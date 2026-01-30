import xgboost as xgb
import pandas as pd
import numpy as np
import logging
import pickle
import os
from datetime import datetime, timedelta
from typing import Dict, Optional, List

from backend.lib.supabase_client import get_supabase

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Predictor:
    """
    AI 預測器
    載入訓練好的模型，對個股進行未來 5 日 Alpha 預測
    """
    
    def __init__(self, model_path: str = "backend/models/saved/latest_model.json"):
        self.db = get_supabase()
        self.model = xgb.XGBRegressor()
        
        # Check if model exists
        if not os.path.exists(model_path):
            logger.warning(f"Model not found at {model_path}. Prediction will fail.")
            self.model_ready = False
        else:
            self.model.load_model(model_path)
            self.model_ready = True
            
        # Load feature names to ensure alignment
        feature_path = model_path + ".features"
        if os.path.exists(feature_path):
            with open(feature_path, 'rb') as f:
                self.features = pickle.load(f)
        else:
            self.features = [] # Fallback, might cause mismatch
            
    def get_latest_factors(self, stock_code: str) -> pd.DataFrame:
        """從 DB 獲取最新一筆因子"""
        # Fetch latest
        res = self.db.table('stock_factors') \
            .select('trade_date, factors_all') \
            .eq('stock_code', stock_code) \
            .order('trade_date', desc=True) \
            .limit(1) \
            .execute()
            
        if not res.data:
            return pd.DataFrame()
            
        row = res.data[0]
        # Parse JSONB
        # row['factors_all'] is a dict
        df = pd.json_normalize(row['factors_all'])
        return df

    def predict(self, stock_code: str) -> Dict:
        if not self.model_ready:
            return {"error": "Model not loaded"}
            
        # 1. Get Factors
        df_features = self.get_latest_factors(stock_code)
        
        if df_features.empty:
            return {"error": "No factor data found"}
            
        # 2. Align Features
        # Add missing columns with 0/NaN, keep only model features
        if self.features:
            # Create DataFrame with model features
            df_input = pd.DataFrame(index=df_features.index, columns=self.features)
            # update with available data
            common_cols = list(set(df_features.columns) & set(self.features))
            df_input[common_cols] = df_features[common_cols]
            # Fill NaN? XGBoost handles NaN, but better to fill?
            # For now, let XGBoost handle it.
            df_input = df_input.astype(float)
        else:
            df_input = df_features
            
        # 3. Predict
        pred_alpha = self.model.predict(df_input)[0]
        
        return {
            "stock_code": stock_code,
            "prediction_date": datetime.now().strftime('%Y-%m-%d'),
            "predicted_5d_alpha": float(pred_alpha),
            "win_rate": 0.0 # Placeholder, need classifier or error distribution for win rate
        }

if __name__ == "__main__":
    predictor = Predictor()
    print(predictor.predict("2330"))
