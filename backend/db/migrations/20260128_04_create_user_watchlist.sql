-- 20260128_04_create_user_watchlist.sql
-- Purpose: 建立 user_watchlist 自選股資料表
-- Author: AI 投資分析儀 V10.0 開發團隊
-- Date: 2026-01-28

-- 自選股表
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

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_watchlist_user ON public.user_watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_stock ON public.user_watchlist(stock_code);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_order ON public.user_watchlist(user_id, sort_order);

-- 唯一約束（防止重複添加）
CREATE UNIQUE INDEX IF NOT EXISTS idx_watchlist_user_stock
ON public.user_watchlist(user_id, stock_code);

-- RLS 政策
ALTER TABLE public.user_watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view own watchlist"
ON public.user_watchlist FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlist"
ON public.user_watchlist FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watchlist"
ON public.user_watchlist FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlist"
ON public.user_watchlist FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to watchlist"
ON public.user_watchlist USING (auth.jwt()->>'role' = 'service_role');
