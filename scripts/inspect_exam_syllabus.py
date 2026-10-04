import sqlite3
import json

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()
c.execute("SELECT id, version, title, status, syllabusDataJson FROM ExamSyllabus WHERE status = 'ACTIVE'")
row = c.fetchone()
if row:
    print(f"ID: {row[0]}, Version: {row[1]}, Title: {row[2]}, Status: {row[3]}")
    data = json.loads(row[4])
    chapters = data.get('chapters', [])
    print(f"Total chapters: {len(chapters)}")
    for ch in chapters:
        print(f"  [{ch.get('subjectCode')}] [{ch.get('classLevelCode')}] {ch.get('chapterTitle')} (slug: {ch.get('chapterSlug')}) - Status: {ch.get('status')}")

conn.close()
