import sqlite3
import hashlib

conn = sqlite3.connect('prisma/dev.db')
cur = conn.cursor()

cur.execute("SELECT id, questionText, correctOption FROM Question WHERE sourceType = 'FINGERTIPS'")
rows = cur.fetchall()

updates = []
for qid, qtext, qans in rows:
    fprint = hashlib.sha256(f"{qid}:::{qtext}:::{qans}".encode('utf-8')).hexdigest()
    updates.append((fprint, qid))

cur.executemany("UPDATE Question SET fingerprint = ? WHERE id = ?", updates)
conn.commit()

cur.execute("SELECT count(distinct fingerprint), count(id) FROM Question WHERE sourceType = 'FINGERTIPS'")
row = cur.fetchone()
print(f"Distinct unique fingerprints: {row[0]} / {row[1]}")

conn.close()
