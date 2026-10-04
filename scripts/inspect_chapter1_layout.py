import asyncio
import os
import sys
import pymupdf
import winsdk.windows.graphics.imaging as imaging
import winsdk.windows.media.ocr as ocr
import winsdk.windows.storage as storage

sys.stdout.reconfigure(encoding='utf-8')
engine = ocr.OcrEngine.try_create_from_user_profile_languages()

async def ocr_page(pdf_path, pno):
    doc = pymupdf.open(pdf_path)
    page = doc[pno]
    pix = page.get_pixmap(dpi=150)
    img_path = f'temp_ingestion/test_layout_{pno}.png'
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
    print('Scanning Biology PDF pages 20-30 for Chapter 1 MCQs and Answer Key:', flush=True)
    for p in range(20, 31):
        t = await ocr_page('temp_ingestion/mtg_source/biology_fingertips.pdf', p)
        has_mcq = 'MCQs' in t or 'MCQ' in t or 'Corner' in t
        has_ans = 'ANSWER' in t.upper() or 'HINTS' in t.upper() or 'EXPLANATION' in t.upper()
        prev = t[:70].replace('\n', ' ')
        print(f'Bio PDF Page {p+1}: len={len(t)} | MCQs={has_mcq} | AnsKey={has_ans} | preview={prev}', flush=True)

if __name__ == '__main__':
    asyncio.run(main())
