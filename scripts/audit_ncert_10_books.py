import pymupdf
import sqlite3
import os
import re
import json
import hashlib

DB_PATH = 'prisma/dev.db'

# Define the 10 authoritative NCERT books
BOOKS_CONFIG = [
    {"bookId": "NCERT_BIO_11", "class": 11, "subject": "Biology", "bookNumber": 1, "bookName": "Class 11 Biology", "folder": "temp_ingestion/kebo1dd", "prefix": "kebo1"},
    {"bookId": "NCERT_PHY_11_P1", "class": 11, "subject": "Physics", "bookNumber": 1, "bookName": "Class 11 Physics Part 1", "folder": "temp_ingestion/keph1dd", "prefix": "keph1"},
    {"bookId": "NCERT_PHY_11_P2", "class": 11, "subject": "Physics", "bookNumber": 2, "bookName": "Class 11 Physics Part 2", "folder": "temp_ingestion/keph2dd", "prefix": "keph2"},
    {"bookId": "NCERT_CHEM_11_P1", "class": 11, "subject": "Chemistry", "bookNumber": 1, "bookName": "Class 11 Chemistry Part 1", "folder": "temp_ingestion/kech1dd", "prefix": "kech1"},
    {"bookId": "NCERT_CHEM_11_P2", "class": 11, "subject": "Chemistry", "bookNumber": 2, "bookName": "Class 11 Chemistry Part 2", "folder": "temp_ingestion/kech2dd", "prefix": "kech2"},
    {"bookId": "NCERT_BIO_12", "class": 12, "subject": "Biology", "bookNumber": 1, "bookName": "Class 12 Biology", "folder": "temp_ingestion/lebo1dd", "prefix": "lebo1"},
    {"bookId": "NCERT_PHY_12_P1", "class": 12, "subject": "Physics", "bookNumber": 1, "bookName": "Class 12 Physics Part 1", "folder": "temp_ingestion/leph1dd", "prefix": "leph1"},
    {"bookId": "NCERT_PHY_12_P2", "class": 12, "subject": "Physics", "bookNumber": 2, "bookName": "Class 12 Physics Part 2", "folder": "temp_ingestion/leph2dd", "prefix": "leph2"},
    {"bookId": "NCERT_CHEM_12_P1", "class": 12, "subject": "Chemistry", "bookNumber": 1, "bookName": "Class 12 Chemistry Part 1", "folder": "temp_ingestion/lech1dd", "prefix": "lech1"},
    {"bookId": "NCERT_CHEM_12_P2", "class": 12, "subject": "Chemistry", "bookNumber": 2, "bookName": "Class 12 Chemistry Part 2", "folder": "temp_ingestion/lech2dd", "prefix": "lech2"}
]

conn = sqlite3.connect(DB_PATH, timeout=60.0)
cur = conn.cursor()

# Get all current chapters and topics in database
cur.execute("SELECT id, chapterNumber, title, ncertBookCode FROM Chapter")
db_chapters = {c[3].lower() if c[3] else f"num_{c[1]}": {"id": c[0], "number": c[1], "title": c[2]} for c in cur.fetchall()}

cur.execute("""
    SELECT t.id, t.topicNumber, t.title, t.chapterId, c.ncertBookCode
    FROM Topic t
    JOIN Chapter c ON t.chapterId = c.id
""")
db_topics = {}
for tid, tnum, title, chid, bcode in cur.fetchall():
    key = f"{bcode.lower() if bcode else chid}_{tnum}"
    db_topics[key] = {"id": tid, "number": tnum, "title": title}

cur.execute("SELECT id, subtopicNumber, title, topicId FROM Subtopic")
db_subtopics = {f"{s[3]}_{s[1]}": {"id": s[0], "number": s[1], "title": s[2]} for s in cur.fetchall()}

master_manifest = {
    "generatedAt": "2026-10-01T22:30:00Z",
    "totalBooks": len(BOOKS_CONFIG),
    "books": []
}

total_source_chapters = 0
total_source_topics = 0
total_source_subtopics = 0
total_source_figures = 0
total_source_tables = 0
total_source_paras = 0

