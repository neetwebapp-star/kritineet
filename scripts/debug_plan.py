import sqlite3

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()

rows = c.execute("SELECT date, plannedMinutes, preparationStage FROM DailyStudyPlan WHERE plannedMinutes > 600").fetchall()
print("Overloaded days:", rows)

topic_rows = c.execute("SELECT date, COUNT(id) FROM DailyStudyTask WHERE taskType = 'NCERT_READ' GROUP BY date ORDER BY date").fetchall()
print(f"Total dates with NCERT_READ: {len(topic_rows)}")
print("First 5:", topic_rows[:5])
print("Last 10:", topic_rows[-10:])
