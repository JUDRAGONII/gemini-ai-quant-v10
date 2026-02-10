import psycopg2
import os
from dotenv import load_dotenv

def kill_and_deploy():
    load_dotenv()
    pw = os.getenv('POSTGRES_PASSWORD')
    conn = psycopg2.connect(f"host='localhost' user='postgres' password='{pw}' dbname='postgres'")
    conn.autocommit = True
    cur = conn.cursor()
    
    print("Finding and killing stuck RPC sessions...")
    cur.execute("""
        SELECT pg_terminate_backend(pid) 
        FROM pg_stat_activity 
        WHERE query ILIKE '%get_category_counts%' 
        AND pid <> pg_backend_pid();
    """)
    killed = cur.fetchall()
    print(f"Killed {len(killed)} sessions.")
    
    print("Deploying stats table...")
    cur.execute("CREATE TABLE IF NOT EXISTS public.category_stats (category_id TEXT PRIMARY KEY, count_val BIGINT DEFAULT 0, updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());")
    
    print("Deploying O(1) RPC...")
    sql_rpc = """
    CREATE OR REPLACE FUNCTION get_category_counts()
    RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $RPC$
    DECLARE 
        result JSON;
    BEGIN
        SELECT json_build_object(
            'tw_equity', COALESCE((SELECT count_val FROM category_stats WHERE category_id = 'tw_equity'), 0),
            'us_equity', COALESCE((SELECT count_val FROM category_stats WHERE category_id = 'us_equity'), 0),
            'tw_macro', (SELECT COUNT(*) FROM macro_indicators WHERE country = 'TW'),
            'us_macro', (SELECT COUNT(*) FROM macro_indicators WHERE country = 'US'),
            'realtime', (SELECT COUNT(*) FROM market_quotes),
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
    print("Deployment Successful!")
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    kill_and_deploy()
