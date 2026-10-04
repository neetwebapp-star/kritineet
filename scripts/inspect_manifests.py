import json

with open('docs/NCERT_SOURCE_MASTER_MANIFEST.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print('=== NCERT MASTER MANIFEST BOOKS ===')
for b in data.get('books', []):
    print(f"{b['bookId']} (Class {b['class']} {b['subject']}): {len(b.get('chapters', []))} chapters")
    for ch in b.get('chapters', []):
        for top in ch.get('topics', []):
            t = top.get('title', '')
            if any(k.lower() in t.lower() for k in ['states of matter', 'hydrogen', 's-block', 'p-block']):
                print(f"   Ch {ch.get('chapterNumber')} ({ch.get('bookCode')}): topic = {t}")

with open('docs/MTG_SOURCE_MASTER_MANIFEST.json', 'r', encoding='utf-8') as f:
    mtg_data = json.load(f)

print('\n=== MTG MASTER MANIFEST BOOKS ===')
for b in mtg_data.get('books', []):
    print(f"{b.get('bookName')}: {len(b.get('chapters', []))} chapters")
