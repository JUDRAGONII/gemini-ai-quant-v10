import os
import sys
import logging
import requests
import pandas as pd
import time

# 設定 Python 路徑
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
backend_path = os.path.join(project_root, "backend")
for path in [project_root, backend_path]:
    if path not in sys.path:
        sys.path.append(path)

from backend.lib.supabase_client import get_supabase
from backend.etl.tw_official import TwseFetcher

# 設定日誌
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)

def fetch_otc_stocks():
    """從 TPEx 獲取上櫃股票清單 (包含更多關鍵資訊)"""
    url = "https://www.tpex.org.tw/web/stock/aftertrading/otc_quotes_no1430/stk_quotes_result.php?l=zh-tw&o=json"
    try:
        logger.info(f"正在從 TPEx 獲取上櫃清單: {url}")
        resp = requests.get(url, timeout=15)
        data = resp.json()
        if 'aaData' not in data:
            return []
        
        records = []
        for row in data['aaData']:
            # row[0]: 代號, row[1]: 名稱
            symbol = row[0].strip()
            name = row[1].strip()
            # 過濾認購售權證等 (通常代號長度為 6 且包含英文字母或特定編號)
            if len(symbol) == 4 and symbol.isdigit():
                records.append({
                    "stock_code": symbol,
                    "stock_name": name,
                    "market_type": "TW",
                    "priority": 2,
                    "is_active": True
                })
            elif len(symbol) == 5 and symbol.isdigit(): # 持續關注 ETF (如 00937B 型態)
                 records.append({
                    "stock_code": symbol,
                    "stock_name": name,
                    "market_type": "TW",
                    "priority": 2,
                    "is_active": True
                })
        return records
    except Exception as e:
        logger.error(f"獲取 OTC 失敗: {e}")
        return []

def get_us_constituents():
    """定義美股主要指數成分股 (更新至 2026 常用熱門標的)"""
    constituents = {
        "Mag7": ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "NVDA", "TSLA"],
        "Semis": ["TSM", "AMD", "AVGO", "INTC", "ASML", "AMAT", "MU", "QCOM", "TXN", "LRCX", "ADI"],
        "Financials": ["JPM", "BAC", "GS", "MS", "V", "MA", "AXP", "PYPL"],
        "Healthcare": ["LLY", "UNH", "JNJ", "PFE", "ABBV", "AMGN"],
        "Others": ["BRK-B", "WMT", "COST", "PG", "DIS", "NFLX", "NKE", "SBUX", "ORCL", "CRM", "IBM"]
    }
    
    unique_symbols = set()
    for category, syms in constituents.items():
        for s in syms:
            unique_symbols.add(s)
            
    records = []
    for symbol in unique_symbols:
        # 標記高優先權
        priority = 1 if symbol in ["AAPL", "MSFT", "NVDA", "TSLA", "TSM", "BRK-B"] else 2
        records.append({
            "stock_code": symbol,
            "stock_name": f"US Stock: {symbol}",
            "market_type": "US",
            "priority": priority,
            "is_active": True
        })
    return records

def get_us_indices():
    """獲取常用美股指數 ETF"""
    indices = [
        {"stock_code": "DIA", "stock_name": "道瓊工業指數 ETF (DIA)", "priority": 1},
        {"stock_code": "SPY", "stock_name": "標普500指數 ETF (SPY)", "priority": 1},
        {"stock_code": "QQQ", "stock_name": "納斯達克100指數 ETF (QQQ)", "priority": 1},
        {"stock_code": "SOXX", "stock_name": "費城半導體指數 ETF (SOXX)", "priority": 1},
        {"stock_code": "VTI", "stock_name": "全美股市指數 ETF (VTI)", "priority": 1},
        {"stock_code": "TLT", "stock_name": "20年期以上公債 ETF (TLT)", "priority": 1},
    ]
    for item in indices:
        item["market_type"] = "US"
        item["is_active"] = True
    return indices

def init_stocks():
    supabase = get_supabase()
    fetcher = TwseFetcher(supabase)
    
    all_records = []

    # 1. 獲取台股上市
    logger.info("正在從 TWSE 獲取上市清單...")
    try:
        # 嘗試從多個端點獲取以確保完整性
        df_twse = fetcher.fetch(report_type='BWIBBU_ALL')
        if not df_twse.empty:
            for _, row in df_twse.iterrows():
                symbol = str(row['stock_code']).strip()
                # 只保留普通股與常見 ETF
                if (len(symbol) == 4 and symbol.isdigit()) or (len(symbol) == 5 and symbol.isdigit()) or (len(symbol) == 6 and symbol.isdigit()):
                    priority = 1 if symbol in ['2330', '2317', '2454', '0050', '0056'] else 2
                    all_records.append({
                        "stock_code": symbol,
                        "stock_name": str(row['stock_name']).strip(),
                        "market_type": "TW",
                        "priority": priority,
                        "is_active": True
                    })
    except Exception as e:
        logger.error(f"獲取 TWSE 失敗: {e}")

    # 2. 獲取台股上櫃
    otc_records = fetch_otc_stocks()
    all_records.extend(otc_records)

    # 3. 獲取美股標的
    all_records.extend(get_us_indices())
    all_records.extend(get_us_constituents())

    # 4. 獲取期貨與大盤指數標的
    futures = [
        {"stock_code": "^TWII", "stock_name": "台灣加權指數", "market_type": "TW", "priority": 1, "is_active": True},
        {"stock_code": "^TWOII", "stock_name": "台灣上櫃指數", "market_type": "TW", "priority": 1, "is_active": True},
        {"stock_code": "TX", "stock_name": "台指期", "market_type": "Taifex", "priority": 1, "is_active": True},
        {"stock_code": "MTX", "stock_name": "小台指", "market_type": "Taifex", "priority": 1, "is_active": True},
        # 增加美股主要指數
        {"stock_code": "^GSPC", "stock_name": "S&P 500 Index", "market_type": "US", "priority": 1, "is_active": True},
        {"stock_code": "^IXIC", "stock_name": "Nasdaq Composite", "market_type": "US", "priority": 1, "is_active": True},
        {"stock_code": "^DJI", "stock_name": "Dow Jones Industrial Average", "market_type": "US", "priority": 1, "is_active": True},
        {"stock_code": "^SOX", "stock_name": "PHLX Semiconductor Index", "market_type": "US", "priority": 1, "is_active": True},
    ]
    all_records.extend(futures)

    if all_records:
        logger.info(f"準備寫入 {len(all_records)} 筆標的主檔...")
        try:
            # 去重處理 (以 stock_code 為主)
            unique_records = {r['stock_code']: r for r in all_records}.values()
            
            batch_size = 500
            for i in range(0, len(unique_records), batch_size):
                batch = list(unique_records)[i:i+batch_size]
                supabase.from_('stocks').upsert(batch, on_conflict='stock_code').execute()
            logger.info(f"全市場標的主檔初始化完成，共寫入 {len(unique_records)} 筆。")
        except Exception as e:
            logger.error(f"寫入資料庫失敗: {e}")

if __name__ == "__main__":
    init_stocks()
