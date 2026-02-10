-- 20260209_01_alignment_p11_6.sql
-- Alignment with SPEC-V10.0-001

-- 1. daily_price: Add turnover
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'daily_price' AND column_name = 'turnover'
    ) THEN
        ALTER TABLE public.daily_price ADD COLUMN turnover NUMERIC(20, 2);
    END IF;
END $$;

-- 2. exchange_rates check and update
DO $$
BEGIN
    -- Create table if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exchange_rates') THEN
        CREATE TABLE public.exchange_rates (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            base_currency VARCHAR(10) NOT NULL,
            target_currency VARCHAR(10) NOT NULL,
            rate NUMERIC(18, 8) NOT NULL,
            trade_date DATE NOT NULL,
            change NUMERIC(18, 8),
            change_percent NUMERIC(8, 4),
            created_at TIMESTAMPTZ DEFAULT now(),
            UNIQUE (base_currency, target_currency, trade_date)
        );
    ELSE
        -- Table exists, check columns
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exchange_rates' AND column_name = 'reference_date') THEN
            ALTER TABLE public.exchange_rates RENAME COLUMN reference_date TO trade_date;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exchange_rates' AND column_name = 'base_currency') THEN
            ALTER TABLE public.exchange_rates ADD COLUMN base_currency VARCHAR(10);
            ALTER TABLE public.exchange_rates ADD COLUMN target_currency VARCHAR(10);
            
            -- Migrate data from currency_pair if exists
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exchange_rates' AND column_name = 'currency_pair') THEN
                UPDATE public.exchange_rates 
                SET base_currency = SUBSTRING(currency_pair FROM 1 FOR 3),
                    target_currency = SUBSTRING(currency_pair FROM 4 FOR 3)
                WHERE currency_pair IS NOT NULL;
                
                ALTER TABLE public.exchange_rates ALTER COLUMN base_currency SET NOT NULL;
                ALTER TABLE public.exchange_rates ALTER COLUMN target_currency SET NOT NULL;
            END IF;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exchange_rates' AND column_name = 'change') THEN
            ALTER TABLE public.exchange_rates ADD COLUMN change NUMERIC(18, 8);
            ALTER TABLE public.exchange_rates ADD COLUMN change_percent NUMERIC(8, 4);
        END IF;
    END IF;
END $$;

-- 3. RLS
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on exchange_rates" ON public.exchange_rates;
CREATE POLICY "Allow public read access on exchange_rates"
ON public.exchange_rates FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow service_role full access on exchange_rates" ON public.exchange_rates;
CREATE POLICY "Allow service_role full access on exchange_rates"
ON public.exchange_rates FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 4. Indices
CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON public.exchange_rates(trade_date DESC);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_pairs ON public.exchange_rates(base_currency, target_currency);
