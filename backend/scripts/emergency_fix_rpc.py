import psycopg2
import os
from dotenv import load_dotenv

def emergency_fix_rpc():
    load_dotenv()
    pw = os.getenv('POSTGRES_PASSWORD')
    conn = psycopg2.connect(f"host='localhost' user='postgres' password='{pw}' dbname='postgres'")
    conn.autocommit = True
    cur = conn.cursor()
    
    # 建立統計表（如果不存在）
    cur.execute("CREATE TABLE IF NOT EXISTS public.category_stats (category_id TEXT PRIMARY KEY, count_val BIGINT DEFAULT 0, updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());")
    
    # 更新 RPC：
    # 1. 優先從 category_stats 讀取（O(1)）
    # 2. 如果 category_stats 沒數據，對「小表」執行即時 COUNT
    # 3. 對「大表」如果沒數據，返回 0 並等待背景腳本補充（避免 504）
    print("Updating RPC to Smart-Fallback mode...")
    sql_rpc = """
    CREATE OR REPLACE FUNCTION get_category_counts()
    RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $RPC$
    DECLARE 
        result JSON;
    BEGIN
        SELECT json_build_object(
            -- 精準且快的計數：對於小表直接 Count，對於大表讀取緩存
            'tw_equity', COALESCE((SELECT count_val FROM category_stats WHERE category_id = 'tw_equity'), (SELECT COUNT(*) FROM daily_price WHERE market_type = 'TWSE')),
            'us_equity', COALESCE((SELECT count_val FROM category_stats WHERE category_id = 'us_equity'), (SELECT COUNT(*) FROM daily_price WHERE market_type = 'TIINGO')),
            'tw_macro', (SELECT COUNT(*) FROM macro_indicators WHERE country = 'TW'),
            'us_macro', (SELECT COUNT(*) FROM macro_indicators WHERE country = 'US'),
            'realtime', (SELECT COUNT(*) FROM market_quotes),
            'factors', COALESCE((SELECT count_val FROM category_stats WHERE category_id = 'factors'), (SELECT reltuples::BIGINT FROM pg_class WHERE relname = 'stock_factors')),
            'genes', COALESCE((SELECT count_val FROM category_stats WHERE category_id = 'genes'), (SELECT reltuples::BIGINT FROM pg_class WHERE relname = 'evolution_genes')),
            'fx', (SELECT COUNT(*) FROM exchange_rates),
            'economic_calendar', (SELECT COUNT(*) FROM economic_calendar)
        ) INTO result;
        
        RETURN result;
    END;
    $RPC$;
    """
    cur.execute(sql_rpc)
    print("RPC Updated. 504 should be gone.")
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    emergency_fix_rpc()
