import sys
import os
import logging
from datetime import datetime

# 設定路徑
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
backend_path = os.path.join(project_root, "backend")
for path in [project_root, backend_path]:
    if path not in sys.path:
        sys.path.append(path)

from backend.lib.supabase_client import get_supabase
from backend.etl.hybrid_fetcher import HybridMarketFetcher

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    logger.info("啟動混合模式 (Hybrid) 歷史數據回補...")
    
    supabase = get_supabase()
    hybrid_fetcher = HybridMarketFetcher(supabase)
    
    # 定義核心回補標的 (台股大盤與領先權值股)
    # ^TWII: 台灣加權指數
    # 2330: 台積電
    # 0050: 元大台灣50
    targets = [
        {"code": "^TWII", "name": "台灣加權指數"},
        {"code": "2330", "name": "台積電"},
        {"code": "0050", "name": "元大台灣50"},
        {"code": "2317", "name": "鴻海"},
        {"code": "2454", "name": "聯發科"}
    ]
    
    start_year = 1990
    
    for target in targets:
        logger.info(f"===> 開始回補: {target['name']} ({target['code']}) 自 {start_year} 年 ==")
        try:
            count = hybrid_fetcher.run_backfill(target['code'], start_year=start_year)
            logger.info(f"===> {target['code']} 回補完成，入庫筆數: {count}")
        except Exception as e:
            logger.error(f"回補 {target['code']} 失敗: {e}")

if __name__ == "__main__":
    main()
