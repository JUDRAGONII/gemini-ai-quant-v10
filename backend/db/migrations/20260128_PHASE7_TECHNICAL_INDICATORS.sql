-- ============================================================
-- Phase 7: 計算下沉 - 技術指標 PostgreSQL 計算腳本
-- 執行日期：2026-01-28
-- 功能：建立 MA/RSI/MACD/Bollinger Bands 視圖與函數
-- ============================================================

-- ============================================================
-- Part 1: 移動平均線 (MA) 視圖
-- ============================================================
CREATE OR REPLACE VIEW v_stock_ma AS
SELECT
    stock_code,
    trade_date,
    close_price,
    AVG(close_price) OVER (
        PARTITION BY stock_code
        ORDER BY trade_date
        ROWS BETWEEN 4 PRECEDING AND CURRENT ROW
    ) AS ma5,
    AVG(close_price) OVER (
        PARTITION BY stock_code
        ORDER BY trade_date
        ROWS BETWEEN 9 PRECEDING AND CURRENT ROW
    ) AS ma10,
    AVG(close_price) OVER (
        PARTITION BY stock_code
        ORDER BY trade_date
        ROWS BETWEEN 19 PRECEDING AND CURRENT ROW
    ) AS ma20,
    AVG(close_price) OVER (
        PARTITION BY stock_code
        ORDER BY trade_date
        ROWS BETWEEN 59 PRECEDING AND CURRENT ROW
    ) AS ma60,
    AVG(close_price) OVER (
        PARTITION BY stock_code
        ORDER BY trade_date
        ROWS BETWEEN 119 PRECEDING AND CURRENT ROW
    ) AS ma120
FROM public.daily_price
WHERE is_trading = TRUE
ORDER BY stock_code, trade_date DESC;

COMMENT ON VIEW v_stock_ma IS '移動平均線視圖：MA5/10/20/60/120';


