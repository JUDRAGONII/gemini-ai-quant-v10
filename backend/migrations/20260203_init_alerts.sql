-- 1. 市場警示主表
DROP TABLE IF EXISTS market_alerts CASCADE;
CREATE TABLE market_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_code VARCHAR(20) NOT NULL,
    stock_name VARCHAR(100),
    market_type VARCHAR(10) NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    alert_level VARCHAR(20) NOT NULL,
    alert_title VARCHAR(200) NOT NULL,
    alert_description TEXT,
    trigger_value DECIMAL(18, 6),
    threshold_value DECIMAL(18, 6),
    change_percent DECIMAL(8, 4),
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    is_dismissed BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 警示規則配置表
DROP TABLE IF EXISTS alert_rules CASCADE;
CREATE TABLE alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name VARCHAR(100) NOT NULL UNIQUE,
    rule_type VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    condition_expr JSONB NOT NULL,
    level_expr JSONB,
    is_system_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 使用者自訂警示偏好
DROP TABLE IF EXISTS user_alert_preferences CASCADE;
CREATE TABLE user_alert_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    enable_push BOOLEAN DEFAULT TRUE,
    enable_email BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    custom_rules JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 4. 索引優化
CREATE INDEX idx_alerts_stock_time ON market_alerts(stock_code, triggered_at DESC);
CREATE INDEX idx_alerts_type ON market_alerts(alert_type, triggered_at DESC);
CREATE INDEX idx_alerts_unread ON market_alerts(is_read, triggered_at DESC) WHERE is_read = FALSE;

-- 5. RLS 安全政策
ALTER TABLE market_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_alert_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read alerts" ON market_alerts FOR SELECT USING (true);
CREATE POLICY "System insert alerts" ON market_alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read rules" ON alert_rules FOR SELECT USING (true);

-- 6. 啟用 Realtime
-- 假設 publication 名稱為 supabase_realtime
-- 若不存在則建立，存在則直接加入表
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE market_alerts;

-- 7. 重新載入 Schema
NOTIFY pgrst, 'reload schema';
