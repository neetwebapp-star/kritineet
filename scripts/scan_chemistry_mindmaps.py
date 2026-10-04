import os
import json
import sqlite3

def run_scan():
    source_dir = r"C:\Users\sagar\OneDrive\Desktop\New folder"
    all_files = []
    for root, dirs, files in os.walk(source_dir):
        for f in files:
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, source_dir)
            size = os.path.getsize(full_path)
            ext = os.path.splitext(f)[1].lower()
            all_files.append({
                'filename': f,
                'rel_path': rel_path,
                'full_path': full_path,
                'size': size,
                'ext': ext
            })

    print(f"Total files in source folder: {len(all_files)}")

    conn = sqlite3.connect("prisma/dev.db")
    cursor = conn.cursor()
    cursor.execute("""
        SELECT c.id, c.chapterNumber, c.title, c.slug, s.name, cl.name
        FROM Chapter c
        JOIN Subject s ON c.subjectId = s.id
        JOIN ClassLevel cl ON s.classLevelId = cl.id
        WHERE s.name LIKE '%Chem%'
        ORDER BY cl.name, c.chapterNumber
    """)

    chapters = []
    for row in cursor.fetchall():
        chapters.append({
            'id': row[0],
            'chapterNumber': row[1],
            'title': row[2],
            'slug': row[3],
            'subjectName': row[4],
            'className': row[5]
        })

    print(f"Total Chemistry chapters in database: {len(chapters)}")

    with open("scripts/scan_output.json", "w", encoding="utf-8") as out:
        json.dump({'files': all_files, 'chapters': chapters}, out, indent=2)

    print("Wrote scan_output.json successfully.")

if __name__ == "__main__":
    run_scan()
