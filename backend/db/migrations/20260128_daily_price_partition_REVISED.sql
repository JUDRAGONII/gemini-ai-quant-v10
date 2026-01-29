-- ============================================================
-- Phase 7.4: daily_price 深度分區與數據遷移 (REVISED V2)
-- 執行日期：2026-01-28
-- ============================================================

-- Step 1: 備份現有表與清理
-- 將備份放在事務外處理，因為 ALTER TABLE RENAME 不需要事務且更安全
DO $$
BEGIN
    -- 檢查 daily_price 是否存在且「不是」分區表 (relkind != 'p')
    IF EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE n.nspname = 'public' 
        AND c.relname = 'daily_price' 
        AND c.relkind != 'p'
    ) THEN
        ALTER TABLE public.daily_price RENAME TO daily_price_old;
        RAISE NOTICE 'Renamed existing daily_price to daily_price_old';
    END IF;
END $$;

BEGIN;

-- 1.2 建立分區主表
CREATE TABLE IF NOT EXISTS public.daily_price (
    stock_code VARCHAR(20) NOT NULL,
    trade_date DATE NOT NULL,
    open_price NUMERIC,
    high_price NUMERIC,
    low_price NUMERIC,
    close_price NUMERIC,
    volume BIGINT DEFAULT 0,
    market_type VARCHAR(20),
    adjusted_close NUMERIC(18, 4),
    change_percent NUMERIC(8, 4),
    is_trading BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (stock_code, trade_date)
) PARTITION BY RANGE (trade_date);

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
        RAISE NOTICE 'Starting data migration...';
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
        
        RAISE NOTICE 'Data migration to partitions complete.';
    END IF;
END $$;

-- Step 4: 建立索引與 RLS
CREATE INDEX IF NOT EXISTS idx_daily_price_stock_date ON public.daily_price(stock_code, trade_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_price_is_trading ON public.daily_price(is_trading, trade_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_price_market_type ON public.daily_price(market_type);

ALTER TABLE public.daily_price ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read for daily_price" ON public.daily_price;
CREATE POLICY "Public read for daily_price" ON public.daily_price FOR SELECT USING (true);

COMMIT;

-- Step 5: 自動分區觸發器
CREATE OR REPLACE FUNCTION public.auto_create_daily_price_partition()
RETURNS TRIGGER AS $$
DECLARE
    p_year INTEGER;
    p_name TEXT;
BEGIN
    p_year := EXTRACT(YEAR FROM NEW.trade_date);
    p_name := 'daily_price_y' || p_year;
    
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = p_name) THEN
        EXECUTE format('CREATE TABLE IF NOT EXISTS public.%I PARTITION OF public.daily_price FOR VALUES FROM (%L) TO (%L)', 
            p_name, make_date(p_year, 1, 1), make_date(p_year + 1, 1, 1));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_partition ON public.daily_price;
CREATE TRIGGER trg_auto_partition
    BEFORE INSERT ON public.daily_price
    FOR EACH ROW EXECUTE FUNCTION public.auto_create_daily_price_partition();

-- 驗證
SELECT count(*) as partitioned_count FROM public.daily_price;
