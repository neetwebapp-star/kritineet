import asyncio
import pymupdf
import winsdk.windows.graphics.imaging as imaging
import winsdk.windows.media.ocr as ocr
import winsdk.windows.storage as storage
import os
import io
import re
import json
from PIL import Image

async def ocr_pil_image(pil_img, engine, name):
    buf = io.BytesIO()
    pil_img.save(buf, format='JPEG', quality=95)
    img_path = f"temp_ingestion/col_{name}.jpg"
    with open(img_path, "wb") as f:
        f.write(buf.getvalue())
    file = await storage.StorageFile.get_file_from_path_async(os.path.abspath(img_path))
    stream = await file.open_async(storage.FileAccessMode.READ)
    decoder = await imaging.BitmapDecoder.create_async(stream)
    bitmap = await decoder.get_software_bitmap_async()
    res = await engine.recognize_async(bitmap)
    if os.path.exists(img_path): os.remove(img_path)
    return res.text

async def extract_chapter_pages_2col(pdf_path, start_page, end_page):
    doc = pymupdf.open(pdf_path)
    engine = ocr.OcrEngine.try_create_from_user_profile_languages()
    extracted = []
    for p_no in range(start_page, end_page + 1):
        page = doc[p_no]
        imgs = page.get_images()
        if not imgs: continue
        base_img = doc.extract_image(imgs[0][0])
        img = Image.open(io.BytesIO(base_img["image"]))
        w, h = img.size
        mid = w // 2
        left_img = img.crop((0, 0, mid + 20, h))
        right_img = img.crop((mid - 20, 0, w, h))

        left_text = await ocr_pil_image(left_img, engine, f"p{p_no}_l")
        right_text = await ocr_pil_image(right_img, engine, f"p{p_no}_r")
        extracted.append({
            "pdfPage": p_no,
            "bookPage": p_no + 1,
            "leftText": left_text,
            "rightText": right_text
        })
        print(f"Extracted page {p_no+1} (L: {len(left_text)}, R: {len(right_text)})")
    return extracted

if __name__ == '__main__':
    # Test on Bio Ch 1 Exam Scorer pages (PDF pages 31 to 37)
    res = asyncio.run(extract_chapter_pages_2col('temp_ingestion/mtg_source/biology_fingertips.pdf', 31, 37))
    with open('temp_ingestion/bio_ch1_2col.json', 'w', encoding='utf-8') as f:
        json.dump(res, f, indent=2)
    print("Done extracting Bio Ch 1 2-column OCR.")
