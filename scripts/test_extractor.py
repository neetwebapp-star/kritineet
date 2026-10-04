import sys
import os

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

sys.path.append('src/lib/auditor')
from pdf_extractor import NCERTPDFExtractor

ext = NCERTPDFExtractor('temp_ingestion/keph1dd/keph101.pdf', 1)
data = ext.extract_all()
print("Book code:", data['book_code'])
print("Title:", data['chapter_title'])
print("Sections found:", len(data['sections']))
for s in data['sections']:
    print(f"  Sec {s['section_number']} ({s['title']}) - {len(s['blocks'])} blocks")
print("Figures found:", len(data['figures']))
for f in data['figures']:
    print(f"  Fig: {f['fig_number']} - {f['caption'][:60]}")
print("Tables found:", len(data['tables']))
for t in data['tables']:
    print(f"  Tbl: {t['table_number']} - {t['title'][:60]}")
print("Formulas found:", len(data['formulas']))
for eq in data['formulas'][:5]:
    print(f"  Eq: {eq['equation_number']} | {eq['expression'][:40]}")