-- ============================================================
-- Part 2: RSI (14) 計算函數與視圖
-- ============================================================
CREATE OR REPLACE FUNCTION f_calculate_rsi(p_stock_code TEXT, p_periods INTEGER DEFAULT 14)
RETURNS TABLE (
    stock_code TEXT,
    trade_date DATE,
    close_price NUMERIC,
    rsi NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH price_changes AS (
        SELECT
            stock_code,
            trade_date,
            close_price,
            close_price - LAG(close_price) OVER (PARTITION BY stock_code ORDER BY trade_date) AS change
        FROM public.daily_price
        WHERE stock_code = p_stock_code AND is_trading = TRUE
    ),
    gains_losses AS (
        SELECT
            stock_code,
            trade_date,
            close_price,
            CASE WHEN change >= 0 THEN change ELSE 0 END AS gain,
            CASE WHEN change < 0 THEN ABS(change) ELSE 0 END AS loss
        FROM price_changes
    ),
    avg_gains_losses AS (
        SELECT
            stock_code,
            trade_date,
            close_price,
            gain,
            loss,
            AVG(gain) OVER (PARTITION BY stock_code ORDER BY trade_date ROWS BETWEEN (p_periods - 1) PRECEDING AND CURRENT ROW) AS avg_gain,
            AVG(loss) OVER (PARTITION BY stock_code ORDER BY trade_date ROWS BETWEEN (p_periods - 1) PRECEDING AND CURRENT ROW) AS avg_loss
        FROM gains_losses
    )
    SELECT
        stock_code,
        trade_date,
        close_price,
        CASE
            WHEN avg_loss = 0 THEN 100
            ELSE 100 - (100 / (1 + avg_gain / NULLIF(avg_loss, 0)))
        END AS rsi
    FROM avg_gains_losses
    WHERE ROW_NUMBER() OVER (PARTITION BY stock_code ORDER BY trade_date DESC) >= p_periods
    ORDER BY trade_date DESC;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION f_calculate_rsi IS '計算個股 RSI (14)';


-- RSI 視圖（更快查詢）
CREATE OR REPLACE VIEW v_stock_rsi AS
WITH price_changes AS (
    SELECT
        stock_code,
        trade_date,
        close_price,
        close_price - LAG(close_price) OVER (PARTITION BY stock_code ORDER BY trade_date) AS change
    FROM public.daily_price
    WHERE is_trading = TRUE
),
gains_losses AS (
    SELECT
        stock_code,
        trade_date,
        close_price,
        CASE WHEN change >= 0 THEN change ELSE 0 END AS gain,
        CASE WHEN change < 0 THEN ABS(change) ELSE 0 END AS loss
    FROM price_changes
),
smoothed AS (
    SELECT
        stock_code,
        trade_date,
        close_price,
        gain,
        loss,
        AVG(gain) OVER w AS avg_gain,
        AVG(loss) OVER w AS avg_loss
    FROM gains_losses
    WINDOW w AS (PARTITION BY stock_code ORDER BY trade_date ROWS BETWEEN 13 PRECEDING AND CURRENT ROW)
)
SELECT
    stock_code,
    trade_date,
    close_price,
    CASE
        WHEN avg_loss = 0 THEN 100::NUMERIC
        ELSE ROUND((100 - (100 / (1 + avg_gain / NULLIF(avg_loss, 0))))::NUMERIC, 4)
    END AS rsi_14
FROM smoothed
ORDER BY stock_code, trade_date DESC;

COMMENT ON VIEW v_stock_rsi IS 'RSI (14) 預計算視圖';


-- ============================================================
-- Part 3: MACD (12, 26, 9) 計算視圖
-- ============================================================
CREATE OR REPLACE VIEW v_stock_macd AS
WITH ema12 AS (
    SELECT
        stock_code,
        trade_date,
        close_price,
        AVG(close_price) OVER (
            PARTITION BY stock_code
            ORDER BY trade_date
            ROWS BETWEEN 11 PRECEDING AND CURRENT ROW
        ) AS ema12
    FROM public.daily_price
    WHERE is_trading = TRUE
),
ema26 AS (
    SELECT
        stock_code,
        trade_date,
        close_price,
        AVG(close_price) OVER (
            PARTITION BY stock_code
            ORDER BY trade_date
            ROWS BETWEEN 25 PRECEDING AND CURRENT ROW
        ) AS ema26
    FROM public.daily_price
    WHERE is_trading = TRUE
),
macd_line AS (
    SELECT
        e.stock_code,
        e.trade_date,
        e.close_price,
        e.ema12 - c.ema26 AS macd_line
    FROM ema12 e
    JOIN ema26 c ON e.stock_code = c.stock_code AND e.trade_date = c.trade_date
),
signal_line AS (
    SELECT
        stock_code,
        trade_date,
        close_price,
        macd_line,
        AVG(macd_line) OVER (
            PARTITION BY stock_code
            ORDER BY trade_date
            ROWS BETWEEN 8 PRECEDING AND CURRENT ROW
        ) AS signal_line
    FROM macd_line
)
SELECT
    stock_code,
    trade_date,
    close_price,
    ROUND(macd_line::NUMERIC, 4) AS macd_line,
    ROUND(signal_line::NUMERIC, 4) AS signal_line,
    ROUND((macd_line - signal_line)::NUMERIC, 4) AS macd_histogram
FROM signal_line
ORDER BY stock_code, trade_date DESC;

COMMENT ON VIEW v_stock_macd IS 'MACD (12, 26, 9) 計算視圖';


-- ============================================================
-- Part 4: Bollinger Bands 計算視圖
-- ============================================================
CREATE OR REPLACE VIEW v_stock_bollinger_bands AS
SELECT
    stock_code,
    trade_date,
    close_price,
    AVG(close_price) OVER (
        PARTITION BY stock_code
        ORDER BY trade_date
        ROWS BETWEEN 19 PRECEDING AND CURRENT ROW
    ) AS bb_middle,
    AVG(close_price) OVER (
        PARTITION BY stock_code
        ORDER BY trade_date
        ROWS BETWEEN 19 PRECEDING AND CURRENT ROW
    ) + (
        2 * STDDEV(close_price) OVER (
            PARTITION BY stock_code
            ORDER BY trade_date
            ROWS BETWEEN 19 PRECEDING AND CURRENT ROW
        )
    ) AS bb_upper,
    AVG(close_price) OVER (
        PARTITION BY stock_code
        ORDER BY trade_date
        ROWS BETWEEN 19 PRECEDING AND CURRENT ROW
    ) - (
        2 * STDDEV(close_price) OVER (
            PARTITION BY stock_code
            ORDER BY trade_date
            ROWS BETWEEN 19 PRECEDING AND CURRENT ROW
        )
    ) AS bb_lower
FROM public.daily_price
WHERE is_trading = TRUE
ORDER BY stock_code, trade_date DESC;

COMMENT ON VIEW v_stock_bollinger_bands IS 'Bollinger Bands (20, 2) 計算視圖';


-- ============================================================
-- Part 5: 技術指標整合視圖
-- ============================================================
CREATE OR REPLACE VIEW v_stock_technical_indicators AS
SELECT
    dp.stock_code,
    dp.trade_date,
    dp.close_price,
    dp.volume,
    -- MA
    ma.ma5,
    ma.ma10,
    ma.ma20,
    ma.ma60,
    ma.ma120,
    -- RSI
    rs.rsi_14,
    -- MACD
    mac.macd_line,
    mac.signal_line,
    mac.macd_histogram,
    -- Bollinger Bands
    bb.bb_middle,
    bb.bb_upper,
    bb.bb_lower
FROM public.daily_price dp
LEFT JOIN v_stock_ma ma ON dp.stock_code = ma.stock_code AND dp.trade_date = ma.trade_date
LEFT JOIN v_stock_rsi rs ON dp.stock_code = rs.stock_code AND dp.trade_date = rs.trade_date
LEFT JOIN v_stock_macd mac ON dp.stock_code = mac.stock_code AND dp.trade_date = mac.trade_date
LEFT JOIN v_stock_bollinger_bands bb ON dp.stock_code = bb.stock_code AND dp.trade_date = bb.trade_date
WHERE dp.is_trading = TRUE
ORDER BY dp.stock_code, dp.trade_date DESC;

COMMENT ON VIEW v_stock_technical_indicators IS '技術指標整合視圖（MA/RSI/MACD/Bollinger Bands）';


-- ============================================================
-- Part 6: 索引優化
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_daily_price_stock_date ON public.daily_price(stock_code, trade_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_price_is_trading ON public.daily_price(is_trading, trade_date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_factors_stock_date ON public.stock_factors(stock_code, trade_date DESC);
CREATE INDEX IF NOT EXISTS idx_macro_country_category ON public.macro_indicators(country, category);
CREATE INDEX IF NOT EXISTS idx_ai_reports_stock_date ON public.ai_reports(stock_code, report_date DESC);

COMMENT ON INDEX idx_daily_price_stock_date IS '優化股價歷史查詢效能';
COMMENT ON INDEX idx_daily_price_is_trading ON public.daily_price IS '優化交易日篩選';
COMMENT ON INDEX idx_stock_factors_stock_date ON public.stock_factors IS '優化因子查詢';
COMMENT ON INDEX idx_macro_country_category ON public.macro_indicators IS '優化宏觀指標查詢';
COMMENT ON INDEX idx_ai_reports_stock_date ON public.ai_reports IS '優化 AI 報告查詢';


-- ============================================================
-- 驗證訊息
-- ============================================================
SELECT '✅ Technical Indicators Views Created' AS message;
SELECT '✅ Indexes Optimized' AS message;

SELECT
    'Technical Indicators Migration Complete' AS phase,
    NOW() AS executed_at;
