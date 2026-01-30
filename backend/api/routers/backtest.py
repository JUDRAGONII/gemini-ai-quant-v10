from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

# Local imports
from backend.lib.supabase_client import get_supabase
from backend.models.predictor import Predictor
from backend.backtest.engine import VectorBacktester

router = APIRouter()

class BacktestRequest(BaseModel):
    stock_code: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    strategy_config: Optional[Dict[str, Any]] = None

@router.post("/run")
async def run_backtest(req: BacktestRequest):
    """
    執行指定個股的 AI 策略回測
    """
    db = get_supabase()
    predictor = Predictor()
    
    if req.start_date is None:
        req.start_date = (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d')
    
    # 1. Fetch Price Data
    res_price = db.table('daily_price') \
        .select('trade_date, close_price') \
        .eq('stock_code', req.stock_code) \
        .gte('trade_date', req.start_date) \
        .order('trade_date', desc=False) \
        .execute()
        
    if not res_price.data:
        raise HTTPException(status_code=404, detail=f"No price data found for {req.stock_code}")
        
    df_price = pd.DataFrame(res_price.data)
    df_price['trade_date'] = pd.to_datetime(df_price['trade_date'])
    df_price = df_price.set_index('trade_date')
    
    # 2. Fetch Factors & Generate AI Signals
    # (Note: For large scale, we should batch this or use a more efficient fetch)
    res_factors = db.table('stock_factors') \
        .select('trade_date, factors_all') \
        .eq('stock_code', req.stock_code) \
        .gte('trade_date', req.start_date) \
        .order('trade_date', desc=False) \
        .execute()
        
    if not res_factors.data:
        raise HTTPException(status_code=404, detail="No factor data found for backtesting")
        
    # Generate signals
    signals_list = []
    dates_list = []
    
    # Threshold from config if provided
    threshold = 0.005 # Default 0.5%
    if req.strategy_config and 'threshold' in req.strategy_config:
        threshold = req.strategy_config['threshold']
        
    for row in res_factors.data:
        if predictor.model_ready:
            feat_df = pd.json_normalize(row['factors_all'])
            df_input = pd.DataFrame(columns=predictor.features)
            common_cols = list(set(feat_df.columns) & set(predictor.features))
            df_input.loc[0, common_cols] = feat_df.loc[0, common_cols].values
            df_input = df_input.fillna(0).astype(float)
            
            val = predictor.model.predict(df_input)[0]
            signal = 1 if val > threshold else 0
        else:
            signal = 0 # Silent if no model
            
        signals_list.append(signal)
        dates_list.append(pd.to_datetime(row['trade_date']))
        
    signals_ser = pd.Series(signals_list, index=dates_list)
    
    # 3. Execution
    vbt = VectorBacktester(df_price)
    results = vbt.run(signals_ser)
    
    # 4. Format Output for Frontend
    df_res = results['data']
    equity_data = [
        {"date": date.strftime('%Y-%m-%d'), "value": float(round(val, 4))}
        for date, val in df_res['equity_curve'].items()
    ]
    
    return {
        "stock_code": req.stock_code,
        "metrics": results['summary'],
        "charts": {
            "equity": equity_data
        }
    }
