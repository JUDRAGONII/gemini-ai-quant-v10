import sys
import os

# 將專案根目錄與 backend 目錄加入路徑
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
backend_path = os.path.join(project_root, "backend")
for path in [project_root, backend_path]:
    if path not in sys.path:
        sys.path.append(path)

from backend.etl.macro import MacroFetcher
from backend.lib.supabase_client import get_supabase
import logging

# 設定日誌
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    logger.info("啟動宏觀數據回補任務 (Macro Data Backfill)...")
    
    supabase = get_supabase()
    fetcher = MacroFetcher(client=supabase)
    
    # 回補過去 35 年的數據 (涵蓋 1990+)
    days = 13000
    
    logger.info(f"正在回補過去 {days} 天的宏觀數據...")
    try:
        count = fetcher.run_all(lookback_days=days)
        logger.info(f"回補完成。總計處理筆數: {count}")
    except Exception as e:
        logger.error(f"宏觀回補失敗: {e}")

if __name__ == "__main__":
    main()
