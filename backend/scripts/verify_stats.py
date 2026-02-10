import psycopg2
import os
from dotenv import load_dotenv

def verify_and_finish():
    load_dotenv()
    pw = os.getenv('POSTGRES_PASSWORD')
    conn = psycopg2.connect(f"host='localhost' user='postgres' password='{pw}' dbname='postgres'")
    cur = conn.cursor()
    
    cur.execute("SELECT category_id, count_val FROM category_stats;")
    rows = cur.fetchall()
    print("--- Final Verified Stats ---")
    for row in rows:
        print(f"{row[0]}: {row[1]}")
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    verify_and_finish()
