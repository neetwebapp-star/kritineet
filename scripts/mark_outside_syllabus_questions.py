import sqlite3

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()

# Check current status
c.execute("SELECT id, syllabusStatus FROM Question WHERE chapterId = 'cmuo7g35y0001evjomkg853jt'")
print("Before:", c.fetchall())

# Update to OUTSIDE_CURRENT_SYLLABUS
c.execute("UPDATE Question SET syllabusStatus = 'OUTSIDE_CURRENT_SYLLABUS' WHERE chapterId = 'cmuo7g35y0001evjomkg853jt'")
conn.commit()

c.execute("SELECT id, syllabusStatus FROM Question WHERE chapterId = 'cmuo7g35y0001evjomkg853jt'")
print("After:", c.fetchall())

conn.close()
