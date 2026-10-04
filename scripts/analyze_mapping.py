import json
import re

with open("scripts/scan_output.json", "r", encoding="utf-8") as f:
    data = json.load(f)

files = data['files']
chapters = data['chapters']

print("--- CHAPTERS IN DATABASE ---")
for ch in chapters:
    print(f"[{ch['className']} | Ch {ch['chapterNumber']}] {ch['title']} (id: {ch['id']}, slug: {ch['slug']})")

print("\n--- FILES IN SOURCE FOLDER ---")
for idx, fl in enumerate(files):
    print(f"{idx+1}. {fl['filename']} ({fl['size']} bytes)")

