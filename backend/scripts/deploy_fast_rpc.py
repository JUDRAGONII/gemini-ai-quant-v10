import psycopg2
import os
from dotenv import load_dotenv

def deploy_o1_rpc():
    load_dotenv()
    pw = os.getenv('POSTGRES_PASSWORD')
    conn = psycopg2.connect(f"host='localhost' user='postgres' password='{pw}' dbname='postgres'")
    conn.autocommit = True
    cur = conn.cursor()
    
    # 建立統計表核心
    cur.execute("CREATE TABLE IF NOT EXISTS public.category_stats (category_id TEXT PRIMARY KEY, count_val BIGINT DEFAULT 0, updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());")
    
    # 極速 RPC：僅讀取統計表
    sql_rpc = """
    CREATE OR REPLACE FUNCTION get_category_counts()
    RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $RPC$
    DECLARE 
        result JSON;
    BEGIN
        SELECT json_build_object(
            'tw_equity', COALESCE((SELECT count_val FROM category_stats WHERE category_id = 'tw_equity'), 0),
            'us_equity', COALESCE((SELECT count_val FROM category_stats WHERE category_id = 'us_equity'), 0),
            'tw_macro', COALESCE((SELECT count_val FROM category_stats WHERE category_id = 'tw_macro'), 0),
            'us_macro', COALESCE((SELECT count_val FROM category_stats WHERE category_id = 'us_macro'), 0),
            'realtime', COALESCE((SELECT count_val FROM category_stats WHERE category_id = 'realtime'), (SELECT COUNT(*) FROM market_quotes)),
            'factors', COALESCE((SELECT count_val FROM category_stats WHERE category_id = 'factors'), 0),
            'genes', COALESCE((SELECT count_val FROM category_stats WHERE category_id = 'genes'), 0),
            'fx', COALESCE((SELECT count_val FROM category_stats WHERE category_id = 'fx'), 0),
            'economic_calendar', COALESCE((SELECT count_val FROM category_stats WHERE category_id = 'economic_calendar'), 0)
        ) INTO result;
        
        RETURN result;
    END;
    $RPC$;
    """
    cur.execute(sql_rpc)
    cur.close()
    conn.close()
    print("O(1) RPC Deployed. UI should respond instantly.")

if __name__ == "__main__":
    deploy_o1_rpc()
