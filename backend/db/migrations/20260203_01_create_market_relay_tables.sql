-- Migration: Create Market Relay Tables (Phase 9.2)
-- Description: Creates market_quotes and api_key_usage tables.
-- Created at: 2026-02-03

-- 1. Create market_quotes table
CREATE TABLE IF NOT EXISTS public.market_quotes (
    stock_code TEXT PRIMARY KEY REFERENCES public.stocks(stock_code) ON DELETE CASCADE,
    name TEXT,
    price FLOAT,
    change FLOAT,
    change_percent FLOAT,
    volume BIGINT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source TEXT
);

-- 2. Create api_key_usage table (for Quota Management)
CREATE TABLE IF NOT EXISTS public.api_key_usage (
    key_id TEXT PRIMARY KEY,
    service TEXT NOT NULL, -- 'Fugle', 'Tiingo', 'FMP'
    request_count INTEGER DEFAULT 0,
    reset_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.market_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_key_usage ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
DROP POLICY IF EXISTS "Public read market_quotes" ON public.market_quotes;
CREATE POLICY "Public read market_quotes" ON public.market_quotes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role can do everything on market_quotes" ON public.market_quotes;
CREATE POLICY "Service role can do everything on market_quotes" ON public.market_quotes
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role can do everything on api_key_usage" ON public.api_key_usage;
CREATE POLICY "Service role can do everything on api_key_usage" ON public.api_key_usage
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 5. Enable Realtime for market_quotes
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'market_quotes'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.market_quotes;
    END IF;
END $$;

-- 6. Indices
CREATE INDEX IF NOT EXISTS idx_market_quotes_updated_at ON public.market_quotes(updated_at);
CREATE INDEX IF NOT EXISTS idx_api_key_usage_service ON public.api_key_usage(service);
