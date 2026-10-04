import sqlite3
from collections import Counter
import re
import json

DB_PATH = 'prisma/dev.db'

def analyze_synthetic_stems():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute('SELECT COUNT(*) FROM Question')
    total_q = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM Question WHERE sourceType = 'FINGERTIPS'")
    mtg_q = c.fetchone()[0]

    print(f"Total Questions in DB: {total_q}")
    print(f"MTG Questions in DB: {mtg_q}")

    # Inspect questions by source and topic
    c.execute("""
        SELECT q.id, q.questionText, q.correctOption, q.topicId, t.title, t.topicNumber, t.chapterId, c.title, c.subjectId
        FROM Question q
        LEFT JOIN Topic t ON q.topicId = t.id
        LEFT JOIN Chapter c ON t.chapterId = c.id
        WHERE q.sourceType = 'FINGERTIPS'
    """)
    rows = c.fetchall()

    stems = [r[1].strip() for r in rows]
    stem_counts = Counter(stems)

    duplicates = {s: count for s, count in stem_counts.items() if count > 1}
    print(f"Distinct stems: {len(stem_counts)}")
    print(f"Number of stems appearing > 1 time: {len(duplicates)}")
    total_in_duplicates = sum(count for count in duplicates.values())
    print(f"Total question records with repeated stem: {total_in_duplicates}")

    print("\nTop 10 most frequent stems:")
    for s, count in stem_counts.most_common(10):
        print(f"  Count: {count} | Stem: {repr(s[:90])}")

    # Breakdown by topic type: EXAM_SCORER vs normal topic drills
    exam_scorer_rows = [r for r in rows if r[5] and r[5].upper() == 'EXAM_SCORER']
    drill_rows = [r for r in rows if r not in exam_scorer_rows]

    print(f"\nExam Scorer Questions in DB: {len(exam_scorer_rows)}")
    print(f"Drill Questions in DB: {len(drill_rows)}")

    # Check synthetic patterns
    # Patterns from ingest_mtg_master_pipeline.py:
    # 1. "Assertion (A): ... plays an indispensable role in the physiological and developmental cycle described in NCERT ..."
    # 2. "Assertion (A): In ..., ... conforms strictly to fundamental thermodynamic and quantum mechanical principles..."
    # 3. "Assertion (A): For physical systems governed by ... in ..., dimensional homogeneity and conservation laws must be simultaneously satisfied..."
    # 4. "With reference to NCERT core curriculum for ..., which of the following statements is scientifically CORRECT regarding ... (Item ...)"
    # 5. "According to NCERT Chemistry guidelines for ..., what is the expected chemical/physical behavior observed in ... (Problem ...)"
    # 6. "In the study of ... (...), which of the following physical relationships correctly describes the behavior of the system (Exercise ...)"

    synthetic_patterns = [
        re.compile(r"plays an indispensable role in the physiological and developmental cycle", re.IGNORECASE),
        re.compile(r"conforms strictly to fundamental thermodynamic and quantum mechanical principles", re.IGNORECASE),
        re.compile(r"dimensional homogeneity and conservation laws must be simultaneously satisfied", re.IGNORECASE),
        re.compile(r"With reference to NCERT core curriculum for", re.IGNORECASE),
        re.compile(r"According to NCERT Chemistry guidelines for", re.IGNORECASE),
        re.compile(r"which of the following physical relationships correctly describes the behavior of the system", re.IGNORECASE),
    ]

    synthetic_in_exam_scorer = []
    synthetic_in_drills = []

    for r in exam_scorer_rows:
        text = r[1]
        if any(p.search(text) for p in synthetic_patterns):
            synthetic_in_exam_scorer.append(r)

    for r in drill_rows:
        text = r[1]
        if any(p.search(text) for p in synthetic_patterns):
            synthetic_in_drills.append(r)

    print(f"\nSynthetic detected in Exam Scorer: {len(synthetic_in_exam_scorer)} / {len(exam_scorer_rows)}")
    print(f"Synthetic detected in Drills: {len(synthetic_in_drills)} / {len(drill_rows)}")
    print(f"Total Synthetic across DB: {len(synthetic_in_exam_scorer) + len(synthetic_in_drills)}")

    # Inspect non-synthetic questions in DB
    authentic_candidate_rows = [r for r in rows if r not in synthetic_in_exam_scorer and r not in synthetic_in_drills]
    print(f"Authentic Candidate Questions in DB: {len(authentic_candidate_rows)}")

    # Let's inspect some samples of authentic questions
    print("\nSample authentic candidate questions (first 3):")
    for r in authentic_candidate_rows[:3]:
        print(f"  ID: {r[0]}, Topic: {r[4]}, Chapter: {r[6]} ({r[7]})")
        print(f"  Stem: {r[1][:120]}...\n")

if __name__ == '__main__':
    analyze_synthetic_stems()
