import sqlite3

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()

c.execute('''
    SELECT ch.chapterNumber, ch.ncertBookCode, ch.title, t.id, t.topicNumber, t.title, t.pageStart, t.pageEnd, LENGTH(COALESCE(t.contentHtml, ''))
    FROM Chapter ch
    JOIN Topic t ON t.chapterId = ch.id
    WHERE ch.ncertBookCode LIKE 'keph1%'
    ORDER BY ch.chapterNumber, t.orderIndex
''')

rows = c.fetchall()
print(f"Total topics in DB for Book 1: {len(rows)}")
current_ch = None
for r in rows:
    ch_num, code, ch_title, t_id, t_num, t_title, p_start, p_end, html_len = r
    if ch_num != current_ch:
        current_ch = ch_num
        print(f"\n--- Chapter {ch_num} ({code}): {ch_title} ---")
    print(f"  Topic {t_num:6s} | {t_title[:45]:45s} | Pages {p_start}-{p_end} | HTML len: {html_len}")

conn.close()
