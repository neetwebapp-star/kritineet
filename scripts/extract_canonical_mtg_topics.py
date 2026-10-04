import json
import re
import sys
from typing import Dict, List, Any

sys.stdout.reconfigure(encoding='utf-8')

with open('temp_ingestion/mtg_complete_toc.json', 'r', encoding='utf-8') as f:
    toc_data = json.load(f)

with open('docs/MTG_AUTHORITATIVE_SOURCE_INVENTORY.json', 'r', encoding='utf-8') as f:
    manifest = json.load(f)

# Build a clean dictionary of canonical chapters and their topics
canonical_topics_by_chapter = {}

for ch in manifest['chapters']:
    ch_id = ch['chapterId']
    ch_num = ch['chapterNumber']
    ch_title = ch['title']
    subj = ch['subject']
    class_level = ch['classLevel']
    source_target = ch['totalSourceMCQs']
    topic_target = ch['topicMcqsCount']
    scorer_target = ch['examScorerCount']
    
    # We will store canonical topic definitions
    canonical_topics_by_chapter[ch_id] = {
        "chapterId": ch_id,
        "chapterNumber": ch_num,
        "title": ch_title,
        "subject": subj,
        "classLevel": class_level,
        "totalSourceMCQs": source_target,
        "topicMcqsCount": topic_target,
        "examScorerCount": scorer_target,
        "sourceFile": ch['sourceFile'],
        "sourceBookPages": ch['sourceBookPages'],
        "sourcePdfPages": ch['sourcePdfPages']
    }

print(f"Loaded {len(canonical_topics_by_chapter)} chapters from manifest.", flush=True)