reconciliation_records = []

for bcfg in BOOKS_CONFIG:
    book_info = {
        "bookId": bcfg["bookId"],
        "class": bcfg["class"],
        "subject": bcfg["subject"],
        "bookNumber": bcfg["bookNumber"],
        "bookName": bcfg["bookName"],
        "sourceDirectory": bcfg["folder"],
        "totalPages": 0,
        "totalChapters": 0,
        "chapters": []
    }

    if not os.path.exists(bcfg["folder"]):
        master_manifest["books"].append(book_info)
        continue

    files = sorted([f for f in os.listdir(bcfg["folder"]) if f.lower().endswith('.pdf') and not f.lower().endswith(('ps.pdf', 'an.pdf', 'a1.pdf'))])
    
    for f in files:
        fpath = os.path.join(bcfg["folder"], f)
        code = f.lower().replace('.pdf', '')
        
        # Calculate SHA256
        h = hashlib.sha256()
        with open(fpath, 'rb') as fb:
            while chunk := fb.read(65536):
                h.update(chunk)
        f_hash = h.hexdigest()

        try:
            doc = pymupdf.open(fpath)
        except Exception as e:
            continue

        p_count = len(doc)
        book_info["totalPages"] += p_count
        book_info["totalChapters"] += 1
        total_source_chapters += 1

        # Extract chapter headings and content
        ch_title = ""
        ch_num_match = re.search(r'\d+', code)
        ch_num = int(ch_num_match.group(0)) if ch_num_match else 1
        
        ch_topics = []
        ch_figures = []
        ch_tables = []
        ch_paras = 0

        # Scan all pages
        for pno in range(p_count):
            page = doc[pno]
            blocks = page.get_text("blocks")
            
            for b in blocks:
                b_text = b[4].strip()
                if not b_text: continue

                # Figure check
                m_fig = re.match(r'^\s*(?:Figure|Fig\.)\s*(\d+\.\d+[a-z]?)([\s\:\.\-][^\n]*)?', b_text, re.IGNORECASE)
                if m_fig:
                    fnum = m_fig.group(1)
                    caption = b_text.split('\n')[0].strip()
                    ch_figures.append({"figureNumber": fnum, "caption": caption, "page": pno + 1})
                    continue

                # Table check
                m_tab = re.match(r'^\s*(?:Table|Tab\.)\s*(\d+\.\d+)', b_text, re.IGNORECASE)
                if m_tab:
                    tnum = m_tab.group(1)
                    ch_tables.append({"tableNumber": tnum, "page": pno + 1})
                    continue

                # Subtopic check e.g. 2.1.1 Archaebacteria
                m_sub = re.match(r'^\s*(\d+\.\d+\.\d+)\s+([A-Za-z0-9\s,\-\(\)\'\"]+)', b_text)
                if m_sub:
                    sub_num = m_sub.group(1)
                    sub_title = m_sub.group(2).split('\n')[0].strip()
                    total_source_subtopics += 1
                    if ch_topics:
                        ch_topics[-1]["subtopics"].append({"number": sub_num, "title": sub_title, "page": pno + 1})
                    continue

                # Major topic check e.g. 2.1 KINGDOM MONERA
                m_top = re.match(r'^\s*(\d+\.\d+)\s+([A-Za-z0-9\s,\-\(\)\'\"]+)', b_text)
                if m_top:
                    top_num = m_top.group(1)
                    top_title = m_top.group(2).split('\n')[0].strip()
                    # Skip running header if matched
                    if len(top_title) > 2 and not any(h in top_title.upper() for h in ['BIOLOGY', 'PHYSICS', 'CHEMISTRY']):
                        total_source_topics += 1
                        ch_topics.append({
                            "number": top_num,
                            "title": top_title,
                            "page": pno + 1,
                            "subtopics": []
                        })
                    continue

                # Running paragraph block
                if len(b_text) > 40 and not any(h in b_text.upper() for h in ['REPRINT 2026', 'BIOLOGY 1', 'CHEMISTRY 1', 'PHYSICS 1']):
                    ch_paras += 1
                    total_source_paras += 1

        total_source_figures += len(ch_figures)
        total_source_tables += len(ch_tables)

        # Reconcile chapter with database
        db_ch = db_chapters.get(code)
        ch_status = "MATCHED" if db_ch else "MISSING_FROM_DATABASE"

        # Reconcile topics
        for t in ch_topics:
            tkey = f"{code}_{t['number']}"
            db_t = db_topics.get(tkey)
            if db_t:
                # Check for rename
                t_diff = "MATCHED" if db_t["title"].strip().lower() == t["title"].strip().lower() else "RENAMED"
                reconciliation_records.append({
                    "bookId": bcfg["bookId"],
                    "bookCode": code,
                    "topicNumber": t["number"],
                    "sourceTitle": t["title"],
                    "databaseTitle": db_t["title"],
                    "status": t_diff,
                    "databaseId": db_t["id"]
                })
            else:
                reconciliation_records.append({
                    "bookId": bcfg["bookId"],
                    "bookCode": code,
                    "topicNumber": t["number"],
                    "sourceTitle": t["title"],
                    "databaseTitle": None,
                    "status": "MISSING_FROM_DATABASE",
                    "databaseId": None
                })

        ch_data = {
            "chapterNumber": ch_num,
            "bookCode": code,
            "sourceFile": f,
            "sourceFileHash": f_hash,
            "totalPages": p_count,
            "topicsCount": len(ch_topics),
            "figuresCount": len(ch_figures),
            "tablesCount": len(ch_tables),
            "paragraphsCount": ch_paras,
            "topics": ch_topics,
            "figures": ch_figures,
            "status": ch_status
        }
        book_info["chapters"].append(ch_data)

    master_manifest["books"].append(book_info)

