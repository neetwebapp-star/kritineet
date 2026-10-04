import sqlite3

conn = sqlite3.connect('prisma/dev.db')
c = conn.cursor()

test_ids = [
    'ch_p15_1790788245798',
    'ch_p15_1790788280707',
    'ch_p15_1790788300810',
    'ch_p15_1790788396731',
    'cmuo7g35y0001evjomkg853jt'
]

c.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [t[0] for t in c.fetchall()]

for tbl in tables:
    if tbl.startswith('_'): continue
    c.execute(f"PRAGMA table_info({tbl})")
    cols = [col[1] for col in c.fetchall()]
    for col in cols:
        for tid in test_ids:
            try:
                c.execute(f"SELECT count(*) FROM {tbl} WHERE {col} = ?", (tid,))
                cnt = c.fetchone()[0]
                if cnt > 0:
                    print(f"{tbl}.{col} matches {tid}: {cnt} rows")
            except Exception:
                pass

conn.close()
