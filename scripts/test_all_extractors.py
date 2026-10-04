import sys
sys.path.append('src/lib/auditor')
from pdf_extractor import NCERTPDFExtractor

total_pdf_sections = 0
total_pdf_blocks = 0
total_pdf_figures = 0
total_pdf_tables = 0

for ch_num in range(1, 8):
    pdf_path = f"temp_ingestion/keph1dd/keph10{ch_num}.pdf"
    ext = NCERTPDFExtractor(pdf_path, ch_num)
    data = ext.extract_all()
    
    # Filter out exercises section from main reading sections
    main_sections = [s for s in data['sections'] if not s['section_number'].endswith('exercises')]
    blocks_count = sum(len(s['blocks']) for s in main_sections)
    
    total_pdf_sections += len(main_sections)
    total_pdf_blocks += blocks_count
    total_pdf_figures += len(data['figures'])
    total_pdf_tables += len(data['tables'])
    
    sec_names = [f"{s['section_number']}: {s['title'][:20]}" for s in main_sections]
    print(f"Ch {ch_num} ({data['chapter_title'][:30]}): {len(main_sections)} Secs, {blocks_count} Blocks, {len(data['figures'])} Figs, {len(data['tables'])} Tables")
    print(f"    Sections: {', '.join(sec_names[:6])}{'...' if len(sec_names) > 6 else ''}")

print("\n==========================================")
print(f"TOTAL CLASS 11 PHYSICS BOOK 1 (NCERT PDF):")
print(f"  Chapters: 7")
print(f"  Sections: {total_pdf_sections}")
print(f"  Content Blocks: {total_pdf_blocks}")
print(f"  Figures: {total_pdf_figures}")
print(f"  Tables: {total_pdf_tables}")
print("==========================================")
