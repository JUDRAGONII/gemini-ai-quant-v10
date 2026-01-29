import os
import sys
sys.path.append('backend')
from lib.supabase_client import get_supabase

def check_tables():
    sb = get_supabase()
    tables = [
        'portfolio_performance', 
        'stock_institutional', 
        'stock_margin', 
        'intraday_candles', 
        'economic_calendar'
    ]
    print(f"{'Table Name':<25} | {'Status':<10}")
    print("-" * 40)
    for t in tables:
        try:
            # Using a simple Select 1 or Limit 0 query
            sb.table(t).select('id').limit(1).execute()
            print(f"{t:<25} | OK")
        except Exception as e:
            print(f"{t:<25} | Failed ({str(e)})")

if __name__ == "__main__":
    check_tables()
