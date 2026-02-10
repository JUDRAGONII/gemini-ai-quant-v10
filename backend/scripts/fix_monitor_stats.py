import psycopg2
import os
from dotenv import load_dotenv

def deploy_accurate_stats():
    load_dotenv()
    pw = os.getenv('POSTGRES_PASSWORD')
    conn_str = f"host='localhost' user='postgres' password='{pw}' dbname='postgres'"
    
    conn = psycopg2.connect(conn_str)
    conn.autocommit = True
    cur = conn.cursor()
    
    # 1. 建立結構
    print("Step 1: Creating stats table and triggers...")
    sql_structure = """
    CREATE TABLE IF NOT EXISTS public.category_stats (
        category_id TEXT PRIMARY KEY,
        count_val BIGINT DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE OR REPLACE FUNCTION public.update_category_stats()
    RETURNS TRIGGER AS $BODY$
    DECLARE
        target_id TEXT;
    BEGIN
        IF TG_TABLE_NAME = 'daily_price' THEN
            IF NEW.market_type = 'TWSE' OR OLD.market_type = 'TWSE' THEN target_id := 'tw_equity';
            ELSIF NEW.market_type = 'TIINGO' OR OLD.market_type = 'TIINGO' THEN target_id := 'us_equity';
            END IF;
        ELSIF TG_TABLE_NAME = 'macro_indicators' THEN
            IF NEW.country = 'TW' OR OLD.country = 'TW' THEN target_id := 'tw_macro';
            ELSIF NEW.country = 'US' OR OLD.country = 'US' THEN target_id := 'us_macro';
            END IF;
        ELSIF TG_TABLE_NAME = 'exchange_rates' THEN target_id := 'fx';
        ELSIF TG_TABLE_NAME = 'economic_calendar' THEN target_id := 'economic_calendar';
        ELSIF TG_TABLE_NAME = 'market_quotes' THEN target_id := 'realtime';
        ELSIF TG_TABLE_NAME = 'stock_factors' THEN target_id := 'factors';
        ELSIF TG_TABLE_NAME = 'evolution_genes' THEN target_id := 'genes';
        END IF;

        IF target_id IS NOT NULL THEN
            IF (TG_OP = 'INSERT') THEN
                INSERT INTO public.category_stats (category_id, count_val) 
                VALUES (target_id, 1)
                ON CONFLICT (category_id) DO UPDATE SET count_val = category_stats.count_val + 1, updated_at = NOW();
            ELSIF (TG_OP = 'DELETE') THEN
                UPDATE public.category_stats SET count_val = count_val - 1, updated_at = NOW() WHERE category_id = target_id;
            END IF;
        END IF;
        RETURN NULL;
    END;
    $BODY$ LANGUAGE plpgsql SECURITY DEFINER;

    DROP TRIGGER IF EXISTS trg_stats_daily_price ON daily_price;
    CREATE TRIGGER trg_stats_daily_price AFTER INSERT OR DELETE ON daily_price FOR EACH ROW EXECUTE FUNCTION update_category_stats();

    DROP TRIGGER IF EXISTS trg_stats_fx ON exchange_rates;
    CREATE TRIGGER trg_stats_fx AFTER INSERT OR DELETE ON exchange_rates FOR EACH ROW EXECUTE FUNCTION update_category_stats();

    DROP TRIGGER IF EXISTS trg_stats_econ ON economic_calendar;
    CREATE TRIGGER trg_stats_econ AFTER INSERT OR DELETE ON economic_calendar FOR EACH ROW EXECUTE FUNCTION update_category_stats();

    DROP TRIGGER IF EXISTS trg_stats_macro ON macro_indicators;
    CREATE TRIGGER trg_stats_macro AFTER INSERT OR DELETE ON macro_indicators FOR EACH ROW EXECUTE FUNCTION update_category_stats();

    DROP TRIGGER IF EXISTS trg_stats_factors ON stock_factors;
    CREATE TRIGGER trg_stats_factors AFTER INSERT OR DELETE ON stock_factors FOR EACH ROW EXECUTE FUNCTION update_category_stats();
    """
    cur.execute(sql_structure)
    
    # 2. 更新 RPC
    print("Step 2: Updating get_category_counts RPC...")
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
    
    # 3. 初始化計數 (分段執行，避免超時)
    print("Step 3: Initializing counts (this may take a minute)...")
    categories = [
        ('tw_equity', "SELECT COUNT(*) FROM daily_price WHERE market_type = 'TWSE'"),
        ('us_equity', "SELECT COUNT(*) FROM daily_price WHERE market_type = 'TIINGO'"),
        ('fx', "SELECT COUNT(*) FROM exchange_rates"),
        ('economic_calendar', "SELECT COUNT(*) FROM economic_calendar"),
        ('factors', "SELECT COUNT(*) FROM stock_factors"),
        ('genes', "SELECT COUNT(*) FROM evolution_genes")
    ]
    
    for cat_id, count_sql in categories:
        print(f"Counting {cat_id}...")
        cur.execute(count_sql)
        count = cur.fetchone()[0]
        cur.execute(f"""
            INSERT INTO public.category_stats (category_id, count_val) 
            VALUES ('{cat_id}', {count})
            ON CONFLICT (category_id) DO UPDATE SET count_val = EXCLUDED.count_val, updated_at = NOW();
        """)
        print(f"Synced {cat_id}: {count}")

    print("Deployment and Sync Completed!")
    cur.close()
    conn.close()

if __name__ == "__main__":
    deploy_accurate_stats()
