import requests
import json

BASE_URL = "http://localhost:8001/api/v1"

def test_rpc_counts():
    print("--- 測試 RPC get_category_counts ---")
    # 直接透過 PostgreSQL 驗證 (模擬 RPC 調用)
    import subprocess
    cmd = 'docker exec -i supabase-db psql -U postgres -d postgres -c "SELECT * FROM get_category_counts();"'
    result = subprocess.check_output(cmd, shell=True).decode()
    print(result)
    assert "fx" in result
    assert "economic_calendar" in result

def test_macro_api():
    print("--- 測試 Macro Indicators API ---")
    response = requests.get(f"{BASE_URL}/macro/indicators")
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Count: {len(data)}")
    assert response.status_code == 200
    assert len(data) > 0

def test_calendar_api():
    print("--- 測試 Economic Calendar API ---")
    response = requests.get(f"{BASE_URL}/macro/calendar")
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Count: {len(data)}")
    assert response.status_code == 200

if __name__ == "__main__":
    try:
        test_rpc_counts()
        test_macro_api()
        test_calendar_api()
        print("\n✅ 所有背後數據通路驗證通過！")
    except Exception as e:
        print(f"\n❌ 驗證失敗: {e}")
