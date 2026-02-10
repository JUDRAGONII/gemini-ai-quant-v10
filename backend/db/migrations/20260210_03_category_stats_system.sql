-- 20260210_03_category_stats_system.sql
-- 建立實時精準計數系統

-- 1. 建立統計表
CREATE TABLE IF NOT EXISTS public.category_stats (
    category_id TEXT PRIMARY KEY,
    count_val BIGINT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 建立更新函數
CREATE OR REPLACE FUNCTION public.update_category_stats()
RETURNS TRIGGER AS $$
DECLARE
    target_id TEXT;
BEGIN
    -- 根據表名與條件判斷分類
    IF TG_TABLE_NAME = 'daily_price' THEN
        IF NEW.market_type = 'TWSE' OR OLD.market_type = 'TWSE' THEN target_id := 'tw_equity';
        ELSIF NEW.market_type = 'TIINGO' OR OLD.market_type = 'TIINGO' THEN target_id := 'us_equity';
        END IF;
    ELSIF TG_TABLE_NAME = 'macro_indicators' THEN
        IF NEW.country = 'TW' OR OLD.country = 'TW' THEN target_id := 'tw_macro';
        ELSIF NEW.country = 'US' OR OLD.country = 'US' THEN target_id := 'us_macro';
        END IF;
    ELSIF TG_TABLE_NAME = 'exchange_rates' THEN target_id := 'fx';
    ELSIF TG_TABLE_NAME = 'economic_calendar' THEN target_id := 'economic_calendar';
    ELSIF TG_TABLE_NAME = 'market_quotes' THEN target_id := 'realtime';
    ELSIF TG_TABLE_NAME = 'stock_factors' THEN target_id := 'factors';
    ELSIF TG_TABLE_NAME = 'evolution_genes' THEN target_id := 'genes';
    END IF;

    IF target_id IS NOT NULL THEN
        IF (TG_OP = 'INSERT') THEN
            INSERT INTO public.category_stats (category_id, count_val) 
            VALUES (target_id, 1)
            ON CONFLICT (category_id) DO UPDATE SET count_val = category_stats.count_val + 1, updated_at = NOW();
        ELSIF (TG_OP = 'DELETE') THEN
            UPDATE public.category_stats SET count_val = count_val - 1, updated_at = NOW() WHERE category_id = target_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 為各表建立觸發器 (採用 AFTER 以確保數據已提交)
-- 注意：為簡化維修，若表已存在觸發器請先刪除
DROP TRIGGER IF EXISTS trg_stats_daily_price ON daily_price;
CREATE TRIGGER trg_stats_daily_price AFTER INSERT OR DELETE ON daily_price FOR EACH ROW EXECUTE FUNCTION update_category_stats();

DROP TRIGGER IF EXISTS trg_stats_fx ON exchange_rates;
CREATE TRIGGER trg_stats_fx AFTER INSERT OR DELETE ON exchange_rates FOR EACH ROW EXECUTE FUNCTION update_category_stats();

DROP TRIGGER IF EXISTS trg_stats_econ ON economic_calendar;
CREATE TRIGGER trg_stats_econ AFTER INSERT OR DELETE ON economic_calendar FOR EACH ROW EXECUTE FUNCTION update_category_stats();

DROP TRIGGER IF EXISTS trg_stats_macro ON macro_indicators;
CREATE TRIGGER trg_stats_macro AFTER INSERT OR DELETE ON macro_indicators FOR EACH ROW EXECUTE FUNCTION update_category_stats();

DROP TRIGGER IF EXISTS trg_stats_factors ON stock_factors;
CREATE TRIGGER trg_stats_factors AFTER INSERT OR DELETE ON stock_factors FOR EACH ROW EXECUTE FUNCTION update_category_stats();

-- 4. 初始化數據 (這一步可能較慢，但在背景執行)
INSERT INTO public.category_stats (category_id, count_val)
VALUES 
    ('tw_equity', (SELECT COUNT(*) FROM daily_price WHERE market_type = 'TWSE')),
    ('us_equity', (SELECT COUNT(*) FROM daily_price WHERE market_type = 'TIINGO')),
    ('tw_macro', (SELECT COUNT(*) FROM macro_indicators WHERE country = 'TW')),
    ('us_macro', (SELECT COUNT(*) FROM macro_indicators WHERE country = 'US')),
    ('realtime', (SELECT COUNT(*) FROM market_quotes)),
    ('fx', (SELECT COUNT(*) FROM exchange_rates)),
    ('economic_calendar', (SELECT COUNT(*) FROM economic_calendar)),
    ('factors', (SELECT COUNT(*) FROM stock_factors)),
    ('genes', (SELECT COUNT(*) FROM evolution_genes))
ON CONFLICT (category_id) DO UPDATE SET count_val = EXCLUDED.count_val, updated_at = NOW();
