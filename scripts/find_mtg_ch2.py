import pymupdf

pdf_path = r"C:\Users\sagar\Downloads\ilide.info-mtg-fingertips-biology-2026-pr_1e3fca60e19e86ee3c28a324da2891c8.pdf"
doc = pymupdf.open(pdf_path)

# Let's search for "CHAPTER 2" or "Biological Classification" in the first 100 pages
for pno in range(100):
    text = doc[pno].get_text()
    if "biological classification" in text.lower() and ("ncert" in text.lower() or "topic" in text.lower() or "mcq" in text.lower()):
        print(f"Page {pno+1}:")
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        for l in lines[:15]:
            print("   ", l)
        print("...")
        break
