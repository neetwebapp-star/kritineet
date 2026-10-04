import pymupdf
import sqlite3
import os
import re

DB_PATH = 'prisma/dev.db'
OUTPUT_DIR = 'public/extracted_figures'
os.makedirs(OUTPUT_DIR, exist_ok=True)

conn = sqlite3.connect(DB_PATH, timeout=60.0)
cur = conn.cursor()

# Get all chapters with their ncertBookCode
cur.execute("SELECT id, chapterNumber, ncertBookCode, title FROM Chapter WHERE ncertBookCode IS NOT NULL")
chapters = cur.fetchall()

pdf_map = {}
for root, dirs, files in os.walk('temp_ingestion'):
    for f in files:
        if f.lower().endswith('.pdf'):
            code = f.lower().replace('.pdf', '')
            pdf_map[code] = os.path.join(root, f)

print(f"Loaded {len(chapters)} chapters and {len(pdf_map)} PDF files.", flush=True)

total_recovered = 0

for ch_id, ch_num, book_code, title in chapters:
    pdf_path = pdf_map.get(book_code.lower())
    if not pdf_path or not os.path.exists(pdf_path):
        continue

    try:
        doc = pymupdf.open(pdf_path)
    except Exception as e:
        print(f"Failed to open {pdf_path}: {e}", flush=True)
        continue

    pw = doc[0].rect.width
    ph = doc[0].rect.height
    ch_fig_count = 0

    for pno in range(len(doc)):
        page = doc[pno]
        blocks = page.get_text("blocks")
        img_infos = page.get_image_info()

        # Find figure blocks
        for b in blocks:
            b_text = b[4].strip()
            # Match "Figure 1.2" or "Fig. 1.2"
            matches = list(re.finditer(r'(?:Figure|Fig\.)\s*(\d+\.\d+[a-z]?)([\s\:\.\-][^\n]*)?', b_text, re.IGNORECASE))
            if not matches:
                continue

            for match in matches:
                fig_num = match.group(1)
                caption = (match.group(0) or f"Figure {fig_num}").strip().replace('\n', ' ')
                
                # Bounding box of caption
                bx0, by0, bx1, by1 = b[0], b[1], b[2], b[3]

                # Determine column span
                is_right_col = bx0 > 240
                is_full_width = (bx1 - bx0) > 280 or (bx0 < 220 and bx1 > 350)

                if is_full_width:
                    crop_x0 = 35.0
                    crop_x1 = pw - 35.0
                elif is_right_col:
                    crop_x0 = 240.0
                    crop_x1 = pw - 35.0
                else:
                    crop_x0 = 35.0
                    crop_x1 = min(pw - 180, max(bx1 + 40, 310.0))

                # Check if any image is above or around this caption
                nearby_imgs = [img['bbox'] for img in img_infos if abs(img['bbox'][3] - by0) < 320 and img['bbox'][2] > img['bbox'][0] + 20 and img['bbox'][3] > img['bbox'][1] + 20]
                
                if nearby_imgs:
                    min_y0 = min(img[1] for img in nearby_imgs)
                    max_y1 = max(img[3] for img in nearby_imgs)
                    min_x0 = min(img[0] for img in nearby_imgs)
                    max_x1 = max(img[2] for img in nearby_imgs)
                    crop_rect = pymupdf.Rect(
                        min(crop_x0, min_x0 - 10),
                        max(40.0, min_y0 - 15),
                        max(crop_x1, max_x1 + 10),
                        min(ph - 30, max(by1 + 10, max_y1 + 10))
                    )
                else:
                    crop_y0 = max(45.0, by0 - 240.0)
                    crop_y1 = min(ph - 30, by1 + 10.0)
                    crop_rect = pymupdf.Rect(crop_x0, crop_y0, crop_x1, crop_y1)

                try:
                    pix = page.get_pixmap(clip=crop_rect, dpi=180)
                    samples = pix.samples
                    is_black = all(b < 15 for b in samples[:min(len(samples), 2000)])
                    if is_black:
                        pix = page.get_pixmap(clip=crop_rect, dpi=150, alpha=False)

                    out_name = f"{book_code}_fig_{fig_num.replace('.', '_')}.png"
                    out_path = os.path.join(OUTPUT_DIR, out_name)
                    pix.save(out_path)

                    fig_id = f"FIG_{book_code.upper()}_{fig_num.replace('.', '_')}"
                    image_url = f"/extracted_figures/{out_name}"

                    cur.execute("""
                        INSERT OR REPLACE INTO ContentFigure (
                            id, figureNumber, caption, imagePath, pageNumber, chapterId, contentAssetId
                        ) VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (fig_id, fig_num, caption[:200], image_url, pno + 1, ch_id, f"ASSET_{book_code.upper()}"))

                    total_recovered += 1
                    ch_fig_count += 1

                except Exception as crop_err:
                    print(f"Error cropping {fig_num} on page {pno+1}: {crop_err}", flush=True)

    doc.close()
    conn.commit()
    print(f"[{book_code.upper()}] Recovered {ch_fig_count} figures for '{title}' (Total: {total_recovered})", flush=True)

conn.close()
print(f"\nCOMPLETED: Recovered {total_recovered} figures across all chapters.", flush=True)
