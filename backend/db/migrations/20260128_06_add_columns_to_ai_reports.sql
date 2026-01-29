-- 20260128_06_add_columns_to_ai_reports.sql
-- Purpose: 補全 ai_reports 缺失欄位
-- Author: AI 投資分析儀 V10.0 開發團隊
-- Date: 2026-01-28

-- 新增 context_snapshot 欄位（JSONB）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ai_reports' AND column_name = 'context_snapshot'
    ) THEN
        ALTER TABLE public.ai_reports ADD COLUMN context_snapshot JSONB;
    END IF;
END $$;

-- 新增 report_type 欄位
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ai_reports' AND column_name = 'report_type'
    ) THEN
        ALTER TABLE public.ai_reports ADD COLUMN report_type TEXT DEFAULT 'daily';
    END IF;
END $$;

-- 新增 version 欄位
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ai_reports' AND column_name = 'version'
    ) THEN
        ALTER TABLE public.ai_reports ADD COLUMN version TEXT DEFAULT 'v1.0';
    END IF;
END $$;

-- 新增 stock_name 欄位
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ai_reports' AND column_name = 'stock_name'
    ) THEN
        ALTER TABLE public.ai_reports ADD COLUMN stock_name TEXT;
    END IF;
END $$;

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_ai_reports_stock_date
ON public.ai_reports(stock_code, report_date DESC);

CREATE INDEX IF NOT EXISTS idx_ai_reports_type
ON public.ai_reports(report_type);
