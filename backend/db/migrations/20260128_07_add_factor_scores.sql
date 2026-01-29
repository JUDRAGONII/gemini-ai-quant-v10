-- Phase 7.1: stock_factors 分項評分欄位擴充
-- 日期：2026-01-28
-- 功能：新增 value_score, growth_score, quality_score, momentum_score 分項評分快取欄位

ALTER TABLE public.stock_factors ADD COLUMN IF NOT EXISTS value_score NUMERIC(5, 2);
ALTER TABLE public.stock_factors ADD COLUMN IF NOT EXISTS growth_score NUMERIC(5, 2);
ALTER TABLE public.stock_factors ADD COLUMN IF NOT EXISTS quality_score NUMERIC(5, 2);
ALTER TABLE public.stock_factors ADD COLUMN IF NOT EXISTS momentum_score NUMERIC(5, 2);

COMMENT ON COLUMN public.stock_factors.value_score IS '價值因子評分 (0-100)';
COMMENT ON COLUMN public.stock_factors.growth_score IS '成長因子評分 (0-100)';
COMMENT ON COLUMN public.stock_factors.quality_score IS '品質因子評分 (0-100)';
COMMENT ON COLUMN public.stock_factors.momentum_score IS '動能因子評分 (0-100)';

-- 建立分項評分索引
CREATE INDEX IF NOT EXISTS idx_stock_factors_value ON public.stock_factors(value_score DESC);
CREATE INDEX IF NOT EXISTS idx_stock_factors_growth ON public.stock_factors(growth_score DESC);
CREATE INDEX IF NOT EXISTS idx_stock_factors_quality ON public.stock_factors(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_stock_factors_momentum ON public.stock_factors(momentum_score DESC);

SELECT 'stock_factors 分項評分欄位擴充完成' AS message;
