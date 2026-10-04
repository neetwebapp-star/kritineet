import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('prisma/dev.db')
cur = conn.cursor()

cur.execute("""
    SELECT q.id, q.questionText, q.correctOption, q.chapterId, q.topicId, count(o.id)
    FROM Question q
    LEFT JOIN QuestionOption o ON q.id = o.questionId
    WHERE q.sourceType = 'FINGERTIPS'
    GROUP BY q.id
""")
rows = cur.fetchall()

valid_count = 0
invalid_count = 0
reasons = {}

for qid, text, ans, chid, tid, opt_count in rows:
    errs = []
    if not text or len(text.strip()) < 10:
        errs.append("empty_or_short_text")
    if not ans or ans.strip().upper() not in ['A', 'B', 'C', 'D']:
        errs.append("invalid_correct_option")
    if opt_count != 4:
        errs.append(f"invalid_options_count_{opt_count}")
    if not chid:
        errs.append("missing_chapter_id")
    if not tid:
        errs.append("missing_topic_id")

    if errs:
        invalid_count += 1
        for e in errs:
            reasons[e] = reasons.get(e, 0) + 1
    else:
        valid_count += 1

print(f"Total existing FINGERTIPS MCQs: {len(rows)}")
print(f"Verified Valid: {valid_count}")
print(f"Invalid / Defective: {invalid_count}")
print("Defect breakdown:", reasons)

conn.close()
