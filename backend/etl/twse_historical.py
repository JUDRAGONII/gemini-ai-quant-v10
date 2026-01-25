"""
TWSE 官方歷史行情擷取器 (Taiwan Stock Exchange Official API)
- 使用 STOCK_DAY 端點逐月查詢個股日 K 線
- 自動轉換民國年至西元年
"""
import os
import time
import requests
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from .base_fetcher import BaseFetcher

logger = logging.getLogger(__name__)


class TwseHistoricalFetcher(BaseFetcher):
    """台灣證券交易所 (TWSE) 官方歷史行情擷取器"""
    
    # TWSE 官方月報端點
    STOCK_DAY_URL = "https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY"
    
    def __init__(self, client):
        super().__init__(client, "daily_price")
    
    def _roc_to_ad(self, roc_date: str) -> str:
        """
        將民國年日期轉換為西元年日期
        例如: 113/01/02 -> 2024-01-02
        """
        parts = roc_date.split('/')
        if len(parts) == 3:
            roc_year = int(parts[0])
            month = parts[1]
            day = parts[2]
            ad_year = roc_year + 1911
            return f"{ad_year}-{month}-{day}"
        return roc_date
    
    def _clean_number(self, value: str) -> Optional[float]:
        """清理數字格式 (移除逗號，處理空值)"""
        if not value or value == '--' or value == '':
            return None
        try:
            return float(value.replace(',', ''))
        except ValueError:
            return None

    def fetch(self, stock_no: str, year: int, month: int) -> List[Dict[str, Any]]:
        """
        獲取指定年月的日 K 數據
        
        Args:
            stock_no: 股票代碼 (如 0050)
            year: 西元年 (如 2024)
            month: 月份 (1-12)
        """
        # 轉換為查詢日期格式 YYYYMMDD (使用該月 1 號)
        date_str = f"{year}{month:02d}01"
        
        params = {
            'date': date_str,
            'stockNo': stock_no,
            'response': 'json'
        }
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        
        try:
            # TWSE 建議延遲：避免過於頻繁
            time.sleep(3) 
            response = requests.get(self.STOCK_DAY_URL, params=params, headers=headers, timeout=30, verify=False)
            response.raise_for_status()
            
            # 嘗試解析 JSON，若非 JSON (如 HTML 錯誤頁) 則會拋出 JSONDecodeError
            try:
                data = response.json()
            except ValueError:
                logger.error(f"[TWSE] Response not JSON for {stock_no} {year}/{month:02d}. Content: {response.text[:100]}...")
                return []
            
            if data.get('stat') != 'OK':
                logger.warning(f"[TWSE] {stock_no} {year}/{month:02d}: stat={data.get('stat')}")
                return []
            
            return data.get('data', [])
            
        except Exception as e:
            logger.error(f"[TWSE] Failed to fetch {stock_no} {year}/{month:02d}: {e}")
            return []

    def transform(self, raw_data: List[List[str]], stock_code: str) -> List[Dict[str, Any]]:
        """
        將 TWSE 原始數據轉換為 daily_price Schema
        
        TWSE 欄位順序: ['日期', '成交股數', '成交金額', '開盤價', '最高價', '最低價', '收盤價', '漲跌價差', '成交筆數', '註記']
        """
        records = []
        for row in raw_data:
            if len(row) < 7:
                continue
                
            trade_date = self._roc_to_ad(row[0])
            
            records.append({
                "stock_code": stock_code,
                "trade_date": trade_date,
                "open_price": self._clean_number(row[3]),
                "high_price": self._clean_number(row[4]),
                "low_price": self._clean_number(row[5]),
                "close_price": self._clean_number(row[6]),
                "volume": int(self._clean_number(row[1]) or 0)
            })
        
        return records

    def backfill(self, stock_no: str, start_year: int, end_year: int = None) -> int:
        """
        執行全量歷史回補
        
        Args:
            stock_no: 股票代碼
            start_year: 起始年份 (西元)
            end_year: 結束年份 (預設為當前年份)
        
        Returns:
            總入庫筆數
        """
        if end_year is None:
            end_year = datetime.now().year
        
        total_upserted = 0
        
        for year in range(start_year, end_year + 1):
            for month in range(1, 13):
                # 檢查是否超過當前日期
                if year == datetime.now().year and month > datetime.now().month:
                    break
                
                raw_data = self.fetch(stock_no, year, month)
                
                if raw_data:
                    records = self.transform(raw_data, stock_no)
                    if records:
                        count = self.upsert(records, on_conflict='stock_code,trade_date')
                        total_upserted += count
                        logger.info(f"[TWSE] {stock_no} {year}/{month:02d}: {count} records")
                
                # 避免請求過於頻繁被封鎖
                time.sleep(0.3)
        
        logger.info(f"[TWSE] Backfill completed for {stock_no}: {total_upserted} total records")
        return total_upserted
