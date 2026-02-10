-- 20260210_02_create_economic_calendar.sql
-- Phase 11.4: 經濟日曆資料表

CREATE TABLE IF NOT EXISTS public.economic_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL,             -- 事件名稱 (如: Non-Farm Payrolls)
    event_code TEXT,                      -- 事件代碼 (如: FRED_10)
    country TEXT NOT NULL,                -- 國家 (US, TW)
    indicator_code TEXT,                  -- 關聯指標代碼 (可選)
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL, -- 預計公布時間
    importance INTEGER,                   -- 重要性 (1-5)
    actual_value DECIMAL(20, 4),          -- 實際值
    previous_value DECIMAL(20, 4),        -- 前值
    consensus_value DECIMAL(20, 4),       -- 預測值
    source TEXT DEFAULT 'FRED',           -- 來源
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_code, scheduled_at)
);

-- 索引優化
CREATE INDEX IF NOT EXISTS idx_econ_cal_date ON public.economic_calendar (scheduled_at DESC);

-- RLS
ALTER TABLE public.economic_calendar ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'economic_calendar' AND policyname = 'Allow public read access'
    ) THEN
        CREATE POLICY "Allow public read access" ON public.economic_calendar
            FOR SELECT USING (true);
    END IF;
END $$;

COMMENT ON TABLE public.economic_calendar IS '全球主要經濟事件日曆與指標公布值';
