import psycopg2
import os
from dotenv import load_dotenv

def check_activity():
    load_dotenv()
    pw = os.getenv('POSTGRES_PASSWORD')
    conn = psycopg2.connect(f"host='localhost' user='postgres' password='{pw}' dbname='postgres'")
    cur = conn.cursor()
    cur.execute("SELECT pid, query, state, wait_event_type, wait_event FROM pg_stat_activity WHERE state != 'idle';")
    rows = cur.fetchall()
    print("--- Active Queries ---")
    for row in rows:
        print(row)
    
    cur.execute("SELECT locktype, mode, granted, pid, relation::regclass FROM pg_locks WHERE NOT granted;")
    locks = cur.fetchall()
    print("--- Blocked Locks ---")
    for lock in locks:
        print(lock)
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    check_activity()
