import sys
import os
import argparse
import logging
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.etl.tw_official import TwseFetcher
from backend.lib.supabase_client import get_supabase

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    logger.info(f"Testing TWSE Fetcher for BWIBBU_ALL (PE/PB/Yield)...")
    
    # Initialize
    client = get_supabase()
    fetcher = TwseFetcher(client)
    
    # Execute Run
    # Fetcher automatically fetches today's report
    count = fetcher.run()
    
    if count > 0:
        logger.info(f"??Success! Upserted {count} records into stock_factors.")
        
        # Verify TSMC (2330)
        latest = client.table("stock_factors")\
            .select("*")\
            .eq("stock_id", "2330")\
            .order("date", desc=True)\
            .limit(1)\
            .execute()
            
        if latest.data:
            logger.info(f"TSMC (2330) Factor: {latest.data[0]}")
    else:
        logger.warning("?? No records upserted. Possibly market closed or API rate limit.")

if __name__ == "__main__":
    main()
