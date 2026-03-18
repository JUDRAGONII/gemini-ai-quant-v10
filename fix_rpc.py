import asyncio
from backend.lib.supabase_client import get_supabase
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

sql = """
DROP FUNCTION IF EXISTS public.fn_screen_stocks(jsonb, text, text, int, int);

CREATE OR REPLACE FUNCTION public.fn_screen_stocks(
    p_filters jsonb,
    p_sort_by text DEFAULT 'ai_score',
    p_sort_order text DEFAULT 'desc',
    p_offset int DEFAULT 0,
    p_limit int DEFAULT 50
)
RETURNS TABLE (
    stock_code text,
    name text,
    stock_name text,
    market_type text,
    price numeric,
    change_percent numeric,
    volume bigint,
    ai_score numeric,
    rsi_14 numeric,
    factors_all jsonb,
    updated_at timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH latest_factors AS (
        SELECT DISTINCT ON (stock_code) 
            stock_factors.stock_code, 
            stock_factors.factors_all
        FROM stock_factors
        ORDER BY stock_code, trade_date DESC
    ),
    filtered AS (
        SELECT 
            s.stock_code,
            s.stock_name as name,
            s.stock_name,
            s.market_type,
            mq.price::numeric,
            mq.change_percent::numeric,
            mq.volume::bigint,
            (lf.factors_all->>'ai_score')::numeric as ai_score_val,
            (lf.factors_all->>'rsi_14')::numeric as rsi_14_val,
            lf.factors_all,
            COALESCE(mq.updated_at, s.updated_at) as last_updated
        FROM stocks s
        LEFT JOIN market_quotes mq ON s.stock_code = mq.stock_code
        LEFT JOIN latest_factors lf ON s.stock_code = lf.stock_code
        WHERE s.is_active = true
          AND (p_filters->>'market_type' IS NULL OR s.market_type = p_filters->>'market_type')
          AND (p_filters->'price_range' IS NULL OR (mq.price::numeric >= (p_filters->'price_range'->>0)::numeric AND mq.price::numeric <= (p_filters->'price_range'->>1)::numeric))
          AND (p_filters->'change_range' IS NULL OR (mq.change_percent::numeric >= (p_filters->'change_range'->>0)::numeric AND mq.change_percent::numeric <= (p_filters->'change_range'->>1)::numeric))
          AND (p_filters->'ai_score_range' IS NULL OR ((lf.factors_all->>'ai_score')::numeric >= (p_filters->'ai_score_range'->>0)::numeric AND (lf.factors_all->>'ai_score')::numeric <= (p_filters->'ai_score_range'->>1)::numeric))
          AND (p_filters->'rsi_14_range' IS NULL OR ((lf.factors_all->>'rsi_14')::numeric >= (p_filters->'rsi_14_range'->>0)::numeric AND (lf.factors_all->>'rsi_14')::numeric <= (p_filters->'rsi_14_range'->>1)::numeric))
    )
    SELECT 
        f.stock_code, f.name, f.stock_name, f.market_type, f.price, f.change_percent, f.volume, 
        f.ai_score_val as ai_score, f.rsi_14_val as rsi_14, f.factors_all, f.last_updated as updated_at
    FROM filtered f
    ORDER BY 
        CASE WHEN p_sort_by = 'ai_score' AND p_sort_order = 'desc' THEN f.ai_score_val END DESC NULLS LAST,
        CASE WHEN p_sort_by = 'ai_score' AND p_sort_order = 'asc' THEN f.ai_score_val END ASC NULLS LAST,
        CASE WHEN p_sort_by = 'price' AND p_sort_order = 'desc' THEN f.price END DESC NULLS LAST,
        CASE WHEN p_sort_by = 'price' AND p_sort_order = 'asc' THEN f.price END ASC NULLS LAST,
        CASE WHEN p_sort_by = 'change_percent' AND p_sort_order = 'desc' THEN f.change_percent END DESC NULLS LAST,
        CASE WHEN p_sort_by = 'change_percent' AND p_sort_order = 'asc' THEN f.change_percent END ASC NULLS LAST,
        CASE WHEN p_sort_by = 'volume' AND p_sort_order = 'desc' THEN f.volume END DESC NULLS LAST,
        CASE WHEN p_sort_by = 'volume' AND p_sort_order = 'asc' THEN f.volume END ASC NULLS LAST
    OFFSET p_offset
    LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_screen_stocks(jsonb, text, text, int, int) TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
"""

def run():
    import psycopg2
    import os
    from dotenv import load_dotenv
    
    load_dotenv()
    pw = os.getenv('POSTGRES_PASSWORD')
    
    try:
        # Connect strictly to docker-compose mapped port 6100
        conn = psycopg2.connect(f"host='localhost' port='6100' user='postgres' password='{pw}' dbname='postgres'")
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute(sql)
        cur.close()
        conn.close()
        logger.info("✅ 成功覆寫 Supabase 內部 fn_screen_stocks RPC ！")
    except Exception as e:
        logger.error(f"❌ 部署失敗: {e}")

if __name__ == "__main__":
    run()
