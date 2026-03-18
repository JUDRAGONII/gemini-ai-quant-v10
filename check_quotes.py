import psycopg2
import os
from dotenv import load_dotenv

def check():
    load_dotenv()
    pw = os.getenv('POSTGRES_PASSWORD')
    conn = psycopg2.connect(f"host='localhost' port='6100' user='postgres' password='{pw}' dbname='postgres'")
    cur = conn.cursor()
    
    cur.execute("SELECT COUNT(*) FROM market_quotes")
    print(f"Total market_quotes: {cur.fetchone()[0]}")
    
    cur.execute("SELECT stock_code, price, change_percent FROM market_quotes WHERE stock_code IN ('VTI', 'TLT', 'SOXX', 'MSFT', 'TSLA')")
    quotes = cur.fetchall()
    print("Specific quotes exist:", quotes)
    
    cur.execute("SELECT COUNT(*) FROM market_quotes WHERE stock_code IN (SELECT stock_code FROM stocks WHERE market_type = 'US')")
    print(f"Total US quotes: {cur.fetchone()[0]}")

    conn.close()

if __name__ == "__main__":
    check()
