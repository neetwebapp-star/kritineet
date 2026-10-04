"""
NCERT Real Scan Engine & Pipeline Orchestrator
Production-grade execution pipeline:
START AUDIT -> Load PDF -> Parse Source -> Load DB Content -> Compare Structure
-> Compare Text -> Compare Figures -> Compare Tables -> Compare Formulas
-> Check Ordering -> Detect Duplicates -> Audit Highlights -> Store Results -> Generate Report.
"""

import os
import sys
import uuid
import json
import sqlite3
import datetime
from typing import Dict, List, Any, Optional

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Ensure auditor modules are in sys.path
auditor_dir = os.path.dirname(os.path.abspath(__file__))
if auditor_dir not in sys.path:
    sys.path.insert(0, auditor_dir)

from pdf_extractor import NCERTPDFExtractor
from comparer import NCERTComparer

DB_PATH = "prisma/dev.db"
PDF_DIR = "temp_ingestion/keph1dd"

class NCERTAuditEngine:
    def __init__(self, db_path: str = DB_PATH, pdf_dir: str = PDF_DIR):
        self.db_path = db_path
        self.pdf_dir = pdf_dir
        self.comparer = NCERTComparer(public_dir="public")

    def run_audit(
        self,
        target_class: str = "Class 11",
        target_subject: str = "Physics",
        target_book: str = "Book 1 / Part 1",
        specific_chapter: Optional[int] = None,
        resume_run_id: Optional[str] = None
    ) -> str:
        """
        Executes a real audit pipeline and persists results into NCERTAuditRun & NCERTAuditIssue tables.
        Returns the audit_run_id.
        """
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()

        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        if resume_run_id:
            audit_run_id = resume_run_id
            c.execute("SELECT checkpointChapter FROM NCERTAuditRun WHERE id = ?", (audit_run_id,))
            row = c.fetchone()
            start_chapter = row[0] if row else 1
            c.execute("UPDATE NCERTAuditRun SET status = 'IN_PROGRESS', currentStage = 'RESUMING' WHERE id = ?", (audit_run_id,))
            conn.commit()
            print(f"Resuming Audit Run {audit_run_id} from Chapter {start_chapter}")
        else:
            audit_run_id = f"audit_{uuid.uuid4().hex[:12]}"
            start_chapter = specific_chapter if specific_chapter else 1
            end_chapter = specific_chapter if specific_chapter else 7
            
            c.execute("""
            INSERT INTO NCERTAuditRun (
                id, createdAt, status, targetClass, targetSubject, targetBook,
                totalChapters, currentStage, currentProgress, checkpointChapter
            ) VALUES (?, ?, 'IN_PROGRESS', ?, ?, ?, ?, 'INITIALIZING', '0%', ?)
            """, (audit_run_id, now_iso, target_class, target_subject, target_book, (end_chapter - start_chapter + 1), start_chapter))
            conn.commit()
            print(f"Starting New Audit Run {audit_run_id} for {target_class} {target_subject} ({target_book})")

        chapters_to_audit = [specific_chapter] if specific_chapter else list(range(start_chapter, 8))

        try:
            for ch_num in chapters_to_audit:
                pdf_file = os.path.join(self.pdf_dir, f"keph10{ch_num}.pdf")
                if not os.path.exists(pdf_file):
                    raise FileNotFoundError(f"Source PDF for Chapter {ch_num} not found: {pdf_file}")

                # Update stage
                c.execute("""
                UPDATE NCERTAuditRun SET 
                    currentStage = ?, 
                    currentProgress = ?, 
                    checkpointChapter = ?
                WHERE id = ?
                """, (f"PARSING_PDF_CH_{ch_num}", f"Auditing Chapter {ch_num} / 7", ch_num, audit_run_id))
                conn.commit()

                # Step 1: Parse official NCERT PDF
                extractor = NCERTPDFExtractor(pdf_file, ch_num)
                pdf_data = extractor.extract_all()

                # Step 2: Fetch Application DB records
                db_data = self._fetch_db_chapter_data(c, ch_num)

                # Update stage
                c.execute("""
                UPDATE NCERTAuditRun SET 
                    currentStage = ?
                WHERE id = ?
                """, (f"COMPARING_CH_{ch_num}", audit_run_id))
                conn.commit()

                # Step 3: Run comprehensive comparison
                issues = self.comparer.compare_chapter(
                    pdf_data=pdf_data,
                    db_chapter=db_data["chapter"],
                    db_topics=db_data["topics"],
                    db_figures=db_data["figures"],
                    db_tables=db_data["tables"]
                )

                # Step 4: Persist issues into SQLite
                self._persist_chapter_issues(c, audit_run_id, issues)

                # Step 5: Update running metrics
                self._update_run_metrics(c, audit_run_id, ch_num, pdf_data, db_data, issues)
                conn.commit()
                print(f"  [OK] Chapter {ch_num} audited successfully. Found {len(issues)} verification records.")

            # Step 6: Finalize Audit Run
            completed_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
            
            # Fetch final counts
            c.execute("""
            SELECT 
                COUNT(CASE WHEN severity = 'CRITICAL' THEN 1 END),
                COUNT(CASE WHEN severity = 'WARNING' THEN 1 END),
                COUNT(CASE WHEN severity = 'INFO' THEN 1 END),
                COUNT(CASE WHEN severity = 'PASS' THEN 1 END)
            FROM NCERTAuditIssue WHERE auditRunId = ?
            """, (audit_run_id,))
            crit, warn, info, passed = c.fetchone()

            summary = {
                "auditRunId": audit_run_id,
                "target": f"{target_class} {target_subject} {target_book}",
                "status": "COMPLETED",
                "completedAt": completed_iso,
                "criticalErrors": crit,
                "warnings": warn,
                "info": info,
                "passed": passed,
                "totalVerified": crit + warn + info + passed
            }

            c.execute("""
            UPDATE NCERTAuditRun SET 
                status = 'COMPLETED',
                completedAt = ?,
                currentStage = 'COMPLETED',
                currentProgress = '100%',
                criticalCount = ?,
                warningCount = ?,
                infoCount = ?,
                passCount = ?,
                summaryJson = ?
            WHERE id = ?
            """, (completed_iso, crit, warn, info, passed, json.dumps(summary, indent=2), audit_run_id))
            conn.commit()
            print(f"\n==========================================")
            print(f"AUDIT RUN {audit_run_id} COMPLETE:")
            print(f"  🔴 Critical Errors: {crit}")
            print(f"  🟡 Warnings:        {warn}")
            print(f"  🔵 Info:            {info}")
            print(f"  🟢 Passed:          {passed}")
            print(f"==========================================")

        except Exception as e:
            conn.rollback()
            err_msg = str(e)
            c.execute("""
            UPDATE NCERTAuditRun SET 
                status = 'INCOMPLETE',
                errorMessage = ?,
                currentStage = 'ERROR'
            WHERE id = ?
            """, (err_msg, audit_run_id))
            conn.commit()
            print(f"Audit Run {audit_run_id} failed midway: {err_msg}")
            raise e
        finally:
            conn.close()

        return audit_run_id

    def _fetch_db_chapter_data(self, cursor: sqlite3.Cursor, ch_num: int) -> Dict[str, Any]:
        """Loads Chapter, Topics, ContentFigures, ContentTables from SQLite"""
        # Fetch Chapter
        cursor.execute("""
        SELECT ch.id, ch.chapterNumber, ch.title, ch.slug, ch.ncertBookCode
        FROM Chapter ch
        JOIN Subject s ON ch.subjectId = s.id
        WHERE s.name LIKE '%physic%' AND ch.chapterNumber = ?
        """, (ch_num,))
        ch_row = cursor.fetchone()
        
        if not ch_row:
            ch_data = {"id": None, "chapterNumber": ch_num, "title": f"Chapter {ch_num}", "slug": "", "ncertBookCode": f"keph10{ch_num}"}
            ch_id = None
        else:
            ch_data = {
                "id": ch_row[0],
                "chapterNumber": ch_row[1],
                "title": ch_row[2],
                "slug": ch_row[3],
                "ncertBookCode": ch_row[4]
            }
            ch_id = ch_row[0]

        # Fetch Topics
        topics = []
        if ch_id:
            cursor.execute("""
            SELECT id, topicNumber, title, orderIndex, pageStart, pageEnd, contentHtml, contentMarkdown
            FROM Topic
            WHERE chapterId = ?
            ORDER BY orderIndex ASC
            """, (ch_id,))
            for r in cursor.fetchall():
                topics.append({
                    "id": r[0],
                    "topicNumber": r[1],
                    "title": r[2],
                    "orderIndex": r[3],
                    "pageStart": r[4],
                    "pageEnd": r[5],
                    "contentHtml": r[6],
                    "contentMarkdown": r[7]
                })

        # Fetch ContentFigures
        figures = []
        if ch_id:
            cursor.execute("""
            SELECT id, figureNumber, caption, imagePath, pageNumber
            FROM ContentFigure
            WHERE chapterId = ?
            """, (ch_id,))
            for r in cursor.fetchall():
                figures.append({
                    "id": r[0],
                    "figureNumber": r[1],
                    "caption": r[2],
                    "imagePath": r[3],
                    "pageNumber": r[4]
                })

        # Fetch ContentTables
        tables = []
        if ch_id:
            cursor.execute("""
            SELECT id, tableNumber, title, headersJson, rowsJson, pageNumber
            FROM ContentTable
            WHERE chapterId = ?
            """, (ch_id,))
            for r in cursor.fetchall():
                tables.append({
                    "id": r[0],
                    "tableNumber": r[1],
                    "title": r[2],
                    "headersJson": r[3],
                    "rowsJson": r[4],
                    "pageNumber": r[5]
                })

        return {
            "chapter": ch_data,
            "topics": topics,
            "figures": figures,
            "tables": tables
        }

    def _persist_chapter_issues(self, cursor: sqlite3.Cursor, audit_run_id: str, issues: List[Dict[str, Any]]):
        """Batch inserts discovered issues into NCERTAuditIssue table"""
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        rows_to_insert = []
        for issue in issues:
            issue_id = f"issue_{uuid.uuid4().hex[:12]}"
            rows_to_insert.append((
                issue_id,
                audit_run_id,
                issue["severity"],
                issue["issueType"],
                issue.get("className", "Class 11"),
                issue.get("subjectName", "Physics"),
                issue.get("bookCode", f"keph10{issue['chapterNumber']}"),
                issue["chapterNumber"],
                issue["chapterTitle"],
                issue.get("sectionNumber"),
                issue.get("topicNumber"),
                issue.get("sourcePage"),
                issue.get("sourceBlockId"),
                issue.get("appRecordId"),
                issue.get("sourceContent"),
                issue.get("appContent"),
                issue.get("detectedDifference"),
                issue.get("confidence", 1.0),
                issue.get("recommendedAction"),
                now_iso
            ))

        cursor.executemany("""
        INSERT INTO NCERTAuditIssue (
            id, auditRunId, severity, issueType, className, subjectName, bookCode,
            chapterNumber, chapterTitle, sectionNumber, topicNumber, sourcePage,
            sourceBlockId, appRecordId, sourceContent, appContent, detectedDifference,
            confidence, recommendedAction, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, rows_to_insert)

    def _update_run_metrics(
        self,
        cursor: sqlite3.Cursor,
        audit_run_id: str,
        ch_num: int,
        pdf_data: Dict[str, Any],
        db_data: Dict[str, Any],
        issues: List[Dict[str, Any]]
    ):
        """Updates cumulative counters on NCERTAuditRun"""
        sec_count = len([s for s in pdf_data["sections"] if not s["section_number"].endswith("exercises")])
        block_count = sum(len(s["blocks"]) for s in pdf_data["sections"] if not s["section_number"].endswith("exercises"))
        fig_count = len(pdf_data["figures"])
        tbl_count = len(pdf_data["tables"])

        cursor.execute("""
        UPDATE NCERTAuditRun SET
            auditedChapters = auditedChapters + 1,
            totalSections = totalSections + ?,
            auditedSections = auditedSections + ?,
            totalTopics = totalTopics + ?,
            auditedTopics = auditedTopics + ?,
            totalBlocks = totalBlocks + ?,
            auditedBlocks = auditedBlocks + ?,
            totalFigures = totalFigures + ?,
            auditedFigures = auditedFigures + ?,
            totalTables = totalTables + ?,
            auditedTables = auditedTables + ?,
            currentProgress = ?
        WHERE id = ?
        """, (
            sec_count, len(db_data["topics"]),
            sec_count, len(db_data["topics"]),
            block_count, block_count,
            fig_count, len(db_data["figures"]),
            tbl_count, len(db_data["tables"]),
            f"{(ch_num / 7) * 100:.0f}%",
            audit_run_id
        ))

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description="NCERT Integrity & Presentation Auditor Engine")
    parser.add_argument("--chapter", type=int, default=None, help="Specific chapter number to audit (1-7)")
    parser.add_argument("--resume", type=str, default=None, help="Audit Run ID to resume")
    args = parser.parse_args()

    engine = NCERTAuditEngine()
    engine.run_audit(
        specific_chapter=args.chapter,
        resume_run_id=args.resume
    )
