import sys
import os
import logging

# 設定路徑
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
backend_path = os.path.join(project_root, "backend")
for path in [project_root, backend_path]:
    if path not in sys.path:
        sys.path.append(path)

from backend.etl.currency_fetcher import CurrencyFetcher
from backend.lib.supabase_client import get_supabase

# 設定日誌
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    logger.info("啟動匯率數據回補任務 (Currency Backfill)...")
    
    try:
        supabase = get_supabase()
        fetcher = CurrencyFetcher(client=supabase)
        
        pairs = ["USD/TWD", "USD/CNY", "CNY/TWD"]
        logger.info(f"正在回補匯率對: {pairs}")
        
        count = fetcher.run_backfill(pairs, start_year=1990)
        logger.info(f"匯率回補完成。總計處理筆數: {count}")
    except Exception as e:
        logger.error(f"匯率回補失敗: {e}", exc_info=True)

if __name__ == "__main__":
    main()
