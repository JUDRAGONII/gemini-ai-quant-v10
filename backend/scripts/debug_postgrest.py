from datetime import datetime
import os
import sys

# Add root to sys.path
sys.path.append(os.getcwd())

from backend.lib.supabase_client import get_supabase

def test_upsert():
    db = get_supabase()
    
    # 1. Test existing columns only
    payload_basic = {
        'stock_code': 'DEBUG001',
        'trade_date': datetime.now().strftime('%Y-%m-%d'),
        'pe_ratio': 10.5
    }
    
    print("Attempting to upsert BASIC payload...")
    try:
        res = db.table('stock_factors').upsert(payload_basic).execute()
        print("BASIC Success:", res.data)
    except Exception as e:
        print("BASIC Failed:", e)
        
    # 2. Test with factors_all
    payload_full = {
        'stock_code': 'DEBUG001',
        'trade_date': datetime.now().strftime('%Y-%m-%d'),
        'pe_ratio': 10.5,
        'factors_all': {'test': 123}
    }
    
    print("\nAttempting to upsert FULL payload (with factors_all) AND on_conflict...")
    try:
        res = db.table('stock_factors').upsert(payload_full, on_conflict='stock_code, trade_date').execute()
        print("FULL Success:", res.data)
    except Exception as e:
        print("FULL Failed:", e)

if __name__ == "__main__":
    test_upsert()
