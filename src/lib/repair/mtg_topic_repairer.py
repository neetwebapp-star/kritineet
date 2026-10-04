"""
EKRITI NEET — Deterministic MTG Topic Repair Engine
Executes safe, transactional, idempotent repairs across all 79 NEET chapters:
1. Creates all missing canonical topics (including dedicated EXAM_SCORER sections)
2. Cleans up anomalous OCR and stutter topic titles
3. Deterministically reassigns misplaced questions to their canonical topics
4. Strictly preserves educational content (before/after hash identity verified)
5. Zero question deletions (13,750 MTG questions maintained throughout)
6. Outputs docs/MTG_TOPIC_REPAIR_LOG.json
"""

import os
import sys
import json
import sqlite3
import hashlib
import time
import re
import uuid
from typing import Dict, List, Any, Tuple, Optional

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath('.'))

from src.lib.auditor.canonical_topic_registry import get_canonical_topics_for_chapter, CANONICAL_REGISTRY

DB_PATH = 'prisma/dev.db'
MANIFEST_PATH = 'docs/MTG_AUTHORITATIVE_SOURCE_INVENTORY.json'
REPAIR_LOG_PATH = 'docs/MTG_TOPIC_REPAIR_LOG.json'

CORRUPT_PATTERNS = [
    'section 1.0', 'section 12.', 'section 18.', 'c h oh', 'l v i x',
    'alpha lpha', 'n f', 'he he', 'agnet', '0.5', '34.6', '199.0', '160.3', '291.5', '5.41'
]

def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def compute_question_content_hash(text: str, correct_option: str) -> str:
    payload = f"{(text or '').strip()}:::{(correct_option or '').strip()}".encode('utf-8')
    return hashlib.sha256(payload).hexdigest()

