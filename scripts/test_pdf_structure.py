import pymupdf
import re

doc = pymupdf.open('temp_ingestion/keph1dd/keph101.pdf')
print(f"Loaded keph101.pdf: {len(doc)} pages")

sections = []
figures = []
tables = []

for page_idx, page in enumerate(doc):
    page_num = page_idx + 1
    blocks = page.get_text("blocks")
    
    # Check for text blocks
    for b in blocks:
        # b: (x0, y0, x1, y1, text, block_no, block_type)
        if b[6] == 0:  # text block
            text = b[4].strip()
            # Detect section heading e.g. "1.1 INTRODUCTION", "1.2 THE INTERNATIONAL SYSTEM OF UNITS"
            sec_match = re.match(r'^(1\.\d+)\s+([A-Z\s,]+)', text)
            if sec_match:
                sections.append({
                    "page": page_num,
                    "section_num": sec_match.group(1),
                    "title": sec_match.group(2).strip(),
                    "raw": text[:80]
                })
            
            # Detect figures
            fig_match = re.search(r'Fig(?:ure)?\.?\s*(1\.\d+)\s*[:\.]?\s*(.*)', text, re.IGNORECASE)
            if fig_match:
                figures.append({
                    "page": page_num,
                    "fig_num": fig_match.group(1),
                    "caption": fig_match.group(2)[:80]
                })
                
            # Detect tables
            tbl_match = re.search(r'Table\s*(1\.\d+)\s*[:\.]?\s*(.*)', text, re.IGNORECASE)
            if tbl_match:
                tables.append({
                    "page": page_num,
                    "tbl_num": tbl_match.group(1),
                    "caption": tbl_match.group(2)[:80]
                })

print("\n--- DETECTED SECTIONS IN PDF ---")
for s in sections:
    print(f"  Page {s['page']:2d} | Sec {s['section_num']}: {s['title']}")

print("\n--- DETECTED FIGURES IN PDF ---")
for f in figures:
    print(f"  Page {f['page']:2d} | Fig {f['fig_num']}: {f['caption']}")

print("\n--- DETECTED TABLES IN PDF ---")
for t in tables:
    print(f"  Page {t['page']:2d} | Table {t['tbl_num']}: {t['caption']}")
