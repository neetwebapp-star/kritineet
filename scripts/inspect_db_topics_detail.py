import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('prisma/dev.db')
cur = conn.cursor()

cur.execute("""
    SELECT c.chapterNumber, c.title, s.name, cl.name, t.topicNumber, t.title, t.id, count(q.id)
    FROM Chapter c
    JOIN Subject s ON c.subjectId = s.id
    JOIN ClassLevel cl ON s.classLevelId = cl.id
    JOIN Topic t ON c.id = t.chapterId
    LEFT JOIN Question q ON t.id = q.topicId AND q.sourceType = 'FINGERTIPS'
    WHERE c.chapterNumber <= 50
    GROUP BY t.id
    ORDER BY cl.name, s.name, c.chapterNumber, t.orderIndex
""")
rows = cur.fetchall()

print(f"Total Topics in DB: {len(rows)}\n")

# Print first 30 and summarize anomalies
anomalous_topics = []
empty_topics = []
overloaded_topics = []

for ch_num, ch_title, sname, clname, tnum, ttitle, tid, qcount in rows:
    # Check for anomalous titles
    is_anomalous = False
    if any(k in (ttitle or '') for k in ['Section ', 'C H Oh', 'L V I X', 'V C V', 'V I Z', 'Alpha Lpha', 'N F', 'F N']):
        is_anomalous = True
        anomalous_topics.append((f"{clname} {sname} Ch {ch_num}", tnum, ttitle, qcount))
    
    if qcount == 0:
        empty_topics.append((f"{clname} {sname} Ch {ch_num}", tnum, ttitle))
    elif qcount > 100:
        overloaded_topics.append((f"{clname} {sname} Ch {ch_num}", tnum, ttitle, qcount))

print(f"--- ANOMALOUS TOPICS ({len(anomalous_topics)}) ---")
for a in anomalous_topics[:15]:
    print(f"  {a[0]} | Topic {a[1]}: {a[2]} -> {a[3]} MCQs")

print(f"\n--- OVERLOADED TOPICS ({len(overloaded_topics)}) ---")
for o in overloaded_topics[:15]:
    print(f"  {o[0]} | Topic {o[1]}: {o[2]} -> {o[3]} MCQs")

print(f"\n--- EMPTY TOPICS ({len(empty_topics)}) ---")
for e in empty_topics[:15]:
    print(f"  {e[0]} | Topic {e[1]}: {e[2]}")

conn.close()
