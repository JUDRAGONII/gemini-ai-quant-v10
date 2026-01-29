from datetime import datetime, timedelta
import pandas as pd
import requests
import time
import logging
from typing import List, Dict, Any, Optional
from .base_fetcher import BaseFetcher

logger = logging.getLogger(__name__)

class TwseFetcher(BaseFetcher):
    """
    台灣證券交易所 (TWSE) 官方數據擷取器
    
    主要用途:
    1. 抓取本益比 (PE)、股價淨值比 (PB)、殖利率 (Yield) -> stock_factors
    2. 抓取每日收盤行情 (Stock Day) -> daily_price (可作為校驗)
    
    API 來源:
    - BWIBBU_ALL (個股日本益比、殖利率及股價淨值比): https://www.twse.com.tw/exchangeReport/BWIBBU_ALL?response=json
    """

    def __init__(self, client):
        super().__init__(client, "stock_factors")
        self.base_url = "https://www.twse.com.tw/exchangeReport"
    
    def fetch(self, **kwargs) -> pd.DataFrame:
        """
        獲取 TWSE 數據
        kwargs:
            report_type (str): 'BWIBBU_ALL' (本益比)
        """
        report_type = kwargs.get('report_type', 'BWIBBU_ALL')
        
        if report_type == 'BWIBBU_ALL':
            url = f"{self.base_url}/BWIBBU_ALL?response=json"
            try:
                # TWSE 建議不要太頻繁請求
                time.sleep(2) 
                logger.info(f"Requesting TWSE API: {url}")
                
                # Header 模擬瀏覽器，避免被擋
                headers = {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
                }
                
                resp = requests.get(url, headers=headers, timeout=10, verify=False)
                if resp.status_code != 200:
                    logger.error(f"TWSE API Error: {resp.status_code}")
                    return pd.DataFrame()
                
                data = resp.json()
                if 'data' not in data:
                    logger.warning(f"No data returned from TWSE: {data}")
                    return pd.DataFrame()
                
                # 轉為 DataFrame
                # TWSE BWIBBU_ALL Columns (Dynamic): 
                # Observed: 證券代號, 證券名稱, 本益比, 殖利率(%), 股價淨值比
                # Sample: ['1101', '台泥', '-', '3.89', '0.88']
                columns = ['stock_code', 'stock_name', 'pe_ratio', 'yield', 'pb_ratio']
                df = pd.DataFrame(data['data'], columns=columns)
                
                return df
                
            except Exception as e:
                logger.error(f"Error fetching TWSE data: {e}")
                return pd.DataFrame()
        
        return pd.DataFrame()

    def transform(self, raw_data: pd.DataFrame, **kwargs) -> List[Dict[str, Any]]:
        """轉換為 stock_factors"""
        if raw_data.empty:
            return []
            
        records = []
        today_str = datetime.now().strftime('%Y-%m-%d')
        # 如果是歷史回補，應該傳入 exact date，但 BWIBBU_ALL 只有當日最新
        # 若要回補歷史，TWSE API 需帶 date 參數: &date=20240101 (需要確認 BWIBBU_ALL 是否支援 date)
        # 經查 BWIBBU_ALL 不支援 date 參數，只有當日。
        # 若要歷史 PE，需使用 individual stock API 或其他 report。
        # 暫時假設此 fetcher 用於 capture "當日" 數據。
        
        for _, row in raw_data.iterrows():
            try:
                code = row['stock_code'].strip()
                pe = self._clean_numeric(row['pe_ratio'])
                pb = self._clean_numeric(row['pb_ratio'])
                dy = self._clean_numeric(row['yield'])
                
                if pe is None and pb is None:
                    continue
                    
                records.append({
                    "stock_code": code, # 注意: DB schema 欄位是 stock_id 還是 ticker? (V10: 對齊 schema 為 stock_code)
                    "trade_date": today_str,
                    "pe_ratio": pe,
                    "pb_ratio": pb,
                    "dividend_yield": dy,
                    "source": "TWSE"
                })
            except Exception as e:
                continue
                
        return records

    def _clean_numeric(self, val):
        """清洗 TWSE 數值格式 (含 '-' 或 ',')"""
        if not val or val == '-':
            return None
        try:
            return float(val.replace(',', ''))
        except:
            return None
