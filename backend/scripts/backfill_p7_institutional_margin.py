import os
import sys
import logging
from datetime import datetime, timedelta
from supabase import create_client

# 加入父目錄到 Python Path 以便匯入 etl 模組
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from etl.institutional_fetcher import InstitutionalFetcher
from etl.margin_fetcher import MarginFetcher
from lib.config import Config

# 設定 Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("backfill_p7.log", encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("BackfillP7")

def run_backfill(start_date: str, end_date: str):
    """
    執行三大法人與融資券數據回補
    """
    try:
        client = create_client(Config.SUPABASE_URL, Config.SERVICE_ROLE_KEY)
        inst_fetcher = InstitutionalFetcher(client)
        margin_fetcher = MarginFetcher(client)
        
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
        
        current = start
        total_days = (end - start).days + 1
        processed = 0
        
        logger.info(f"🚀 開始回補任務: {start_date} ~ {end_date} (共 {total_days} 天)")
        
        while current <= end:
            date_str = current.strftime('%Y-%m-%d')
            processed += 1
            progress = (processed / total_days) * 100
            
            logger.info(f"[{processed}/{total_days}] ({progress:.1f}%) 處理日期: {date_str}")
            
            # 1. 回補三大法人
            try:
                inst_count = inst_fetcher.run(trade_date=date_str)
                logger.info(f"   - 三大法人: {inst_count} 筆")
            except Exception as e:
                logger.error(f"   ❌ 三大法人回補失敗 ({date_str}): {e}")
            
            # 2. 回補融資融券
            try:
                margin_count = margin_fetcher.run(trade_date=date_str)
                logger.info(f"   - 融資融券: {margin_count} 筆")
            except Exception as e:
                logger.error(f"   ❌ 融資融券回補失敗 ({date_str}): {e}")
            
            # 休息避免被鎖 IP
            if processed % 5 == 0:
                logger.info("⏸️ 休息 5 秒...")
                import time
                time.sleep(5)
            else:
                import time
                time.sleep(1.5)
                
            current += timedelta(days=1)
            
        logger.info("✅ 回補任務完成！")
        
    except Exception as e:
        logger.error(f"🔥 任務中斷: {e}")

if __name__ == "__main__":
    # 預設回補最近一年
    default_end = datetime.now().strftime('%Y-%m-%d')
    default_start = (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d')
    
    # 可從命令列接收參數: python scripts/backfill_p7_institutional_margin.py 2024-01-01 2026-01-28
    s_date = sys.argv[1] if len(sys.argv) > 1 else default_start
    e_date = sys.argv[2] if len(sys.argv) > 2 else default_end
    
    run_backfill(s_date, e_date)
