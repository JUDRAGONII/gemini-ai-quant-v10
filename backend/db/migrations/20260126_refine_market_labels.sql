-- 20260126_refine_market_labels.sql
-- 建立日期: 2026-01-26
-- 功能: 精確化台美股分類邏輯，防止 00937B 等混合代碼被誤標

-- 1. 修正台股標籤：凡是以數字開頭的，一律視為台股 (包含 00937B, 2330P 等)
UPDATE daily_price 
SET market_type = 'TWSE' 
WHERE stock_code ~ '^[0-9]';

-- 2. 修正美股標籤：以字母開頭，且非已知期貨代號
UPDATE daily_price 
SET market_type = 'TIINGO' 
WHERE stock_code ~ '^[A-Z]' 
AND stock_code NOT IN ('TX', 'MTX', 'TE', 'TFE');

-- 3. 修正期貨標籤
UPDATE daily_price 
SET market_type = 'TAIFEX' 
WHERE stock_code IN ('TX', 'MTX', 'TE', 'TFE');

-- 4. 驗證現況 (預期目前混合代碼筆數仍為 0)
SELECT market_type, count(*) FROM daily_price GROUP BY market_type;
