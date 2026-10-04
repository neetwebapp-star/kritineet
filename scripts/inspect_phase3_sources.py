import os
import glob
import re
import sys
import pymupdf

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

DOWNLOADS = r"C:\Users\sagar\Downloads"

def inspect_pyqs():
    print("=== INSPECTING PYQ PDFS IN DOWNLOADS ===")
    pyq_files = sorted(glob.glob(os.path.join(DOWNLOADS, "selfstudys_com_file*.pdf")))
    print(f"Total PYQ files found: {len(pyq_files)}")
    
    for idx, f in enumerate(pyq_files):
        fname = os.path.basename(f)
        size_mb = os.path.getsize(f) / (1024 * 1024)
        doc = pymupdf.open(f)
        page_count = len(doc)
        
        # Check first 2 pages text
        p1_text = doc[0].get_text()[:400].replace('\n', ' ') if page_count > 0 else ""
        p2_text = doc[1].get_text()[:300].replace('\n', ' ') if page_count > 1 else ""
        
        # Detect year & exam
        header_text = p1_text + " " + p2_text
        year_match = re.search(r'\b(19\d{2}|20[0-2]\d)\b', header_text)
        exam_match = re.search(r'\b(NEET|AIPMT|AIIMS|JIPMER)\b', header_text, re.IGNORECASE)
        
        year_str = year_match.group(1) if year_match else "UNKNOWN"
        exam_str = exam_match.group(1).upper() if exam_match else "UNKNOWN"
        
        print(f"[{idx+1:02d}] {fname} | {size_mb:.1f}MB | {page_count} pages | Exam: {exam_str} | Year: {year_str}")
        print(f"     Preview: {p1_text[:120]}...")
        doc.close()

def inspect_fingertips():
    print("\n=== INSPECTING MTG FINGERTIPS BOOKS IN DOWNLOADS ===")
    ft_files = sorted(glob.glob(os.path.join(DOWNLOADS, "*fingertips*.pdf")))
    print(f"Total MTG Fingertips books found: {len(ft_files)}")
    
    for idx, f in enumerate(ft_files):
        fname = os.path.basename(f)
        size_mb = os.path.getsize(f) / (1024 * 1024)
        doc = pymupdf.open(f)
        page_count = len(doc)
        
        # Determine subject
        subj = "UNKNOWN"
        if "biology" in fname.lower(): subj = "BIOLOGY"
        elif "chemistry" in fname.lower(): subj = "CHEMISTRY"
        elif "physics" in fname.lower(): subj = "PHYSICS"
        
        # Sample text from middle page (e.g. page 50)
        sample_page = doc[min(50, page_count - 1)]
        sample_text = sample_page.get_text()[:300].replace('\n', ' ')
        
        print(f"[{idx+1}] {fname} | Subject: {subj} | {size_mb:.1f}MB | {page_count} pages")
        print(f"    Page 50 Sample: {sample_text[:150]}...")
        doc.close()

if __name__ == "__main__":
    inspect_pyqs()
    inspect_fingertips()
