import asyncio
import pymupdf
import winsdk.windows.graphics.imaging as imaging
import winsdk.windows.media.ocr as ocr
import winsdk.windows.storage as storage
import os
import re
import json

async def ocr_page(doc, p_no, engine):
    page = doc[p_no]
    imgs = page.get_images()
    if not imgs: return ""
    base_img = doc.extract_image(imgs[0][0])
    img_path = f"temp_ingestion/parse_p_{p_no}.jpg"
    with open(img_path, "wb") as f:
        f.write(base_img["image"])
    file = await storage.StorageFile.get_file_from_path_async(os.path.abspath(img_path))
    stream = await file.open_async(storage.FileAccessMode.READ)
    decoder = await imaging.BitmapDecoder.create_async(stream)
    bitmap = await decoder.get_software_bitmap_async()
    res = await engine.recognize_async(bitmap)
    if os.path.exists(img_path): os.remove(img_path)
    return res.text

async def test_parse_ch1():
    doc = pymupdf.open("temp_ingestion/mtg_source/biology_fingertips.pdf")
    engine = ocr.OcrEngine.try_create_from_user_profile_languages()
    
    # OCR Exam Scorer pages for Bio Ch 1: pages 31, 32, 33, 34, 35, 36, 37
    pages_text = {}
    for p in range(31, 38):
        t = await ocr_page(doc, p, engine)
        pages_text[p] = t
        print(f"OCRed page {p+1}, len={len(t)}")

    with open("temp_ingestion/bio_ch1_ocr.json", "w", encoding="utf-8") as f:
        json.dump(pages_text, f, indent=2)

if __name__ == '__main__':
    asyncio.run(test_parse_ch1())
