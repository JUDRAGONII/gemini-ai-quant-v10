-- Phase 12: 戰術計畫與覆盤系統資料表 (Tactical Loop System)
-- 對標 SPEC-V10.0-001 第 5.6 節

-- 1. 戰術計畫表 (Tactical Plans)
CREATE TABLE IF NOT EXISTS public.tactical_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL DEFAULT auth.uid(), -- 關聯至 Supabase Auth
    stock_code VARCHAR(20) NOT NULL,
    stock_name VARCHAR(100),
    entry_price DECIMAL(18,4) NOT NULL,      -- 預計進場價
    stop_loss DECIMAL(18,4) NOT NULL,       -- 停損價
    take_profit DECIMAL(18,4) NOT NULL,     -- 停利價
    reason TEXT,                            -- 戰術理由 (Why this trade?)
    status VARCHAR(20) DEFAULT 'open',      -- open, closed, cancelled
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 戰術覆盤日誌表 (Tactical Logs)
CREATE TABLE IF NOT EXISTS public.tactical_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES public.tactical_plans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL DEFAULT auth.uid(),
    exit_price DECIMAL(18,4),               -- 實際出場價
    exit_date DATE DEFAULT CURRENT_DATE,    -- 出場日期
    profit_loss DECIMAL(18,4),              -- 盈虧金額
    discipline_score INTEGER CHECK (discipline_score BETWEEN 0 AND 100), -- 紀律評分
    feedback TEXT,                          -- 覆盤心得 (Feedback Loop)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 安全性：啟用 RLS
ALTER TABLE public.tactical_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tactical_logs ENABLE ROW LEVEL SECURITY;

-- 4. 建立 RLS 政策 (多用戶隔離)
DO $$ 
BEGIN
    -- Plans Policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can only see their own plans' AND tablename = 'tactical_plans') THEN
        CREATE POLICY "Users can only see their own plans" ON public.tactical_plans
            FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Logs Policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can only see their own logs' AND tablename = 'tactical_logs') THEN
        CREATE POLICY "Users can only see their own logs" ON public.tactical_logs
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- 5. 自動更新時間戳
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tactical_plans_updated_at
    BEFORE UPDATE ON tactical_plans
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
