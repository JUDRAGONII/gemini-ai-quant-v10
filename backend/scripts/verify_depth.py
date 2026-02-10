import psycopg2
import os
from dotenv import load_dotenv

def verify():
    load_dotenv()
    db_pass = os.getenv('POSTGRES_PASSWORD', 'postgres')
    conn_str = f"postgresql://postgres:{db_pass}@localhost:5432/postgres"
    
    try:
        conn = psycopg2.connect(conn_str)
        cur = conn.cursor()
        
        # 檢查 AAPL 歷史深度
        cur.execute("SELECT MIN(trade_date), COUNT(*) FROM daily_price WHERE stock_code='AAPL';")
        res = cur.fetchone()
        print(f"TC-INF-03 (AAPL): Earliest={res[0]}, Count={res[1]}")
        
        # 檢查 2330 歷史深度 (如果有的話)
        cur.execute("SELECT MIN(trade_date), COUNT(*) FROM daily_price WHERE stock_code='2330';")
        res_tw = cur.fetchone()
        print(f"TC-INF-03 (2330): Earliest={res_tw[0]}, Count={res_tw[1]}")

        cur.close()
        conn.close()
    except Exception as e:
        print(f"Verification failed: {e}")

if __name__ == "__main__":
    verify()
