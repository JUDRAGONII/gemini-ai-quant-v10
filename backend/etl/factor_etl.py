import pandas as pd
import numpy as np
from typing import List, Dict, Optional
import logging
from datetime import datetime, timedelta

# Local imports
from backend.lib.supabase_client import get_supabase
from backend.research.alpha_factors import AlphaFactory

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FactorETL:
    """
    AI 因子整合 ETL 服務
    負責從 DB 撈取 Raw Data -> 呼叫 AlphaFactory 計算 -> 寫回 DB
    """
    
    def __init__(self):
        self.db = get_supabase()
        
    def fetch_data(self, stock_code: str, days: int = 400) -> Dict[str, pd.DataFrame]:
        """
        從 DB 撈取該標的所需的 Raw Data (預設抓 400 天以滿足 rolling 需求)
        """
        start_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
        
        # 1. Fetch OHLCV (daily_price)
        res_price = self.db.table('daily_price') \
            .select('trade_date, open_price, high_price, low_price, close_price, volume') \
            .eq('stock_code', stock_code) \
            .gte('trade_date', start_date) \
            .order('trade_date', desc=False) \
            .execute()
            
        df_price = pd.DataFrame(res_price.data)
        if df_price.empty:
            return {}
            
        # Rename columns to match AlphaFactory expectation (open, high, low, close, volume)
        # Note: DB columns are open_price, etc. AlphaFactory expects 'open', 'high'...
        df_price = df_price.rename(columns={
            'open_price': 'open',
            'high_price': 'high',
            'low_price': 'low',
            'close_price': 'close'
        })
        df_price['trade_date'] = pd.to_datetime(df_price['trade_date'])
        df_price = df_price.set_index('trade_date')
        
        # 2. Fetch Chips (stock_institutional, stock_margin)
        # Assuming we have these tables populated. If not, factory handles empty df.
        res_inst = self.db.table('stock_institutional') \
            .select('trade_date, foreign_investor_net, investment_trust_net, dealer_net') \
            .eq('stock_code', stock_code) \
            .gte('trade_date', start_date) \
            .execute()
        df_inst = pd.DataFrame(res_inst.data)
        if not df_inst.empty:
            df_inst['trade_date'] = pd.to_datetime(df_inst['trade_date'])
            df_inst = df_inst.set_index('trade_date')
            
        res_margin = self.db.table('stock_margin') \
            .select('trade_date, margin_balance, short_balance, margin_rate') \
            .eq('stock_code', stock_code) \
            .gte('trade_date', start_date) \
            .execute()
        df_margin = pd.DataFrame(res_margin.data)
        if not df_margin.empty:
            df_margin['trade_date'] = pd.to_datetime(df_margin['trade_date'])
            df_margin = df_margin.set_index('trade_date')
            
        # Merge Chips
        df_chips = pd.DataFrame()
        if not df_inst.empty:
            df_chips = df_inst
        if not df_margin.empty:
            if df_chips.empty:
                df_chips = df_margin
            else:
                df_chips = df_chips.join(df_margin, how='outer')
                
        # 3. Fetch Macro (macro_indicators) - Simplified for now
        # Ideally we fetch broad market index (^TWII) and VIX
        # For Phase 8.2 MVP, we might skip macro fetching logic if detailed mapping is complex
        # Or fetch just ^TWII from daily_price if stored there
        df_macro = pd.DataFrame() # Placeholder
        
        return {
            'price': df_price,
            'chips': df_chips,
            'macro': df_macro
        }

    def run_single(self, stock_code: str):
        """
        單一標的執行流程
        """
        logger.info(f"Processing factors for {stock_code}...")
        
        # 1. Fetch
        data = self.fetch_data(stock_code)
        if not data or data['price'].empty:
            logger.warning(f"No price data for {stock_code}")
            return
            
        # 2. Calc
        factory = AlphaFactory(data['price'])
        factory.add_technical_factors()
        
        if not data['chips'].empty:
            factory.add_chip_factors(data['chips'])
            
        # Macro added later
        
        factors = factory.get_factors(drop_na=True)
        if factors.empty:
            logger.warning(f"No factors generated for {stock_code}")
            return
            
        # 3. Upsert
        self.upsert_factors(stock_code, factors)

    def upsert_factors(self, stock_code: str, df_factors: pd.DataFrame):
        """
        將因子寫入 DB (使用 JSONB 存儲完整因子)
        """
        records = []
        for date, row in df_factors.iterrows():
            # Convert row to dict, handling NaNs
            factor_dict = row.replace({np.nan: None}).to_dict()
            
            # Extract core columns if mapped, else put all in factors_all
            # Core columns in DB: pe_ratio, roe, etc. (Not calculated here yet)
            # We calculate Alpha Factors (MOM_*, VOL_*, etc.)
            
            # Construct payload
            record = {
                'stock_code': stock_code,
                'trade_date': date.strftime('%Y-%m-%d'),
                'factors_all': factor_dict
            }
            records.append(record)
            
        if not records:
            return

        # Batch upsert (Supabase limits batch size, safe to split usually)
        batch_size = 100
        for i in range(0, len(records), batch_size):
            batch = records[i:i+batch_size]
            try:
                self.db.table('stock_factors').upsert(batch, on_conflict='stock_code, trade_date').execute()
                logger.info(f"Upserted {len(batch)} records for {stock_code}")
            except Exception as e:
                logger.error(f"Failed to upsert batch: {e}")

if __name__ == "__main__":
    etl = FactorETL()
    
    # Self-Test: Upsert a test record to verify API access
    try:
        logging.info("Running FactorETL Self-Test (Upsert 1 record)...")
        test_payload = {
            'stock_code': 'ETL_TEST',
            'trade_date': datetime.now().strftime('%Y-%m-%d'),
            'factors_all': {'status': 'active'},
            'pe_ratio': 0
        }
        etl.db.table('stock_factors').upsert(test_payload, on_conflict='stock_code, trade_date').execute()
        logging.info("Self-Test PASSED: ETL_TEST record upserted.")
    except Exception as e:
        logging.error(f"Self-Test FAILED: {e}")
        # Continue to try running real data anyway, or exit?
        
    # Test run for TSMC and 0050
    etl.run_single("2330")
    etl.run_single("0050")
