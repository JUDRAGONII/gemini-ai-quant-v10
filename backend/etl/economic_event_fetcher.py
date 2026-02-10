import logging
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from .base_fetcher import BaseFetcher
from backend.lib.config import Config
import requests

logger = logging.getLogger(__name__)

class EconomicEventFetcher(BaseFetcher):
    """經濟日曆擷取器 - 接入 FRED Releases API"""
    
    BASE_URL = "https://api.stlouisfed.org/fred/releases/dates"

    def __init__(self, client, api_key: Optional[str] = None):
        super().__init__(client, "economic_calendar", provider="fred")
        self.api_key = api_key or Config.FRED_API_KEY

    def fetch(self, days: int = 7) -> List[Dict[str, Any]]:
        """
        獲取未來/過去指定天數的經濟發布事件
        """
        if not self.api_key:
            logger.error("FRED API Key is missing.")
            return []
            
        # 計算時間範圍
        start_date = (datetime.now() - timedelta(days=2)).strftime('%Y-%m-%d')
        end_date = (datetime.now() + timedelta(days=days)).strftime('%Y-%m-%d')
        
        params = {
            "api_key": self.api_key,
            "file_type": "json",
            "realtime_start": start_date,
            "realtime_end": end_date,
            "include_release_dates_with_no_data": "true"
        }
        
        try:
            logger.info(f"[Economic] Fetching releases from {start_date} to {end_date}")
            response = requests.get(self.BASE_URL, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            return data.get('release_dates', [])
        except Exception as e:
            logger.error(f"[Economic] Fetch failed: {e}")
            return []

    def transform(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """轉換為 economic_calendar Schema"""
        records = []
        for item in raw_data:
            # item 欄位範例: {"release_id": 9, "release_name": "Consumer Price Index", "date": "2024-02-13"}
            # 我們需要過濾或映射重要性 (此處先以名稱關鍵字簡單映射)
            event_name = item.get('release_name', 'Unknown Event')
            importance = 3
            if any(k in event_name for k in ['CPI', 'GDP', 'Non-Farm', 'FOMC', 'Employment']):
                importance = 5
            elif any(k in event_name for k in ['Retail', 'Industrial', 'Housing']):
                importance = 4
                
            records.append({
                "event_name": event_name,
                "event_code": f"FRED_{item.get('release_id')}",
                "country": "US", # FRED 預設為 US
                "scheduled_at": f"{item.get('date')} 00:00:00+00", # FRED Releases 僅提供日期
                "importance": importance,
                "source": "FRED"
            })
        return records

    def run(self, days: int = 7) -> int:
        """執行擷取與入庫"""
        raw = self.fetch(days=days)
        records = self.transform(raw)
        if records:
            return self.upsert(records, on_conflict="event_code,scheduled_at")
        return 0
