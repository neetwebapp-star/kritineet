import sqlite3
import json

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()
c.execute("SELECT id, topicNumber, title, sourceProvenance, contentHtml FROM Topic WHERE id = 'TOPIC_KEPH101_1_3'")
row = c.fetchone()
if row:
    print('ID:', row[0])
    print('TopicNumber:', row[1])
    print('Title:', row[2])
    print('Provenance:', row[3])
    print('ContentHtml length:', len(row[4]) if row[4] else 0)
    print('Snippet:', row[4][:400] if row[4] else 'None')
else:
    print('Not found')
conn.close()
