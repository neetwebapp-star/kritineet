import sqlite3
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('prisma/dev.db')
cur = conn.cursor()

# 1. Total FINGERTIPS MCQs
cur.execute("SELECT count(*) FROM Question WHERE sourceType = 'FINGERTIPS'")
total_count = cur.fetchone()[0]

# 2. Check for defects (empty text, invalid ans, invalid topic, not 4 options)
cur.execute("""
    SELECT count(q.id)
    FROM Question q
    LEFT JOIN QuestionOption o ON q.id = o.questionId
    WHERE q.sourceType = 'FINGERTIPS'
    GROUP BY q.id
    HAVING count(o.id) != 4 
       OR q.questionText IS NULL 
       OR length(trim(q.questionText)) < 10
       OR q.correctOption NOT IN ('A', 'B', 'C', 'D')
       OR q.topicId IS NULL
       OR q.chapterId IS NULL
""")
defective_rows = cur.fetchall()
defective_count = len(defective_rows)

# 3. Check duplicate fingerprints
cur.execute("""
    SELECT fingerprint, count(*)
    FROM Question
    WHERE sourceType = 'FINGERTIPS'
    GROUP BY fingerprint
    HAVING count(*) > 1
""")
duplicate_rows = cur.fetchall()

# 4. Check chapter breakdown against manifest
with open('docs/MTG_AUTHORITATIVE_SOURCE_INVENTORY.json', 'r', encoding='utf-8') as f:
    manifest = json.load(f)

cur.execute("""
    SELECT chapterId, count(*)
    FROM Question
    WHERE sourceType = 'FINGERTIPS'
    GROUP BY chapterId
""")
db_counts = dict(cur.fetchall())

ch_completed = 0
ch_incomplete = 0
ch_mismatches = []

for ch in manifest['chapters']:
    target = ch['totalSourceMCQs']
    actual = db_counts.get(ch['chapterId'], 0)
    if actual == target:
        ch_completed += 1
    else:
        ch_incomplete += 1
        ch_mismatches.append((ch['title'], target, actual))

conn.close()

print("======================================================")
print("INDEPENDENT FINAL AUDIT & PARITY VERIFICATION")
print("======================================================")
print(f"Total Canonical Target: 13,750 MCQs")
print(f"Total Stored in DB:     {total_count} MCQs")
print(f"Defective MCQs:         {defective_count}")
print(f"Duplicate Fingerprints: {len(duplicate_rows)}")
print(f"Completed Chapters:     {ch_completed} / 79")
print(f"Incomplete Chapters:    {ch_incomplete} / 79")
print(f"Parity Rate:            {(total_count / 13750) * 100:.2f}%")
print("======================================================")

if total_count == 13750 and defective_count == 0 and len(duplicate_rows) == 0 and ch_completed == 79:
    print("ALL ACCEPTANCE CRITERIA SATISFIED: 100% PARITY ACHIEVED!")
else:
    print("FAILED CRITERIA:", ch_mismatches[:5])
