import asyncio
import pandas as pd
from backend.services.insights_service import InsightsService
from backend.lib.supabase_client import get_supabase
import os
from dotenv import load_dotenv

async def verify_phase12():
    load_dotenv()
    print("=== Phase 12 核心功能驗證 (憲級加固版) ===")
    service = InsightsService()
    supabase = get_supabase()

    # 1. 驗證資料表存在
    print("\n[Step 1] 驗證資料表結構...")
    try:
        res = supabase.table("tactical_plans").select("count", count="exact").limit(1).execute()
        print(f"✅ tactical_plans 存在 (Count: {res.count})")
    except Exception as e:
        print(f"❌ tactical_plans 驗證失敗: {e}")

    # 2. 驗證滯後相關性分析
    print("\n[Step 2] 驗證滯後相關性 (TSMC vs USD/TWD) - Lag: 1...")
    # 注意：這裡假設資料庫已有 2330.TW 與 USD/TWD 資料
    # 若資料不足，系統應回傳 error message 而非崩潰
    try:
        corr = await service.get_correlation("STOCK:2330", "FX:USD/TWD", window=10, days=30, lag=1)
        if "summary" in corr:
            print(f"✅ 相關性計算成功: {corr['summary']['current']} ({corr['summary']['status']})")
            print(f"   是否命中緩存: {corr.get('cached')}")
            
            # 測試緩存效能
            start = pd.Timestamp.now()
            corr_cached = await service.get_correlation("STOCK:2330", "FX:USD/TWD", window=10, days=30, lag=1)
            end = pd.Timestamp.now()
            print(f"✅ 緩存測試成功 (耗時: {(end-start).total_seconds():.4f}s), 命中: {corr_cached.get('cached')}")
        else:
            print(f"⚠️ 相關性計算提示: {corr.get('message')}")
    except Exception as e:
        print(f"❌ 相關性計算崩潰: {e}")

    # 3. 驗證 AI 辯證共識
    print("\n[Step 3] 驗證 AI 辯證引擎 (Ticker: 2330)...")
    try:
        dialectic = await service.get_dialectic_consensus("2330")
        print(f"✅ 辯證共識: {dialectic['consensus']} (信心度: {dialectic['conviction']})")
        for agent in dialectic['agents']:
            print(f"   - {agent['name']}: {agent['opinion']} ({agent['reason']})")
    except Exception as e:
        print(f"❌ AI 辯證驗證失敗: {e}")

    # 4. 驗證戰術計畫 CRUD
    print("\n[Step 4] 驗證戰術計畫寫入...")
    test_plan = {
        "stock_code": "2330",
        "stock_name": "台積電",
        "entry_price": 600.0,
        "stop_loss": 580.0,
        "take_profit": 700.0,
        "reason": "測試 Phase 12 戰術閉環"
    }
    try:
        res = supabase.table("tactical_plans").insert(test_plan).execute()
        if res.data:
            plan_id = res.data[0]['id']
            print(f"✅ 戰術計畫寫入成功 (ID: {plan_id})")
            # 刪除測試資料
            supabase.table("tactical_plans").delete().eq("id", plan_id).execute()
            print("✅ 測試資料已清理")
    except Exception as e:
        print(f"❌ 戰術計畫驗證失敗: {e}")

if __name__ == "__main__":
    asyncio.run(verify_phase12())
