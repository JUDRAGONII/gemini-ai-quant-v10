import os
import sys
import logging
from datetime import datetime, timedelta
from supabase import create_client

# ??嗥? Python Path 隞乩噶?臬 etl 璅∠?
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.etl.institutional_fetcher import InstitutionalFetcher
from backend.etl.margin_fetcher import MarginFetcher
from backend.lib.config import Config

# 閮剖? Logging
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
    ?瑁?銝之瘜犖??鞈?豢???
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
        
        logger.info(f"?? ????隞餃?: {start_date} ~ {end_date} (??{total_days} 憭?")
        
        while current <= end:
            date_str = current.strftime('%Y-%m-%d')
            processed += 1
            progress = (processed / total_days) * 100
            
            logger.info(f"[{processed}/{total_days}] ({progress:.1f}%) ???交?: {date_str}")
            
            # 1. ??銝之瘜犖
            try:
                inst_count = inst_fetcher.run(trade_date=date_str)
                logger.info(f"   - 銝之瘜犖: {inst_count} 蝑?)
            except Exception as e:
                logger.error(f"   ??銝之瘜犖??憭望? ({date_str}): {e}")
            
            # 2. ?????
            try:
                margin_count = margin_fetcher.run(trade_date=date_str)
                logger.info(f"   - ???: {margin_count} 蝑?)
            except Exception as e:
                logger.error(f"   ???????憭望? ({date_str}): {e}")
            
            # 隡?踹?鋡恍? IP
            if processed % 5 == 0:
                logger.info("?賂? 隡 5 蝘?..")
                import time
                time.sleep(5)
            else:
                import time
                time.sleep(1.5)
                
            current += timedelta(days=1)
            
        logger.info("????隞餃?摰?嚗?)
        
    except Exception as e:
        logger.error(f"? 隞餃?銝剜: {e}")

if __name__ == "__main__":
    # ?身???餈?撟?
    default_end = datetime.now().strftime('%Y-%m-%d')
    default_start = (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d')
    
    # ?臬??賭誘??嗅??? python scripts/backfill_p7_institutional_margin.py 2024-01-01 2026-01-28
    s_date = sys.argv[1] if len(sys.argv) > 1 else default_start
    e_date = sys.argv[2] if len(sys.argv) > 2 else default_end
    
    run_backfill(s_date, e_date)
