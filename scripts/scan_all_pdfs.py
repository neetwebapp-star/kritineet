import pymupdf
import re
import os
import glob

pdf_files = sorted(glob.glob('temp_ingestion/keph1dd/keph10[1-7].pdf'))

for pdf_path in pdf_files:
    fname = os.path.basename(pdf_path)
    ch_num = int(fname[5:7])
    doc = pymupdf.open(pdf_path)
    
    sec_set = set()
    fig_set = set()
    tbl_set = set()
    
    for page_idx, page in enumerate(doc):
        text = page.get_text("text")
        
        # Sections e.g. "2.1 INTRODUCTION", "2.2 POSITION, PATH LENGTH..."
        # Regex looks for chapter_num.section_num
        for m in re.finditer(rf'(?:^|\n)({ch_num}\.\d+)\s+([A-Z][A-Z\s,\-–()]+)', text):
            sec_num = m.group(1)
            title = m.group(2).strip().split('\n')[0]
            if len(title) > 2 and not title.startswith('TABLE') and not title.startswith('FIG'):
                sec_set.add((sec_num, title[:40]))
                
        # Figures e.g. "Fig. 2.1", "Figure 2.1"
        for m in re.finditer(rf'Fig(?:ure)?\.?\s*({ch_num}\.\d+)', text, re.IGNORECASE):
            fig_set.add(m.group(1))
            
        # Tables e.g. "Table 2.1"
        for m in re.finditer(rf'Table\s*({ch_num}\.\d+)', text, re.IGNORECASE):
            tbl_set.add(m.group(1))
            
    print(f"\n==========================================")
    print(f"PDF: {fname} (Chapter {ch_num}) - {len(doc)} pages")
    print(f"==========================================")
    print(f"Sections ({len(sec_set)}): {sorted(list(sec_set))}")
    print(f"Figures ({len(fig_set)}): {sorted(list(fig_set), key=lambda x: [int(p) for p in x.split('.') if p.isdigit()])}")
    print(f"Tables ({len(tbl_set)}): {sorted(list(tbl_set), key=lambda x: [int(p) for p in x.split('.') if p.isdigit()])}")
