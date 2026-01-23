-- Repair Schema Script: 2026-01-23
-- Create missing tables if they don't exist

-- 3. 多因子評分表 (Stock Factors)
CREATE TABLE IF NOT EXISTS public.stock_factors (
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

-- 4. 決策支援：演化基因組 (RLS Protected)
CREATE TABLE IF NOT EXISTS public.evolution_genes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    generation INT NOT NULL,
    genes JSONB NOT NULL,
    fitness_score NUMERIC,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AI 分析報告 (含 Vector)
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
    gene_id UUID REFERENCES public.evolution_genes(id),
    annual_return NUMERIC,
    max_drawdown NUMERIC,
    sharpe_ratio NUMERIC,
    win_rate NUMERIC,
    test_start_date DATE,
    test_end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 建立索引 (IDEMPOTENT via IF NOT EXISTS in vanilla PG is hard, so we just run creating indexes which might skip or error if exist, usually separate is better but for quick fix we use exception block or just ignore errors.
-- Actually standard PG 'CREATE INDEX IF NOT EXISTS' exists in PG 9.5+
CREATE INDEX IF NOT EXISTS idx_stock_factors_composite ON public.stock_factors(composite_score DESC);
-- macro_indicators index was likely already there but...
CREATE INDEX IF NOT EXISTS idx_macro_indicator_code ON public.macro_indicators(indicator_code, reference_date DESC);

-- RLS
ALTER TABLE public.evolution_genes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_factors ENABLE ROW LEVEL SECURITY;

-- Policies (Drop first to avoid error if exists)
DROP POLICY IF EXISTS "Users can only view own genes" ON public.evolution_genes;
CREATE POLICY "Users can only view own genes" ON public.evolution_genes FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own genes" ON public.evolution_genes;
CREATE POLICY "Users can insert own genes" ON public.evolution_genes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role has full access to genes" ON public.evolution_genes;
CREATE POLICY "Service role has full access to genes" ON public.evolution_genes USING (auth.jwt()->>'role' = 'service_role');

DROP POLICY IF EXISTS "Service role full access to factors" ON public.stock_factors;
CREATE POLICY "Service role full access to factors" ON public.stock_factors USING (auth.jwt()->>'role' = 'service_role');

DROP POLICY IF EXISTS "Public read for factors" ON public.stock_factors;
CREATE POLICY "Public read for factors" ON public.stock_factors FOR SELECT USING (true);

-- Reload Schema Cache
NOTIFY pgrst, 'reload config';
