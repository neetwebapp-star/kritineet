import os
import sys
import pymupdf
import re

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

DOWNLOADS = r"C:\Users\sagar\Downloads"

def inspect_pyq_format(filename, pages):
    doc = pymupdf.open(os.path.join(DOWNLOADS, filename))
    print(f"\n==================== {filename} ====================")
    for p in pages:
        if p < len(doc):
            text = doc[p].get_text()
            print(f"--- Page {p+1} ---")
            lines = [l.strip() for l in text.split('\n') if l.strip()]
            for l in lines[:25]:
                print("  ", l)
    doc.close()

if __name__ == '__main__':
    # Check NEET 2018 (selfstudys_com_file (20).pdf)
    inspect_pyq_format("selfstudys_com_file (20).pdf", [0, 1, 2, 20, 21, 30])
    # Check AIPMT 2014 (selfstudys_com_file (9).pdf)
    inspect_pyq_format("selfstudys_com_file (9).pdf", [0, 1, 2, 25, 26])
