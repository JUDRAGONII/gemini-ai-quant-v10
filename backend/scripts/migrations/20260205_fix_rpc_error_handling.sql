-- 修復 fn_screen_stocks RPC (v2: JSONB Extraction)
CREATE OR REPLACE FUNCTION public.fn_screen_stocks(
    p_filters jsonb DEFAULT '{}'::jsonb,
    p_sort_by text DEFAULT 'ai_score',
    p_sort_order text DEFAULT 'desc',
    p_offset int DEFAULT 0,
    p_limit int DEFAULT 50
)
RETURNS SETOF jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_query text;
BEGIN
    BEGIN
        v_query := format(
            'SELECT jsonb_build_object(
                ''stock_code'', s.stock_code,
                ''stock_name'', s.stock_name,
                ''price'', q.price,
                ''change_percent'', q.change_percent,
                ''ai_score'', f.ai_score
            )
            FROM public.stocks s
            LEFT JOIN public.market_quotes q ON s.stock_code = q.stock_code
            LEFT JOIN (
                SELECT DISTINCT ON (stock_code) 
                    stock_code, 
                    (factors_all->>''ai_score'')::numeric as ai_score
                FROM public.stock_factors
                ORDER BY stock_code, trade_date DESC
            ) f ON s.stock_code = f.stock_code
            WHERE s.is_active = true
            ORDER BY %I %s
            OFFSET %L LIMIT %L',
            p_sort_by,
            p_sort_order,
            p_offset,
            p_limit
        );

        RETURN QUERY EXECUTE v_query;

    EXCEPTION WHEN OTHERS THEN
        RETURN NEXT jsonb_build_object(
            'error', SQLERRM,
            'detail', SQLSTATE
        );
    END;
END;
$function$;
