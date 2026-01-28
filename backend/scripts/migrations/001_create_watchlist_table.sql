-- user_watchlist 資料表
-- 用於儲存用戶的自選股清單

CREATE TABLE IF NOT EXISTS user_watchlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stock_code VARCHAR(20) NOT NULL,
    stock_name VARCHAR(100),
    market VARCHAR(10) DEFAULT 'TW',
    notes TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id),
    CONSTRAINT unique_watchlist UNIQUE (user_id, stock_code)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_watchlist_user ON user_watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_stock ON user_watchlist(stock_code);

-- RLS 政策
ALTER TABLE user_watchlist ENABLE ROW LEVEL SECURITY;

-- 用戶只能看到自己的自選股
CREATE POLICY "Users can view own watchlist" ON user_watchlist
    FOR SELECT
    USING (auth.uid() = user_id);

-- 用戶只能新增自己的自選股
CREATE POLICY "Users can insert own watchlist" ON user_watchlist
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 用戶只能更新自己的自選股
CREATE POLICY "Users can update own watchlist" ON user_watchlist
    FOR UPDATE
    USING (auth.uid() = user_id);

-- 用戶只能刪除自己的自選股
CREATE POLICY "Users can delete own watchlist" ON user_watchlist
    FOR DELETE
    USING (auth.uid() = user_id);
