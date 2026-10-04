import sqlite3
import psycopg2
from psycopg2.extras import execute_values
import datetime
import os
import sys

PG_URL = os.getenv("DATABASE_URL")
if not PG_URL:
    print("Error: DATABASE_URL environment variable is required.")
    sys.exit(1)

def migrate():
    sqlite_conn = sqlite3.connect('prisma/dev.db')
    sqlite_conn.row_factory = sqlite3.Row
    sqlite_cur = sqlite_conn.cursor()

    pg_conn = psycopg2.connect(PG_URL, sslmode='require')
    pg_cur = pg_conn.cursor()

    print("Postgres connected successfully.")

    # Get all tables in SQLite
    sqlite_cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma%'")
    tables = [row[0] for row in sqlite_cur.fetchall()]

    # Filter to tables with count > 0
    tables_to_migrate = []
    for t in sorted(tables):
        try:
            sqlite_cur.execute(f'SELECT count(*) FROM "{t}"')
            cnt = sqlite_cur.fetchone()[0]
            if cnt > 0:
                tables_to_migrate.append((t, cnt))
        except Exception:
            pass

    print(f"Found {len(tables_to_migrate)} tables to migrate from SQLite.")

    # Get Postgres table and column schema
    pg_cur.execute("""
        SELECT table_name, column_name, data_type, udt_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
    """)
    pg_schema = {}
    for t_name, c_name, d_type, udt in pg_cur.fetchall():
        if t_name not in pg_schema:
            pg_schema[t_name] = {}
        pg_schema[t_name][c_name] = (d_type, udt)

    # Disable foreign key checks / triggers during load
    pg_cur.execute("SET session_replication_role = 'replica';")

    migrated_counts = {}

    for table, expected_cnt in tables_to_migrate:
        if table not in pg_schema:
            print(f"Skipping {table}: not found in Postgres schema")
            continue

        print(f"Migrating {table} ({expected_cnt} rows)...")

        # Get sqlite columns
        sqlite_cur.execute(f'PRAGMA table_info("{table}")')
        sqlite_cols = [c[1] for c in sqlite_cur.fetchall()]

        # Common columns present in both sqlite and postgres
        common_cols = [c for c in sqlite_cols if c in pg_schema[table]]
        if not common_cols:
            print(f"  Warning: No common columns for {table}")
            continue

        cols_sql = ", ".join([f'"{c}"' for c in common_cols])
        sqlite_cur.execute(f'SELECT {cols_sql} FROM "{table}"')
        
        col_types = [pg_schema[table][c][0] for c in common_cols]

        batch_size = 1000
        total_inserted = 0

        while True:
            rows = sqlite_cur.fetchmany(batch_size)
            if not rows:
                break

            converted_rows = []
            for row in rows:
                converted_row = []
                for val, ctype in zip(row, col_types):
                    if val is None:
                        converted_row.append(None)
                    elif ctype == 'boolean':
                        converted_row.append(bool(val))
                    elif ctype in ('timestamp with time zone', 'timestamp without time zone'):
                        if isinstance(val, (int, float)):
                            if val > 100000000000:
                                converted_row.append(datetime.datetime.fromtimestamp(val / 1000.0, datetime.timezone.utc))
                            else:
                                converted_row.append(datetime.datetime.fromtimestamp(val, datetime.timezone.utc))
                        elif isinstance(val, str):
                            try:
                                converted_row.append(datetime.datetime.fromisoformat(val.replace('Z', '+00:00')))
                            except Exception:
                                converted_row.append(val)
                        else:
                            converted_row.append(val)
                    else:
                        converted_row.append(val)
                converted_rows.append(tuple(converted_row))

            insert_cols = ", ".join([f'"{c}"' for c in common_cols])
            insert_query = f'INSERT INTO "{table}" ({insert_cols}) VALUES %s ON CONFLICT DO NOTHING'
            execute_values(pg_cur, insert_query, converted_rows)
            total_inserted += len(converted_rows)

        pg_conn.commit()
        migrated_counts[table] = total_inserted
        print(f"  -> Inserted {total_inserted}/{expected_cnt} rows into {table}")

    # Re-enable foreign key checks
    pg_cur.execute("SET session_replication_role = 'origin';")
    pg_conn.commit()

    print("\n=== MIGRATION VERIFICATION ===")
    for table, expected_cnt in tables_to_migrate:
        if table in pg_schema:
            pg_cur.execute(f'SELECT count(*) FROM "{table}"')
            pg_cnt = pg_cur.fetchone()[0]
            status = "OK" if pg_cnt >= expected_cnt else f"MISMATCH ({pg_cnt}/{expected_cnt})"
            print(f"{table}: Postgres={pg_cnt}, SQLite={expected_cnt} [{status}]")

    pg_cur.close()
    pg_conn.close()
    sqlite_conn.close()
    print("Migration completed successfully!")

if __name__ == '__main__':
    migrate()
