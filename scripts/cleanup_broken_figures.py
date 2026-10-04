import sqlite3
import os
import glob

conn = sqlite3.connect('prisma/dev.db')
cur = conn.cursor()

cur.execute("SELECT count(*) FROM ContentFigure WHERE imagePath LIKE '%_img%.png'")
old_count = cur.fetchone()[0]

cur.execute("SELECT count(*) FROM ContentFigure WHERE imagePath LIKE '%_fig_%.png'")
new_count = cur.fetchone()[0]

print(f"Old broken placeholder figures in DB: {old_count}")
print(f"New recovered figures in DB: {new_count}")

# Delete the old broken placeholder figures
cur.execute("DELETE FROM ContentFigure WHERE imagePath LIKE '%_img%.png'")
conn.commit()

# Also remove the physical broken black placeholder files from public/extracted_figures/
deleted_files = 0
for f in glob.glob('public/extracted_figures/*_img*.png'):
    try:
        os.remove(f)
        deleted_files += 1
    except:
        pass

print(f"Cleaned up {old_count} old DB records and deleted {deleted_files} broken black placeholder image files.")
conn.close()
