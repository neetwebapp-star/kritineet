import urllib.request
import json
import sqlite3
import sys

sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('prisma/dev.db')
cur = conn.cursor()

# Get 5 questions and their exact correct options
cur.execute("SELECT id, correctOption FROM Question WHERE topicId = 'TOPIC_KEBO101_1_1' AND sourceType = 'FINGERTIPS' LIMIT 5")
rows = cur.fetchall()
answers = [{'questionId': r[0], 'selectedOption': r[1]} for r in rows]

req = urllib.request.Request(
    'http://localhost:3000/api/ncert/topic/TOPIC_KEBO101_1_1/fingertips',
    data=json.dumps({'answers': answers}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode('utf-8'))

print("=== 100% MASTERY VERIFICATION ===")
print("  Status:", data.get('status'))
print("  Mastered:", data.get('mastered'))
print("  Summary:", data.get('summary'))
print("  NextTopicId:", "UNLOCKED" if data.get('nextTopicId') else "NULL")
print("  Progress Status:", data.get('progress', {}).get('status'))

conn.close()
