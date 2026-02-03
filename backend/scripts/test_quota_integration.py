"""
Test Quota Integration - 驗證配額追蹤是否生效
"""
import sys
import os
import asyncio
from backend.lib.supabase_client import get_supabase
from backend.etl.market import TiingoFetcher, FugleFetcher
from backend.etl.macro import MacroFetcher
from backend.services.quota_service import QuotaService

async def test_quota_tracking():
    client = get_supabase()
    quota_service = QuotaService()
    
    print("\n[Test] Checking Redis Connection...")
    if quota_service.redis:
        print(f"✅ Redis Connected: {quota_service.redis.ping()}")
    else:
        print("❌ Redis NOT Connected")

    print("\n--- [Step 1] Before Sync ---")
    keys_before = quota_service.get_all_keys()
    for k in keys_before:
        print(f"Provider: {k['provider']} | Status: {k['status']} | Count: {k['requests_today']}")
    
    # 執行一次模擬 Sync (使用不影響大量數據的標的)
    print("\n--- [Step 2] Running Tiingo Sync (AAPL) ---")
    tiingo = TiingoFetcher(client)
    # 我們只測試 fetch 呼叫，不一定要成功寫入，只要 run 執行即觸發 Quota
    tiingo.run(ticker="AAPL", start_date="2024-01-01", end_date="2024-01-02")
    
    print("\n--- [Step 3] Running Fugle Sync (2330) ---")
    fugle = FugleFetcher(client)
    fugle.run(ticker="2330", start_date="2024-01-01", end_date="2024-01-02")
    
    print("\n--- [Step 4] After Sync ---")
    keys_after = quota_service.get_all_keys()
    for k in keys_after:
        print(f"Provider: {k['provider']} | Status: {k['status']} | Count: {k['requests_today']}")
        
    # 驗證是否有增加
    print("\n--- [Step 5] Verification Results ---")
    for kb in keys_before:
        ka = next((k for k in keys_after if k['provider'] == kb['provider']), None)
        if ka and ka['provider'] in ['tiingo', 'fugle']:
            if ka['requests_today'] > kb['requests_today']:
                print(f"✅ Quota for {ka['provider']} correctly incremented: {kb['requests_today']} -> {ka['requests_today']}")
            else:
                print(f"❌ Quota for {ka['provider']} did NOT increment.")


if __name__ == "__main__":
    asyncio.run(test_quota_tracking())
