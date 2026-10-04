import sqlite3

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()

def q(sql):
    return c.execute(sql).fetchone()[0]

print('--- INVENTORY CHECK ---')
print('Chapters:', q('SELECT COUNT(*) FROM Chapter'))
print('Topics:', q('SELECT COUNT(*) FROM Topic'))
print('Subtopics:', q('SELECT COUNT(*) FROM Subtopic'))
print('Concepts:', q('SELECT COUNT(*) FROM Concept'))
print('ContentFigure:', q('SELECT COUNT(*) FROM ContentFigure'))
print('ContentTable:', q('SELECT COUNT(*) FROM ContentTable'))
print('Total Questions:', q('SELECT COUNT(*) FROM Question'))
print('FINGERTIPS Questions:', q("SELECT COUNT(*) FROM Question WHERE sourceType = 'FINGERTIPS'"))
print('PYQ Questions:', q("SELECT COUNT(*) FROM Question WHERE sourceType = 'PYQ'"))
print('Tests in DB:', q('SELECT COUNT(*) FROM Test'))
print('TestQuestions in DB:', q('SELECT COUNT(*) FROM TestQuestion'))
print('ClassLevels:', [r[0] for r in c.execute('SELECT code FROM ClassLevel').fetchall()])
print('Subjects:', [r[0] for r in c.execute('SELECT name FROM Subject').fetchall()])

# Subject-wise breakdown
print('\n--- SUBJECT-WISE CHAPTERS & TOPICS ---')
c.execute("""
    SELECT s.name, cl.code, COUNT(DISTINCT c.id), COUNT(DISTINCT t.id)
    FROM Subject s
    JOIN ClassLevel cl ON s.classLevelId = cl.id
    LEFT JOIN Chapter c ON c.subjectId = s.id
    LEFT JOIN Topic t ON t.chapterId = c.id
    GROUP BY s.id
    ORDER BY cl.code ASC, s.name ASC
""")
for row in c.fetchall():
    print(f"{row[0]} ({row[1]}): {row[2]} Chapters, {row[3]} Topics")
