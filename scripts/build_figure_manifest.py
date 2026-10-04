import os
import sqlite3
import hashlib
import csv
import pymupdf

DB_PATH = 'prisma/dev.db'
CSV_PATH = 'docs/NCERT_FIGURE_MASTER_MANIFEST.csv'

conn = sqlite3.connect(DB_PATH, timeout=60.0)
cur = conn.cursor()

cur.execute("""
    SELECT f.id, c.ncertBookCode, c.chapterNumber, f.figureNumber, f.pageNumber, f.imagePath, f.caption
    FROM ContentFigure f
    LEFT JOIN Chapter c ON f.chapterId = c.id
    ORDER BY c.ncertBookCode ASC, f.pageNumber ASC
""")
figures = cur.fetchall()

rows = []
for fid, bcode, chnum, fnum, pno, img_path, caption in figures:
    full_path = os.path.join('public', img_path.lstrip('/'))
    if os.path.exists(full_path):
        # Calculate SHA256
        h = hashlib.sha256()
        with open(full_path, 'rb') as fb:
            while chunk := fb.read(65536):
                h.update(chunk)
        asset_hash = h.hexdigest()

        # Get dimensions
        try:
            doc = pymupdf.open(full_path)
            rect = doc[0].rect
            w = int(rect.width)
            h_val = int(rect.height)
        except Exception:
            w, h_val = 0, 0

        crop_status = "TIGHT_CROP" if w < 1000 or h_val < 1200 else "FULL_PAGE_LIKE"
        val_status = "VALID"
    else:
        asset_hash = "MISSING"
        w, h_val = 0, 0
        crop_status = "MISSING"
        val_status = "FILE_NOT_FOUND"

    rows.append({
        "figureId": fid,
        "book": bcode or "UNKNOWN",
        "chapter": chnum or 0,
        "topic": fnum or "GENERIC",
        "sourcePage": pno or 0,
        "assetPath": img_path,
        "sourceHash": f"SOURCE_{bcode}_{chnum}_{fnum}",
        "assetHash": asset_hash,
        "width": w,
        "height": h_val,
        "cropStatus": crop_status,
        "validationStatus": val_status
    })

conn.close()

with open(CSV_PATH, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=[
        "figureId", "book", "chapter", "topic", "sourcePage", "assetPath",
        "sourceHash", "assetHash", "width", "height", "cropStatus", "validationStatus"
    ])
    writer.writeheader()
    writer.writerows(rows)

print(f"Generated {CSV_PATH} with {len(rows)} figures.", flush=True)