# Write NCERT_SOURCE_MASTER_MANIFEST.json
with open('docs/NCERT_SOURCE_MASTER_MANIFEST.json', 'w', encoding='utf-8') as f:
    json.dump(master_manifest, f, indent=2)

# Write NCERT_SOURCE_MASTER_MANIFEST.md
with open('docs/NCERT_SOURCE_MASTER_MANIFEST.md', 'w', encoding='utf-8') as f:
    f.write("# NCERT 10-Book Source Master Manifest & Complete Audit\n\n")
    f.write("## 1. Executive Summary\n\n")
    f.write(f"- **Total Authoritative NCERT Books**: {len(BOOKS_CONFIG)}\n")
    f.write(f"- **Total Chapters Audited**: {total_source_chapters}\n")
    f.write(f"- **Total Source Topics Discovered**: {total_source_topics}\n")
    f.write(f"- **Total Subtopics Discovered**: {total_source_subtopics}\n")
    f.write(f"- **Total Figures Discovered in Source**: {total_source_figures}\n")
    f.write(f"- **Total Tables Discovered in Source**: {total_source_tables}\n")
    f.write(f"- **Total Content Paragraphs**: {total_source_paras}\n\n")
    
    f.write("## 2. 10 Books Overview\n\n")
    f.write("| Book ID | Class | Subject | Book Name | Chapters | Pages |\n")
    f.write("| :--- | :--- | :--- | :--- | :--- | :--- |\n")
    for b in master_manifest["books"]:
        f.write(f"| `{b['bookId']}` | {b['class']} | {b['subject']} | {b['bookName']} | {b['totalChapters']} | {b['totalPages']} |\n")

    f.write("\n## 3. Hierarchy Reconciliation Sample\n\n")
    f.write("| Book | Topic # | Authoritative Source Title | Database Title | Status |\n")
    f.write("| :--- | :--- | :--- | :--- | :--- |\n")
    for r in reconciliation_records[:45]:
        f.write(f"| `{r['bookCode']}` | `{r['topicNumber']}` | {r['sourceTitle']} | {r['databaseTitle'] or 'N/A'} | `{r['status']}` |\n")

print(f"Manifest Complete! 10 Books, {total_source_chapters} Chapters, {total_source_topics} Topics, {total_source_subtopics} Subtopics, {total_source_figures} Figures.", flush=True)
conn.close()
