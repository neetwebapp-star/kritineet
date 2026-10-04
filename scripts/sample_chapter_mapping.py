import json

with open('docs/MTG_AUTHORITATIVE_SOURCE_INVENTORY.json', 'r', encoding='utf-8') as f:
    inv = json.load(f)

for subj in ['Biology', 'Chemistry', 'Physics']:
    chs = [c for c in inv['chapters'] if c['subject'] == subj]
    print(f"\n{subj}: {len(chs)} chapters")
    for c in chs[:4]:
        print(f"  Ch {c['chapterNumber']} ({c['classLevel']}): {c['title']} | Pages: {c['sourcePdfPages']} | Topic: {c['topicMcqsCount']} | Scorer: {c['examScorerCount']} | Total: {c['totalSourceMCQs']}")
