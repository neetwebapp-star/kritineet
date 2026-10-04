import pymupdf
import re
import os

doc = pymupdf.open('temp_ingestion/kebo1dd/kebo102.pdf')
pw = doc[0].rect.width
ph = doc[0].rect.height
os.makedirs('public/ncert_figures', exist_ok=True)

fig_records = []

for pno, page in enumerate(doc):
    text_page = page.get_text("blocks")
    # Search for blocks containing "Figure X.Y" or "Fig. X.Y"
    for b in text_page:
        block_text = b[4].strip()
        match = re.search(r'(?:Figure|Fig\.)\s*(\d+\.\d+[a-z]?)[\s\:\.\-]([^\n]+)', block_text, re.IGNORECASE)
        if match:
            fig_num = match.group(1)
            caption = match.group(0).replace('\n', ' ')
            bx0, by0, bx1, by1 = b[0], b[1], b[2], b[3]
            print(f"Page {pno+1}: Found {fig_num} -> {caption[:60]} at y=({by0:.1f}, {by1:.1f})")

            # Determine crop rect
            # Is diagram above or below caption?
            # In NCERT 95% of diagrams are above the caption
            is_right_col = bx0 > 240
            is_full_width = (bx1 - bx0) > 300 or (bx0 < 200 and bx1 > 380)

            if is_full_width:
                crop_x0 = 40
                crop_x1 = pw - 40
            elif is_right_col:
                crop_x0 = max(240, bx0 - 30)
                crop_x1 = pw - 40
            else:
                crop_x0 = 40
                crop_x1 = min(pw - 200, max(bx1 + 30, 300))

            # Look for drawing rects or images on this page in the vicinity
            img_infos = page.get_image_info()
            nearby_imgs = [img['bbox'] for img in img_infos if abs(img['bbox'][3] - by0) < 350 and img['bbox'][2] > img['bbox'][0] + 20 and img['bbox'][3] > img['bbox'][1] + 20]
            
            if nearby_imgs:
                min_y0 = min(img[1] for img in nearby_imgs)
                max_y1 = max(img[3] for img in nearby_imgs)
                min_x0 = min(img[0] for img in nearby_imgs)
                max_x1 = max(img[2] for img in nearby_imgs)
                crop_rect = pymupdf.Rect(min(crop_x0, min_x0 - 10), min(by0 - 10, min_y0 - 10), max(crop_x1, max_x1 + 10), max(by1 + 15, max_y1 + 15))
            else:
                # Default vertical span above caption
                crop_y0 = max(50, by0 - 220)
                crop_y1 = min(ph - 40, by1 + 15)
                crop_rect = pymupdf.Rect(crop_x0, crop_y0, crop_x1, crop_y1)

            # Render at 200 DPI
            pix = page.get_pixmap(clip=crop_rect, dpi=200)
            
            # Validate non-black
            # Sample pixels
            samples = pix.samples
            total_px = pix.width * pix.height
            non_black = sum(1 for i in range(0, min(len(samples), 3000), pix.n) if any(samples[i+c] > 20 for c in range(min(3, pix.n))))
            
            out_filename = f"kebo102_fig_{fig_num.replace('.', '_')}.png"
            out_path = os.path.join('public/ncert_figures', out_filename)
            pix.save(out_path)
            print(f"   -> Saved {out_path}: {pix.width}x{pix.height}, valid_color: {non_black > 0}")

doc.close()
