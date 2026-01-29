-- ============================================================
-- Phase 7: 資料庫補全 Migration 修正版腳本 (FIXED)
-- 執行日期：2026-01-28
-- 功能：欄位更名、補全缺失欄位、建立新表、注入 RLS 輔助函數
-- ============================================================

-- 0. 注入 RLS 輔助函數 (針對本地 Docker 環境)
-- ============================================================
CREATE SCHEMA IF NOT EXISTS auth;

DROP FUNCTION IF EXISTS auth.uid();
CREATE OR REPLACE FUNCTION auth.uid() 
RETURNS uuid AS $$
  SELECT nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::uuid;
$$ LANGUAGE sql STABLE;

DROP FUNCTION IF EXISTS auth.jwt();
CREATE OR REPLACE FUNCTION auth.jwt() 
RETURNS json AS $$
  SELECT current_setting('request.jwt.claims', true)::json;
$$ LANGUAGE sql STABLE;

-- 1. 處理 stocks 表結構對齊
-- ============================================================
-- 先建立表（如果不存在）
CREATE TABLE IF NOT EXISTS public.stocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stock_code TEXT NOT NULL UNIQUE,
    stock_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN
    -- 更名 Legacy 欄位
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stocks' AND column_name = 'symbol') THEN
        ALTER TABLE public.stocks RENAME COLUMN symbol TO stock_code;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stocks' AND column_name = 'name') THEN
        ALTER TABLE public.stocks RENAME COLUMN name TO stock_name;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stocks' AND column_name = 'market') THEN
        ALTER TABLE public.stocks RENAME COLUMN market TO market_type;
    END IF;

    -- 補全缺失欄位
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stocks' AND column_name = 'stock_name_en') THEN
        ALTER TABLE public.stocks ADD COLUMN stock_name_en TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stocks' AND column_name = 'market_type') THEN
        ALTER TABLE public.stocks ADD COLUMN market_type TEXT DEFAULT 'TWSE';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stocks' AND column_name = 'industry') THEN
        ALTER TABLE public.stocks ADD COLUMN industry TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stocks' AND column_name = 'currency') THEN
        ALTER TABLE public.stocks ADD COLUMN currency TEXT DEFAULT 'TWD';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stocks' AND column_name = 'is_active') THEN
        ALTER TABLE public.stocks ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- 建立索引與 RLS
CREATE INDEX IF NOT EXISTS idx_stocks_code ON public.stocks(stock_code);
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read stocks" ON public.stocks;
CREATE POLICY "Public read stocks" ON public.stocks FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role full access" ON public.stocks;
CREATE POLICY "Service role full access" ON public.stocks USING (auth.jwt()->>'role' = 'service_role');

-- 2. 建立 stock_financials 財報資料表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.stock_financials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stock_code TEXT NOT NULL,
    report_type TEXT NOT NULL,
    report_date DATE NOT NULL,
    fiscal_year INTEGER NOT NULL,
    fiscal_quarter INTEGER,
    revenue NUMERIC(18, 2),
    net_income NUMERIC(18, 2),
    eps NUMERIC(10, 4),
    roe NUMERIC(8, 4),
    gross_margin NUMERIC(8, 4),
    net_margin NUMERIC(8, 4),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(stock_code, report_type, fiscal_year, fiscal_quarter)
);

DO $$ 
BEGIN
    -- 處理 fiscal_date -> report_date 的歷史更名 (如果存在)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stock_financials' AND column_name = 'fiscal_date') THEN
        ALTER TABLE public.stock_financials RENAME COLUMN fiscal_date TO report_date;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_stock_financials_code ON public.stock_financials(stock_code);
CREATE INDEX IF NOT EXISTS idx_stock_financials_date ON public.stock_financials(report_date);

ALTER TABLE public.stock_financials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read financials" ON public.stock_financials;
CREATE POLICY "Public read financials" ON public.stock_financials FOR SELECT USING (true);

-- 3. 建立投資組合相關表格
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_portfolios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    currency VARCHAR(3) DEFAULT 'TWD',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_holdings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    portfolio_id UUID NOT NULL REFERENCES public.user_portfolios(id) ON DELETE CASCADE,
    stock_code VARCHAR(20) NOT NULL,
    shares DECIMAL(18, 4) NOT NULL,
    avg_cost DECIMAL(18, 4) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_portfolios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only view own portfolios" ON public.user_portfolios;
CREATE POLICY "Users can only view own portfolios" ON public.user_portfolios FOR SELECT USING (auth.uid() = user_id);

-- 4. 建立 user_watchlist 自選股表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_watchlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stock_code VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_watchlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only view own watchlist" ON public.user_watchlist;
CREATE POLICY "Users can only view own watchlist" ON public.user_watchlist FOR SELECT USING (auth.uid() = user_id);

-- 5. 補全 daily_price 缺失欄位
-- ============================================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_price' AND column_name = 'market_type') THEN
        ALTER TABLE public.daily_price ADD COLUMN market_type TEXT DEFAULT 'TWSE';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_price' AND column_name = 'adjusted_close') THEN
        ALTER TABLE public.daily_price ADD COLUMN adjusted_close NUMERIC(18, 4);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_price' AND column_name = 'symbol') THEN
        ALTER TABLE public.daily_price RENAME COLUMN symbol TO stock_code;
    END IF;
END $$;

-- 6. 補全 ai_reports 缺失欄位
-- ============================================================
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_reports' AND column_name = 'symbol') THEN
        ALTER TABLE public.ai_reports RENAME COLUMN symbol TO stock_code;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_reports' AND column_name = 'report_type') THEN
        ALTER TABLE public.ai_reports ADD COLUMN report_type TEXT DEFAULT 'daily';
    END IF;
END $$;

SELECT '✅ Migration (FIXED) 執行成功' AS message;
