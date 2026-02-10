import psycopg2
import os
from dotenv import load_dotenv

def diagnostic():
    load_dotenv()
    db_url = os.getenv('POSTGRES_URL') or os.getenv('DATABASE_URL')
    if not db_url:
        # 嘗試從個別變數構建
        user = os.getenv('DB_USER', 'postgres')
        password = os.getenv('POSTGRES_PASSWORD', 'postgres')
        host = os.getenv('DB_HOST', 'localhost')
        port = os.getenv('DB_PORT', '5432')
        dbname = os.getenv('DB_NAME', 'postgres')
        db_url = f"postgresql://{user}:{password}@{host}:{port}/{dbname}"
        print(f"Constructed DB URL: postgresql://{user}:***@{host}:{port}/{dbname}")

    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        # TC-INF-01: Table Existence
        cur.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'exchange_rates');")
        exists = cur.fetchone()[0]
        print(f"TC-INF-01: exchange_rates exists: {exists}")

        # TC-INF-02: Stock Distribution
        cur.execute("SELECT market_type, COUNT(*) FROM stocks GROUP BY market_type;")
        dist = cur.fetchall()
        print(f"TC-INF-02: Stocks distribution: {dist}")

        # TC-INF-03: History Depth
        cur.execute("SELECT MIN(reference_date), COUNT(*) FROM daily_price;")
        depth = cur.fetchone()
        print(f"TC-INF-03: Earliest price: {depth[0]}, Total rows: {depth[1]}")

        cur.close()
        conn.close()
    except Exception as e:
        print(f"Diagnostic failed: {e}")

if __name__ == "__main__":
    diagnostic()
