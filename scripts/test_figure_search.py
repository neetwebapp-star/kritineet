import pymupdf

doc = pymupdf.open('temp_ingestion/kebo1dd/kebo102.pdf')
# Let's inspect page 1 and page 2 text to find "Figure 2.1"
for pno in range(len(doc)):
    page = doc[pno]
    text = page.get_text()
    for line in text.split('\n'):
        if 'figure' in line.lower() or 'fig.' in line.lower() or 'fig ' in line.lower():
            print(f'Page {pno+1}: {line}')

# Let's find rect for "Figure 2.1"
page = doc[1] # Page 2 or Page 1?
rects = page.search_for("Figure 2.1")
print("Search for 'Figure 2.1':", rects)
if not rects:
    for p in range(len(doc)):
        r = doc[p].search_for("Figure 2.1")
        if r:
            print(f"Found 'Figure 2.1' on page {p+1}: {r}")
