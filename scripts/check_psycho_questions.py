import sqlite3
conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()
c.execute("SELECT id, questionText, sourceType, bookName FROM Question WHERE chapterId = 'cmuo7g35y0001evjomkg853jt'")
for row in c.fetchall():
    print(row)
conn.close()
