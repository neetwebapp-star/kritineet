import sqlite3

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()
c.execute("SELECT contentHtml FROM Topic WHERE id = 'TOPIC_KEPH101_1_3'")
raw = c.fetchone()[0]

def extract_clean_ncert_body(s: str) -> str:
    if not s:
        return ''
    trimmed = s.strip()
    if 'ncert-structured-learning' in trimmed:
        h3_idx = trimmed.find('</h3>')
        if h3_idx != -1:
            div_after_h3 = trimmed.find('</div>', h3_idx)
            if div_after_h3 != -1:
                trimmed = trimmed[div_after_h3 + 6:].strip()
        # strip trailing closing divs
        while trimmed.endswith('</div>'):
            trimmed = trimmed[:-6].rstrip()
    return trimmed

cleaned = extract_clean_ncert_body(raw)
print("Original length:", len(raw))
print("Cleaned length:", len(cleaned))
print("Starts with:", cleaned[:200])
print("Ends with:", cleaned[-200:])
conn.close()
