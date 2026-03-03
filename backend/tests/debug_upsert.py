import sys
import os
import json

# 確保可以導入 backend
sys.path.append(os.getcwd())

from backend.lib.supabase_client import get_supabase

def debug_upsert():
    supabase = get_supabase()
    test_data = {
        "generation": 9991,
        "best_genome": [0.5] * 26,
        "avg_fitness": 0.45,
        "max_fitness": 0.55
    }
    
    print("Testing upsert...")
    try:
        # 顯式指定 on_conflict
        res = supabase.table("evolution_history").upsert(test_data, on_conflict="generation").execute()
        print(f"Success! Data: {res.data}")
    except Exception as e:
        print(f"Caught error: {type(e).__name__}")
        print(f"Error message: {e}")
        # 如果有 response 屬性就印出來
        if hasattr(e, 'response'):
            print(f"Response status: {e.response.status_code}")
            print(f"Response text: {e.response.text}")

if __name__ == "__main__":
    debug_upsert()
