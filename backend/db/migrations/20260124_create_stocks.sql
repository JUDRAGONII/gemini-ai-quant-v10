-- 修復或建立 stocks 資料表
CREATE TABLE IF NOT EXISTS public.stocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    symbol TEXT NOT NULL UNIQUE,
    name TEXT,
    market TEXT DEFAULT 'TW', -- TW, US, Global
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 啟用 RLS
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;

-- 策略：公開讀取
DROP POLICY IF EXISTS "Public read for stocks" ON public.stocks;
CREATE POLICY "Public read for stocks" ON public.stocks FOR SELECT USING (true);

-- 策略：Service Role 完整存取
DROP POLICY IF EXISTS "Service role full access to stocks" ON public.stocks;
CREATE POLICY "Service role full access to stocks" ON public.stocks USING (auth.jwt()->>'role' = 'service_role');

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_stocks_symbol ON public.stocks(symbol);
CREATE INDEX IF NOT EXISTS idx_stocks_market ON public.stocks(market);

-- 重載 PostgREST 快取
NOTIFY pgrst, 'reload config';
