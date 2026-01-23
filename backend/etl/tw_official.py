import requests
import logging
from typing import List, Dict, Any
from .base_fetcher import BaseFetcher

logger = logging.getLogger(__name__)

class TwseFetcher(BaseFetcher):
    """台股證交所 (TWSE) 官方數據擷取器"""
    
    # 十大法人買賣超 (全部幣別)
    INSTITUTIONAL_URL = "https://openapi.twse.com.tw/v1/fund/T86_ALL_BUT0999"
    # 信用交易統計
    MARGIN_URL = "https://openapi.twse.com.tw/v1/exchangeReport/MI_MARGN"
    # 每日收盤行情
    CLOSE_PRICE_URL = "https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL"

    def __init__(self, client):
        # 注意：TwseFetcher 可能會寫入多個資料表，這裏預設為 daily_price
        super().__init__(client, "daily_price")

    def fetch(self, url: str) -> List[Dict[str, Any]]:
        """獲取官方數據"""
        response = requests.get(url)
        response.raise_for_status()
        return response.json()

    def transform(self, raw_data: List[Dict[str, Any]], target_type: str = "price") -> List[Dict[str, Any]]:
        """
        將官方數據轉換為系統 Schema。
        target_type: "price" | "institutional" | "margin"
        """
        records = []
        for item in raw_data:
            if target_type == "price":
                # 簡單行情轉換
                records.append({
                    "stock_code": item.get('Code'),
                    "trade_date": datetime.now().strftime('%Y-%m-%d'), # OpenAPI 通常是當日資料
                    "close_price": float(item.get('ClosingPrice', 0)) if item.get('ClosingPrice') else None,
                    "volume": int(item.get('TradeVolume', 0).replace(',', '')) if item.get('TradeVolume') else 0
                })
            # 籌碼數據轉換邏輯 (待 stock_factors 表細化後補全)
        return records

    def sync_institutional(self) -> int:
        """同步三大法人買賣超數據"""
        logger.info("Syncing TWSE Institutional data...")
        raw = self.fetch(self.INSTITUTIONAL_URL)
        # TODO: 實作轉換至 stock_factors 的邏輯
        return len(raw)

    def sync_margin(self) -> int:
        """同步融資融券數據"""
        logger.info("Syncing TWSE Margin data...")
        raw = self.fetch(self.MARGIN_URL)
        # TODO: 實作轉換至 stock_factors 的邏輯
        return len(raw)
