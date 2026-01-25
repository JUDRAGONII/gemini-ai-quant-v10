import os
import sys
import logging
import requests
import pandas as pd

# 設定 Python 路徑
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if project_root not in sys.path:
    sys.path.append(project_root)

from backend.lib.supabase_client import get_supabase
from backend.etl.tw_official import TwseFetcher

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fetch_otc_stocks():
    """從 TPEx 抓取上櫃標的清單"""
    url = "https://www.tpex.org.tw/web/stock/aftertrading/otc_quotes_no1430/stk_quotes_result.php?l=zh-tw&o=json"
    try:
        logger.info(f"正在從 TPEx 抓取上櫃清單: {url}")
        resp = requests.get(url, timeout=10)
        data = resp.json()
        if 'aaData' not in data:
            return []
        
        records = []
        for row in data['aaData']:
            # row[0]: 代號, row[1]: 名稱
            symbol = row[0].strip()
            name = row[1].strip()
            if len(symbol) in [4, 5, 6]:
                records.append({
                    "symbol": symbol,
                    "name": name,
                    "market": "TW",
                    "priority": 2, # 上櫃預設優先序
                    "is_active": True
                })
        return records
    except Exception as e:
        logger.error(f"抓取 OTC 失敗: {e}")
        return []

def get_us_indices():
    """定義核心美股指數對應 ETF"""
    indices = [
        {"symbol": "DIA", "name": "道瓊工業指數 ETF (DIA)", "priority": 1},
        {"symbol": "SPY", "name": "標普500指數 ETF (SPY)", "priority": 1},
        {"symbol": "QQQ", "name": "那斯達克100指數 ETF (QQQ)", "priority": 1},
        {"symbol": "SOXX", "name": "費城半導體指數 ETF (SOXX)", "priority": 1},
    ]
    for item in indices:
        item["market"] = "US"
        item["is_active"] = True
    return indices

def init_stocks():
    supabase = get_supabase()
    fetcher = TwseFetcher(supabase)
    
    all_records = []

    # 1. 抓取台股上市
    logger.info("🎬 正在從 TWSE 抓取上市清單...")
    df_twse = fetcher.fetch(report_type='BWIBBU_ALL')
    if not df_twse.empty:
        for _, row in df_twse.iterrows():
            symbol = row['stock_code'].strip()
            if len(symbol) in [4, 5, 6]:
                # 權值股優先序提高 (範例: 2330, 2317)
                priority = 1 if symbol in ['2330', '2317', '2454', '0050', '0056'] else 2
                all_records.append({
                    "symbol": symbol,
                    "name": row['stock_name'].strip(),
                    "market": "TW",
                    "priority": priority,
                    "is_active": True
                })

    # 2. 抓取台股上櫃
    otc_records = fetch_otc_stocks()
    all_records.extend(otc_records)

    # 3. 注入美股核心指數
    us_records = get_us_indices()
    all_records.extend(us_records)

    if all_records:
        logger.info(f"🚀 正在將 {len(all_records)} 檔標的存入資料庫 (台股上市櫃 + 美股指數)...")
        try:
            # 由於筆數較多，分批處裡以防超時
            batch_size = 500
            for i in range(0, len(all_records), batch_size):
                batch = all_records[i:i+batch_size]
                supabase.from_('stocks').upsert(batch, on_conflict='symbol').execute()
            logger.info("✅ 標的清單初始化完成。")
        except Exception as e:
            logger.error(f"❌ 存入資料庫失敗: {e}")

if __name__ == "__main__":
    init_stocks()
