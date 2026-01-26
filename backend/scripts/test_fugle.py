import sys
import os
import argparse
import logging
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from etl.market import FugleFetcher
from lib.supabase_client import get_supabase

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    parser = argparse.ArgumentParser(description="Test Fugle Fetcher")
    parser.add_argument("--ticker", type=str, default="2330", help="Stock ID")
    parser.add_argument("--timeframe", type=str, default="5m", choices=['1m', '5m', 'D1'], help="Timeframe")
    args = parser.parse_args()

    logger.info(f"Testing Fugle Fetcher for {args.ticker} ({args.timeframe})...")
    
    # Initialize
    client = get_supabase()
    # Check if FUGLE_API_KEY_1 is loaded
    if not os.getenv("FUGLE_API_KEY_1"):
        logger.error("FUGLE_API_KEY_1 not found in env!")
        return

    # Pass specific key to override default if needed, or rely on internal logic
    fetcher = FugleFetcher(client, api_key=os.getenv("FUGLE_API_KEY_1"))
    
    # Execute Run
    # Run will: Fetch -> Transform -> Upsert (to intraday_candles or daily_price)
    count = fetcher.run(ticker=args.ticker, timeframe=args.timeframe)
    
    if count > 0:
        logger.info(f"✅ Success! Upserted {count} records.")
        
        # Verify specific record
        if args.timeframe != 'D1':
            latest = client.table("intraday_candles")\
                .select("*")\
                .eq("stock_code", args.ticker)\
                .order("ts", desc=True)\
                .limit(1)\
                .execute()
            if latest.data:
                logger.info(f"Latest Record: {latest.data[0]}")
    else:
        logger.warning("⚠️ No records upserted. Check API Quota or Market Hours.")

if __name__ == "__main__":
    main()
