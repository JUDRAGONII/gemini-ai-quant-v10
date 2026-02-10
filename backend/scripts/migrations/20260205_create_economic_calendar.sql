-- 建立經濟日曆表
CREATE TABLE IF NOT EXISTS public.economic_calendar (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name varchar(255) NOT NULL,
    event_code varchar(100) NOT NULL, -- 唯一標識符 (如 FRED_ID)
    country varchar(10) DEFAULT 'US',
    scheduled_at timestamptz NOT NULL,
    importance int DEFAULT 3, -- 1-5
    actual_value numeric,
    consensus_value numeric,
    previous_value numeric,
    source varchar(50) DEFAULT 'FRED',
    created_at timestamptz DEFAULT now(),
    CONSTRAINT unique_event_time UNIQUE (event_code, scheduled_at)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_calendar_time ON public.economic_calendar (scheduled_at);
CREATE INDEX IF NOT EXISTS idx_calendar_importance ON public.economic_calendar (importance);

-- RLS
ALTER TABLE public.economic_calendar ENABLE ROW LEVEL SECURITY;

DO $BODY$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read' AND tablename = 'economic_calendar') THEN
        CREATE POLICY "Allow public read" ON public.economic_calendar FOR SELECT TO anon, authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service_role full' AND tablename = 'economic_calendar') THEN
        CREATE POLICY "Allow service_role full" ON public.economic_calendar FOR ALL TO service_role USING (true);
    END IF;
END $BODY$;

COMMENT ON TABLE public.economic_calendar IS '全球主要經濟事件日曆';
