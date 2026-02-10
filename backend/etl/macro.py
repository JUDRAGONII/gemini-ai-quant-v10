from fredapi import Fred
import pandas as pd
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from .base_fetcher import BaseFetcher
from backend.lib.config import Config

logger = logging.getLogger(__name__)

# 指標映射：功能名稱 -> FRED Series ID
# 依照憲級文件 4.2 擴充與 SDD 校準
MACRO_METADATA = {
    "FEDFUNDS": {"id": "FEDFUNDS", "cat": "利率", "country": "US", "name": "Fed Funds Rate"},
    "10Y_BOND": {"id": "DGS10", "cat": "利率", "country": "US", "name": "10-Year Treasury Yield"},
    "2Y_BOND": {"id": "DGS2", "cat": "利率", "country": "US", "name": "2-Year Treasury Yield"},
    "M2": {"id": "M2SL", "cat": "貨幣", "country": "US", "name": "M2 Money Supply"},
    
    # 通貨膨脹
    "CPI": {"id": "CPIAUCSL", "cat": "通膨", "country": "US", "name": "CPI (All Urban)"},
    "CORE_CPI": {"id": "CPILFESL", "cat": "通膨", "country": "US", "name": "Core CPI"},
    "PCE": {"id": "PCECTPI", "cat": "通膨", "country": "US", "name": "PCE Price Index"},
    
    # 就業
    "UNRATE": {"id": "UNRATE", "cat": "就業", "country": "US", "name": "Unemployment Rate"},
    "PAYEMS": {"id": "PAYEMS", "cat": "就業", "country": "US", "name": "Non-Farm Payrolls"},
    "ICSA": {"id": "ICSA", "cat": "就業", "country": "US", "name": "Initial Claims"},
    
    # 成長
    "GDP": {"id": "GDP", "cat": "成長", "country": "US", "name": "Real GDP"},
    "IPMAN": {"id": "IPMAN", "cat": "成長", "country": "US", "name": "Industrial Production: Manufacturing"},
    "RSXFS": {"id": "RSXFS", "cat": "成長", "country": "US", "name": "Retail Sales"},
    
    # 風險與信心
    "VIX": {"id": "VIXCLS", "cat": "風險", "country": "US", "name": "VIX Volatility Index"},
    "BAA10Y": {"id": "BAA10Y", "cat": "風險", "country": "US", "name": "BAA Corporate Bond Spread"},
    "CS_INDEX": {"id": "UMCSENT", "cat": "信心", "country": "US", "name": "Consumer Sentiment"},

    # 指數與商品代碼校正
    "DXY": {"id": "DTWEXBGS", "cat": "匯率", "country": "US", "name": "Dollar Index"},
    "GOLD": {"id": "GOLDAMGBD228NLBM", "cat": "商品", "country": "Global", "name": "Gold Price (Fixing)"},

    # 台灣宏觀數據 (FRED Source: IMF)
    "TW_GDP": {"id": "TWNNGDPRPCPPPT", "cat": "成長", "country": "TW", "name": "Taiwan Real GDP (% Change)"},
    "TW_CPI": {"id": "TWNPCPIPCPPPT", "cat": "通膨", "country": "TW", "name": "Taiwan CPI (% Change)"},
}


class MacroFetcher(BaseFetcher):
    """美國宏觀經濟指標擷取器 (FRED)"""

    def __init__(self, client, api_key: Optional[str] = None):
        super().__init__(client, "macro_indicators", provider="fred")
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
        
        # 【修復】取得當前日期，用於過濾未來預測數據
        today = datetime.now().date()
        
        records = []
        for index, row in raw_data.iterrows():
            val = row[series_id]
            if pd.isna(val):
                continue
            
            # 【關鍵修復】過濾未來日期 (IMF 預測數據)
            ref_date = index.date() if hasattr(index, 'date') else index
            if ref_date > today:
                logger.debug(f"Skipping future projection: {indicator_code} @ {ref_date}")
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
        
        # 1. 配額檢查
        if self.provider:
            self.quota_service.increment_usage(self.provider)

        total_upserted = 0
        try:
            for code, meta in MACRO_METADATA.items():
                logger.info(f"Syncing {code} ({meta['id']})...")
                df = self.fetch(meta['id'], start_date)
                records = self.transform(df, indicator_code=code, series_id=meta['id'])
                total_upserted += self.upsert(records, on_conflict='indicator_code,reference_date')
                
            logger.info(f"Macro Sync Completed. Total records: {total_upserted}")
            return total_upserted
        except Exception as e:
            if self.provider:
                self.quota_service.record_error(self.provider, str(e))
            logger.error(f"Macro Sync Failed: {e}")
            return 0
