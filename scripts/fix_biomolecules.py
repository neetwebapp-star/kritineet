import sqlite3

def run():
    conn = sqlite3.connect(r'prisma/dev.db')
    cur = conn.cursor()

    cur.execute('''
        SELECT s.id FROM Subject s 
        JOIN ClassLevel cl ON s.classLevelId = cl.id 
        WHERE s.code = 'CHEMISTRY' AND cl.code = 'CLASS_12'
    ''')
    chem12_id = cur.fetchone()[0]

    cur.execute("UPDATE Chapter SET ncertBookCode = 'kebo109' WHERE id = 'CH_KEBO109'")

    cur.execute('''
        INSERT OR REPLACE INTO Chapter (id, chapterNumber, title, slug, subjectId, biologyCategory, ncertBookCode)
        VALUES ('CH_LECH205', 10, 'Biomolecules', 'chemistry-class-12-biomolecules', ?, NULL, 'lech205')
    ''', (chem12_id,))

    cur.execute("UPDATE Concept SET chapterId = 'CH_LECH205' WHERE id LIKE '%LECH205%'")
    cur.execute("UPDATE ContentSection SET chapterId = 'CH_LECH205' WHERE id LIKE '%lech205%'")
    cur.execute("UPDATE ContentFigure SET chapterId = 'CH_LECH205' WHERE id LIKE '%LECH205%'")
    cur.execute("UPDATE ContentTable SET chapterId = 'CH_LECH205' WHERE id LIKE '%LECH205%'")
    cur.execute("UPDATE Question SET chapterId = 'CH_LECH205', subjectId = ? WHERE id LIKE '%LECH205%'", (chem12_id,))

    conn.commit()
    print("Biomolecules chapters successfully separated!")
    for r in cur.execute('''
        SELECT ch.id, ch.title, ch.ncertBookCode, s.name, cl.name 
        FROM Chapter ch 
        JOIN Subject s ON ch.subjectId = s.id 
        JOIN ClassLevel cl ON s.classLevelId = cl.id 
        WHERE ch.title LIKE '%Biomolecules%'
    ''').fetchall():
        print(" ", r)
    conn.close()

if __name__ == '__main__':
    run()
