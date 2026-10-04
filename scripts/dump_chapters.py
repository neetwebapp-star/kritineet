import sqlite3
import json

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()

c.execute('''
    SELECT c.id, c.chapterNumber, c.title, c.slug, s.name, cl.name, u.title, u.unitNumber
    FROM Chapter c
    JOIN Subject s ON c.subjectId = s.id
    LEFT JOIN ClassLevel cl ON s.classLevelId = cl.id
    LEFT JOIN Unit u ON c.unitId = u.id
    ORDER BY cl.name, s.name, c.chapterNumber
''')
chapters = c.fetchall()

res = {}
for ch in chapters:
    cl_name = ch[5] or 'Unknown'
    sub_name = ch[4]
    if cl_name not in res:
        res[cl_name] = {}
    if sub_name not in res[cl_name]:
        res[cl_name][sub_name] = []
    res[cl_name][sub_name].append({
        'id': ch[0],
        'chNum': ch[1],
        'title': ch[2],
        'slug': ch[3],
        'unit': ch[6],
        'unitNum': ch[7]
    })

with open('scratch/chapters_dump.json', 'w', encoding='utf-8') as f:
    json.dump(res, f, indent=2)

print('Dumped successfully')
