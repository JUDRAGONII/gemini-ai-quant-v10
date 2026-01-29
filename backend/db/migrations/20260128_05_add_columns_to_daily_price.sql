-- 20260128_05_add_columns_to_daily_price.sql
-- Purpose: 補全 daily_price 缺失欄位
-- Author: AI 投資分析儀 V10.0 開發團隊
-- Date: 2026-01-28

-- 新增 market_type 欄位（若不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'daily_price' AND column_name = 'market_type'
    ) THEN
        ALTER TABLE public.daily_price ADD COLUMN market_type TEXT DEFAULT 'TWSE';
    END IF;
END $$;

-- 新增 adjusted_close 欄位
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'daily_price' AND column_name = 'adjusted_close'
    ) THEN
        ALTER TABLE public.daily_price ADD COLUMN adjusted_close NUMERIC(18, 4);
    END IF;
END $$;

-- 新增 change_percent 欄位
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'daily_price' AND column_name = 'change_percent'
    ) THEN
        ALTER TABLE public.daily_price ADD COLUMN change_percent NUMERIC(8, 4);
    END IF;
END $$;

-- 新增 is_trading 欄位
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'daily_price' AND column_name = 'is_trading'
    ) THEN
        ALTER TABLE public.daily_price ADD COLUMN is_trading BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- 建立 market_type 索引
CREATE INDEX IF NOT EXISTS idx_daily_price_market_type
ON public.daily_price(market_type);

-- 建立複合索引（優化排序查詢）
CREATE INDEX IF NOT EXISTS idx_daily_price_volume_desc
ON public.daily_price(volume DESC)
WHERE is_trading = TRUE;
