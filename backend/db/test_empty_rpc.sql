-- Test RPC with EMPTY filters
SELECT * FROM fn_screen_stocks('{}'::jsonb);
