import pymupdf

pdf_path = r"C:\Users\sagar\Downloads\ilide.info-mtg-fingertips-biology-2026-pr_1e3fca60e19e86ee3c28a324da2891c8.pdf"
doc = pymupdf.open(pdf_path)
for p in range(5):
    t = doc[p].get_text()
    print(f"Page {p+1} text length: {len(t)}")
    if len(t) > 0:
        print("Sample:", repr(t[:200]))
