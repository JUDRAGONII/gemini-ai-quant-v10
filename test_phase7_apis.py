#!/usr/bin/env python3
"""
Phase 7 API 測試腳本
執行日期：2026-01-28
"""

import subprocess
import time
import urllib.request
import json
import sys
import os

def wait_for_server(url, timeout=30):
    """等待伺服器啟動"""
    print(f"等待伺服器啟動: {url}")
    start = time.time()
    while time.time() - start < timeout:
        try:
            req = urllib.request.Request(url)
            urllib.request.urlopen(req, timeout=5)
            print(f"✅ 伺服器已就緒")
            return True
        except:
            time.sleep(1)
    print(f"❌ 伺服器啟動超時")
    return False

def test_api(url, name):
    """測試 API 端點"""
    print(f"\n{'='*50}")
    print(f"測試: {name}")
    print(f"URL: {url}")
    print('='*50)

    try:
        req = urllib.request.Request(url)
        req.add_header('Accept', 'application/json')

        with urllib.request.urlopen(req, timeout=15) as response:
            data = json.loads(response.read().decode('utf-8'))
            status = data.get('status', 'unknown')
            print(f"✅ 成功 - Status: {status}")

            if 'data' in data:
                print(f"Data keys: {list(data['data'].keys()) if isinstance(data['data'], dict) else 'list'}")

            return True
    except Exception as e:
        print(f"❌ 失敗: {e}")
        return False

def main():
    base_url = "http://localhost:3000"

    print("="*60)
    print("Phase 7 API 測試")
    print("="*60)

    # 測試清單
    apis = [
        (f"{base_url}/api/stocks/search?q=2330", "股票搜尋"),
        (f"{base_url}/api/ai/scores?market=TW&limit=3", "AI 評分排行"),
        (f"{base_url}/api/ai/scores/2330", "個股 AI 評分"),
        (f"{base_url}/api/ai/reports", "AI 報告列表"),
        (f"{base_url}/api/stocks/2330/technical", "技術指標"),
        (f"{base_url}/api/macro/factors", "宏觀因子"),
        (f"{base_url}/api/stocks/2330/institutional", "三大法人"),
    ]

    # 檢查伺服器
    if not wait_for_server(f"{base_url}/api/stocks/search?q=2330"):
        print("\n請先啟動前端服務:")
        print("  cd frontend && npm run dev")
        return

    # 執行測試
    passed = 0
    failed = 0

    for url, name in apis:
        if test_api(url, name):
            passed += 1
        else:
            failed += 1

    print("\n" + "="*60)
    print(f"測試結果: {passed} 通過, {failed} 失敗")
    print("="*60)

    # 輸出 Migration 執行說明
    print("\n" + "="*60)
    print("Migration 執行說明")
    print("="*60)
    print("""
請在 Supabase SQL Editor 中執行以下檔案：

1. backend/db/migrations/20260128_ALL_MIGRATIONS.sql
   - 這是一個整合腳本，包含所有 6 個步驟
   - 請直接複製內容執行

執行後可驗證：
- stocks, stock_financials, user_portfolios 等表格已建立
- RLS 政策已生效
""")

if __name__ == "__main__":
    main()
