-- ============================================================
-- Phase 7: daily_price 年度分區策略
-- 執行日期：2026-01-28
-- 功能：將 daily_price 表按 trade_date 年度分區，提升大數據查詢效能
-- ============================================================

-- Step 1: 創建分區表父表
-- ============================================================
-- 確認 daily_price 表結構
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'daily_price'
        AND pg_table_is_partition('public.daily_price'::regclass::oid) = false
    ) THEN
        -- 建立分區主表
        CREATE TABLE IF NOT EXISTS public.daily_price (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            stock_code VARCHAR(20) NOT NULL,
            trade_date DATE NOT NULL,
            open_price NUMERIC(12, 2),
            high_price NUMERIC(12, 2),
            low_price NUMERIC(12, 2),
            close_price NUMERIC(12, 2),
            volume BIGINT DEFAULT 0,
            change_percent NUMERIC(8, 4),
            adjusted_close NUMERIC(12, 2),
            market_type VARCHAR(10),
            is_trading BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT NOW()
        ) PARTITION BY RANGE (trade_date);

        -- 創建索引 (在主表上建立會自動繼承到分區)
        CREATE INDEX IF NOT EXISTS idx_daily_price_stock_date ON public.daily_price(stock_code, trade_date DESC);
        CREATE INDEX IF NOT EXISTS idx_daily_price_is_trading ON public.daily_price(is_trading, trade_date DESC);

        RAISE NOTICE 'Created partitioned daily_price table';
    ELSE
        RAISE NOTICE 'daily_price already exists, checking for partitioning...';
    END IF;
END $$;

-- Step 2: 建立年度分區
-- ============================================================
DO $$
DECLARE
    start_year INTEGER := 2023;
    end_year INTEGER := 2027;
    current_year INTEGER;
    partition_name TEXT;
    start_date DATE;
    end_date DATE;
BEGIN
    current_year := start_year;
    WHILE current_year <= end_year LOOP
        partition_name := 'daily_price_' || current_year;
        start_date := make_date(current_year, 1, 1);
        end_date := make_date(current_year + 1, 1, 1);

        IF NOT EXISTS (
            SELECT 1 FROM pg_tables
            WHERE schemaname = 'public'
            AND tablename = partition_name
        ) THEN
            EXECUTE format(
                'CREATE TABLE IF NOT EXISTS public.%I PARTITION OF public.daily_price
                 FOR VALUES FROM (%L) TO (%L)',
                partition_name,
                start_date,
                end_date
            );
            RAISE NOTICE 'Created partition: % for year %', partition_name, current_year;
        ELSE
            RAISE NOTICE 'Partition % already exists', partition_name;
        END IF;

        current_year := current_year + 1;
    END LOOP;
END $$;

-- Step 3: 現有數據遷移 (如果還沒分區)
-- ============================================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'daily_price'
        AND pg_table_is_partition('public.daily_price'::regclass::oid) = false
    ) THEN
        -- 檢查是否有舊數據需要遷移
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'daily_price'
            AND column_name = 'id'
        ) THEN
            -- 將舊數據遷移到對應分區
            RAISE NOTICE 'Migrating existing daily_price data to partitions...';

            -- 插入各年份數據
            INSERT INTO public.daily_price
            SELECT * FROM public.daily_price_old
            WHERE trade_date >= '2023-01-01' AND trade_date < '2024-01-01'
            ON CONFLICT DO NOTHING;

            -- 清理舊表
            DROP TABLE IF EXISTS public.daily_price_old;
            RAISE NOTICE 'Data migration complete';
        END IF;
    END IF;
END $$;

-- Step 4: 自動創建未來分區的觸發器
-- ============================================================
CREATE OR REPLACE FUNCTION public.auto_create_daily_price_partition()
RETURNS TRIGGER AS $$
DECLARE
    partition_year INTEGER;
    partition_name TEXT;
    start_date DATE;
    end_date DATE;
BEGIN
    partition_year := EXTRACT(YEAR FROM NEW.trade_date);
    partition_name := 'daily_price_' || partition_year;
    start_date := make_date(partition_year, 1, 1);
    end_date := make_date(partition_year + 1, 1, 1);

    IF NOT EXISTS (
        SELECT 1 FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = partition_name
    ) THEN
        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS public.%I PARTITION OF public.daily_price
             FOR VALUES FROM (%L) TO (%L)',
            partition_name,
            start_date,
            end_date
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 創建觸發器
DROP TRIGGER IF EXISTS trg_auto_create_daily_price_partition ON public.daily_price;
CREATE TRIGGER trg_auto_create_daily_price_partition
    BEFORE INSERT ON public.daily_price
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_create_daily_price_partition();

-- Step 5: 驗證分區狀態
-- ============================================================
SELECT
    schemaname,
    tablename,
    pg_get_partkeydef(relid) AS partition_key
FROM pg_tables
WHERE tablename LIKE 'daily_price%'
ORDER BY tablename;

-- 顯示分區資訊
SELECT
    'daily_price' AS parent_table,
    child.relname AS partition_name,
    pg_get_expr(r.rangedef, r.relid) AS partition_range
FROM pg_inherits i
JOIN pg_class parent ON parent.oid = i.inhparent
JOIN pg_class child ON child.oid = i.inhrelid
JOIN pg_constraint c ON conrelid = child.oid
JOIN pg_range rg ON rg.rngtypid = c.contypid
LEFT JOIN pg_constraint con ON con.conrelid = child.oid AND con.contype = 'p'
LEFT JOIN LATERAL (
    SELECT pg_get_expr(conbin, oid) AS rangedef
    FROM pg_opclass o
    JOIN pg_am a ON o.opcmethod = a.oid
    WHERE a.amname = 'btree'
    AND o.opcname = 'text_pattern_ops'
) r ON true
WHERE parent.relname = 'daily_price';

-- 驗證訊息
SELECT
    '✅ Daily Price Partition Strategy Applied' AS message,
    NOW() AS executed_at;
