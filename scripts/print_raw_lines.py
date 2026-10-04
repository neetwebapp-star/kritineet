import sqlite3

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()
c.execute("SELECT contentHtml FROM Topic WHERE id = 'TOPIC_KEPH101_1_3'")
raw = c.fetchone()[0]

lines = raw.splitlines()
print("--- LAST 6 LINES ---")
for i, line in enumerate(lines[-6:]):
    print(f"{len(lines)-6+i+1:2d}: {line}")
conn.close()
