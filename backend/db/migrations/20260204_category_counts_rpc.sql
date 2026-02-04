-- ============================================
-- 分類統計 RPC: get_category_counts
-- 用途: 為數據監控中心提供各分類的記錄數統計
-- 日期: 2026-02-04
-- ============================================

CREATE OR REPLACE FUNCTION get_category_counts()
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE 
    result JSON;
BEGIN
    SELECT json_build_object(
        -- 行情數據 (依市場區分)
        'tw_equity', (SELECT COUNT(*) FROM daily_price WHERE market_type = 'TWSE'),
        'us_equity', (SELECT COUNT(*) FROM daily_price WHERE market_type = 'TIINGO'),
        
        -- 宏觀數據 (依國家區分)
        'tw_macro', (SELECT COUNT(*) FROM macro_indicators WHERE country = 'TW'),
        'us_macro', (SELECT COUNT(*) FROM macro_indicators WHERE country = 'US'),
        
        -- 即時行情
        'realtime', (SELECT COUNT(*) FROM market_quotes),
        
        -- 因子與基因 (預估值以避免大表計數超時)
        'factors', (SELECT reltuples::BIGINT FROM pg_class WHERE relname = 'stock_factors'),
        'genes', (SELECT reltuples::BIGINT FROM pg_class WHERE relname = 'evolution_genes'),
        
        -- 待補充 (佔位)
        'fx', 0,
        'metals', 0
    ) INTO result;
    
    RETURN result;
END;
$$;

-- 授權給 anon 和 authenticated 角色
GRANT EXECUTE ON FUNCTION get_category_counts() TO anon, authenticated;

COMMENT ON FUNCTION get_category_counts() IS '返回數據監控中心各分類的記錄數統計 (JSON 格式)';
