import sqlite3
import json
from datetime import datetime

with open('scratch/audit_mapping_results.json', 'r', encoding='utf-8') as f:
    mapping_data = json.load(f)

results = mapping_data['results']

syllabus_chapters = []
for r in results:
    status = 'INCLUDED' if r['action'] == 'KEEP' else 'REMOVED'
    sub_code = 'BIOLOGY' if 'Biology' in r['subject'] else ('CHEMISTRY' if 'Chemistry' in r['subject'] else 'PHYSICS')
    class_code = 'CLASS_11' if '11' in r['class'] else 'CLASS_12'
    
    entry = {
        'chapterSlug': r['slug'],
        'chapterTitle': r['title'],
        'subjectCode': sub_code,
        'classLevelCode': class_code,
        'status': status,
        'notes': r['reason'],
        'targetMatch': r.get('target_match')
    }
    syllabus_chapters.append(entry)

# Also add the legacy Communication Systems chapter as REMOVED
syllabus_chapters.append({
    'chapterSlug': 'communication-systems',
    'chapterTitle': 'Communication Systems (Legacy NCERT Ch 15)',
    'subjectCode': 'PHYSICS',
    'classLevelCode': 'CLASS_12',
    'status': 'REMOVED',
    'notes': 'Legacy chapter omitted from NEET 2024-2027 syllabus',
    'targetMatch': None
})

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()

c.execute("SELECT id FROM ExamSyllabus WHERE status = 'ACTIVE'")
row = c.fetchone()
if row:
    s_id = row[0]
    c.execute(
        "UPDATE ExamSyllabus SET syllabusDataJson = ?, title = ?, updatedAt = ? WHERE id = ?",
        (
            json.dumps({'chapters': syllabus_chapters}, indent=2),
            'NEET UG 2027 Target Canonical Syllabus',
            datetime.now().isoformat(),
            s_id
        )
    )
    conn.commit()
    print(f"Updated ExamSyllabus {s_id} with {len(syllabus_chapters)} chapters ({len([x for x in syllabus_chapters if x['status'] == 'INCLUDED'])} INCLUDED, {len([x for x in syllabus_chapters if x['status'] == 'REMOVED'])} REMOVED).")
else:
    print("No active ExamSyllabus found.")

conn.close()
