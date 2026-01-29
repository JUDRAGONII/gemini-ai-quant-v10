-- ============================================================
-- Phase 7: 資料庫補全 Migration P1 腳本
-- 執行日期：2026-01-28
-- 功能：建立 P1 優先級資料表
-- ============================================================

-- Step 1: 建立 portfolio_performance 投資組合績效表
-- ============================================================
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

CREATE INDEX IF NOT EXISTS idx_performance_portfolio ON public.portfolio_performance(portfolio_id, trade_date DESC);

ALTER TABLE public.portfolio_performance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own portfolio performance" ON public.portfolio_performance FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_portfolios WHERE id = portfolio_performance.portfolio_id AND user_id = auth.uid())
);
CREATE POLICY "Service role full access to performance" ON public.portfolio_performance USING (auth.jwt()->>'role' = 'service_role');

SELECT '✅ Step 1: portfolio_performance 表建立完成' AS status;


-- Step 2: 建立 stock_institutional 三大法人買賣超表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.stock_institutional (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stock_code VARCHAR(20) NOT NULL,
    trade_date DATE NOT NULL,
    foreign_investor_buy DECIMAL(18, 2),
    foreign_investor_sell DECIMAL(18, 2),
    foreign_investor_net DECIMAL(18, 2),
    foreign_investor_holding DECIMAL(18, 2),
    dealer_buy DECIMAL(18, 2),
    dealer_sell DECIMAL(18, 2),
    dealer_net DECIMAL(18, 2),
    investment_trust_buy DECIMAL(18, 2),
    investment_trust_sell DECIMAL(18, 2),
    investment_trust_net DECIMAL(18, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(stock_code, trade_date)
);

CREATE INDEX IF NOT EXISTS idx_institutional_stock ON public.stock_institutional(stock_code);
CREATE INDEX IF NOT EXISTS idx_institutional_date ON public.stock_institutional(trade_date DESC);

ALTER TABLE public.stock_institutional ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read institutional" ON public.stock_institutional FOR SELECT USING (true);
CREATE POLICY "Service role full access" ON public.stock_institutional USING (auth.jwt()->>'role' = 'service_role');

SELECT '✅ Step 2: stock_institutional 表建立完成' AS status;


-- Step 3: 建立 stock_margin 融資融券表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.stock_margin (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stock_code VARCHAR(20) NOT NULL,
    trade_date DATE NOT NULL,
    margin_balance DECIMAL(18, 2),
    margin_buy DECIMAL(18, 2),
    margin_sell DECIMAL(18, 2),
    margin_net DECIMAL(18, 2),
    short_balance DECIMAL(18, 2),
    short_buy DECIMAL(18, 2),
    short_sell DECIMAL(18, 2),
    short_net DECIMAL(18, 2),
    margin_rate NUMERIC(8, 4),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(stock_code, trade_date)
);

CREATE INDEX IF NOT EXISTS idx_margin_stock ON public.stock_margin(stock_code);
CREATE INDEX IF NOT EXISTS idx_margin_date ON public.stock_margin(trade_date DESC);

ALTER TABLE public.stock_margin ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read margin" ON public.stock_margin FOR SELECT USING (true);
CREATE POLICY "Service role full access" ON public.stock_margin USING (auth.jwt()->>'role' = 'service_role');

SELECT '✅ Step 3: stock_margin 表建立完成' AS status;


-- Step 4: 建立 intraday_candles 分K行情表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.intraday_candles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stock_code VARCHAR(20) NOT NULL,
    candle_date DATE NOT NULL,
    candle_time TIME NOT NULL,
    open_price DECIMAL(18, 4),
    high_price DECIMAL(18, 4),
    low_price DECIMAL(18, 4),
    close_price DECIMAL(18, 4),
    volume BIGINT,
    turnover DECIMAL(18, 2),
    candle_type SMALLINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(stock_code, candle_date, candle_time)
);

CREATE INDEX IF NOT EXISTS idx_intraday_stock ON public.intraday_candles(stock_code, candle_date DESC);
CREATE INDEX IF NOT EXISTS idx_intraday_time ON public.intraday_candles(candle_date, candle_time);

ALTER TABLE public.intraday_candles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read intraday" ON public.intraday_candles FOR SELECT USING (true);
CREATE POLICY "Service role full access" ON public.intraday_candles USING (auth.jwt()->>'role' = 'service_role');

SELECT '✅ Step 4: intraday_candles 表建立完成' AS status;


-- Step 5: 建立 economic_calendar 經濟事件日曆表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.economic_calendar (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_date DATE NOT NULL,
    event_time TIME,
    country VARCHAR(10) NOT NULL,
    event_name TEXT NOT NULL,
    importance VARCHAR(20) DEFAULT 'medium',
    actual_value TEXT,
    forecast_value TEXT,
    previous_value TEXT,
    is_estimate BOOLEAN DEFAULT FALSE,
    is_revised BOOLEAN DEFAULT FALSE,
    source VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calendar_date ON public.economic_calendar(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_calendar_country ON public.economic_calendar(country, importance);
CREATE INDEX IF NOT EXISTS idx_calendar_name ON public.economic_calendar(event_name);

ALTER TABLE public.economic_calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read calendar" ON public.economic_calendar FOR SELECT USING (true);
CREATE POLICY "Service role full access" ON public.economic_calendar USING (auth.jwt()->>'role' = 'service_role');

SELECT '✅ Step 5: economic_calendar 表建立完成' AS status;


-- ============================================================
-- Migration 完成摘要
-- ============================================================
SELECT
    'Phase 7 P1 Migration 完成' AS phase,
    NOW() AS executed_at;

SELECT '🎉 P1 資料表建立完成！' AS message;
