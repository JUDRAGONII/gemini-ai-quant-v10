import requests
import sys
import os

# 確保可以導入 backend
sys.path.append(os.getcwd())

from backend.lib.supabase_client import get_supabase

def verify():
    print("--- Phase 13.3 Backend Verification ---")
    
    # 1. 直接測試資料庫 (TC-1341)
    supabase = get_supabase()
    print(f"DEBUG: Supabase URL: {supabase.supabase_url}")
    print(f"DEBUG: Using Table: evolution_history")
    
    test_gen = 9994
    test_data = {
        "generation": test_gen,
        "best_genome": [0.5] * 26, # 還原數組欄位
        "avg_fitness": 0.45,
        "max_fitness": 0.55
    }

    print("Checking DB Storage (TC-1341) via Raw Requests...")
    try:
        url = "http://localhost:8000/rest/v1/evolution_history"
        headers = {
            "apikey": os.getenv("SERVICE_ROLE_KEY"),
            "Authorization": f"Bearer {os.getenv('SERVICE_ROLE_KEY')}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        }
        res = requests.post(url, headers=headers, json=test_data)
        if res.status_code in [201, 204]:
            print("  [PASS] Raw Requests POST successful.")
        else:
            print(f"  [FAIL] Raw Requests POST status {res.status_code}: {res.text}")
    except Exception as e:
        print(f"  [ERROR] Raw Requests failed: {e}")

    # 2. 測試 API 端點 (TC-1342)
    # 根據 docker-compose.yml，API 運行在 8001 端口
    print("Checking API History Endpoint (TC-1342)...")
    try:
        response = requests.get("http://localhost:8001/api/v1/evolution/history")
        if response.status_code == 200:
            data = response.json()
            print(f"  [PASS] API returned {len(data)} records.")
        else:
            print(f"  [FAIL] API returned status {response.status_code}: {response.text}")
    except Exception as e:
        print(f"  [ERROR] API call failed: {e}")

    # 清理
    supabase.table("evolution_history").delete().eq("generation", test_gen).execute()
    print("Verification completed.")

if __name__ == "__main__":
    verify()
