import asyncio
import os
import sys
import pymupdf
import winsdk.windows.graphics.imaging as imaging
import winsdk.windows.media.ocr as ocr
import winsdk.windows.storage as storage

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

engine = ocr.OcrEngine.try_create_from_user_profile_languages()

async def ocr_page(pdf_path, pno):
    doc = pymupdf.open(pdf_path)
    page = doc[pno]
    pix = page.get_pixmap(dpi=150)
    img_path = f'temp_ingestion/test_p{pno}.png'
    pix.save(img_path)
    doc.close()
    
    file = await storage.StorageFile.get_file_from_path_async(os.path.abspath(img_path))
    stream = await file.open_async(storage.FileAccessMode.READ)
    decoder = await imaging.BitmapDecoder.create_async(stream)
    bitmap = await decoder.get_software_bitmap_async()
    res = await engine.recognize_async(bitmap)
    if os.path.exists(img_path):
        try: os.remove(img_path)
        except: pass
    return res.text

async def main():
    for name, fname in [
        ('Biology', 'biology_fingertips.pdf'),
        ('Chemistry', 'chemistry_fingertips.pdf'),
        ('Physics', 'physics_fingertips.pdf')
    ]:
        print(f'\n================== {name} ==================', flush=True)
        pdf_path = os.path.join('temp_ingestion/mtg_source', fname)
        # Scan first 10 pages to find Table of Contents
        for p in range(12):
            text = await ocr_page(pdf_path, p)
            lines = [l.strip() for l in text.splitlines() if l.strip()]
            preview = ' | '.join(lines[:4])
            print(f'Page {p+1:2d}: {len(lines):2d} lines -> {preview[:110]}', flush=True)

if __name__ == '__main__':
    asyncio.run(main())
