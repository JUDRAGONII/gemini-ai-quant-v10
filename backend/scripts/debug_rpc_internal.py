from backend.lib.supabase_client import get_supabase
import asyncio

async def debug_rpc():
    supabase = get_supabase()
    params = {
        "p_filters": {},
        "p_sort_by": "ai_score",
        "p_sort_order": "desc",
        "p_offset": 0,
        "p_limit": 10
    }
    print(f"Calling RPC with params: {params}")
    try:
        res = supabase.rpc("fn_screen_stocks", params).execute()
        print(f"Results Count: {len(res.data) if res.data else 0}")
        if res.data:
            print(f"Sample: {res.data[0]['stock_code']}")
        else:
            print("No data returned")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(debug_rpc())
