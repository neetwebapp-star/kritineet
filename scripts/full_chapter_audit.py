import sqlite3
import json

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()

# Get all canonical and non-canonical chapters
c.execute('''
    SELECT 
        c.id, 
        c.chapterNumber, 
        c.title, 
        c.slug, 
        s.name as subjectName, 
        cl.name as className,
        u.title as unitTitle,
        u.unitNumber,
        (SELECT count(*) FROM Question q WHERE q.chapterId = c.id AND q.sourceType = 'FINGERTIPS') as fingertipsCount,
        (SELECT count(*) FROM Question q WHERE q.chapterId = c.id AND q.sourceType != 'FINGERTIPS') as ncertPyqCount,
        (SELECT count(*) FROM Topic t WHERE t.chapterId = c.id) as topicCount
    FROM Chapter c
    JOIN Subject s ON c.subjectId = s.id
    LEFT JOIN ClassLevel cl ON s.classLevelId = cl.id
    LEFT JOIN Unit u ON c.unitId = u.id
    ORDER BY cl.name, s.name, c.chapterNumber
''')
rows = c.fetchall()

data = []
for r in rows:
    data.append({
        'id': r[0],
        'chNum': r[1],
        'title': r[2],
        'slug': r[3],
        'subject': r[4],
        'class': r[5],
        'unit': r[6],
        'unitNum': r[7],
        'fingertipsCount': r[8],
        'ncertPyqCount': r[9],
        'topicCount': r[10]
    })

with open('scratch/full_chapter_audit.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print(f"Audited {len(data)} chapters.")
conn.close()
