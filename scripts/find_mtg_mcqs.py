import asyncio
import os
import sys
import pymupdf
import re
import winsdk.windows.graphics.imaging as imaging
import winsdk.windows.media.ocr as ocr
import winsdk.windows.storage as storage

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

async def recognize_page(doc, page_num: int) -> str:
    page = doc[page_num]
    imgs = page.get_images()
    if not imgs: return ""
    base_img = doc.extract_image(imgs[0][0])
    img_path = f"temp_ingestion/p_{page_num}.jpg"
    with open(img_path, "wb") as f:
        f.write(base_img["image"])

    abs_path = os.path.abspath(img_path)
    file = await storage.StorageFile.get_file_from_path_async(abs_path)
    stream = await file.open_async(storage.FileAccessMode.READ)
    decoder = await imaging.BitmapDecoder.create_async(stream)
    bitmap = await decoder.get_software_bitmap_async()
    
    engine = ocr.OcrEngine.try_create_from_user_profile_languages()
    result = await engine.recognize_async(bitmap)
    return result.text

async def main():
    p = r"C:\Users\sagar\Downloads\ilide.info-mtg-fingertips-biology-2026-pr_1e3fca60e19e86ee3c28a324da2891c8.pdf"
    doc = pymupdf.open(p)
    print("Searching for Practice Questions & Answer Key in pages 25-35...")
    for p_no in range(24, 35):
        t = await recognize_page(doc, p_no)
        print(f"Page {p_no + 1}: len={len(t)}")
        # Check if contains MCQs or Answer Key
        if "MCQ" in t.upper() or "HINTS" in t.upper() or "ANSWER" in t.upper() or re.search(r'\b1\.\s+[A-Z]', t):
            print(f"  --> MATCH on Page {p_no + 1}:")
            lines = [l.strip() for l in t.splitlines() if l.strip()]
            for l in lines[:15]:
                print("     ", l)
    doc.close()

if __name__ == '__main__':
    asyncio.run(main())
