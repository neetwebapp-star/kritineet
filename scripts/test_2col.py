import asyncio
import pymupdf
import winsdk.windows.graphics.imaging as imaging
import winsdk.windows.media.ocr as ocr
import winsdk.windows.storage as storage
import os
import io
from PIL import Image

async def ocr_pil_image(pil_img, engine, name):
    buf = io.BytesIO()
    pil_img.save(buf, format='JPEG', quality=95)
    img_path = f"temp_ingestion/test_col_{name}.jpg"
    with open(img_path, "wb") as f:
        f.write(buf.getvalue())
    file = await storage.StorageFile.get_file_from_path_async(os.path.abspath(img_path))
    stream = await file.open_async(storage.FileAccessMode.READ)
    decoder = await imaging.BitmapDecoder.create_async(stream)
    bitmap = await decoder.get_software_bitmap_async()
    res = await engine.recognize_async(bitmap)
    if os.path.exists(img_path): os.remove(img_path)
    return res.text

async def test_2col():
    doc = pymupdf.open("temp_ingestion/mtg_source/biology_fingertips.pdf")
    page = doc[31] # Page 32
    base_img = doc.extract_image(page.get_images()[0][0])
    img = Image.open(io.BytesIO(base_img["image"]))
    w, h = img.size

    # Split into 2 columns with a slight overlap in the middle
    mid = w // 2
    left_img = img.crop((0, 0, mid + 20, h))
    right_img = img.crop((mid - 20, 0, w, h))

    engine = ocr.OcrEngine.try_create_from_user_profile_languages()
    left_text = await ocr_pil_image(left_img, engine, "left")
    right_text = await ocr_pil_image(right_img, engine, "right")

    print("================ LEFT COLUMN ================")
    print(left_text[:1000])
    print("\n================ RIGHT COLUMN ================")
    print(right_text[:1000])

if __name__ == '__main__':
    asyncio.run(test_2col())
