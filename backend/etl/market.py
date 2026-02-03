import os
import requests
import logging
import time
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from .base_fetcher import BaseFetcher
from backend.lib.config import Config

logger = logging.getLogger(__name__)

class TiingoFetcher(BaseFetcher):
    """Tiingo 美股行情擷取器"""
    
    BASE_URL = "https://api.tiingo.com/tiingo/daily/{ticker}/prices"

    def __init__(self, client, api_key: Optional[str] = None):
        super().__init__(client, "daily_price", provider="tiingo")
        self.api_key_index = 0
        self.api_key = api_key or Config.get_tiingo_key(self.api_key_index)

    def rotate_key(self):
        """嘗試切換至下一個 API Key"""
        if not Config.TIINGO_KEYS:
            raise Exception("No Tiingo API keys configured.")
            
        self.api_key_index += 1
        # 如果已經轉了一圈回到原位，說明所有 Key 都失效了
        if self.api_key_index >= len(Config.TIINGO_KEYS) * 2: 
            raise Exception("All Tiingo API keys reached limits after full rotation.")
            
        new_key = Config.get_tiingo_key(self.api_key_index)
        logger.info(f"🔄 Tiingo API Key rotated to index {self.api_key_index % len(Config.TIINGO_KEYS)}")
        self.api_key = new_key

    def fetch(self, ticker: str, start_date: str = None, end_date: str = None) -> List[Dict[str, Any]]:
        """獲取美股日 K 數據"""
        # 加強物理延遲至 3.0 秒，徹底保護帳號與 IP
        time.sleep(3.0)
        
        if not start_date:
            start_date = (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d')
            
        params = {
            "startDate": start_date,
            "token": self.api_key
        }
        if end_date:
            params["endDate"] = end_date
            
        url = self.BASE_URL.format(ticker=ticker)
        try:
            response = requests.get(url, params=params)
            # 檢查是否達到配額限制 (Tiingo 特有的 500 Symbol 限制)
            if response.status_code == 200 and "run over your 500 symbol" in response.text:
                logger.warning(f"⚠️ Tiingo Quota Exceeded for current key. Rotating...")
                self.rotate_key()
                return self.fetch(ticker, start_date)
                
            response.raise_for_status()
            data = response.json()
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:
                logger.warning("⚠️ Tiingo Rate Limit (429). Sleeping 60s for IP/Account cooling...")
                time.sleep(60) # 429 深度冷卻時間
                self.rotate_key()
                return self.fetch(ticker, start_date)
            raise e
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
    """Fugle 台股行情擷取器 (支援日 K 與分 K)"""
    
    def __init__(self, client, api_key: Optional[str] = None):
        super().__init__(client, "daily_price", provider="fugle") # 預設寫入 daily_price, 分K需切換 table
        self.api_key = api_key or Config.FUGLE_API_KEY
        try:
            from fugle_marketdata import RestClient
            self.sdk_client = RestClient(api_key=self.api_key) if self.api_key else None
        except ImportError:
            logger.error("fugle-marketdata SDK not installed.")
            self.sdk_client = None

    def fetch(self, ticker: str, timeframe: str = 'D1', start_date: str = None, end_date: str = None) -> Dict[str, Any]:
        """
        獲取台股 K 線數據
        timeframe: 'D', '1', '5' (Fugle SDK 參數)
        """
        if not self.sdk_client:
            logger.error("Fugle SDK Client not initialized (Missing API Key or Package)")
            return {}

        try:
            # SDK 使用 'D', '1', '5'
            tf_map = {'D1': 'D', '1m': '1', '5m': '5'}
            sdk_tf = tf_map.get(timeframe, 'D')
            
            stock = self.sdk_client.stock
            
            params = {
                "symbol": ticker,
                "resolution": sdk_tf,
            }
            if start_date:
                params['from'] = start_date
            if end_date:
                params['to'] = end_date

            if timeframe == 'D1':
                # 使用歷史行情報表 (EOD)
                resp = stock.historical.candles(**params)
            else:
                # 盤中行情 (Intraday)
                resp = stock.intraday.candles(**params)
            
            # 回傳原始資料加上 metadata
            return {
                "ticker": ticker,
                "timeframe": timeframe,
                "data": resp
            }
        except Exception as e:
            logger.error(f"Fugle API Error for {ticker}: {e}")
            return {}

    def transform(self, raw_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """轉換為 Schema 格式 (支援 daily_price 與 intraday_candles)"""
        ticker = raw_data.get('ticker')
        timeframe = raw_data.get('timeframe', 'D1')
        candles = raw_data.get('data', [])
        
        # 判斷是否為 data['data'] 結構 (視 SDK 回傳而定)
        if isinstance(candles, dict) and 'data' in candles:
            candles = candles['data']
            
        records = []
        for c in candles:
            # Fugle 格式: date, open, high, low, close, volume (SDK might return dict or object)
            # Ensure c is dict
            if hasattr(c, 'model_dump'):
                c = c.model_dump()
            elif hasattr(c, '__dict__'):
                c = c.__dict__
            
            ts = c.get('date') 
            # Convert datetime to ISO string if needed
            if hasattr(ts, 'isoformat'):
                ts = ts.isoformat()
            
            # Ensure ts is string
            ts_str = str(ts)

            if timeframe == 'D1':
                 records.append({
                    "stock_code": ticker,
                    "trade_date": ts_str.split('T')[0] if 'T' in ts_str else ts_str,
                    "open_price": c['open'],
                    "high_price": c['high'],
                    "low_price": c['low'],
                    "close_price": c['close'],
                    "volume": c['volume']
                })
            else:
                 # Intraday
                 records.append({
                    "stock_code": ticker,
                    "ts": ts_str,
                    "open": c['open'],
                    "high": c['high'],
                    "low": c['low'],
                    "close": c['close'],
                    "volume": c['volume'],
                    "timeframe": timeframe
                })
        return records

    def run(self, ticker: str, timeframe: str = 'D1', **kwargs) -> int:
        """覆寫 run 以支援分段回補與 timeframe 切換"""
        original_table = self.table_name
        if timeframe != 'D1':
            self.table_name = "intraday_candles"
            
        try:
            logger.info(f"Starting Fugle ETL for {ticker} ({timeframe})...")
            
            # 1. 配額檢查與遞增
            if self.provider:
                self.quota_service.increment_usage(self.provider)

            start_date = kwargs.get('start_date')
            # ... (其餘邏輯保持不變)
            end_date = kwargs.get('end_date') or datetime.now().strftime('%Y-%m-%d')
            
            total_count = 0
            
            if timeframe == 'D1' and start_date:
                # 歷史行情 D1 模式：分段擷取 (API 限制單次查詢不得超過一年)
                current_start = datetime.strptime(start_date, '%Y-%m-%d')
                final_end = datetime.strptime(end_date, '%Y-%m-%d')
                
                while current_start < final_end:
                    # 計算該年度結尾或最終結尾
                    current_end = current_start + timedelta(days=364)
                    if current_end > final_end:
                        current_end = final_end
                    
                    s_str = current_start.strftime('%Y-%m-%d')
                    e_str = current_end.strftime('%Y-%m-%d')
                    
                    logger.info(f"  -> Fetching chunk: {s_str} to {e_str}")
                    raw = self.fetch(ticker, timeframe=timeframe, start_date=s_str, end_date=e_str)
                    records = self.transform(raw)
                    
                    if records:
                        count = self.upsert(records, on_conflict="stock_code,trade_date")
                        total_count += count
                    
                    # 避免打爆 API
                    time.sleep(0.5)
                    current_start = current_end + timedelta(days=1)
                
                logger.info(f"Fugle Full History ETL completed for {ticker}. Total: {total_count}")
                return total_count

            # 一般模式 (盤中或單次查詢)
            raw = self.fetch(ticker, timeframe=timeframe, **kwargs)
            records = self.transform(raw)
            conflict_col = "stock_code,ts,timeframe" if timeframe != 'D1' else "stock_code,trade_date"
            total_count = self.upsert(records, on_conflict=conflict_col)
            logger.info(f"Fugle ETL completed for {ticker}. Total: {total_count}")
            return total_count

        except Exception as e:
            # 錯誤記錄
            if self.provider:
                self.quota_service.record_error(self.provider, str(e))
            logger.error(f"Fugle ETL failed for {ticker}: {e}")
            return 0

        finally:
            self.table_name = original_table # 還原

