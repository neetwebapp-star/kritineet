import pymupdf
import glob
import os

pdf_files = sorted(glob.glob('temp_ingestion/keph1dd/keph10*.pdf'))
print(f"Found {len(pdf_files)} PDF files in temp_ingestion/keph1dd/:")
total_pages = 0
for p in pdf_files:
    doc = pymupdf.open(p)
    pages = len(doc)
    total_pages += pages
    title = doc.metadata.get('title', '')
    print(f"  {os.path.basename(p)}: {pages:2d} pages | {title[:60]}")
print(f"Total Pages in Book 1: {total_pages}")
