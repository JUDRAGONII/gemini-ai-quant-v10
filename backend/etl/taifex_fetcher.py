import logging
import requests
import time
import json
import pandas as pd
from typing import List, Dict, Any, Optional
from datetime import datetime
from .base_fetcher import BaseFetcher
from backend.lib.config import Config

logger = logging.getLogger(__name__)

class TaifexFetcher(BaseFetcher):
    """
    期交所 (TAIFEX) 數據擷取器
    透過官方 OpenAPI 獲取最新交易日行情。
    """

    def __init__(self, client):
        super().__init__(client, "daily_price")
        # 依照調研結果，正確 JSON 端點為 DailyMarketReportFut
        self.base_url = "https://openapi.taifex.com.tw/v1"

    def fetch(self, **kwargs) -> Any:
        """從期交所獲取行情"""
        time.sleep(1.1)
        endpoint = f"{self.base_url}/DailyMarketReportFut"
        headers = {'Accept': 'application/json'}
        try:
            logger.info(f"正在從 TAIFEX 抓取期貨行情: {endpoint}")
            response = requests.get(endpoint, headers=headers, timeout=15)
            response.raise_for_status()
            # 處理可能存在的 BOM
            content = response.content.decode('utf-8-sig')
            return json.loads(content)
        except Exception as e:
            logger.error(f"TAIFEX Fetcher 數據抓取或解析失敗: {e}")
            return []

    def transform(self, raw_data: Any) -> List[Dict[str, Any]]:
        """將原始數據轉換為 daily_price Schema"""
        if not raw_data:
            return []

        # 目標標的
        targets = ["TX", "MTX", "TE"]
        transformed = []
        for item in raw_data:
            symbol = item.get("SymbolID", "").strip()
            if symbol in targets:
                try:
                    date_str = item.get("Date")
                    trade_date = datetime.strptime(date_str, "%Y%m%d").date()
                    
                    transformed.append({
                        "stock_code": symbol,
                        "trade_date": trade_date.isoformat(),
                        "open_price": float(item.get("OpenPrice")) if item.get("OpenPrice") else None,
                        "high_price": float(item.get("HighPrice")) if item.get("HighPrice") else None,
                        "low_price": float(item.get("LowPrice")) if item.get("LowPrice") else None,
                        "close_price": float(item.get("SettlementPrice")) if item.get("SettlementPrice") else None,
                        "volume": int(item.get("TradingVolume")) if item.get("TradingVolume") else 0
                    })
                except Exception as e:
                    logger.warning(f"跳近期貨紀錄轉換錯誤: {e} | Data: {item}")
                    continue

        # 由於同代號有多個合約，我們對 transformed 進行去重，只保留成交量最大的一筆 (代表主力合約)
        if transformed:
            df = pd.DataFrame(transformed)
            # 依據代號群組，取成交量最大者
            df_main = df.sort_values("volume", ascending=False).drop_duplicates("stock_code")
            return df_main.to_dict("records")
            
        return []

    def run(self, **kwargs) -> int:
        """重寫執行流程，期貨行情 PK 是 symbol + date"""
        return super().run(on_conflict="stock_code,trade_date", **kwargs)
