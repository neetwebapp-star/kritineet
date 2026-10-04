import sqlite3

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()

c.execute("SELECT COUNT(DISTINCT topicId) FROM DailyStudyTask WHERE topicId IS NOT NULL")
print("Distinct topicIds in DailyStudyTask:", c.fetchone()[0])

c.execute("SELECT COUNT(*) FROM Topic")
total_topics = c.fetchone()[0]
print("Total topics in DB:", total_topics)

c.execute("""
    SELECT t.id, t.topicNumber, t.title, c.title, s.name, cl.code
    FROM Topic t
    JOIN Chapter c ON t.chapterId = c.id
    JOIN Subject s ON c.subjectId = s.id
    JOIN ClassLevel cl ON s.classLevelId = cl.id
    WHERE t.id NOT IN (SELECT topicId FROM DailyStudyTask WHERE topicId IS NOT NULL)
""")
missing = c.fetchall()
print(f"Total unscheduled topics: {len(missing)}")
if missing:
    print("First 10 missing:")
    for m in missing[:10]:
        print(f"  {m[0]} | {m[1]} {m[2]} | Ch: {m[3]} | Subj: {m[4]} ({m[5]})")
