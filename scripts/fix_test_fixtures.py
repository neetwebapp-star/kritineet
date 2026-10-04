import sqlite3

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()

c.execute("""
UPDATE Question 
SET bookName = 'MTG NCERT at your Fingertips - Physics',
    bookEdition = '2024'
WHERE id = 'Q_DUP_TEST_001'
""")

c.execute("""
UPDATE Question 
SET examName = 'NEET',
    examYear = 2024,
    yearSource = 'EXPLICIT_METADATA',
    yearConfidence = 'HIGH'
WHERE id = 'Q_UNVERIFIED_DRAFT_TEST'
""")

conn.commit()
print("Updated test fixture records.")
conn.close()
