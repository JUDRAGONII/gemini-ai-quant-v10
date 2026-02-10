-- 1. 建立 exchange_rates 表
CREATE TABLE IF NOT EXISTS public.exchange_rates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    currency_pair varchar(20) NOT NULL,
    rate numeric NOT NULL,
    reference_date date NOT NULL,
    source varchar(50) NOT NULL,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT unique_pair_date UNIQUE (currency_pair, reference_date)
);

-- 2. 建立索引
CREATE INDEX IF NOT EXISTS idx_fx_pair_date ON public.exchange_rates (currency_pair, reference_date DESC);

-- 3. 啟用 RLS
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- 4. 建立 RLS 政策 (允許匿名讀取，僅開發者可寫入)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access' AND tablename = 'exchange_rates') THEN
        CREATE POLICY "Allow public read access" ON public.exchange_rates FOR SELECT TO anon, authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service_role full access' AND tablename = 'exchange_rates') THEN
        CREATE POLICY "Allow service_role full access" ON public.exchange_rates FOR ALL TO service_role USING (true);
    END IF;
END $$;

COMMENT ON TABLE public.exchange_rates IS '匯率與貴金屬歷史數據表';
