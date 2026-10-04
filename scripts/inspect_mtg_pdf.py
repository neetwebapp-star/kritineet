import pymupdf
import os

pdf_path = r"C:\Users\sagar\Downloads\ilide.info-mtg-fingertips-biology-2026-pr_1e3fca60e19e86ee3c28a324da2891c8.pdf"
doc = pymupdf.open(pdf_path)
print("Total pages in MTG Biology:", len(doc))

# Search table of contents or search for Chapter 1 / Chapter 2
for pno in range(min(15, len(doc))):
    text = doc[pno].get_text()
    if "biological classification" in text.lower() or "living world" in text.lower():
        print(f"Page {pno+1} mentions chapter:")
        for line in text.split('\n')[:10]:
            print("  ", line)
