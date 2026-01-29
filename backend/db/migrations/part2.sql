-- Step 2: 預建分區 (2010-2027)
DO $$
DECLARE
    curr_yr INTEGER;
    p_name TEXT;
    p_start DATE;
    p_end DATE;
BEGIN
    FOR curr_yr IN 2010..2027 LOOP
        p_name := 'daily_price_y' || curr_yr;
        p_start := make_date(curr_yr, 1, 1);
        p_end := make_date(curr_yr + 1, 1, 1);
        
        IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = p_name) THEN
            EXECUTE format('CREATE TABLE public.%I PARTITION OF public.daily_price FOR VALUES FROM (%L) TO (%L)', p_name, p_start, p_end);
        END IF;
    END LOOP;
END $$;

-- Step 3: 數據遷移
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'daily_price_old') THEN
        INSERT INTO public.daily_price (
            stock_code, trade_date, open_price, high_price, 
            low_price, close_price, volume, market_type, 
            adjusted_close, change_percent, is_trading
        )
        SELECT 
            stock_code, trade_date, open_price, high_price, 
            low_price, close_price, volume, market_type, 
            adjusted_close, change_percent, is_trading
        FROM public.daily_price_old
        ON CONFLICT (stock_code, trade_date) DO NOTHING;
    END IF;
END $$;

-- Step 4: 建立索引與 RLS
CREATE INDEX IF NOT EXISTS idx_daily_price_stock_date ON public.daily_price(stock_code, trade_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_price_is_trading ON public.daily_price(is_trading, trade_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_price_market_type ON public.daily_price(market_type);

ALTER TABLE public.daily_price ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read for daily_price" ON public.daily_price;
CREATE POLICY "Public read for daily_price" ON public.daily_price FOR SELECT USING (true);
