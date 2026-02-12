-- 1. 建立統計快取表
CREATE TABLE IF NOT EXISTS public.category_stats (
    category_id TEXT PRIMARY KEY,
    count_val BIGINT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 初始數據填充 (一次性慢速 count)
INSERT INTO public.category_stats (category_id, count_val)
VALUES 
    ('tw_equity', (SELECT count(*) FROM public.daily_price WHERE market_type = 'TWSE')),
    ('us_equity', (SELECT count(*) FROM public.daily_price WHERE market_type = 'TIINGO')),
    ('tw_macro', (SELECT count(*) FROM public.macro_indicators WHERE country = 'TW')),
    ('us_macro', (SELECT count(*) FROM public.macro_indicators WHERE country = 'US')),
    ('realtime', (SELECT count(*) FROM public.market_quotes)),
    ('factors', (SELECT count(*) FROM public.stock_factors)),
    ('genes', (SELECT count(*) FROM public.evolution_genes)),
    ('fx', (SELECT count(*) FROM public.exchange_rates)),
    ('economic_calendar', (SELECT count(*) FROM public.economic_calendar))
ON CONFLICT (category_id) DO UPDATE SET count_val = EXCLUDED.count_val, updated_at = NOW();

-- 3. 重寫 get_category_counts 為 O(1)
CREATE OR REPLACE FUNCTION public.get_category_counts()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_results jsonb;
BEGIN
    SELECT jsonb_build_object(
        'tw_equity', COALESCE((SELECT count_val FROM category_stats WHERE category_id = 'tw_equity'), 0),
        'us_equity', COALESCE((SELECT count_val FROM category_stats WHERE category_id = 'us_equity'), 0),
        'tw_macro', COALESCE((SELECT count_val FROM category_stats WHERE category_id = 'tw_macro'), 0),
        'us_macro', COALESCE((SELECT count_val FROM category_stats WHERE category_id = 'us_macro'), 0),
        'realtime', COALESCE((SELECT count_val FROM category_stats WHERE category_id = 'realtime'), 0),
        'factors', COALESCE((SELECT count_val FROM category_stats WHERE category_id = 'factors'), 0),
        'genes', COALESCE((SELECT count_val FROM category_stats WHERE category_id = 'genes'), 0),
        'fx', COALESCE((SELECT count_val FROM category_stats WHERE category_id = 'fx'), 0),
        'economic_calendar', COALESCE((SELECT count_val FROM category_stats WHERE category_id = 'economic_calendar'), 0)
    ) INTO v_results;
    
    RETURN v_results;
END;
$function$;
