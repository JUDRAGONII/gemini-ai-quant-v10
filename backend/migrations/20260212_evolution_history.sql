-- backend/migrations/20260212_evolution_history.sql
-- 建立演化歷史紀錄表，用於持久化每一代的最強基因組與適應度統計

CREATE TABLE IF NOT EXISTS evolution_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    generation INTEGER NOT NULL,
    best_genome DOUBLE PRECISION[] NOT NULL, -- 26 維基因組向量
    avg_fitness DOUBLE PRECISION NOT NULL,
    max_fitness DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 確保同一批次（如果未來需要批次 ID）或單純代數的索引
    CONSTRAINT unique_generation UNIQUE (generation)
);

-- 設定 RLS 安全政策
ALTER TABLE evolution_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for evolution_history"
ON evolution_history FOR SELECT
USING (true);

COMMENT ON TABLE evolution_history IS '儲存遺傳演算法每一代的演化軌跡與最佳基因個體';
