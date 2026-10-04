import sqlite3

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()

c.execute("SELECT COUNT(*) FROM Question WHERE sourceType = 'PYQ' AND examYear IS NULL")
print("PYQ with null examYear:", c.fetchone()[0])

c.execute("SELECT id, questionText, sourceDocumentId, examName FROM Question WHERE sourceType = 'PYQ' AND examYear IS NULL LIMIT 5")
for r in c.fetchall():
    print("  ", r)

c.execute("SELECT COUNT(*) FROM Question WHERE sourceType = 'FINGERTIPS' AND bookName IS NULL")
print("FT with null bookName:", c.fetchone()[0])

c.execute("SELECT id, questionText, sourceDocumentId FROM Question WHERE sourceType = 'FINGERTIPS' AND bookName IS NULL LIMIT 5")
for r in c.fetchall():
    print("  ", r)

conn.close()
