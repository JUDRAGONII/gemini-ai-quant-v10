import os
import sys
from dotenv import load_dotenv

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
backend_path = os.path.join(project_root, "backend")
sys.path.append(backend_path)
load_dotenv(os.path.join(project_root, ".env"))

from backend.lib.supabase_client import get_supabase

def check_stock(symbol):
    supabase = get_supabase()
    # 瑼Ｘ stocks 銵?
    res = supabase.from_('stocks').select('*').eq('symbol', symbol).execute()
    print(f"--- {symbol} ---")
    print(f"Stocks count: {len(res.data)}")
    
    # 瑼Ｘ daily_price 銵?
    res_price = supabase.from_('daily_price').select('count', count='exact').eq('stock_code', symbol).execute()
    print(f"Price count: {res_price.count}")

    # 瑼Ｘ stock_factors 銵?
    res_factors = supabase.from_('stock_factors').select('count', count='exact').eq('stock_code', symbol).execute()
    print(f"Factor count: {res_factors.count}")

if __name__ == "__main__":
    for s in ["2330", "NVDA", "2330.TW"]:
        check_stock(s)
