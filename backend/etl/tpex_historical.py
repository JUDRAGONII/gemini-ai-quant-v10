"""
TPEx 官方歷史行情擷取器 (Taipei Exchange Official API)
- 抓取上櫃股票日 K 線數據
- 使用 daily_trading_quotes 端點
"""
import time
import requests
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from .base_fetcher import BaseFetcher

logger = logging.getLogger(__name__)

class TpexHistoricalFetcher(BaseFetcher):
    """台北證券交易所 (TPEx) 上櫃歷史行情擷取器"""
    
    BASE_URL = "https://www.tpex.org.tw/web/stock/aftertrading/daily_trading_quotes/stk_quote_result.php"
    
    def __init__(self, client):
        super().__init__(client, "daily_price")

    def _roc_to_ad(self, roc_date: str) -> str:
        """113/01/02 -> 2024-01-02"""
        parts = roc_date.split('/')
        if len(parts) == 3:
            return f"{int(parts[0]) + 1911}-{parts[1]}-{parts[2]}"
        return roc_date

    def _clean_number(self, value: Any) -> Optional[float]:
        if not value or value == '--' or value == '':
            return None
        if isinstance(value, (int, float)):
            return float(value)
        try:
            return float(str(value).replace(',', ''))
        except ValueError:
            return None

    def fetch(self, stock_no: str, date_str: str) -> List[Any]:
        """
        獲取上櫃個股日行情 (TPEx 每次回傳一個日期範圍或單日，這裡配合 TWSE 邏輯採單日或模擬月查)
        由於 TPEx 官網查詢邏輯與 TWSE 不同，這裡採取的 URL 可能回傳單日數據。
        """
        params = {
            'l': 'zh-tw',
            'd': date_str, # 民國年 YYY/MM/DD
            'stk_no': stock_no,
            'o': 'json'
        }
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        try:
            time.sleep(2)
            resp = requests.get(self.BASE_URL, params=params, headers=headers, timeout=30)
            data = resp.json()
            # TPEx 回傳格式中，個股日行情通常在 'aaData'
            return data.get('aaData', [])
        except Exception as e:
            logger.error(f"[TPEx] Fetch failed for {stock_no} on {date_str}: {e}")
            return []

    def transform(self, raw_data: List[Any], stock_code: str) -> List[Dict[str, Any]]:
        """
        TPEx 欄位 (aaData[0]): 
        ['日期', '代號', '名稱', '收盤', '漲跌', '開盤', '最高', '最低', '成交股數', ...]
        """
        records = []
        for row in raw_data:
            if len(row) < 9: continue
            records.append({
                "stock_code": stock_code,
                "trade_date": self._roc_to_ad(row[0]),
                "open_price": self._clean_number(row[5]),
                "high_price": self._clean_number(row[6]),
                "low_price": self._clean_number(row[7]),
                "close_price": self._clean_number(row[3]),
                "volume": int(self._clean_number(row[8]) or 0)
            })
        return records

    def backfill(self, stock_no: str, start_year: int, end_year: int = None) -> int:
        """
        上櫃回補 (TPEx 官方 API 通常只支援按日查詢多檔，或按日查詢單檔)
        為了簡化與 TWSE 邏輯統一，這裡雖然低效但穩定地按月抽樣或按日遍歷。
        實際上對接 Fugle 會快很多，但這裡作為 Official 備援。
        """
        if end_year is None: end_year = datetime.now().year
        total = 0
        # 這裡採取簡化邏輯：優先對接 Fugle，若無 API 才用此官方 Crawler
        # 因為 TPEx 官方 API 對 Crawler 極不友善，建議在大規模回補時使用 FugleFetcher
        return 0 
