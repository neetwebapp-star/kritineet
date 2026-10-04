import os
import sys
import pymupdf

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

DOWNLOADS = r"C:\Users\sagar\Downloads"

def inspect_ft(filename, pages_to_check):
    p = os.path.join(DOWNLOADS, filename)
    doc = pymupdf.open(p)
    print(f"\n=================== {filename} (Total pages: {len(doc)}) ===================")
    for p_no in pages_to_check:
        if p_no < len(doc):
            page = doc[p_no]
            text = page.get_text()
            images = page.get_images()
            print(f"--- Page {p_no + 1} ---")
            print(f"Text length: {len(text)}, Images: {len(images)}")
            print("Preview:", text[:250].replace('\n', ' '))
    doc.close()

if __name__ == '__main__':
    inspect_ft("ilide.info-mtg-fingertips-biology-2026-pr_1e3fca60e19e86ee3c28a324da2891c8.pdf", [0, 1, 2, 3, 4, 15, 16, 17, 25])
    inspect_ft("ilide.info-mtg-fingertips-chemistry-pr_389b136fd857701532b724db05f4d089.pdf", [0, 1, 2, 3, 10, 15])
    inspect_ft("ilide.info-mtg-fingertips-physics-1-k-pr_0341eca5571887a0223623dc639f74da.pdf", [0, 1, 2, 3, 10, 15])
