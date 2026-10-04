import urllib.request
import json

url = 'http://localhost:3000/api/ncert/hierarchy'
req = urllib.request.urlopen(url)
data = json.loads(req.read().decode('utf-8'))
stats = data['stats']
print('Total chapters in hierarchy:', stats['totalChapters'])
for cl in data['hierarchy']:
    print(f"\n=== {cl['name']} ===")
    for s in cl['subjects']:
        ch_count = sum(len(u['chapters']) for u in s['units'])
        print(f"  {s['name']}: {ch_count} chapters")
        for u in s['units']:
            print(f"    Unit {u['unitNumber']}: {u['title']} ({len(u['chapters'])} chapters)")
            for ch in u['chapters']:
                print(f"       Ch {ch['chapterNumber']}: {ch['title']} (topics: {ch['topicsCount']})")
