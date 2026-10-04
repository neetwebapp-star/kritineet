import json
import re

with open('temp_ingestion/bio_ch1_2col.json', 'r', encoding='utf-8') as f:
    pages = json.load(f)

# Combine text in exact reading order:
# For each page: left column, then right column
full_stream = []
for p in pages:
    full_stream.append((p['bookPage'], "L", p['leftText']))
    full_stream.append((p['bookPage'], "R", p['rightText']))

for page_num, side, text in full_stream[:8]:
    print(f"\n--- Book Page {page_num} [{side}] ---")
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    for l in lines[:10]:
        print(" ", l)
