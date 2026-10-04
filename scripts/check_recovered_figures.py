import sqlite3

conn = sqlite3.connect('prisma/dev.db')
cur = conn.cursor()
cur.execute("SELECT id, figureNumber, caption, imagePath, chapterId FROM ContentFigure WHERE id LIKE 'FIG_KEBO102_2_%'")
rows = cur.fetchall()
print("Specific recovered figures for Chapter 2:")
for r in rows:
    print(r)
