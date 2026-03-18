import asyncio
from backend.lib.supabase_client import get_supabase

async def inspect():
    db = get_supabase()
    # Check market_quotes
    res = db.table('market_quotes').select('*').limit(1).execute()
    print("Market Quotes Columns:", res.data[0].keys() if res.data else "Empty")
    
    # Check fn_screen_stocks
    params = {
        "p_filters": {},
        "p_sort_by": "volume",
        "p_sort_order": "desc",
        "p_offset": 0,
        "p_limit": 1
    }
    rpc_res = db.rpc('fn_screen_stocks', params).execute()
    print("Screener RPC Columns:", rpc_res.data[0].keys() if rpc_res.data else "Empty")

if __name__ == "__main__":
    asyncio.run(inspect())
