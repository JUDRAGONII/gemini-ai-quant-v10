"""
銝甈⊥扳風?脫??鋆??(Backfill Script)
- NVDA: 蝢嚗 1999-01-22 (銝??? ?喃?
- 0050: ?啗 ETF嚗 2003-06-30 (?潸??? ?喃?
"""
import os
import sys
from datetime import datetime

# 蝣箔? backend 頝臬???Python Path 銝?
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from supabase import create_client
from backend.etl.market import TiingoFetcher, FugleFetcher
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def main():
    # ????Supabase Client
    supabase_url = os.getenv("SUPABASE_URL", "http://localhost:8000")
    supabase_key = os.getenv("SUPABASE_KEY") or os.getenv("SERVICE_ROLE_KEY")
    
    if not supabase_key:
        logger.error("Missing SUPABASE_KEY environment variable.")
        return
        
    client = create_client(supabase_url, supabase_key)
    logger.info("Supabase Client initialized.")
    
    # ==== 1. ?? NVDA (蝢) ====
    logger.info("=" * 50)
    logger.info("Starting NVDA backfill (US Stock via Tiingo)...")
    tiingo = TiingoFetcher(client)
    
    # NVDA ??1999-01-22 銝?
    nvda_start = "1999-01-22"
    nvda_end = datetime.now().strftime('%Y-%m-%d')
    
    try:
        raw_nvda = tiingo.fetch("NVDA", start_date=nvda_start, end_date=nvda_end)
        records_nvda = tiingo.transform(raw_nvda)
        count_nvda = tiingo.upsert(records_nvda, on_conflict='stock_code,trade_date')
        logger.info(f"[NVDA] Backfill completed: {count_nvda} records upserted.")
    except Exception as e:
        logger.error(f"[NVDA] Backfill failed: {e}")

    # ==== 2. ?? 0050 (?啗 ETF) ====
    logger.info("=" * 50)
    logger.info("Starting 0050 backfill (TW ETF via Fugle)...")
    fugle = FugleFetcher(client)
    
    # ?之?啁50 ??2003-06-30 ?潸?
    tw0050_start = "2003-06-30"
    tw0050_end = datetime.now().strftime('%Y-%m-%d')
    
    try:
        raw_0050 = fugle.fetch("0050", start_date=tw0050_start, end_date=tw0050_end)
        records_0050 = fugle.transform(raw_0050)
        count_0050 = fugle.upsert(records_0050, on_conflict='stock_code,trade_date')
        logger.info(f"[0050] Backfill completed: {count_0050} records upserted.")
    except Exception as e:
        logger.error(f"[0050] Backfill failed: {e}")

    logger.info("=" * 50)
    logger.info("Historical backfill script finished.")


if __name__ == "__main__":
    main()
