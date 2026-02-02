-- 20260130_add_dynamic_factors.sql
-- Phase 8.2: Expand stock_factors with JSONB for dynamic Alpha factors

BEGIN;

ALTER TABLE public.stock_factors 
ADD COLUMN IF NOT EXISTS factors_all JSONB;

COMMENT ON COLUMN public.stock_factors.factors_all IS '存放 AlphaFactory 計算之所有動態因子';

-- Create GIN Index for JSONB (Accelerate Query)
CREATE INDEX IF NOT EXISTS idx_stock_factors_json ON public.stock_factors USING GIN (factors_all);

COMMIT;
