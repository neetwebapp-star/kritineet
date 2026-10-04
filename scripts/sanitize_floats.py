import sqlite3

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()

c.execute("UPDATE Question SET yearConfidence = 1.0 WHERE typeof(yearConfidence) = 'text'")
c.execute("UPDATE Question SET difficultyConfidence = 1.0 WHERE typeof(difficultyConfidence) = 'text'")
c.execute("UPDATE Question SET ocrConfidence = 1.0 WHERE typeof(ocrConfidence) = 'text'")
c.execute("UPDATE Question SET qualityScore = 1.0 WHERE typeof(qualityScore) = 'text'")

conn.commit()
print("Sanitized float fields in Question table. Rows affected:", conn.total_changes)
conn.close()
