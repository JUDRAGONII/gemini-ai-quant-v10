import psycopg2
import os
from dotenv import load_dotenv

def snapshot_sync_stats():
    load_dotenv()
    pw = os.getenv('POSTGRES_PASSWORD')
    conn = psycopg2.connect(f"host='localhost' user='postgres' password='{pw}' dbname='postgres'")
    conn.autocommit = True
    cur = conn.cursor()
    
    # 建立統計表（如果不存在）
    cur.execute("CREATE TABLE IF NOT EXISTS public.category_stats (category_id TEXT PRIMARY KEY, count_val BIGINT DEFAULT 0, updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());")
    
    categories = [
        ('tw_equity', "SELECT COUNT(*) FROM daily_price WHERE market_type = 'TWSE'"),
        ('us_equity', "SELECT COUNT(*) FROM daily_price WHERE market_type = 'TIINGO'"),
        ('tw_macro', "SELECT COUNT(*) FROM macro_indicators WHERE country = 'TW'"),
        ('us_macro', "SELECT COUNT(*) FROM macro_indicators WHERE country = 'US'"),
        ('fx', "SELECT COUNT(*) FROM exchange_rates"),
        ('economic_calendar', "SELECT COUNT(*) FROM economic_calendar"),
        ('realtime', "SELECT COUNT(*) FROM market_quotes"),
        ('factors', "SELECT COUNT(*) FROM stock_factors"),
        ('genes', "SELECT COUNT(*) FROM evolution_genes")
    ]
    
    for cat_id, count_sql in categories:
        try:
            print(f"Counting {cat_id}...")
            cur.execute(count_sql)
            count = cur.fetchone()[0]
            cur.execute(f"INSERT INTO public.category_stats (category_id, count_val) VALUES ('{cat_id}', {count}) ON CONFLICT (category_id) DO UPDATE SET count_val = EXCLUDED.count_val, updated_at = NOW();")
            print(f"Synced {cat_id}: {count}")
        except Exception as e:
            print(f"Error syncing {cat_id}: {e}")

    print("Snapshot Sync Completed.")
    cur.close()
    conn.close()

if __name__ == "__main__":
    snapshot_sync_stats()
