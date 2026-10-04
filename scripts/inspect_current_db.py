import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('prisma/dev.db')
cur = conn.cursor()

cur.execute("SELECT id, questionText, correctOption, chapterId, topicId, syllabusStatus FROM Question WHERE sourceType='FINGERTIPS' LIMIT 5")
for r in cur.fetchall():
    print(f"ID: {r[0]}")
    print(f"Text: {r[1]}")
    print(f"Ans: {r[2]} | Topic: {r[4]}")
    print("---")
