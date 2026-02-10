import logging
import sys
import os
import argparse
from datetime import datetime, timedelta

# 設定路徑
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.append(project_root)

from backend.lib.supabase_client import get_supabase
from backend.etl.institutional_fetcher import InstitutionalFetcher
from backend.etl.margin_fetcher import MarginFetcher

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def backfill_chips(start_year: int, target_symbols: list = None):
    supabase = get_supabase()
    inst_fetcher = InstitutionalFetcher(supabase)
    margin_fetcher = MarginFetcher(supabase)
    
    start_date = datetime(start_year, 1, 1)
    end_date = datetime.now()
    
    current_date = start_date
    while current_date <= end_date:
        if current_date.weekday() < 5:  # 僅週一至週五
            date_str = current_date.strftime('%Y-%m-%d')
            logger.info(f"=== Backfilling Chips for {date_str} ===")
            
            try:
                # 1. 三大法人
                inst_count = inst_fetcher.run(trade_date=date_str)
                logger.info(f"Institutional records: {inst_count}")
                
                # 2. 融資融券
                margin_count = margin_fetcher.run(trade_date=date_str)
                logger.info(f"Margin records: {margin_count}")
                
                # 適度延時避免被封
                import time
                time.sleep(2)
            except Exception as e:
                logger.error(f"Error on {date_str}: {e}")
                
        current_date += timedelta(days=1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Chip Data Backfill Script')
    parser.add_argument('--year', type=int, default=2024, help='Start year for backfill')
    args = parser.parse_args()
    
    logger.info(f"🚀 Starting Chip Backfill from {args.year}")
    backfill_chips(args.year)
