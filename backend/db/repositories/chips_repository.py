import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import pandas as pd
from backend.lib.supabase_client import get_supabase

logger = logging.getLogger(__name__)

class ChipsRepository:
    """
    籌碼分析資料庫操作服務
    負責抓取並整合三大法人與融資券資料
    """
    def __init__(self):
        self.db = get_supabase()

    def get_chips_history(self, stock_code: str, days: int = 30) -> Dict[str, Any]:
        """
        獲取標的歷史籌碼資料，以日期為軸進行 OUTER JOIN
        """
        try:
            start_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
            
            # 1. Fetch Daily Price (Base Dates)
            res_price = self.db.table('daily_price') \
                .select('trade_date, close_price') \
                .eq('stock_code', stock_code) \
                .gte('trade_date', start_date) \
                .order('trade_date', desc=False) \
                .execute()
                
            df_price = pd.DataFrame(res_price.data)
            if df_price.empty:
                return {"ticker": stock_code, "success": True, "data": []}
                
            df_price['trade_date'] = pd.to_datetime(df_price['trade_date'])
            df_price = df_price.set_index('trade_date')
            
            # 2. Fetch Institutional (三大法人)
            res_inst = self.db.table('stock_institutional') \
                .select('trade_date, foreign_investor_net, investment_trust_net, dealer_net') \
                .eq('stock_code', stock_code) \
                .gte('trade_date', start_date) \
                .execute()
                
            df_inst = pd.DataFrame(res_inst.data)
            if not df_inst.empty:
                df_inst['trade_date'] = pd.to_datetime(df_inst['trade_date'])
                df_inst = df_inst.set_index('trade_date')
            
            # 3. Fetch Margin (融資券)
            res_margin = self.db.table('stock_margin') \
                .select('trade_date, margin_balance, short_balance, margin_rate') \
                .eq('stock_code', stock_code) \
                .gte('trade_date', start_date) \
                .execute()
                
            df_margin = pd.DataFrame(res_margin.data)
            if not df_margin.empty:
                df_margin['trade_date'] = pd.to_datetime(df_margin['trade_date'])
                df_margin = df_margin.set_index('trade_date')
                
            # --- Perform Join ---
            df_merged = df_price
            if not df_inst.empty:
                df_merged = df_merged.join(df_inst, how='left')
            else:
                df_merged['foreign_investor_net'] = 0
                df_merged['investment_trust_net'] = 0
                df_merged['dealer_net'] = 0
                
            if not df_margin.empty:
                df_merged = df_merged.join(df_margin, how='left')
            else:
                df_merged['margin_balance'] = 0
                df_merged['short_balance'] = 0
                df_merged['margin_rate'] = 0
                
            # Reset index to bring back 'trade_date'
            df_merged = df_merged.reset_index()
            
            # Forward fill balances if missing, fill NA with 0 for 'net' changes
            df_merged[['margin_balance', 'short_balance', 'margin_rate']] = df_merged[['margin_balance', 'short_balance', 'margin_rate']].ffill().fillna(0)
            df_merged = df_merged.fillna(0)
            
            # Calculate changes for margin
            df_merged['margin_change'] = df_merged['margin_balance'].diff().fillna(0)
            df_merged['short_change'] = df_merged['short_balance'].diff().fillna(0)
            
            # Format the output matching API Spec
            result_data = []
            for _, row in df_merged.iterrows():
                f_net = float(row['foreign_investor_net'])
                t_net = float(row['investment_trust_net'])
                d_net = float(row['dealer_net'])
                
                result_data.append({
                    "date": row['trade_date'].strftime('%Y-%m-%d'),
                    "price": float(row['close_price']),
                    "foreign": f_net,
                    "trust": t_net,
                    "dealer": d_net,
                    "total_institutional": f_net + t_net + d_net,
                    "margin_balance": float(row['margin_balance']),
                    "margin_change": float(row['margin_change']),
                    "short_balance": float(row['short_balance']),
                    "short_change": float(row['short_change']),
                    "short_ratio": float(row['margin_rate']) # Mapping margin_rate to short_ratio
                })
                
            return {
                "ticker": stock_code,
                "success": True,
                "data": result_data
            }
            
        except Exception as e:
            logger.error(f"Error fetching chips history for {stock_code}: {str(e)}")
            return {"ticker": stock_code, "success": False, "data": []}
