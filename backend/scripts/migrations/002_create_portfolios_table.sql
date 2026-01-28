-- user_portfolios 資料表
-- 用於儲存用戶的投資組合

CREATE TABLE IF NOT EXISTS user_portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    currency VARCHAR(3) DEFAULT 'TWD',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_portfolios_user ON user_portfolios(user_id);

-- user_holdings 資料表
-- 用於儲存投資組合中的持股部位

CREATE TABLE IF NOT EXISTS user_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES user_portfolios(id) ON DELETE CASCADE,
    stock_code VARCHAR(20) NOT NULL,
    stock_name VARCHAR(100),
    buy_date DATE NOT NULL,
    buy_price DECIMAL(18, 4) NOT NULL,
    shares DECIMAL(18, 4) NOT NULL,
    commission DECIMAL(18, 2) DEFAULT 0,
    tax DECIMAL(18, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_portfolio FOREIGN KEY (portfolio_id) REFERENCES user_portfolios(id)
);

CREATE INDEX IF NOT EXISTS idx_holdings_portfolio ON user_holdings(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_holdings_stock ON user_holdings(stock_code);

-- portfolio_performance 資料表
-- 用於儲存投資組合績效歷史

CREATE TABLE IF NOT EXISTS portfolio_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES user_portfolios(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_value DECIMAL(18, 4) NOT NULL,
    total_cost DECIMAL(18, 4) NOT NULL,
    profit_loss DECIMAL(18, 4) NOT NULL,
    profit_loss_percent DECIMAL(8, 4) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_performance_portfolio FOREIGN KEY (portfolio_id) REFERENCES user_portfolios(id)
);

CREATE INDEX IF NOT EXISTS idx_performance_portfolio ON portfolio_performance(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_performance_date ON portfolio_performance(portfolio_id, date);

-- RLS 政策
ALTER TABLE user_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_performance ENABLE ROW LEVEL SECURITY;

-- 用戶只能看到自己的投資組合
CREATE POLICY "Users can view own portfolios" ON user_portfolios
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own holdings" ON user_holdings
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_portfolios
            WHERE user_portfolios.id = user_holdings.portfolio_id
            AND user_portfolios.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own performance" ON portfolio_performance
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_portfolios
            WHERE user_portfolios.id = portfolio_performance.portfolio_id
            AND user_portfolios.user_id = auth.uid()
        )
    );

-- 用戶只能操作自己的投資組合
CREATE POLICY "Users can CRUD own portfolios" ON user_portfolios
    FOR ALL
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own holdings" ON user_holdings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_portfolios
            WHERE user_portfolios.id = user_holdings.portfolio_id
            AND user_portfolios.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_portfolios
            WHERE user_portfolios.id = user_holdings.portfolio_id
            AND user_portfolios.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can CRUD own performance" ON portfolio_performance
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_portfolios
            WHERE user_portfolios.id = portfolio_performance.portfolio_id
            AND user_portfolios.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_portfolios
            WHERE user_portfolios.id = portfolio_performance.portfolio_id
            AND user_portfolios.user_id = auth.uid()
        )
    );
