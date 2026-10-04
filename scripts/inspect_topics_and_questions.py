import sqlite3

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()

c.execute("SELECT id, topicNumber, title, chapterId FROM Topic WHERE title LIKE '%Exam%' OR topicNumber LIKE '%SCORER%'")
rows = c.fetchall()
print(f"Total Exam Scorer / Scorer topics: {len(rows)}")
for r in rows[:10]:
    print(r)

# Check question counts in these topics
scorer_ids = [r[0] for r in rows]
c.execute(f"SELECT COUNT(*) FROM Question WHERE topicId IN ({','.join(['?']*len(scorer_ids))})", scorer_ids)
print("Questions assigned to Exam Scorer topics:", c.fetchone()[0])

# Check how many questions were partitioned in mtg_topic_repairer.py
c.execute("SELECT COUNT(*) FROM Question WHERE sourceType = 'FINGERTIPS' AND topicId IN (SELECT id FROM Topic WHERE topicNumber = 'EXAM_SCORER')")
print("Questions in topicNumber='EXAM_SCORER':", c.fetchone()[0])
