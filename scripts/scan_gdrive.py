import urllib.request
import re
import json
import os

url = 'https://drive.google.com/drive/folders/1X9uI9yRlzY4itV7mVdLt6xVlKv_gQjdN'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
except Exception as e:
    print("Error fetching:", e)
    exit(1)

with open('scratch_gdrive.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Saved HTML to scratch_gdrive.html, length:", len(html))

# Look for embedded JSON data or items
# Look for data-initial-data or _DRIVE_ivd or similar
for pattern in [r'_DRIVE_ivd\s*=\s*\'(.*?)\';', r'window\._DRIVE_ivd\s*=\s*\"(.*?)\";', r'AF_initDataCallback\((.*?)\);']:
    matches = re.findall(pattern, html, re.DOTALL)
    print(f"Pattern {pattern[:30]} matches: {len(matches)}")

# Also search for filenames (pdf, doc, folder names)
pdf_matches = re.findall(r'[\w\s\(\)\-\.,_]+\.pdf', html, re.IGNORECASE)
print("Unique PDF names found in HTML:", len(set(pdf_matches)))
for p in sorted(list(set(pdf_matches)))[:25]:
    print("  ", p)
