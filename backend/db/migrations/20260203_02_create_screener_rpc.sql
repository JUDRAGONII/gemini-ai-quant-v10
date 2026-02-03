-- Phase 9.1: AI Screener RPC and Performance Indexes

-- 1. 建立常用因子的函數索引以提升 JSONB 查詢效能
CREATE INDEX IF NOT EXISTS idx_stock_factors_ai_score 
ON public.stock_factors (((factors_all->>'ai_score')::numeric));

CREATE INDEX IF NOT EXISTS idx_stock_factors_rsi_14 
ON public.stock_factors (((factors_all->>'rsi_14')::numeric));

-- 2. 實作核心選股 RPC 函數
CREATE OR REPLACE FUNCTION fn_screen_stocks(
    p_filters jsonb,
    p_sort_by text DEFAULT 'ai_score',
    p_sort_order text DEFAULT 'desc',
    p_offset int DEFAULT 0,
    p_limit int DEFAULT 50
)
RETURNS TABLE (
    stock_code text,
    name text,
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
AS $$
BEGIN
    RETURN QUERY
    WITH latest_factors AS (
        -- 獲取每個標的最新一天的因子數據
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
            s.stock_name,  -- 保留原始名稱以供現有功能/測試使用
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
          -- Range 篩選邏輯 (支援 [min, max] 格式)
          AND (p_filters->'price_range' IS NULL OR (mq.price::numeric >= (p_filters->'price_range'->>0)::numeric AND mq.price::numeric <= (p_filters->'price_range'->>1)::numeric))
          AND (p_filters->'change_range' IS NULL OR (mq.change_percent::numeric >= (p_filters->'change_range'->>0)::numeric AND mq.change_percent::numeric <= (p_filters->'change_range'->>1)::numeric))
          AND (p_filters->'ai_score_range' IS NULL OR ((lf.factors_all->>'ai_score')::numeric >= (p_filters->'ai_score_range'->>0)::numeric AND (lf.factors_all->>'ai_score')::numeric <= (p_filters->'ai_score_range'->>1)::numeric))
          AND (p_filters->'rsi_14_range' IS NULL OR ((lf.factors_all->>'rsi_14')::numeric >= (p_filters->'rsi_14_range'->>0)::numeric AND (lf.factors_all->>'rsi_14')::numeric <= (p_filters->'rsi_14_range'->>1)::numeric))
    )
    SELECT 
        f.stock_code, f.name, f.price, f.change_percent, f.volume, 
        f.ai_score_val as ai_score, f.rsi_14_val as rsi_14, f.factors_all, f.last_updated as updated_at
    FROM filtered f
    ORDER BY 
        CASE WHEN p_sort_by = 'ai_score' AND p_sort_order = 'desc' THEN f.ai_score_val END DESC NULLS LAST,
        CASE WHEN p_sort_by = 'ai_score' AND p_sort_order = 'asc' THEN f.ai_score_val END ASC NULLS LAST,
        CASE WHEN p_sort_by = 'price' AND p_sort_order = 'desc' THEN f.price END DESC NULLS LAST,
        CASE WHEN p_sort_by = 'price' AND p_sort_order = 'asc' THEN f.price END ASC NULLS LAST,
        CASE WHEN p_sort_by = 'change_percent' AND p_sort_order = 'desc' THEN f.change_percent END DESC NULLS LAST,
        CASE WHEN p_sort_by = 'change_percent' AND p_sort_order = 'asc' THEN f.change_percent END ASC NULLS LAST
    OFFSET p_offset
    LIMIT p_limit;
END;
$$;

-- 3. 授權執行權限給匿名與已驗證用戶 (視需求調整)
GRANT EXECUTE ON FUNCTION fn_screen_stocks(jsonb, text, text, int, int) TO anon, authenticated, service_role;
