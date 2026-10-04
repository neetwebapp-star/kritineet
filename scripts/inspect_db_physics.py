import sqlite3

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()

c.execute('''
    SELECT ch.id, ch.chapterNumber, ch.title, ch.ncertBookCode, COUNT(t.id) as topic_count
    FROM Chapter ch
    JOIN Subject s ON ch.subjectId = s.id
    LEFT JOIN Topic t ON t.chapterId = ch.id
    WHERE s.name LIKE '%physic%' AND ch.ncertBookCode LIKE 'keph1%'
    GROUP BY ch.id
    ORDER BY ch.chapterNumber
''')
chapters = c.fetchall()
print(f'Total Class 11 Physics Book 1 Chapters in DB: {len(chapters)}')
for ch in chapters:
    ch_id, num, title, code, count = ch
    c.execute('SELECT COUNT(*) FROM ContentFigure WHERE chapterId = ?', (ch_id,))
    fig_cnt = c.fetchone()[0]
    c.execute('SELECT COUNT(*) FROM ContentTable WHERE chapterId = ?', (ch_id,))
    tbl_cnt = c.fetchone()[0]
    print(f'Ch {num} [{code}] "{title}" (ID: {ch_id}): {count} Topics, {fig_cnt} Figures, {tbl_cnt} Tables')
conn.close()
