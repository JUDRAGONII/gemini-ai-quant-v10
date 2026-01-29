-- 20260128_03_create_user_portfolios.sql
-- Purpose: 建立 user_portfolios 與 user_holdings 投資組合資料表
-- Author: AI 投資分析儀 V10.0 開發團隊
-- Date: 2026-01-28

-- 用戶投資組合表
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

-- 用戶持股部位表
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

-- 投資組合績效歷史表
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

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_portfolios_user ON public.user_portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_portfolio ON public.user_holdings(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_holdings_stock ON public.user_holdings(stock_code);
CREATE INDEX IF NOT EXISTS idx_performance_portfolio ON public.portfolio_performance(portfolio_id, trade_date DESC);

-- RLS 政策 - 用戶投資組合
ALTER TABLE public.user_portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view own portfolios"
ON public.user_portfolios FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolios"
ON public.user_portfolios FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolios"
ON public.user_portfolios FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolios"
ON public.user_portfolios FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to portfolios"
ON public.user_portfolios USING (auth.jwt()->>'role' = 'service_role');

-- RLS 政策 - 用戶持股
ALTER TABLE public.user_holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view own holdings"
ON public.user_holdings FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.user_portfolios
        WHERE id = user_holdings.portfolio_id
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert own holdings"
ON public.user_holdings FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_portfolios
        WHERE id = portfolio_id
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can update own holdings"
ON public.user_holdings FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.user_portfolios
        WHERE id = user_holdings.portfolio_id
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete own holdings"
ON public.user_holdings FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.user_portfolios
        WHERE id = user_holdings.portfolio_id
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Service role full access to holdings"
ON public.user_holdings USING (auth.jwt()->>'role' = 'service_role');

-- RLS 政策 - 投資組合績效
ALTER TABLE public.portfolio_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own portfolio performance"
ON public.portfolio_performance FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.user_portfolios
        WHERE id = portfolio_performance.portfolio_id
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Service role full access to performance"
ON public.portfolio_performance USING (auth.jwt()->>'role' = 'service_role');
