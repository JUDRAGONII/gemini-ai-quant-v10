import logging
import requests
import time
import json
import urllib3
import pandas as pd
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from .base_fetcher import BaseFetcher

# 禁用 SSL 警告
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

logger = logging.getLogger(__name__)


class InstitutionalFetcher(BaseFetcher):
    """
    三大法人買賣超數據擷取器 (V10.2 Precision Fix)
    修正：使用 selectType=ALL 並動態對齊欄位索引
    """

    def __init__(self, client):
        super().__init__(client, "stock_institutional")
        self.twse_base = "https://www.twse.com.tw/rwd/zh/fund/T86"
        self.tpex_base = "https://www.tpex.org.tw/web/stock/aftertrading/institutional_trading/institutional.php"

    def fetch(self, **kwargs) -> List[Dict[str, Any]]:
        trade_date = kwargs.get('trade_date', datetime.now().strftime('%Y-%m-%d'))
        
        # 週末跳過
        dt = datetime.strptime(trade_date, '%Y-%m-%d')
        if dt.weekday() >= 5:
            return []

        all_data = []
        
        # 1. TWSE
        twse_data = self._fetch_twse(trade_date)
        if twse_data:
            all_data.extend(twse_data)
            
        # 2. TPEx
        try:
            tpex_data = self._fetch_tpex(trade_date)
            if tpex_data:
                all_data.extend(tpex_data)
        except Exception as e:
            logger.warning(f"TPEx fetch failed: {e}")

        return all_data

    def _fetch_twse(self, trade_date: str) -> List[Dict[str, Any]]:
        twse_date = trade_date.replace('-', '')
        url = self.twse_base
        params = {
            'date': twse_date,
            'selectType': 'ALL',
            'response': 'json'
        }

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Referer": "https://www.twse.com.tw/zh/page/trading/fund/T86.html"
        }

        try:
            logger.info(f"Fetching TWSE Institutional (ALL) for {trade_date}")
            response = requests.get(url, params=params, headers=headers, timeout=25, verify=False)
            response.raise_for_status()
            data = response.json()

            if data.get('stat') != 'OK' or 'data' not in data:
                return []

            fields = data.get('fields', [])
            # 動態找尋索引
            idx = {
                'code': next((i for i, f in enumerate(fields) if '證券代號' in f), 0),
                'f_buy': next((i for i, f in enumerate(fields) if '外資' in f and '買進' in f), -1),
                'f_sell': next((i for i, f in enumerate(fields) if '外資' in f and '賣出' in f), -1),
                'f_net': next((i for i, f in enumerate(fields) if '外資' in f and '買賣超' in f), -1),
                't_buy': next((i for i, f in enumerate(fields) if '投信' in f and '買進' in f), -1),
                't_sell': next((i for i, f in enumerate(fields) if '投信' in f and '賣出' in f), -1),
                't_net': next((i for i, f in enumerate(fields) if '投信' in f and '買賣超' in f), -1),
                'd_buy': next((i for i, f in enumerate(fields) if '自營商' in f and '買進' in f), -1),
                'd_sell': next((i for i, f in enumerate(fields) if '自營商' in f and '賣出' in f), -1),
                'd_net': next((i for i, f in enumerate(fields) if '自營商' in f and '買賣超' in f), -1),
            }

            records = []
            for row in data['data']:
                stock_code = row[idx['code']].strip()
                # 僅保留 4-6 碼的代號 (標準個股、權證、ETF)
                if not stock_code or len(stock_code) < 4 or len(stock_code) > 6:
                    continue
                
                records.append({
                    "stock_code": stock_code,
                    "trade_date": trade_date,
                    "foreign_investor_buy": self._clean_numeric(row[idx['f_buy']]),
                    "foreign_investor_sell": self._clean_numeric(row[idx['f_sell']]),
                    "foreign_investor_net": self._clean_numeric(row[idx['f_net']]),
                    "investment_trust_buy": self._clean_numeric(row[idx['t_buy']]),
                    "investment_trust_sell": self._clean_numeric(row[idx['t_sell']]),
                    "investment_trust_net": self._clean_numeric(row[idx['t_net']]),
                    "dealer_buy": self._clean_numeric(row[idx['d_buy']]),
                    "dealer_sell": self._clean_numeric(row[idx['d_sell']]),
                    "dealer_net": self._clean_numeric(row[idx['d_net']]),
                })
            
            logger.info(f"Successfully parsed {len(records)} TWSE records")
            return records

        except Exception as e:
            logger.error(f"TWSE Fetch Error: {e}")
            return []

    def _fetch_tpex(self, trade_date: str) -> List[Dict[str, Any]]:
        # TPEx 邏輯保持穩定，僅優化 User-Agent 與 SSL
        dt = datetime.strptime(trade_date, '%Y-%m-%d')
        minguo = f"{dt.year - 1911}/{dt.month:02d}/{dt.day:02d}"
        url = "https://www.tpex.org.tw/web/stock/aftertrading/institutional_trading/institutional_trading_result.php"
        params = {'l': 'zh-tw', 'd': minguo, 'type': 'stp', 'o': 'json'}
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

        try:
            res = requests.get(url, params=params, headers=headers, timeout=20, verify=False)
            data = res.json()
            if 'aaData' not in data: return []
            
            records = []
            for row in data['aaData']:
                records.append({
                    "stock_code": str(row[0]).strip(),
                    "trade_date": trade_date,
                    "foreign_investor_buy": self._clean_numeric(row[1]),
                    "foreign_investor_sell": self._clean_numeric(row[2]),
                    "foreign_investor_net": self._clean_numeric(row[3]),
                    "investment_trust_buy": self._clean_numeric(row[4]),
                    "investment_trust_sell": self._clean_numeric(row[5]),
                    "investment_trust_net": self._clean_numeric(row[6]),
                    "dealer_buy": self._clean_numeric(row[7]),
                    "dealer_sell": self._clean_numeric(row[8]),
                    "dealer_net": self._clean_numeric(row[9]),
                })
            return records
        except:
            return []

    def transform(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return raw_data

    def _clean_numeric(self, val) -> Optional[float]:
        if val is None or val in ['', '--', '---']: return 0.0
        try:
            return float(str(val).replace(',', ''))
        except:
            return 0.0

    def run(self, **kwargs) -> int:
        return super().run(on_conflict="stock_code,trade_date", **kwargs)
