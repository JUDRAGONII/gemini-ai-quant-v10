import pandas as pd
import yfinance as yf
from typing import List, Dict, Any, Optional
from .base_fetcher import BaseFetcher
from datetime import datetime

logger = logging.getLogger(__name__)

class CurrencyFetcher(BaseFetcher):
    """匯率行情擷取器 - 使用 Yahoo Finance"""
    
    def __init__(self, client):
        super().__init__(client, "exchange_rates")

    def _convert_pair(self, pair: str) -> str:
        """轉換為 Yahoo Finance 匯率格式 (如 USD/TWD -> USDTWD=X)"""
        if '/' in pair:
            return pair.replace('/', '') + "=X"
        return pair

    def transform(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        轉換為 exchange_rates Schema
        由於 fetch 已經回傳了符合格式的 list，此處僅作為實現抽象方法並進行最後檢查
        """
        return raw_data

    def fetch(self, pair: str, start_date: str) -> List[Dict[str, Any]]:
        """獲取匯率歷史"""
        symbol = self._convert_pair(pair)
        logger.info(f"[Currency] Fetching {pair} ({symbol}) from {start_date}")
        try:
            ticker = yf.Ticker(symbol)
            df = ticker.history(start=start_date, interval="1d")
            records = []
            df['prev_close'] = df['Close'].shift(1)
            for index, row in df.iterrows():
                base, target = pair.split('/') if '/' in pair else (pair[:3], pair[3:])
                change = row['Close'] - row['prev_close'] if not pd.isna(row['prev_close']) else 0
                pct = (change / row['prev_close']) * 100 if not pd.isna(row['prev_close']) and row['prev_close'] != 0 else 0
                
                records.append({
                    "base_currency": base,
                    "target_currency": target,
                    "rate": float(row['Close']),
                    "trade_date": index.strftime('%Y-%m-%d'),
                    "change": float(change),
                    "change_percent": float(pct),
                    "source": "Yahoo"
                })
            return records
        except Exception as e:
            logger.error(f"[Currency] Failed to fetch {pair}: {e}")
            return []

    def run_backfill(self, pairs: List[str], start_year: int = 1990):
        """執行批量匯率回補"""
        start_date = f"{start_year}-01-01"
        total_count = 0
        for pair in pairs:
            records = self.fetch(pair, start_date)
            if records:
                count = self.upsert(records, on_conflict="base_currency,target_currency,trade_date")
                total_count += count
                logger.info(f"[Currency] {pair} backfilled: {count} records")
        return total_count
