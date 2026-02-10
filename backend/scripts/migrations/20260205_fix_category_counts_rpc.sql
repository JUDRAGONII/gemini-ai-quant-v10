-- 重寫 get_category_counts RPC
-- 對齊 Phase 11.5 之 9 大分類
CREATE OR REPLACE FUNCTION public.get_category_counts()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_results jsonb;
BEGIN
    v_results := jsonb_build_object(
        'tw_equity', (SELECT count(*) FROM public.daily_price WHERE market_type = 'TWSE'),
        'us_equity', (SELECT count(*) FROM public.daily_price WHERE market_type = 'TIINGO'),
        'tw_macro', (SELECT count(*) FROM public.macro_indicators WHERE country = 'TW'),
        'us_macro', (SELECT count(*) FROM public.macro_indicators WHERE country = 'US'),
        'realtime', (SELECT count(*) FROM public.market_quotes),
        'factors', (SELECT count(*) FROM public.stock_factors),
        'genes', (SELECT count(*) FROM public.evolution_genes),
        'fx', (SELECT count(*) FROM public.exchange_rates),
        'economic_calendar', (SELECT count(*) FROM public.economic_calendar)
    );
    
    RETURN v_results;
END;
$function$;
