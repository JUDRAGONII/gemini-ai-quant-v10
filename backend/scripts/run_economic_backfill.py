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
from backend.etl.economic_event_fetcher import EconomicEventFetcher

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

def main():
    logger.info("啟動經濟日曆數據同步 (Economic Calendar Sync)...")
    
    supabase = get_supabase()
    fetcher = EconomicEventFetcher(supabase)
    
    try:
        # 同步未來 14 天的事件
        count = fetcher.run(days=14)
        logger.info(f"經濟日曆同步完成，入庫筆數: {count}")
    except Exception as e:
        logger.error(f"經濟日曆同步失敗: {e}")

if __name__ == "__main__":
    main()
