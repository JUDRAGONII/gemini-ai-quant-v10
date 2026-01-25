-- 新增分K資料表 (Intraday Candles)
-- 支援 1分K, 5分K 等高頻數據儲存

CREATE TABLE IF NOT EXISTS public.intraday_candles (
    stock_code TEXT NOT NULL,
    ts TIMESTAMPTZ NOT NULL,
    open NUMERIC,
    high NUMERIC,
    low NUMERIC,
    close NUMERIC,
    volume BIGINT,
    timeframe TEXT DEFAULT '1m', -- '1m', '5m', '60m'
    
    -- 複合主鍵：股票代號 + 時間 + 週期
    PRIMARY KEY (stock_code, ts, timeframe)
);

-- 建立索引以加速查詢
CREATE INDEX IF NOT EXISTS idx_intraday_candles_stock_ts ON public.intraday_candles (stock_code, ts DESC);

-- RLS 策略 (允許 authenticated 用戶讀取，service_role 寫入)
ALTER TABLE public.intraday_candles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON public.intraday_candles
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable all access for service role" ON public.intraday_candles
    FOR ALL
    TO service_role
    USING (true);
