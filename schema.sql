-- 啟用擴充套件
CREATE EXTENSION IF NOT EXISTS "vector";      -- 向量運算
CREATE EXTENSION IF NOT EXISTS "pg_cron";     -- 排程任務
CREATE EXTENSION IF NOT EXISTS "moddatetime"; -- 修改時間追蹤

-- 1. 行情資料表 (Partitioning 可選)
CREATE TABLE public.daily_price (
    stock_code TEXT NOT NULL,
    trade_date DATE NOT NULL,
    open_price NUMERIC,
    high_price NUMERIC,
    low_price NUMERIC,
    close_price NUMERIC,
    volume BIGINT,
    PRIMARY KEY (stock_code, trade_date)
);

-- 2. 宏觀指標表 (對齊 3.0.0 規格)
CREATE TABLE public.macro_indicators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    indicator_code TEXT NOT NULL,
    indicator_name TEXT,
    country TEXT NOT NULL,                     -- US, TW, CN, JP, EU
    category TEXT NOT NULL,                    -- 利率, 通膨, 就業...
    value NUMERIC NOT NULL,
    unit TEXT,
    transformation_type TEXT,                  -- 原值, YoY, MoM
    frequency TEXT,                           -- D, W, M, Q
    source TEXT,                               -- FRED, TWSE, CBC
    reference_date DATE NOT NULL,
    published_at TIMESTAMPTZ,
    is_estimate BOOLEAN DEFAULT FALSE,
    is_revised BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(indicator_code, reference_date)
);

-- 3. 多因子評分表 (Stock Factors)
CREATE TABLE public.stock_factors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stock_code TEXT NOT NULL,
    trade_date DATE NOT NULL,
    
    -- 價值因子
    pe_ratio NUMERIC,
    pb_ratio NUMERIC,
    dividend_yield NUMERIC,
    
    -- 成長因子
    revenue_growth NUMERIC,
    eps_growth NUMERIC,
    
    -- 動能因子
    momentum_1m NUMERIC,
    relative_strength NUMERIC,
    
    -- 品質因子
    roe NUMERIC,
    gross_margin NUMERIC,
    debt_to_equity NUMERIC,
    
    -- 綜合評分
    composite_score NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(stock_code, trade_date)
);

-- 4. 決策支援：演化基因組 (RLS Protected)
CREATE TABLE public.evolution_genes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    generation INT NOT NULL,
    genes JSONB NOT NULL,                      -- 儲存 26 項基因權重
    fitness_score NUMERIC,                     -- 適應度 (Sharpe Ratio)
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AI 分析報告 (含 Vector)
CREATE TABLE public.ai_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stock_code TEXT NOT NULL,
    report_date DATE DEFAULT CURRENT_DATE,
    summary TEXT,
    full_content TEXT,
    embedding Vector(1536),                    -- Gemini Embedding Dim
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 回測績效紀錄表
CREATE TABLE public.backtest_results (
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

-- 建立 HNSW 向量索引
CREATE INDEX ON public.ai_reports USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_stock_factors_composite ON public.stock_factors(composite_score DESC);
CREATE INDEX idx_macro_indicator_code ON public.macro_indicators(indicator_code, reference_date DESC);

-- 啟用 RLS
ALTER TABLE public.evolution_genes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_factors ENABLE ROW LEVEL SECURITY;

-- 策略：用戶只能看見自己的基因組
CREATE POLICY "Users can only view own genes" ON public.evolution_genes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own genes" ON public.evolution_genes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role has full access to genes" ON public.evolution_genes USING (auth.jwt()->>'role' = 'service_role');

-- 策略：Service Role 擁有 Factor 與 Report 的完整寫入權
CREATE POLICY "Service role full access to factors" ON public.stock_factors USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Service role full access to reports" ON public.ai_reports USING (auth.jwt()->>'role' = 'service_role');
CREATE POLICY "Public read for factors" ON public.stock_factors FOR SELECT USING (true);
CREATE POLICY "Public read for reports" ON public.ai_reports FOR SELECT USING (true);
