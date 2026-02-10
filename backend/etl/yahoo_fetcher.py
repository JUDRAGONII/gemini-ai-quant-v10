import logging
import yfinance as yf
import pandas as pd
from typing import List, Dict, Any, Optional
from .base_fetcher import BaseFetcher
from datetime import datetime

logger = logging.getLogger(__name__)

class YahooFetcher(BaseFetcher):
    """Yahoo Finance 行情擷取器 - 用於極限全歷史回補 (1990以前)"""
    
    def __init__(self, client):
        super().__init__(client, "daily_price")

    def _convert_symbol(self, stock_code: str, market_type: str = "TW") -> str:
        """轉換為 Yahoo Finance 格式 (例如 2330 -> 2330.TW, 8069 -> 8069.TWO, ^TWII)"""
        if stock_code.startswith('^'):
            return stock_code
        
        if market_type == "TW":
            # 透過長度與規則初步判定上市/上櫃 (或之後由外部精確傳入)
            # 在台灣市場，4 位數代號通常是主板，但需細分上市與上櫃
            # 建議之後由 HybridMarketFetcher 從資料庫獲取正確的市場分類
            return f"{stock_code}.TW"
        elif market_type == "TWO":
            return f"{stock_code}.TWO"
        elif market_type == "US":
            return stock_code
        
        # 預防性處理
        if stock_code.isdigit():
            return f"{stock_code}.TW"
        return stock_code

    def fetch(self, stock_code: str, start_date: str, end_date: str = None, market_type: str = "TW") -> pd.DataFrame:
        """獲取歷史數據"""
        symbol = self._convert_symbol(stock_code, market_type)
        if not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')
            
        logger.info(f"[Yahoo] Fetching {symbol} from {start_date} to {end_date}")
        try:
            ticker = yf.Ticker(symbol)
            # 使用 auto_adjust=True 獲取還原股價
            df = ticker.history(start=start_date, end=end_date, interval="1d", auto_adjust=True)
            return df
        except Exception as e:
            logger.error(f"[Yahoo] Failed to fetch {symbol}: {e}")
            return pd.DataFrame()

    def transform(self, df: pd.DataFrame, stock_code: str) -> List[Dict[str, Any]]:
        """轉換為 daily_price Schema"""
        records = []
        for index, row in df.iterrows():
            # 確保數據有效 (Close 不為 NaN)
            if pd.isna(row['Close']):
                continue
                
            records.append({
                "stock_code": stock_code,
                "trade_date": index.strftime('%Y-%m-%d'),
                "open_price": float(row['Open']),
                "high_price": float(row['High']),
                "low_price": float(row['Low']),
                "close_price": float(row['Close']),
                "volume": int(row['Volume']) if not pd.isna(row['Volume']) else 0,
                "adjusted_close": float(row['Close']) # yfinance auto_adjust=True 時 Close 即為還原價
            })
        return records

    def run(self, stock_code: str, start_date: str, end_date: str = None, market_type: str = "TW") -> int:
        """執行回補"""
        df = self.fetch(stock_code, start_date, end_date, market_type)
        if df.empty:
            return 0
        
        records = self.transform(df, stock_code)
        if records:
            return self.upsert(records, on_conflict="stock_code,trade_date")
        return 0
