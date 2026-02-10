import psycopg2
import os
from dotenv import load_dotenv

def check_fx_schema():
    load_dotenv()
    pw = os.getenv('POSTGRES_PASSWORD')
    conn_str = f"postgresql://postgres:{pw}@localhost:5432/postgres"
    
    conn = psycopg2.connect(conn_str)
    cur = conn.cursor()
    cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'exchange_rates'")
    cols = [r[0] for r in cur.fetchall()]
    print(f"Columns in exchange_rates: {cols}")
    cur.close()
    conn.close()

if __name__ == "__main__":
    check_fx_schema()
