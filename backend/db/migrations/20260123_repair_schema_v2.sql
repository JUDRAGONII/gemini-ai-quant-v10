-- Repair Schema Script V2: 2026-01-23
-- Fixes missing auth.users dependency and ensures correct table structure

-- 3. 重建多因子評分表 (Stock Factors) - 安全起見先 DROP (已知目前無數據)
DROP TABLE IF EXISTS public.stock_factors CASCADE;
CREATE TABLE public.stock_factors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stock_code TEXT NOT NULL,
    trade_date DATE NOT NULL,
    pe_ratio NUMERIC,
    pb_ratio NUMERIC,
    dividend_yield NUMERIC,
    revenue_growth NUMERIC,
    eps_growth NUMERIC,
    momentum_1m NUMERIC,
    relative_strength NUMERIC,
    roe NUMERIC,
    gross_margin NUMERIC,
    debt_to_equity NUMERIC,
    composite_score NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(stock_code, trade_date)
);

-- 4. 決策支援：演化基因組 (移除 auth.users FK 以避免環境依賴錯誤)
DROP TABLE IF EXISTS public.evolution_genes CASCADE;
CREATE TABLE public.evolution_genes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID, -- 移除 REFERENCES auth.users(id) 暫時繞過依賴問題
    generation INT NOT NULL,
    genes JSONB NOT NULL,
    fitness_score NUMERIC,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AI 分析報告 (確保存在)
CREATE TABLE IF NOT EXISTS public.ai_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stock_code TEXT NOT NULL,
    report_date DATE DEFAULT CURRENT_DATE,
    summary TEXT,
    full_content TEXT,
    embedding Vector(1536),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 回測績效紀錄表
CREATE TABLE IF NOT EXISTS public.backtest_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gene_id UUID REFERENCES public.evolution_genes(id), -- 這裡引用剛建立的 public 表是安全的
    annual_return NUMERIC,
    max_drawdown NUMERIC,
    sharpe_ratio NUMERIC,
    win_rate NUMERIC,
    test_start_date DATE,
    test_end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_stock_factors_composite ON public.stock_factors(composite_score DESC);
CREATE INDEX IF NOT EXISTS idx_macro_indicator_code ON public.macro_indicators(indicator_code, reference_date DESC);

-- RLS 設定
ALTER TABLE public.evolution_genes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_factors ENABLE ROW LEVEL SECURITY;

-- 寬鬆策略 (針對開發環境)
DROP POLICY IF EXISTS "Enable all access for service role" ON public.evolution_genes;
CREATE POLICY "Enable all access for service role" ON public.evolution_genes USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for stock_factors" ON public.stock_factors;
CREATE POLICY "Enable all access for stock_factors" ON public.stock_factors USING (true) WITH CHECK (true);

-- Reload Schema Cache
NOTIFY pgrst, 'reload config';