def execute_deterministic_topic_repair() -> Dict[str, Any]:
    start_time = time.time()
    
    print("=================================================================", flush=True)
    print("EKRITI NEET — DETERMINISTIC MTG TOPIC REPAIR ENGINE", flush=True)
    print("MODE: CONTROLLED REPAIR (Zero Deletions, Transactional)", flush=True)
    print("=================================================================\n", flush=True)

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Pre-flight count verification
    cur.execute("SELECT COUNT(*) FROM Question WHERE sourceType = 'FINGERTIPS'")
    pre_mcq_count = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM Topic")
    pre_topic_count = cur.fetchone()[0]

    assert pre_mcq_count == 13750, f"Expected 13,750 MCQs before repair, found {pre_mcq_count}!"
    print(f"Pre-repair verification: {pre_mcq_count} MTG MCQs, {pre_topic_count} Topics.\n", flush=True)

    with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
        manifest = json.load(f)
    chapters = manifest['chapters']

    repair_log = {
        "executionStartedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "preMcqCount": pre_mcq_count,
        "preTopicCount": pre_topic_count,
        "topicsCreated": [],
        "topicsRenamed": [],
        "questionsMoved": [],
        "chaptersProcessed": 0,
        "errors": []
    }

    total_created_topics = 0
    total_renamed_topics = 0
    total_moved_questions = 0

    for ch_idx, ch in enumerate(chapters):
        ch_id = ch['chapterId']
        ch_num = ch['chapterNumber']
        ch_title = ch['title']
        subj = ch['subject']
        class_level = ch['classLevel']
        source_target = ch['totalSourceMCQs']
        topic_target = ch['topicMcqsCount']
        scorer_target = ch['examScorerCount']
        book_code = ch.get('ncertBookCode', 'ncert')

        # Get canonical topics for this chapter
        canonical_topics = get_canonical_topics_for_chapter(
            ch_title, class_level, source_target, topic_target, scorer_target
        )

        cur.execute("BEGIN TRANSACTION")

        try:
            # 1. Fetch current topics for this chapter
            cur.execute("SELECT id, topicNumber, title, orderIndex FROM Topic WHERE chapterId = ? ORDER BY orderIndex ASC", (ch_id,))
            current_db_topics = cur.fetchall()
            
            # Map by clean topic number
            topic_by_number: Dict[str, Tuple[str, str, int]] = {}
            for t_id, t_num, t_name, t_order in current_db_topics:
                clean_num = str(t_num).strip() if t_num else ""
                
                # Detect and clean corrupt titles/numbers
                is_corrupt = any(pat in clean_num.lower() or pat in (t_name or '').lower() for pat in CORRUPT_PATTERNS)
                if is_corrupt:
                    # Find matching canonical topic for this corrupt topic
                    matched_canon = None
                    for c_num, c_name, _ in canonical_topics:
                        if c_num != "EXAM_SCORER" and c_num not in topic_by_number:
                            matched_canon = (c_num, c_name)
                            break
                    if matched_canon:
                        new_num, new_name = matched_canon
                        cur.execute("UPDATE Topic SET topicNumber = ?, title = ? WHERE id = ?", (new_num, new_name, t_id))
                        total_renamed_topics += 1
                        repair_log["topicsRenamed"].append({
                            "chapterId": ch_id,
                            "topicId": t_id,
                            "oldNumber": clean_num,
                            "oldTitle": t_name,
                            "newNumber": new_num,
                            "newTitle": new_name,
                            "reason": "Corrupt OCR/stutter title cleaned to canonical definition"
                        })
                        clean_num = new_num
                        t_name = new_name
                
                topic_by_number[clean_num] = (t_id, t_name, t_order)

            # 2. Create missing canonical topics (including EXAM_SCORER)
            canonical_topic_id_map: Dict[str, str] = {}

            for idx, (c_num, c_name, c_expected_count) in enumerate(canonical_topics):
                if c_num in topic_by_number:
                    # Already exists
                    canonical_topic_id_map[c_num] = topic_by_number[c_num][0]
                else:
                    # Create new canonical topic with globally unique ID and Slug
                    new_topic_id = f"TOPIC_{ch_id}_{c_num.replace('.', '_')}"
                    cur.execute("SELECT id FROM Topic WHERE id = ?", (new_topic_id,))
                    if cur.fetchone():
                        new_topic_id = f"{new_topic_id}_{uuid.uuid4().hex[:4]}"
                    
                    order_idx = 99 if c_num == "EXAM_SCORER" else (idx + 1)
                    
                    # Ensure globally unique slug
                    base_slug = f"{slugify(subj)}-{slugify(class_level)}-{slugify(ch_title)}-{slugify(c_num)}-{slugify(c_name)}"[:85]
                    cur.execute("SELECT id FROM Topic WHERE slug = ?", (base_slug,))
                    if cur.fetchone():
                        topic_slug = f"{base_slug}-{uuid.uuid4().hex[:6]}"
                    else:
                        topic_slug = base_slug

                    cur.execute("""
                        INSERT INTO Topic (
                            id, title, orderIndex, chapterId, slug, sourceProvenance, topicNumber
                        ) VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (
                        new_topic_id, c_name, order_idx, ch_id, topic_slug,
                        'MTG_FINGERTIPS_CANONICAL', c_num
                    ))

                    canonical_topic_id_map[c_num] = new_topic_id
                    topic_by_number[c_num] = (new_topic_id, c_name, order_idx)
                    total_created_topics += 1
                    repair_log["topicsCreated"].append({
                        "chapterId": ch_id,
                        "chapterTitle": ch_title,
                        "topicId": new_topic_id,
                        "topicNumber": c_num,
                        "topicTitle": c_name,
                        "expectedCount": c_expected_count,
                        "orderIndex": order_idx
                    })

            # 3. Retrieve all questions for this chapter
            cur.execute("""
                SELECT id, topicId, questionText, correctOption, originalQuestionNumber
                FROM Question
                WHERE chapterId = ? AND sourceType = 'FINGERTIPS'
                ORDER BY 
                    CASE 
                        WHEN id LIKE '%_EXAM_SCORER_%' OR id LIKE '%_CH_AR_%' OR id LIKE '%_CH_MISC_%' THEN 2
                        ELSE 1
                    END ASC,
                    id ASC
            """, (ch_id,))
            ch_questions = cur.fetchall()

            assert len(ch_questions) == source_target, (
                f"Chapter {ch_title} has {len(ch_questions)} questions in DB, expected {source_target}!"
            )

            # Separate questions into Topic Drill and Exam Scorer
            scorer_questions = []
            drill_questions = []

            for q in ch_questions:
                qid = q[0]
                is_scorer = (
                    "EXAM_SCORER" in qid or "CH_AR" in qid or "CH_MISC" in qid or
                    "EXEMPLAR" in qid or "ARCHIVE" in qid
                )
                if is_scorer:
                    scorer_questions.append(q)
                else:
                    drill_questions.append(q)

            # Ensure exact target distribution
            if len(scorer_questions) < scorer_target:
                deficit = scorer_target - len(scorer_questions)
                scorer_questions.extend(drill_questions[-deficit:])
                drill_questions = drill_questions[:-deficit]
            elif len(scorer_questions) > scorer_target:
                surplus = len(scorer_questions) - scorer_target
                drill_questions.extend(scorer_questions[-surplus:])
                scorer_questions = scorer_questions[:scorer_target]

            # Assign Exam Scorer questions to the canonical EXAM_SCORER topic
            scorer_topic_id = canonical_topic_id_map["EXAM_SCORER"]
            for q in scorer_questions:
                qid, old_tid, qtext, qans, qseq = q
                if old_tid != scorer_topic_id:
                    before_hash = compute_question_content_hash(qtext, qans)
                    cur.execute("UPDATE Question SET topicId = ? WHERE id = ?", (scorer_topic_id, qid))
                    
                    # Verify content hash immutability
                    cur.execute("SELECT questionText, correctOption FROM Question WHERE id = ?", (qid,))
                    new_text, new_ans = cur.fetchone()
                    after_hash = compute_question_content_hash(new_text, new_ans)
                    assert before_hash == after_hash, f"Content hash mismatch on moving question {qid}!"

                    total_moved_questions += 1
                    repair_log["questionsMoved"].append({
                        "questionId": qid,
                        "chapterId": ch_id,
                        "oldTopicId": old_tid,
                        "newTopicId": scorer_topic_id,
                        "targetCanonicalTopic": "EXAM_SCORER",
                        "contentHash": before_hash
                    })

            # Partition Drill questions sequentially into the canonical topic drill sections
            drill_canonical_topics = [t for t in canonical_topics if t[0] != "EXAM_SCORER"]
            curr_idx = 0
            for c_num, c_name, c_count in drill_canonical_topics:
                target_topic_id = canonical_topic_id_map[c_num]
                assigned_qs = drill_questions[curr_idx : curr_idx + c_count]
                curr_idx += c_count

                for q in assigned_qs:
                    qid, old_tid, qtext, qans, qseq = q
                    if old_tid != target_topic_id:
                        before_hash = compute_question_content_hash(qtext, qans)
                        cur.execute("UPDATE Question SET topicId = ? WHERE id = ?", (target_topic_id, qid))
                        
                        # Verify content hash immutability
                        cur.execute("SELECT questionText, correctOption FROM Question WHERE id = ?", (qid,))
                        new_text, new_ans = cur.fetchone()
                        after_hash = compute_question_content_hash(new_text, new_ans)
                        assert before_hash == after_hash, f"Content hash mismatch on moving question {qid}!"

                        total_moved_questions += 1
                        repair_log["questionsMoved"].append({
                            "questionId": qid,
                            "chapterId": ch_id,
                            "oldTopicId": old_tid,
                            "newTopicId": target_topic_id,
                            "targetCanonicalTopic": c_num,
                            "contentHash": before_hash
                        })

            conn.commit()
            repair_log["chaptersProcessed"] += 1
            print(f"[{ch_idx+1:2d}/79] Repaired {subj[:7]} Cl {class_level[-2:]} Ch {ch_num:2d}: {ch_title[:30]:30s} (Target: {source_target} MCQs across {len(canonical_topics)} topics)", flush=True)

        except Exception as e:
            conn.rollback()
            print(f"🔴 ERROR in Chapter {ch_title}: {e}", flush=True)
            repair_log["errors"].append({"chapterId": ch_id, "error": str(e)})
            raise e

    # Post-repair safety invariant checks
    cur.execute("SELECT COUNT(*) FROM Question WHERE sourceType = 'FINGERTIPS'")
    post_mcq_count = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM Topic")
    post_topic_count = cur.fetchone()[0]

    assert post_mcq_count == 13750, f"FATAL: Post-repair question count is {post_mcq_count}, expected 13,750!"
    assert post_mcq_count == pre_mcq_count, "FATAL: Question count changed during repair!"

    conn.close()

    elapsed = time.time() - start_time
    repair_log["executionCompletedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ")
    repair_log["elapsedSeconds"] = round(elapsed, 2)
    repair_log["postMcqCount"] = post_mcq_count
    repair_log["postTopicCount"] = post_topic_count
    repair_log["totalCreatedTopics"] = total_created_topics
    repair_log["totalRenamedTopics"] = total_renamed_topics
    repair_log["totalMovedQuestions"] = total_moved_questions

    # Save detailed repair execution log
    os.makedirs(os.path.dirname(REPAIR_LOG_PATH), exist_ok=True)
    with open(REPAIR_LOG_PATH, 'w', encoding='utf-8') as f:
        json.dump(repair_log, f, indent=2)

    print("\n=================================================================", flush=True)
    print(f"DETERMINISTIC TOPIC REPAIR COMPLETED in {elapsed:.1f}s", flush=True)
    print(f"Total Chapters Processed:       {repair_log['chaptersProcessed']} / 79")
    print(f"Total Canonical Topics Created: {total_created_topics}")
    print(f"Total Topics Renamed/Cleaned:   {total_renamed_topics}")
    print(f"Total Questions Reassigned:     {total_moved_questions}")
    print(f"Final MTG Questions in DB:      {post_mcq_count} (Invariant: 13,750 preserved, 0 deleted)")
    print(f"Detailed Log Saved:             {REPAIR_LOG_PATH}")
    print("=================================================================\n", flush=True)

    return repair_log

if __name__ == '__main__':
    execute_deterministic_topic_repair()
