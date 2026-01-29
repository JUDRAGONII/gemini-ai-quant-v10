-- 20260128_02_create_stock_financials.sql
-- Purpose: 建立 stock_financials 財報數據資料表
-- Author: AI 投資分析儀 V10.0 開發團隊
-- Date: 2026-01-28

-- 財報數據表
CREATE TABLE IF NOT EXISTS public.stock_financials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stock_code TEXT NOT NULL,
    report_type TEXT NOT NULL, -- Q1, Q2, Q3, Q4, Annual
    report_date DATE NOT NULL, -- 財報發布日期
    fiscal_year INTEGER NOT NULL,
    fiscal_quarter INTEGER,

    -- 獲利能力
    revenue NUMERIC(18, 2),
    revenue_growth_yoy NUMERIC(10, 4),
    net_income NUMERIC(18, 2),
    net_income_growth_yoy NUMERIC(10, 4),
    eps NUMERIC(10, 4),
    eps_growth_yoy NUMERIC(10, 4),

    -- 估值指標
    pe_ratio NUMERIC(10, 2),
    pb_ratio NUMERIC(10, 2),
    ps_ratio NUMERIC(10, 2),

    -- 報酬率
    roe NUMERIC(8, 4),
    roa NUMERIC(8, 4),
    gross_margin NUMERIC(8, 4),
    net_margin NUMERIC(8, 4),

    -- 股利
    dividend_per_share NUMERIC(10, 2),
    dividend_yield NUMERIC(8, 4),

    -- 槓桿與流動性
    debt_to_equity NUMERIC(10, 4),
    current_ratio NUMERIC(10, 4),
    quick_ratio NUMERIC(10, 4),

    -- 現金流量
    operating_cash_flow NUMERIC(18, 2),
    free_cash_flow NUMERIC(18, 2),

    -- 元資料
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(stock_code, report_type, fiscal_year)
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_stock_financials_code ON public.stock_financials(stock_code);
CREATE INDEX IF NOT EXISTS idx_stock_financials_date ON public.stock_financials(report_date);
CREATE INDEX IF NOT EXISTS idx_stock_financials_fiscal ON public.stock_financials(fiscal_year, fiscal_quarter);

-- RLS 政策
ALTER TABLE public.stock_financials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read financials" ON public.stock_financials FOR SELECT USING (true);
CREATE POLICY "Service role full access" ON public.stock_financials USING (auth.jwt()->>'role' = 'service_role');
