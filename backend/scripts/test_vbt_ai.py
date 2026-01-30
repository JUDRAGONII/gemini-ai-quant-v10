import pandas as pd
import numpy as np
import logging
from datetime import datetime, timedelta

# Local imports
from backend.lib.supabase_client import get_supabase
from backend.models.predictor import Predictor
from backend.backtest.engine import VectorBacktester

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_ai_backtest(stock_code: str, days: int = 365):
    db = get_supabase()
    predictor = Predictor()
    
    # 1. Fetch Price Data for backtesting
    start_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
    res = db.table('daily_price') \
        .select('trade_date, close_price') \
        .eq('stock_code', stock_code) \
        .gte('trade_date', start_date) \
        .order('trade_date', desc=False) \
        .execute()
        
    if not res.data:
        logger.error(f"No price data found for {stock_code}")
        return
        
    df_price = pd.DataFrame(res.data)
    df_price['trade_date'] = pd.to_datetime(df_price['trade_date'])
    df_price = df_price.set_index('trade_date')
    
    # 2. Get AI Signals
    # In real scenario, we'd predict for EVERY day in the backtest period.
    # For this test, we simulate signals based on existing factors 
    # to avoid 300+ API calls / DB fetches in a loop.
    
    logger.info(f"Fetching factors for {stock_code} to generate historical signals...")
    res_factors = db.table('stock_factors') \
        .select('trade_date, factors_all') \
        .eq('stock_code', stock_code) \
        .gte('trade_date', start_date) \
        .order('trade_date', desc=False) \
        .execute()
        
    if not res_factors.data:
        logger.error(f"No factors found for {stock_code}")
        return
        
    # Generate signals for each day
    signals_list = []
    dates_list = []
    
    # We use a threshold for the AI Alpha prediction to turn into a trade signal
    THRESHOLD = 0.005 # Target 0.5% alpha
    
    for row in res_factors.data:
        # Simulate prediction using the model (if ready)
        # If model is not ready, simulate random signal for engine verification
        if predictor.model_ready:
            # We need to expand factors for prediction
            feat_df = pd.json_normalize(row['factors_all'])
            # Align features (code from predictor.predict reused here)
            df_input = pd.DataFrame(columns=predictor.features)
            common_cols = list(set(feat_df.columns) & set(predictor.features))
            df_input.loc[0, common_cols] = feat_df.loc[0, common_cols].values
            df_input = df_input.fillna(0).astype(float)
            
            val = predictor.model.predict(df_input)[0]
            signal = 1 if val > THRESHOLD else 0
        else:
            # Random signal if no model
            signal = np.random.choice([0, 1])
            
        signals_list.append(signal)
        dates_list.append(pd.to_datetime(row['trade_date']))
        
    signals_ser = pd.Series(signals_list, index=dates_list)
    
    # 3. Run Backtest
    logger.info(f"Starting Vectorized Backtest for {stock_code}...")
    vbt = VectorBacktester(df_price)
    results = vbt.run(signals_ser)
    
    # 4. Results
    logger.info("=== Backtest Performance Report ===")
    summary = results['summary']
    for k, v in summary.items():
        logger.info(f"{k.upper():<15}: {v:>10.4f}")
    
    logger.info(f"Final Equity: {results['data']['equity_curve'].iloc[-1]:.4f}")

if __name__ == "__main__":
    # Test on TSMC
    run_ai_backtest("2330", days=365)
