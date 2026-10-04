import sqlite3

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()

c.execute('''
    SELECT s.id, s.name, s.code, cl.name 
    FROM Subject s 
    LEFT JOIN ClassLevel cl ON s.classLevelId = cl.id 
    ORDER BY cl.name, s.name
''')
subjects = c.fetchall()
print('=== SUBJECTS ===')
for s in subjects:
    print(s)

print('\n=== ALL CHAPTERS IN DATABASE ===')
c.execute('''
    SELECT c.id, c.chapterNumber, c.title, c.slug, s.name, cl.name, u.title, u.unitNumber
    FROM Chapter c
    JOIN Subject s ON c.subjectId = s.id
    LEFT JOIN ClassLevel cl ON s.classLevelId = cl.id
    LEFT JOIN Unit u ON c.unitId = u.id
    ORDER BY cl.name, s.name, c.chapterNumber
''')
chapters = c.fetchall()
print(f'Total chapters in DB: {len(chapters)}')
for ch in chapters:
    print(f'[{ch[5]}] [{ch[4]}] Ch {ch[1]}: "{ch[2]}" (slug: {ch[3]}, unit #{ch[7]}: "{ch[6]}") id={ch[0]}')

conn.close()
