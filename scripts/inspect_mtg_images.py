import os
import pymupdf

fpath = r"C:\Users\sagar\Downloads\ilide.info-mtg-fingertips-biology-2026-pr_1e3fca60e19e86ee3c28a324da2891c8.pdf"
doc = pymupdf.open(fpath)

print("Total pages:", len(doc))
for p in [10, 15, 20, 25]:
    page = doc[p]
    imgs = page.get_images()
    print(f"Page {p+1}: {len(imgs)} images")
    for idx, img in enumerate(imgs[:3]):
        xref = img[0]
        base_img = doc.extract_image(xref)
        print(f"  Img {idx+1}: dim={base_img['width']}x{base_img['height']}, format={base_img['ext']}, bytes={len(base_img['image'])}")

doc.close()
