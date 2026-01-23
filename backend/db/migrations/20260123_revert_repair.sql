-- Revert Repair Schema Script
-- Dropping the tables that were created during the unauthorized fix to restore state

DROP TABLE IF EXISTS public.stock_factors CASCADE;
DROP TABLE IF EXISTS public.evolution_genes CASCADE;

-- Note: ai_reports and backtest_results were existing or IF NOT EXISTS, checking if they were created specifically.
-- The logs showed "relation ai_reports already exists, skipping". So we do NOT drop them.
-- The logs showed "relation backtest_results already exists, skipping". So we do NOT drop them.

-- Reset RLS policies if any were changed?
-- We dropped and recreated policies on stock_factors/evolution_genes, so dropping the tables removes the policies.

NOTIFY pgrst, 'reload config';
