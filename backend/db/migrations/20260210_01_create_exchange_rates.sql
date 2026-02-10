-- 20260210_create_exchange_rates.sql
-- Phase 11.3: 基礎設施與數據物理恢復

-- 1. 建立匯率與貴金屬歷史表
CREATE TABLE IF NOT EXISTS public.exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    currency_pair TEXT NOT NULL,          -- 例如: USD/TWD, USD/CNY, XAU/USD (黃金)
    rate DECIMAL(20, 6) NOT NULL,         -- 匯率或價格
    reference_date DATE NOT NULL,         -- 參考日期
    source TEXT,                          -- 來源 (FRED, ExchangeRateAPI, GoldAPI)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(currency_pair, reference_date)
);

-- 2. 建立索引優化查詢
CREATE INDEX IF NOT EXISTS idx_fx_pair_date ON public.exchange_rates (currency_pair, reference_date DESC);

-- 3. 設定 RLS 政策
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'exchange_rates' AND policyname = 'Allow public read access'
    ) THEN
        CREATE POLICY "Allow public read access" ON public.exchange_rates
            FOR SELECT USING (true);
    END IF;
END $$;

COMMENT ON TABLE public.exchange_rates IS '匯率與貴金屬歷史數據表';
