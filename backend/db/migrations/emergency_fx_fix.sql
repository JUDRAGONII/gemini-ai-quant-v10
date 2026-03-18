DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM   pg_class c
        JOIN   pg_namespace n ON n.oid = c.relnamespace
        WHERE  c.relname = 'exchange_rates_base_currency_target_currency_trade_d_key'
        AND    n.nspname = 'public'
    ) THEN
        ALTER TABLE public.exchange_rates
        ADD CONSTRAINT exchange_rates_base_currency_target_currency_trade_d_key
        UNIQUE (base_currency, target_currency, trade_date);
    END IF;
END $$;
