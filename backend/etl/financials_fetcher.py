"""
FMP (Financial Modeling Prep) 財報數據擷取器
支援美股季報/年報的 Income Statement, Balance Sheet, Cash Flow 三表
"""

import logging
import time
import requests
from typing import List, Dict, Any, Optional
from datetime import datetime
from .base_fetcher import BaseFetcher
from lib.config import Config

logger = logging.getLogger(__name__)

class FMPFetcher(BaseFetcher):
    """Financial Modeling Prep 財報擷取器 (支援 Key 輪詢)"""
    
    BASE_URL = "https://financialmodelingprep.com/api/v3"
    
    def __init__(self, client, api_key: Optional[str] = None):
        super().__init__(client, "stock_financials")
        self.api_key_index = 0
        self.api_key = api_key or Config.get_fmp_key(self.api_key_index)
        
    def rotate_key(self):
        """嘗試切換至下一個 API Key"""
        if not Config.FMP_KEYS:
            raise Exception("No FMP API keys configured.")
        
        self.api_key_index += 1
        if self.api_key_index >= len(Config.FMP_KEYS) * 2:
            raise Exception("All FMP API keys reached limits after full rotation.")
        
        new_key = Config.get_fmp_key(self.api_key_index)
        logger.info(f"🔄 FMP API Key rotated to index {self.api_key_index % len(Config.FMP_KEYS)}")
        self.api_key = new_key

    def _make_request(self, endpoint: str, params: Dict = None) -> List[Dict]:
        """通用請求方法 (含 429 處理)"""
        time.sleep(1.0)  # 基礎延遲保護
        
        url = f"{self.BASE_URL}/{endpoint}"
        if params is None:
            params = {}
        params["apikey"] = self.api_key
        
        try:
            response = requests.get(url, params=params, timeout=Config.API_TIMEOUT)
            
            # FMP 回傳 429 或錯誤訊息
            if response.status_code == 429:
                logger.warning("⚠️ FMP Rate Limit (429). Rotating key...")
                time.sleep(30)
                self.rotate_key()
                return self._make_request(endpoint, params)
            
            response.raise_for_status()
            data = response.json()
            
            # FMP 有時回傳 {"Error Message": "..."}
            if isinstance(data, dict) and "Error Message" in data:
                logger.warning(f"FMP API Error: {data['Error Message']}")
                return []
            
            return data if isinstance(data, list) else []
            
        except requests.exceptions.HTTPError as e:
            logger.error(f"FMP HTTP Error: {e}")
            return []
        except Exception as e:
            logger.error(f"FMP Request Failed: {e}")
            return []

    def fetch(self, ticker: str, report_type: str = "annual", limit: int = 10) -> Dict[str, Any]:
        """
        獲取財報數據
        report_type: 'annual' (年報) 或 'quarterly' (季報)
        """
        period = "annual" if report_type == "annual" else "quarter"
        
        # 擷取三表數據
        income = self._make_request(f"income-statement/{ticker}", {"period": period, "limit": limit})
        balance = self._make_request(f"balance-sheet-statement/{ticker}", {"period": period, "limit": limit})
        cashflow = self._make_request(f"cash-flow-statement/{ticker}", {"period": period, "limit": limit})
        
        return {
            "ticker": ticker,
            "report_type": report_type,
            "income_statement": income,
            "balance_sheet": balance,
            "cash_flow": cashflow
        }

    def transform(self, raw_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """轉換為 stock_financials Schema"""
        ticker = raw_data.get("ticker")
        report_type = raw_data.get("report_type", "annual")
        income_data = raw_data.get("income_statement", [])
        balance_data = raw_data.get("balance_sheet", [])
        cashflow_data = raw_data.get("cash_flow", [])
        
        # 以 income statement 為主表，合併其他數據
        records = []
        
        # 建立日期索引對照
        balance_by_date = {b.get("date"): b for b in balance_data}
        cashflow_by_date = {c.get("date"): c for c in cashflow_data}
        
        for inc in income_data:
            date_str = inc.get("date")
            if not date_str:
                continue
            
            bal = balance_by_date.get(date_str, {})
            cf = cashflow_by_date.get(date_str, {})
            
            record = {
                "stock_code": ticker,
                "fiscal_date": date_str,
                "report_type": report_type,
                # Income Statement
                "revenue": inc.get("revenue"),
                "gross_profit": inc.get("grossProfit"),
                "operating_income": inc.get("operatingIncome"),
                "net_income": inc.get("netIncome"),
                "eps": inc.get("eps"),
                # Balance Sheet
                "total_assets": bal.get("totalAssets"),
                "total_liabilities": bal.get("totalLiabilities"),
                "total_equity": bal.get("totalStockholdersEquity"),
                # Cash Flow
                "operating_cash_flow": cf.get("operatingCashFlow"),
                "free_cash_flow": cf.get("freeCashFlow"),
            }
            records.append(record)
        
        return records

    def run(self, ticker: str, report_types: List[str] = None, **kwargs) -> int:
        """執行 ETL (預設擷取年報與季報)"""
        if report_types is None:
            report_types = ["annual", "quarterly"]
        
        total_count = 0
        
        for rt in report_types:
            logger.info(f"📊 Fetching {rt} financials for {ticker}...")
            raw = self.fetch(ticker, report_type=rt, limit=kwargs.get("limit", 10))
            records = self.transform(raw)
            
            if records:
                count = self.upsert(records, on_conflict="stock_code,fiscal_date,report_type")
                total_count += count
                logger.info(f"  ✅ {rt}: {count} records upserted")
            else:
                logger.warning(f"  ⚠️ {rt}: No data found")
        
        return total_count
