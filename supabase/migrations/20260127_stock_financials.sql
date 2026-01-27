-- Migration: Create stock_financials table for US stock financial reports
-- Created: 2026-01-27
-- Description: Stores quarterly and annual financial data from FMP API

CREATE TABLE IF NOT EXISTS stock_financials (
    id BIGSERIAL PRIMARY KEY,
    stock_code VARCHAR(20) NOT NULL,
    fiscal_date DATE NOT NULL,
    report_type VARCHAR(10) NOT NULL CHECK (report_type IN ('annual', 'quarterly')),
    
    -- Income Statement
    revenue NUMERIC,
    gross_profit NUMERIC,
    operating_income NUMERIC,
    net_income NUMERIC,
    eps NUMERIC,
    
    -- Balance Sheet
    total_assets NUMERIC,
    total_liabilities NUMERIC,
    total_equity NUMERIC,
    
    -- Cash Flow Statement
    operating_cash_flow NUMERIC,
    free_cash_flow NUMERIC,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint for upsert
    UNIQUE(stock_code, fiscal_date, report_type)
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_financials_stock_code ON stock_financials(stock_code);
CREATE INDEX IF NOT EXISTS idx_financials_fiscal_date ON stock_financials(fiscal_date DESC);
CREATE INDEX IF NOT EXISTS idx_financials_report_type ON stock_financials(report_type);

-- Comment
COMMENT ON TABLE stock_financials IS '美股財務報表數據 (來源: FMP API)';
