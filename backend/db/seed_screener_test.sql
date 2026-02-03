-- Seeding Test Data for AI Screener
INSERT INTO public.market_quotes (stock_code, name, price, change, change_percent, volume, updated_at)
VALUES 
('1315', '測試股A', 150.5, 4.5, 3.0, 1000000, NOW()),
('1316', '測試股B', 80.2, -0.8, -1.0, 500000, NOW())
ON CONFLICT (stock_code) DO UPDATE SET 
price = EXCLUDED.price, 
change_percent = EXCLUDED.change_percent,
updated_at = EXCLUDED.updated_at;

INSERT INTO public.stock_factors (stock_code, trade_date, factors_all)
VALUES 
('1315', CURRENT_DATE, '{"ai_score": 88, "rsi_14": 68, "inst_buy_days": 5}'),
('1316', CURRENT_DATE, '{"ai_score": 45, "rsi_14": 35, "inst_buy_days": 0}')
ON CONFLICT (stock_code, trade_date) DO UPDATE SET 
factors_all = EXCLUDED.factors_all;
