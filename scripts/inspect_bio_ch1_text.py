import json
import re

with open("temp_ingestion/bio_ch1_ocr.json", "r", encoding="utf-8") as f:
    pages = json.load(f)

# Let's inspect the sections in Bio Ch 1
for p_no, text in pages.items():
    p_num = int(p_no) + 1
    print(f"\n=================== PAGE {p_num} ===================")
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    for l in lines[:15]:
        print("  ", l)
