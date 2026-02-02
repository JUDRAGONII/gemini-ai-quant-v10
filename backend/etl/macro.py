from fredapi import Fred
import pandas as pd
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from .base_fetcher import BaseFetcher
from backend.lib.config import Config

logger = logging.getLogger(__name__)

# 指標映射：功能名稱 -> FRED Series ID
# 依照憲級文件 4.2 擴充
MACRO_METADATA = {
    # 利率與貨幣政策
    "FEDFUNDS": {"id": "FEDFUNDS", "cat": "利率", "country": "US"},
    "10Y_BOND": {"id": "DGS10", "cat": "利率", "country": "US"},
    "2Y_BOND": {"id": "DGS2", "cat": "利率", "country": "US"},
    "M2": {"id": "M2SL", "cat": "貨幣", "country": "US"},
    
    # 通貨膨脹
    "CPI": {"id": "CPIAUCSL", "cat": "通膨", "country": "US"},
    "CORE_CPI": {"id": "CPILFESL", "cat": "通膨", "country": "US"},
    "PCE": {"id": "PCECTPI", "cat": "通膨", "country": "US"},
    
    # 就業
    "UNRATE": {"id": "UNRATE", "cat": "就業", "country": "US"},
    "PAYEMS": {"id": "PAYEMS", "cat": "就業", "country": "US"},
    "ICSA": {"id": "ICSA", "cat": "就業", "country": "US"},
    
    # 成長
    "GDP": {"id": "GDP", "cat": "成長", "country": "US"},
    "IPMAN": {"id": "IPMAN", "cat": "成長", "country": "US"},
    "RSXFS": {"id": "RSXFS", "cat": "成長", "country": "US"},
    
    # 風險與信心
    "VIX": {"id": "VIXCLS", "cat": "風險", "country": "US"},
    "BAA10Y": {"id": "BAA10Y", "cat": "風險", "country": "US"},
    "CS_INDEX": {"id": "UMCSENT", "cat": "信心", "country": "US"},

    # 台灣宏觀數據 (FRED Source: IMF)
    # National Accounts: Real Gross Domestic Product for Taiwan Province of China
    "TW_GDP": {"id": "TWNNGDPRPCPPPT", "cat": "成長", "country": "TW", "name": "Taiwan Real GDP (% Change)"},
    # Prices: Consumer Price Index for Taiwan Province of China
    "TW_CPI": {"id": "TWNPCPIPCPPPT", "cat": "通膨", "country": "TW", "name": "Taiwan CPI (% Change)"},
}


class MacroFetcher(BaseFetcher):
    """美國宏觀經濟指標擷取器 (FRED)"""

    def __init__(self, client, api_key: Optional[str] = None):
        super().__init__(client, "macro_indicators")
        self.api_key = api_key or Config.FRED_API_KEY
        self.fred = Fred(api_key=self.api_key) if self.api_key else None

    def fetch(self, series_id: str, start_date: str = None) -> pd.DataFrame:
        """從 FRED 獲取單一指標數據 (使用 fredapi)"""
        if not self.fred:
            logger.error("FRED API Key is missing. Cannot fetch data.")
            return pd.DataFrame()
            
        if not start_date:
            start_date = (datetime.now() - timedelta(days=365*2)).strftime('%Y-%m-%d')
            
        try:
            s = self.fred.get_series(series_id, observation_start=start_date)
            df = pd.DataFrame(s, columns=[series_id])
            return df
        except Exception as e:
            logger.error(f"Error fetching FRED series {series_id}: {str(e)}")
            return pd.DataFrame()

    def transform(self, raw_data: pd.DataFrame, **kwargs) -> List[Dict[str, Any]]:
        """將 DataFrame 轉換為 macro_indicators Schema"""
        if raw_data.empty:
            return []
            
        indicator_code = kwargs.get('indicator_code')
        series_id = kwargs.get('series_id')
        meta = MACRO_METADATA.get(indicator_code, {})
        
        records = []
        for index, row in raw_data.iterrows():
            val = row[series_id]
            if pd.isna(val):
                continue
                
            records.append({
                "indicator_code": indicator_code,
                "indicator_name": meta.get('name', indicator_code),
                "country": meta.get('country', 'US'),
                "category": meta.get('cat', 'macro'),
                "value": float(val),
                "reference_date": index.strftime('%Y-%m-%d'),
                "source": "FRED"
            })
        return records

    def run_all(self, lookback_days: int = 365*2):
        """執行所有定義指標的同步"""
        start_date = (datetime.now() - timedelta(days=lookback_days)).strftime('%Y-%m-%d')
        logger.info(f"Starting All Macro Sync from {start_date}")
        
        total_upserted = 0
        for code, meta in MACRO_METADATA.items():
            logger.info(f"Syncing {code} ({meta['id']})...")
            df = self.fetch(meta['id'], start_date)
            records = self.transform(df, indicator_code=code, series_id=meta['id'])
            total_upserted += self.upsert(records, on_conflict='indicator_code,reference_date')
            
        logger.info(f"Macro Sync Completed. Total records: {total_upserted}")
        return total_upserted
