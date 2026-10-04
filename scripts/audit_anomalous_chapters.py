import sqlite3

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()

# Check all chapters
c.execute('SELECT id, chapterNumber, title, slug FROM Chapter')
all_chapters = c.fetchall()
print(f"Total Chapter rows in database: {len(all_chapters)}")

# Non-canonical / test chapters
test_chaps = [ch for ch in all_chapters if ch[1] > 20 or 'test' in ch[3].lower() or 'test' in ch[2].lower()]
print("\n--- TEST / ANOMALOUS CHAPTERS FOUND ---")
for tch in test_chaps:
    print(tch)

# Check Questions mapped to test chapters
print("\n--- QUESTIONS IN TEST CHAPTERS ---")
for tch in test_chaps:
    c.execute('SELECT count(*) FROM Question WHERE chapterId = ?', (tch[0],))
    cnt = c.fetchone()[0]
    print(f"Chapter '{tch[2]}' ({tch[0]}): {cnt} questions")

# Check if any questions have chapter names in their metadata/provenance
c.execute("SELECT DISTINCT bookName FROM Question WHERE bookName IS NOT NULL")
books = c.fetchall()
print("\n--- BOOK NAMES IN QUESTIONS ---")
for b in books:
    print(b[0])

conn.close()
