-- Phase 9.4: API 配額管理與金鑰健康監控
-- Migration: 建立 api_keys 表格

-- 1. 建立 api_keys 表格
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL,                    -- tiingo, fugle, gemini, fred
    key_name TEXT NOT NULL,                    -- 用戶友善名稱 (如 "Tiingo Primary")
    api_key TEXT NOT NULL,                     -- API 金鑰 (建議加密存儲)
    daily_limit INT DEFAULT 500,               -- 每日配額上限
    requests_today INT DEFAULT 0,              -- 今日已使用次數
    last_reset_date DATE DEFAULT CURRENT_DATE, -- 上次重置日期 (每日自動重置)
    status TEXT DEFAULT 'active',              -- active, cooling, disabled
    cooldown_until TIMESTAMPTZ,                -- 冷卻結束時間 (若觸發 429)
    error_count INT DEFAULT 0,                 -- 連續錯誤次數
    last_error_message TEXT,                   -- 最後錯誤訊息
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 建立索引
CREATE INDEX IF NOT EXISTS idx_api_keys_provider ON public.api_keys(provider);
CREATE INDEX IF NOT EXISTS idx_api_keys_status ON public.api_keys(status);

-- 3. 建立 RLS 政策 (僅服務角色可存取)
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_access" ON public.api_keys;
CREATE POLICY "service_role_full_access" ON public.api_keys
    FOR ALL
    USING ((auth.jwt() ->> 'role') = 'service_role');

-- 4. 授權
GRANT ALL ON public.api_keys TO service_role;
GRANT SELECT ON public.api_keys TO authenticated;

-- 5. 插入初始測試數據
INSERT INTO public.api_keys (provider, key_name, api_key, daily_limit, status)
VALUES
    ('tiingo', 'Tiingo Primary', 'TIINGO_KEY_PLACEHOLDER', 500, 'active'),
    ('fugle', 'Fugle Primary', 'FUGLE_KEY_PLACEHOLDER', 60, 'active'),
    ('gemini', 'Gemini Flash', 'GEMINI_KEY_PLACEHOLDER', 1500, 'active'),
    ('fred', 'FRED Primary', 'FRED_KEY_PLACEHOLDER', 120, 'active')
ON CONFLICT DO NOTHING;

-- 6. 建立每日重置函數
CREATE OR REPLACE FUNCTION fn_reset_daily_quota()
RETURNS void AS $$
BEGIN
    UPDATE public.api_keys
    SET 
        requests_today = 0,
        last_reset_date = CURRENT_DATE,
        error_count = 0,
        status = CASE WHEN status = 'cooling' AND cooldown_until < NOW() THEN 'active' ELSE status END,
        updated_at = NOW()
    WHERE last_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- 7. 授權函數執行
GRANT EXECUTE ON FUNCTION fn_reset_daily_quota TO service_role;
