import pymupdf
import os

doc = pymupdf.open('temp_ingestion/kebo1dd/kebo102.pdf')
# Let's inspect Page 3 (0-indexed: 2)
page3 = doc[2]
# Find "Figure 2.1"
rects = page3.search_for("Figure 2.1")
print("Figure 2.1 rects:", rects)
# Caption rect
caption_rect = rects[0] # Rect(204.0, 693.45, 257.04, 702.95)
# In NCERT, diagrams are above the caption!
# Page dimensions
pw = page3.rect.width
ph = page3.rect.height
print(f"Page width: {pw}, height: {ph}")

# Crop the diagram above the caption
# The diagram spans roughly y=520 to y=715, full column or width
crop_rect = pymupdf.Rect(50, 520, pw - 50, 715)
pix = page3.get_pixmap(clip=crop_rect, dpi=200)
os.makedirs('public/ncert_figures', exist_ok=True)
pix.save('public/ncert_figures/fig_2_1_test.png')
print(f"Saved fig_2_1_test.png: {pix.width}x{pix.height}, samples non-zero: {any(b != 0 for b in pix.samples)}")

# Now let's test Page 4 (0-indexed: 3) for Figure 2.2 (Nostoc)
page4 = doc[3]
rects2 = page4.search_for("Figure 2.2")
print("Figure 2.2 rects:", rects2)
if rects2:
    cap2 = rects2[0]
    # Crop around Nostoc
    crop_rect2 = pymupdf.Rect(50, cap2.y0 - 250, pw - 50, cap2.y1 + 40)
    pix2 = page4.get_pixmap(clip=crop_rect2, dpi=200)
    pix2.save('public/ncert_figures/fig_2_2_test.png')
    print(f"Saved fig_2_2_test.png: {pix2.width}x{pix2.height}")
