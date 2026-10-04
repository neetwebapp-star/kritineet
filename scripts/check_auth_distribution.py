import sqlite3
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()

# Authentic questions do NOT have synthetic IDs like Q_MTG_... or template text
# In audit_synthetic_stems.py we saw:
# 11,253 questions matched synthetic patterns from generate_curriculum_mcq
# 2,497 did not match.

c.execute("""
    SELECT q.id, q.chapterId, c.title, c.subjectId, count(*)
    FROM Question q
    JOIN Chapter c ON q.chapterId = c.id
    WHERE q.sourceType = 'FINGERTIPS'
      AND q.questionText NOT LIKE '%plays an indispensable role in the physiological%'
      AND q.questionText NOT LIKE '%conforms strictly to fundamental thermodynamic%'
      AND q.questionText NOT LIKE '%dimensional homogeneity and conservation laws must be simultaneously satisfied%'
      AND q.questionText NOT LIKE '%With reference to NCERT core curriculum for%'
      AND q.questionText NOT LIKE '%According to NCERT Chemistry guidelines for%'
      AND q.questionText NOT LIKE '%which of the following physical relationships correctly describes the behavior of the system%'
      AND q.questionText NOT LIKE 'Assertion (A): Fundamental concepts in%'
      AND q.questionText NOT LIKE 'Assertion (A): Microscopic and structural%'
      AND q.questionText NOT LIKE 'Exam Archive Question (%'
      AND q.questionText NOT LIKE 'High-Order Thinking Problem (%'
    GROUP BY q.chapterId
    ORDER BY c.subjectId, c.chapterNumber
""")

rows = c.fetchall()
print(f"Chapters with authentic non-template questions: {len(rows)}")
total_auth = sum(r[4] for r in rows)
print(f"Total authentic non-template questions: {total_auth}")
for r in rows:
    print(f"Ch: {r[2][:30]:30s} | Subj: {r[3][:12]:12s} | Count: {r[4]}")
