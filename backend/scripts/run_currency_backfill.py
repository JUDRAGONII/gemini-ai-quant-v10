import sys
import os
import logging

# 設定路徑
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
backend_path = os.path.join(project_root, "backend")
for path in [project_root, backend_path]:
    if path not in sys.path:
        sys.path.append(path)

from backend.lib.supabase_client import get_supabase
from backend.etl.currency_fetcher import CurrencyFetcher

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

def main():
    logger.info("啟動匯率歷史數據回補...")
    
    supabase = get_supabase()
    fetcher = CurrencyFetcher(supabase)
    
    # 定義關鍵匯率對
    pairs = [
        "USD/TWD", "USD/CNY", "USD/JPY", "USD/HKD", "USD/EUR",
        "CNY/TWD", "XAU/USD", "XAG/USD" # 包含黃金與白銀
    ]
    
    try:
        count = fetcher.run_backfill(pairs, start_year=1990)
        logger.info(f"匯率回補完成，總入庫筆數: {count}")
    except Exception as e:
        logger.error(f"匯率回補失敗: {e}")

if __name__ == "__main__":
    main()
