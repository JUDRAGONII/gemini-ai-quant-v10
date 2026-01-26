-- 026_add_market_type_and_cleanse.sql
-- 建立日期: 2026-01-26
-- 功能: 補回 market_type 欄位並分類 538 萬筆數據

-- 1. 物理結構補完
ALTER TABLE daily_price ADD COLUMN IF NOT EXISTS market_type TEXT;

-- 2. 建立索引 (Concurrent 模式在 Supabase/Postgres 15 推薦，但在此環境簡單執行)
CREATE INDEX IF NOT EXISTS idx_daily_price_market_type ON daily_price (market_type);

-- 3. 數據補洗：台股 (TWSE) - 匹配純數字
UPDATE daily_price 
SET market_type = 'TWSE' 
WHERE market_type IS NULL 
AND stock_code ~ '^[0-9]+$';

-- 4. 數據補洗：美股 (TIINGO) - 匹配包含字母的代碼
UPDATE daily_price 
SET market_type = 'TIINGO' 
WHERE market_type IS NULL 
AND stock_code ~ '[A-Z]';

-- 5. 數據補洗：其餘特殊標的標記為 OTHER (如 TX, MTX 等若尚未分類)
UPDATE daily_price
SET market_type = 'OTHER'
WHERE market_type IS NULL;

-- 6. 驗證
SELECT market_type, count(*) FROM daily_price GROUP BY market_type;
