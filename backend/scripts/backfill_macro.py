import sys
import os

# Add parent directory to path to allow importing modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from etl.macro import MacroFetcher
import logging

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    logger.info("Starting Macro Data Backfill Task...")
    
    # Initialize Fetcher (API Key loaded from config inside class)
    # Using None for client as BaseFetcher handles it or we rely on upsert via rest (or need to mock client if used)
    # The current BaseFetcher uses self.client which is supabase client. 
    # We need to initialize it properly.
    
    from lib.supabase_client import get_supabase
    supabase = get_supabase()
    
    fetcher = MacroFetcher(client=supabase)
    
    # Run backfill for last 35 years (approx covering 1990+)
    # 35 * 365 = 12775 days
    days = 13000
    
    logger.info(f"Backfilling macro data for {days} days...")
    count = fetcher.run_all(lookback_days=days)
    
    logger.info(f"Backfill Completed. Total records processed: {count}")

if __name__ == "__main__":
    main()
