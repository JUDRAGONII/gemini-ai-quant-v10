-- ============================================================
-- Phase 7: 資料庫補全 Migration 整合腳本
-- 執行日期：2026-01-28
-- 請在 Supabase SQL Editor 中依序執行此腳本
-- ============================================================

-- 步驟 1: 建立 stocks 股票主檔資料表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.stocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stock_code TEXT NOT NULL UNIQUE,
    stock_name TEXT NOT NULL,
    stock_name_en TEXT,
    market_type TEXT NOT NULL DEFAULT 'TWSE',
    exchange_code TEXT,
    industry TEXT,
    sector TEXT,
    list_date DATE,
    currency TEXT DEFAULT 'TWD',
    par_value NUMERIC(10, 2),
    authorized_shares BIGINT,
    outstanding_shares BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stocks_code ON public.stocks(stock_code);
CREATE INDEX IF NOT EXISTS idx_stocks_market_type ON public.stocks(market_type);
CREATE INDEX IF NOT EXISTS idx_stocks_industry ON public.stocks(industry);
CREATE INDEX IF NOT EXISTS idx_stocks_name ON public.stocks(stock_name);

ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read stocks" ON public.stocks FOR SELECT USING (true);
CREATE POLICY "Service role full access" ON public.stocks USING (auth.jwt()->>'role' = 'service_role');

SELECT '✅ Step 1: stocks 表建立完成' AS status;


-- 步驟 2: 建立 stock_financials 財報資料表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.stock_financials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stock_code TEXT NOT NULL,
    report_type TEXT NOT NULL,
    report_date DATE NOT NULL,
    fiscal_year INTEGER NOT NULL,
    fiscal_quarter INTEGER,
    revenue NUMERIC(18, 2),
    revenue_growth_yoy NUMERIC(10, 4),
    net_income NUMERIC(18, 2),
    net_income_growth_yoy NUMERIC(10, 4),
    eps NUMERIC(10, 4),
    eps_growth_yoy NUMERIC(10, 4),
    pe_ratio NUMERIC(10, 2),
    pb_ratio NUMERIC(10, 2),
    ps_ratio NUMERIC(10, 2),
    roe NUMERIC(8, 4),
    roa NUMERIC(8, 4),
    gross_margin NUMERIC(8, 4),
    net_margin NUMERIC(8, 4),
    dividend_per_share NUMERIC(10, 2),
    dividend_yield NUMERIC(8, 4),
    debt_to_equity NUMERIC(10, 4),
    current_ratio NUMERIC(10, 4),
    quick_ratio NUMERIC(10, 4),
    operating_cash_flow NUMERIC(18, 2),
    free_cash_flow NUMERIC(18, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(stock_code, report_type, fiscal_year)
);

CREATE INDEX IF NOT EXISTS idx_stock_financials_code ON public.stock_financials(stock_code);
CREATE INDEX IF NOT EXISTS idx_stock_financials_date ON public.stock_financials(report_date);
CREATE INDEX IF NOT EXISTS idx_stock_financials_fiscal ON public.stock_financials(fiscal_year, fiscal_quarter);

ALTER TABLE public.stock_financials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read financials" ON public.stock_financials FOR SELECT USING (true);
CREATE POLICY "Service role full access" ON public.stock_financials USING (auth.jwt()->>'role' = 'service_role');

SELECT '✅ Step 2: stock_financials 表建立完成' AS status;


-- 步驟 3: 建立 user_portfolios / user_holdings / portfolio_performance
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
    stock_name VARCHAR(100),
    shares DECIMAL(18, 4) NOT NULL,
    avg_cost DECIMAL(18, 4) NOT NULL,
    buy_date DATE,
    commission DECIMAL(18, 2) DEFAULT 0,
    tax DECIMAL(18, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.portfolio_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    portfolio_id UUID NOT NULL REFERENCES public.user_portfolios(id) ON DELETE CASCADE,
    trade_date DATE NOT NULL,
    total_value DECIMAL(18, 2) NOT NULL,
    total_cost DECIMAL(18, 2) NOT NULL,
    total_profit DECIMAL(18, 2),
    profit_percent NUMERIC(8, 4),
    day_change DECIMAL(18, 2),
    day_change_percent NUMERIC(8, 4),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(portfolio_id, trade_date)
);

