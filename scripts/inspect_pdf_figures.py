import pymupdf

doc = pymupdf.open('temp_ingestion/kebo1dd/kebo102.pdf')
print('Pages in kebo102:', len(doc))
for pno in range(min(6, len(doc))):
    page = doc[pno]
    img_list = page.get_images(full=True)
    print(f'Page {pno+1}: {len(img_list)} images')
    for img_idx, img in enumerate(img_list):
        xref = img[0]
        base_img = doc.extract_image(xref)
        # Check bytes sample
        img_bytes = base_img["image"]
        is_all_zero = all(b == 0 for b in img_bytes[:1000])
        print(f'   img {img_idx}: xref={xref}, ext={base_img["ext"]}, w={base_img["width"]}, h={base_img["height"]}, colorspace={base_img["colorspace"]}, len={len(img_bytes)}, is_all_zero={is_all_zero}')
