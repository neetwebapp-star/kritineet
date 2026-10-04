import os
import sys
import glob
import re
import pymupdf

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

DOWNLOADS = r"C:\Users\sagar\Downloads"

def analyze_all_pyqs():
    pyqs = sorted(glob.glob(os.path.join(DOWNLOADS, "selfstudys_com_file*.pdf")))
    print(f"Analyzing {len(pyqs)} PYQ files:\n")
    
    for f in pyqs:
        fname = os.path.basename(f)
        doc = pymupdf.open(f)
        num_pages = len(doc)
        total_text_len = 0
        exam_found = None
        year_found = None
        
        # Scan first 5 pages for text and exam/year
        full_sample = ""
        for i in range(min(5, num_pages)):
            t = doc[i].get_text()
            total_text_len += len(t)
            full_sample += " " + t
            
        m_year = re.search(r'\b(19\d{2}|20[0-2]\d)\b', full_sample)
        m_exam = re.search(r'\b(NEET|AIPMT|AIIMS|JIPMER)\b', full_sample, re.IGNORECASE)
        
        # Look for explicit headers like "NEET - 2021", "AIPMT 2015"
        m_explicit = re.search(r'(NEET|AIPMT|AIIMS|CBSE\s+AIPMT)[\s\-\–\(\)]*(\d{4})', full_sample, re.IGNORECASE)
        if m_explicit:
            exam_found = m_explicit.group(1).upper()
            year_found = int(m_explicit.group(2))
        else:
            if m_year: year_found = int(m_year.group(1))
            if m_exam: exam_found = m_exam.group(1).upper()
            
        is_scanned = (total_text_len < 300)
        status = "SCANNED_IMAGES" if is_scanned else f"VECTOR_TEXT ({total_text_len} chars in 5p)"
        print(f"[{fname}] {num_pages}p | Exam: {exam_found} | Year: {year_found} | Status: {status}")
        doc.close()

if __name__ == '__main__':
    analyze_all_pyqs()
