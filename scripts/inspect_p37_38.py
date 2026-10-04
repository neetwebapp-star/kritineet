import json
import re

with open('temp_ingestion/bio_ch1_2col.json', 'r', encoding='utf-8') as f:
    pages = json.load(f)

# Let's inspect the text of Exam Archive on Page 37 (idx 36)
print("=== PAGE 37 LEFT ===")
print(pages[5]['leftText'][:1000])
print("\n=== PAGE 37 RIGHT ===")
print(pages[5]['rightText'][:1000])

print("\n=== PAGE 38 LEFT ===")
print(pages[6]['leftText'][:1000])
print("\n=== PAGE 38 RIGHT ===")
print(pages[6]['rightText'][:1000])
