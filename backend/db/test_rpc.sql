-- Test RPC directly
SELECT * FROM fn_screen_stocks('{"ai_score_range": [80, 100]}'::jsonb);
SELECT * FROM fn_screen_stocks('{"change_range": [2, 10], "price_range": [10, 1000]}'::jsonb);
