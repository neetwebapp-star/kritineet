import sqlite3

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()

c.execute('''
    SELECT c.id, c.chapterNumber, c.title, count(q.id) as q_cnt, count(t.id) as top_cnt
    FROM Chapter c
    LEFT JOIN Question q ON q.chapterId = c.id
    LEFT JOIN Topic t ON t.chapterId = c.id
    WHERE c.chapterNumber > 20
    GROUP BY c.id
''')
for row in c.fetchall():
    print(f"Test chapter: {row[0]}, chNum={row[1]}, title='{row[2]}', questions={row[3]}, topics={row[4]}")

conn.close()
