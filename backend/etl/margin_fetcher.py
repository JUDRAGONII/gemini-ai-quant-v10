import logging
import requests
import time
import json
import urllib3
from typing import List, Dict, Any, Optional
from datetime import datetime
from .base_fetcher import BaseFetcher

# 禁用 SSL 警告
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

logger = logging.getLogger(__name__)


class MarginFetcher(BaseFetcher):
    """
    融資融券數據擷取器 (V10.2 Precision Fix)
    修正：使用穩定端點與動態欄位解析
    """

    def __init__(self, client):
        super().__init__(client, "stock_margin")
        self.twse_url = "https://www.twse.com.tw/exchangeReport/MI_MARGN"
        self.tpex_url = "https://www.tpex.org.tw/web/stock/aftertrading/margin_trading/margin_trading_result.php"

    def fetch(self, **kwargs) -> List[Dict[str, Any]]:
        trade_date = kwargs.get('trade_date', datetime.now().strftime('%Y-%m-%d'))
        
        # 週末不請求
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
            logger.warning(f"TPEx Margin fetch failed: {e}")

        return all_data

    def _fetch_twse(self, trade_date: str) -> List[Dict[str, Any]]:
        twse_date = trade_date.replace('-', '')
        params = {
            'response': 'json',
            'date': twse_date,
            'selectType': 'ALL'
        }
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.0.0 Safari/537.36"}

        try:
            logger.info(f"Fetching TWSE Margin for {trade_date}")
            res = requests.get(self.twse_url, params=params, headers=headers, timeout=25, verify=False)
            data = res.json()
            
            if data.get('stat') != 'OK' or 'tables' not in data:
                return []

            # 融資融券明細通常在 tables[1]
            table = None
            if len(data['tables']) > 1:
                table = data['tables'][1]
            else:
                table = next((t for t in data['tables'] if '融資融券' in t.get('title', '')), data['tables'][0])
            
            if not table: return []

            fields = table.get('fields', [])
            idx = {
                'code': next((i for i, f in enumerate(fields) if '證券代號' in f or '股票代號' in f), 0),
                'm_buy': next((i for i, f in enumerate(fields) if '融資' in f and '買進' in f), 2),
                'm_sell': next((i for i, f in enumerate(fields) if '融資' in f and '賣出' in f), 3),
                'm_bal': next((i for i, f in enumerate(fields) if '融資' in f and '今日餘額' in f), 6),
                's_buy': next((i for i, f in enumerate(fields) if '融券' in f and '買進' in f), 8),
                's_sell': next((i for i, f in enumerate(fields) if '融券' in f and '賣出' in f), 9),
                's_bal': next((i for i, f in enumerate(fields) if '融券' in f and '今日餘額' in f), 12),
            }

            records = []
            for row in table['data']:
                stock_code = str(row[idx['code']]).strip()
                if not stock_code or len(stock_code) > 6: continue
                
                m_buy = self._clean_numeric(row[idx['m_buy']])
                m_sell = self._clean_numeric(row[idx['m_sell']])
                s_buy = self._clean_numeric(row[idx['s_buy']])
                s_sell = self._clean_numeric(row[idx['s_sell']])
                
                records.append({
                    "stock_code": stock_code,
                    "trade_date": trade_date,
                    "margin_balance": self._clean_numeric(row[idx['m_bal']]),
                    "margin_buy": m_buy,
                    "margin_sell": m_sell,
                    "margin_net": m_buy - m_sell,
                    "short_balance": self._clean_numeric(row[idx['s_bal']]),
                    "short_buy": s_buy,
                    "short_sell": s_sell,
                    "short_net": s_buy - s_sell,
                    "margin_rate": 0.0 # 若需融資成數可從其他表獲取
                })
            
            logger.info(f"Successfully parsed {len(records)} TWSE Margin records")
            return records
        except Exception as e:
            logger.error(f"TWSE Margin Error: {e}")
            return []

    def _fetch_tpex(self, trade_date: str) -> List[Dict[str, Any]]:
        dt = datetime.strptime(trade_date, '%Y-%m-%d')
        minguo = f"{dt.year - 1911}/{dt.month:02d}/{dt.day:02d}"
        params = {'l': 'zh-tw', 'd': minguo, 'o': 'json'}
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

        try:
            res = requests.get(self.tpex_url, params=params, headers=headers, timeout=20, verify=False)
            data = res.json()
            if 'aaData' not in data: return []
            
            records = []
            for row in data['aaData']:
                m_buy = self._clean_numeric(row[2])
                m_sell = self._clean_numeric(row[3])
                s_buy = self._clean_numeric(row[8])
                s_sell = self._clean_numeric(row[9])
                
                records.append({
                    "stock_code": str(row[0]).strip(),
                    "trade_date": trade_date,
                    "margin_balance": self._clean_numeric(row[6]),
                    "margin_buy": m_buy,
                    "margin_sell": m_sell,
                    "margin_net": m_buy - m_sell,
                    "short_balance": self._clean_numeric(row[12]),
                    "short_buy": s_buy,
                    "short_sell": s_sell,
                    "short_net": s_buy - s_sell,
                    "margin_rate": 0.0
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
