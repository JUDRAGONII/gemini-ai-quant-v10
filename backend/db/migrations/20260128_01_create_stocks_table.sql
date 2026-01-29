-- 20260128_01_create_stocks_table.sql
-- Purpose: 建立 stocks 股票主檔資料表
-- Author: AI 投資分析儀 V10.0 開發團隊
-- Date: 2026-01-28

-- 股票主檔表
CREATE TABLE IF NOT EXISTS public.stocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stock_code TEXT NOT NULL UNIQUE,
    stock_name TEXT NOT NULL,
    stock_name_en TEXT,
    market_type TEXT NOT NULL DEFAULT 'TWSE', -- TWSE, TPEX, US
    exchange_code TEXT, -- TWSE, TPEX, NASDAQ, NYSE, AMEX
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

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_stocks_code ON public.stocks(stock_code);
CREATE INDEX IF NOT EXISTS idx_stocks_market_type ON public.stocks(market_type);
CREATE INDEX IF NOT EXISTS idx_stocks_industry ON public.stocks(industry);
CREATE INDEX IF NOT EXISTS idx_stocks_name ON public.stocks(stock_name);

-- 允許匿名讀取
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read stocks" ON public.stocks FOR SELECT USING (true);
CREATE POLICY "Service role full access" ON public.stocks USING (auth.jwt()->>'role' = 'service_role');
