import asyncio
import os
import sys
import pymupdf
import winsdk.windows.graphics.imaging as imaging
import winsdk.windows.media.ocr as ocr
import winsdk.windows.storage as storage

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

async def recognize_file(image_path: str) -> str:
    abs_path = os.path.abspath(image_path)
    file = await storage.StorageFile.get_file_from_path_async(abs_path)
    stream = await file.open_async(storage.FileAccessMode.READ)
    decoder = await imaging.BitmapDecoder.create_async(stream)
    bitmap = await decoder.get_software_bitmap_async()
    
    engine = ocr.OcrEngine.try_create_from_user_profile_languages()
    if not engine:
        raise RuntimeError("Windows OCR Engine could not be initialized")
        
    result = await engine.recognize_async(bitmap)
    return result.text

async def main():
    print("Testing winsdk Windows.Media.Ocr...")
    # Extract page 21 from MTG Fingertips Biology
    doc = pymupdf.open(r"C:\Users\sagar\Downloads\ilide.info-mtg-fingertips-biology-2026-pr_1e3fca60e19e86ee3c28a324da2891c8.pdf")
    page = doc[20]
    imgs = page.get_images()
    base_img = doc.extract_image(imgs[0][0])
    test_img = "temp_ingestion/test_winsdk_ocr.jpg"
    with open(test_img, "wb") as f:
        f.write(base_img["image"])
    doc.close()

    text = await recognize_file(test_img)
    print(f"SUCCESS! OCR extracted {len(text)} characters.")
    print("=== FIRST 500 CHARACTERS ===")
    print(text[:500])

if __name__ == "__main__":
    asyncio.run(main())
