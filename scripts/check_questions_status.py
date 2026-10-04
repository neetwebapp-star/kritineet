import sqlite3

conn = sqlite3.connect('prisma/dev.db')
cur = conn.cursor()
print('Questions by sourceType:', cur.execute('SELECT sourceType, count(*) FROM Question GROUP BY sourceType').fetchall())
print('Questions with bookName like MTG:', cur.execute("SELECT count(*) FROM Question WHERE bookName LIKE '%Fingertips%' OR sourceType = 'FINGERTIPS'").fetchone()[0])
sample_mtg = cur.execute("SELECT id, questionText, chapterId, topicId, bookName FROM Question WHERE sourceType = 'FINGERTIPS' LIMIT 5").fetchall()
print('Sample MTG questions:', sample_mtg)
