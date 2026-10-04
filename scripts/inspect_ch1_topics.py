import sqlite3

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()
c.execute("""
    SELECT t.id, t.topicNumber, t.title, t.contentHtml, t.contentMarkdown
    FROM Topic t
    JOIN Chapter ch ON t.chapterId = ch.id
    JOIN Subject s ON ch.subjectId = s.id
    WHERE s.name LIKE '%Physic%' AND ch.chapterNumber = 1
    ORDER BY t.orderIndex ASC
""")
rows = c.fetchall()
for r in rows:
    print('ID:', r[0], 'Num:', r[1], 'Title:', r[2])
    print('  HTML length:', len(r[3]) if r[3] else 0)
    print('  MD length:', len(r[4]) if r[4] else 0)
    # Check if HTML has wrapping div
    if r[3]:
        snippet = r[3][:200].replace('\n', ' ')
        print('  Snippet:', snippet[:120])
conn.close()