CREATE INDEX IF NOT EXISTS idx_portfolios_user ON public.user_portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_portfolio ON public.user_holdings(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_holdings_stock ON public.user_holdings(stock_code);
CREATE INDEX IF NOT EXISTS idx_performance_portfolio ON public.portfolio_performance(portfolio_id, trade_date DESC);

-- RLS for user_portfolios
ALTER TABLE public.user_portfolios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only view own portfolios" ON public.user_portfolios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own portfolios" ON public.user_portfolios FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own portfolios" ON public.user_portfolios FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own portfolios" ON public.user_portfolios FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access to portfolios" ON public.user_portfolios USING (auth.jwt()->>'role' = 'service_role');

-- RLS for user_holdings
ALTER TABLE public.user_holdings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only view own holdings" ON public.user_holdings FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_portfolios WHERE id = user_holdings.portfolio_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert own holdings" ON public.user_holdings FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_portfolios WHERE id = portfolio_id AND user_id = auth.uid())
);
CREATE POLICY "Service role full access to holdings" ON public.user_holdings USING (auth.jwt()->>'role' = 'service_role');

-- RLS for portfolio_performance
ALTER TABLE public.portfolio_performance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own portfolio performance" ON public.portfolio_performance FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_portfolios WHERE id = portfolio_performance.portfolio_id AND user_id = auth.uid())
);
CREATE POLICY "Service role full access to performance" ON public.portfolio_performance USING (auth.jwt()->>'role' = 'service_role');

SELECT '✅ Step 3: user_portfolios/holdings/performance 表建立完成' AS status;


-- 步驟 4: 建立 user_watchlist 自選股表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_watchlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stock_code VARCHAR(20) NOT NULL,
    stock_name VARCHAR(100),
    notes TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_watchlist_user ON public.user_watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_stock ON public.user_watchlist(stock_code);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_order ON public.user_watchlist(user_id, sort_order);

ALTER TABLE public.user_watchlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only view own watchlist" ON public.user_watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own watchlist" ON public.user_watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own watchlist" ON public.user_watchlist FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own watchlist" ON public.user_watchlist FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access to watchlist" ON public.user_watchlist USING (auth.jwt()->>'role' = 'service_role');

SELECT '✅ Step 4: user_watchlist 表建立完成' AS status;


-- 步驟 5: 補全 daily_price 缺失欄位
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_price' AND column_name = 'market_type') THEN
        ALTER TABLE public.daily_price ADD COLUMN market_type TEXT DEFAULT 'TWSE';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_price' AND column_name = 'adjusted_close') THEN
        ALTER TABLE public.daily_price ADD COLUMN adjusted_close NUMERIC(18, 4);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_price' AND column_name = 'change_percent') THEN
        ALTER TABLE public.daily_price ADD COLUMN change_percent NUMERIC(8, 4);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_price' AND column_name = 'is_trading') THEN
        ALTER TABLE public.daily_price ADD COLUMN is_trading BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_daily_price_market_type ON public.daily_price(market_type);
CREATE INDEX IF NOT EXISTS idx_daily_price_volume_desc ON public.daily_price(volume DESC) WHERE is_trading = TRUE;

SELECT '✅ Step 5: daily_price 欄位補全完成' AS status;


-- 步驟 6: 補全 ai_reports 缺失欄位
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_reports' AND column_name = 'context_snapshot') THEN
        ALTER TABLE public.ai_reports ADD COLUMN context_snapshot JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_reports' AND column_name = 'report_type') THEN
        ALTER TABLE public.ai_reports ADD COLUMN report_type TEXT DEFAULT 'daily';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_reports' AND column_name = 'version') THEN
        ALTER TABLE public.ai_reports ADD COLUMN version TEXT DEFAULT 'v1.0';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_reports' AND column_name = 'stock_name') THEN
        ALTER TABLE public.ai_reports ADD COLUMN stock_name TEXT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ai_reports_stock_date ON public.ai_reports(stock_code, report_date DESC);
CREATE INDEX IF NOT EXISTS idx_ai_reports_type ON public.ai_reports(report_type);

SELECT '✅ Step 6: ai_reports 欄位補全完成' AS status;


-- ============================================================
-- Migration 完成摘要
-- ============================================================
SELECT
    'Phase 7 Migration 完成' AS phase,
    COUNT(*) AS tables_created,
    NOW() AS executed_at
FROM (
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('stocks', 'stock_financials', 'user_portfolios', 'user_holdings', 'portfolio_performance', 'user_watchlist')
) t;

SELECT '🎉 所有 Migration 執行完成！' AS message;
