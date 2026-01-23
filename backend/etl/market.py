import os
import requests
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from .base_fetcher import BaseFetcher

logger = logging.getLogger(__name__)

class TiingoFetcher(BaseFetcher):
    """Tiingo 美股行情擷取器"""
    
    BASE_URL = "https://api.tiingo.com/tiingo/daily/{ticker}/prices"

    def __init__(self, client, api_key: Optional[str] = None):
        super().__init__(client, "daily_price")
        self.api_key = api_key or os.getenv("TIINGO_API_KEY_1")

    def fetch(self, ticker: str, start_date: str = None, end_date: str = None) -> List[Dict[str, Any]]:
        """獲取美股日 K 數據"""
        if not start_date:
            start_date = (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d')
            
        params = {
            "startDate": start_date,
            "token": self.api_key
        }
        if end_date:
            params["endDate"] = end_date
            
        url = self.BASE_URL.format(ticker=ticker)
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        data = response.json()
        # 加入 ticker 資訊供 transform 使用
        for item in data:
            item['ticker'] = ticker
            
        return data

    def transform(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """轉換為 daily_price Schema"""
        records = []
        for item in raw_data:
            records.append({
                "stock_code": item['ticker'],
                "trade_date": item['date'].split('T')[0],
                "open_price": item['open'],
                "high_price": item['high'],
                "low_price": item['low'],
                "close_price": item['close'],
                "volume": item['volume']
            })
        return records


class FugleFetcher(BaseFetcher):
    """Fugle 台股行情擷取器 (歷史 K 線)"""
    
    BASE_URL = "https://api.fugle.tw/marketdata/v1.0/stock/historical/candles/{ticker}"

    def __init__(self, client, api_key: Optional[str] = None):
        super().__init__(client, "daily_price")
        self.api_key = api_key or os.getenv("FUGLE_API_KEY_1")

    def fetch(self, ticker: str, start_date: str = None, end_date: str = None) -> Dict[str, Any]:
        """獲取台股日 K 數據 (使用 Fugle MarketData API)"""
        headers = {"X-API-KEY": self.api_key}
        params = {"fields": "open,high,low,close,volume,turnover,change"}
        
        if start_date:
            params["from"] = start_date
        if end_date:
            params["to"] = end_date
            
        url = self.BASE_URL.format(ticker=ticker)
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        
        data = response.json()
        data['ticker'] = ticker # 加入 ticker 標記
        return data

    def transform(self, raw_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """轉換為 daily_price Schema"""
        ticker = raw_data.get('ticker')
        candles = raw_data.get('data', [])
        
        records = []
        for c in candles:
            records.append({
                "stock_code": ticker,
                "trade_date": c['date'],
                "open_price": c['open'],
                "high_price": c['high'],
                "low_price": c['low'],
                "close_price": c['close'],
                "volume": c['volume']
            })
        return records
