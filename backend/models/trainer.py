import pandas as pd
import numpy as np
import xgboost as xgb
import logging
import pickle
import os
from typing import List, Tuple, Dict, Optional
from datetime import datetime, timedelta
from sklearn.metrics import mean_squared_error, r2_score

# Local imports
from backend.lib.supabase_client import get_supabase
# We don't import AlphaFactory here unless we need to recalc on fly, 
# but plan says we use stored factors from DB.

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelTrainer:
    """
    AI 預測模型訓練器 (XGBoost)
    目標: 預測未來 5 日超額報酬 (Alpha)
    """
    
    def __init__(self, stock_codes: List[str] = None):
        """
        :param stock_codes: 指定訓練的股票代碼列表 (若 None 則需在 prepare_data 指定)
        """
        self.db = get_supabase()
        self.stock_codes = stock_codes or []
        self.model = None
        self.features = [] # List of feature names
        
        # XGBoost Params
        self.params = {
            'objective': 'reg:squarederror',
            'n_estimators': 1000,
            'learning_rate': 0.05,
            'max_depth': 6,
            'subsample': 0.8,
            'colsample_bytree': 0.8,
            'early_stopping_rounds': 50,
            # 'tree_method': 'hist', # Enable if backend supports it (faster)
            # 'device': 'cuda' # Enable if GPU available
        }

    def _fetch_market_index(self, start_date: str) -> pd.Series:
        """獲取大盤指數 (TWII) 用於計算 Alpha"""
        # Try finding ^TWII in daily_price First
        res = self.db.table('daily_price') \
            .select('trade_date, close_price') \
            .eq('stock_code', '^TWII') \
            .gte('trade_date', start_date) \
            .order('trade_date', desc=False) \
            .execute()
            
        data = res.data
        if not data:
            # Fallback or Mock if ^TWII not found (for dev phase)
            # In real prod, ensuring ^TWII exists is crucial
            logger.warning("Market Index (^TWII) not found. Using zero return benchmark (Absolute Return).")
            return pd.Series()
            
        df = pd.DataFrame(data)
        df['trade_date'] = pd.to_datetime(df['trade_date'])
        df = df.set_index('trade_date')
        return df['close_price']

    def prepare_data(self, days: int = 365*2) -> Tuple[pd.DataFrame, pd.Series]:
        """
        準備訓練數據
        X: stock_factors.factors_all (expanded)
        y: Future 5-Day Alpha
        """
        start_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
        
        all_X = []
        all_y = []
        
        # 1. Fetch Market Index
        market_series = self._fetch_market_index(start_date)
        
        for code in self.stock_codes:
            # 2. Fetch Stock Price (for Label)
            res_price = self.db.table('daily_price') \
                .select('trade_date, close_price') \
                .eq('stock_code', code) \
                .gte('trade_date', start_date) \
                .order('trade_date', desc=False) \
                .execute()
            
            if not res_price.data:
                logger.warning(f"  > Price data missing for {code}")
                continue
            
            logger.info(f"  > Fetched {len(res_price.data)} price records for {code}")
                
            df_price = pd.DataFrame(res_price.data)
            df_price['trade_date'] = pd.to_datetime(df_price['trade_date'])
            df_price = df_price.set_index('trade_date')
            price_series = df_price['close_price']
            
            # 3. Calculate 5-Day Forward Return
            # Ret_5d = P(t+5) / P(t) - 1
            # Shift(-5) gets future value to current row
            future_price = price_series.shift(-5)
            stock_ret_5d = np.log(future_price / price_series)
            
            # 4. Calculate Market 5-Day Forward Return
            if not market_series.empty:
                market_aligned = market_series.reindex(price_series.index).fillna(method='ffill')
                future_market = market_aligned.shift(-5)
                market_ret_5d = np.log(future_market / market_aligned)
                
                # Alpha = Stock_Ret - Market_Ret
                alpha_5d = stock_ret_5d - market_ret_5d
            else:
                alpha_5d = stock_ret_5d # Fallback to absolute return
                
            # 5. Fetch Factors (X)
            # Note: fetch large amount of JSONB might be slow. 
            # Optimization: Server-side flattening or specialized View.
            # Here doing client-side parsing for MVP.
            res_factors = self.db.table('stock_factors') \
                .select('trade_date, factors_all') \
                .eq('stock_code', code) \
                .gte('trade_date', start_date) \
                .order('trade_date', desc=False) \
                .execute()
                
            if not res_factors.data:
                logger.warning(f"  > Factor data missing for {code}")
                continue
                
            logger.info(f"  > Fetched {len(res_factors.data)} factor records for {code}")
                
            df_factors = pd.DataFrame(res_factors.data)
            df_factors['trade_date'] = pd.to_datetime(df_factors['trade_date'])
            df_factors = df_factors.set_index('trade_date')
            
            # Extract JSONB to Columns
            # factors_all is a dict. apply(pd.Series) expands it.
            # Use json_normalize logic equivalent
            factors_expanded = pd.json_normalize(df_factors['factors_all'])
            factors_expanded.index = df_factors.index
            
            # 6. Align X and y
            # Join (inner) to ensure dates match
            data = pd.concat([factors_expanded, alpha_5d.rename('target')], axis=1, join='inner')
            
            # Drop NaN (missing targets due to shift, or missing factors)
            data = data.dropna()
            
            logger.info(f"  > Aligned data count: {len(data)}")
            
            if data.empty:
                logger.warning(f"  > Data empty after alignment/dropna for {code}")
                continue
                
            all_X.append(data.drop(columns=['target']))
            all_y.append(data['target'])
            
        if not all_X:
            logger.warning("No valid training data found.")
            return pd.DataFrame(), pd.Series()
            
        final_X = pd.concat(all_X)
        final_y = pd.concat(all_y)
        
        self.features = final_X.columns.tolist()
        return final_X, final_y

    def train(self, save_path: str = "backend/models/saved/latest_model.json"):
        """訓練模型並存檔"""
        X, y = self.prepare_data()
        if X.empty:
            logger.error("Training Aborted: Empty dataset")
            return
            
        # Split (Simple random split for now, ideal is time-series split)
        # Using last 20% as validation (simulating time-series)
        split_idx = int(len(X) * 0.8)
        X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
        y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
        
        logger.info(f"Training on {len(X_train)} samples, Validating on {len(X_test)} samples")
        
        self.model = xgb.XGBRegressor(**self.params)
        self.model.fit(
            X_train, y_train,
            eval_set=[(X_test, y_test)],
            verbose=100
        )
        
        # Eval
        preds = self.model.predict(X_test)
        rmse = np.sqrt(mean_squared_error(y_test, preds))
        r2 = r2_score(y_test, preds)
        logger.info(f"Model Evaluation: RMSE={rmse:.5f}, R2={r2:.5f}")
        
        # Save
        self.model.save_model(save_path)
        logger.info(f"Model saved to {save_path}")
        
        # Save feature names separately (needed for prediction alignment)
        feature_path = save_path + ".features"
        with open(feature_path, 'wb') as f:
            pickle.dump(self.features, f)

if __name__ == "__main__":
    # Test Run
    # Assuming we have 2330 and 0050 from previous step
    trainer = ModelTrainer(stock_codes=['2330', '0050'])
    trainer.train()
