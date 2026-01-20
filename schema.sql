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

-- 2. 宏觀指標表
CREATE TABLE public.macro_indicators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    indicator_code TEXT NOT NULL,
    reference_date DATE NOT NULL,
    value NUMERIC NOT NULL,
    category TEXT,
    UNIQUE(indicator_code, reference_date)
);

-- 3. AI 分析報告 (含 Vector)
CREATE TABLE public.ai_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stock_code TEXT NOT NULL,
    report_date DATE DEFAULT CURRENT_DATE,
    summary TEXT,
    full_content TEXT,
    embedding Vector(1536),  -- Gemini Embedding Dim
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 演化基因組 (RLS Protected)
CREATE TABLE public.evolution_genes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    generation INT NOT NULL,
    genes JSONB NOT NULL,  -- 儲存 26 項基因權重
    fitness_score NUMERIC,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 建立 HNSW 向量索引
CREATE INDEX ON public.ai_reports USING hnsw (embedding vector_cosine_ops);

-- 啟用 RLS
ALTER TABLE public.evolution_genes ENABLE ROW LEVEL SECURITY;

-- 策略：用戶只能看見自己的基因組
CREATE POLICY "Users can only view own genes" 
ON public.evolution_genes FOR SELECT 
USING (auth.uid() = user_id);

-- 策略：用戶只能修改自己的基因組
CREATE POLICY "Users can insert own genes" 
ON public.evolution_genes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 策略：Service Role (AI Worker) 擁有全權
CREATE POLICY "Service role has full access" 
ON public.evolution_genes 
USING (auth.jwt()->>'role' = 'service_role');
