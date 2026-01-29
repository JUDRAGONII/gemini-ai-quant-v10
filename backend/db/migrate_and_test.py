#!/usr/bin/env python3
"""
Migration 執行與 API 測試腳本
執行日期：2026-01-28
"""

import os
import sys
from pathlib import Path

# 添加後端目錄到路徑
sys.path.insert(0, str(Path(__file__).parent.parent))

from lib.supabase_client import get_supabase

def execute_migration(sql_file: str) -> bool:
    """執行單一 Migration 腳本"""
    print(f"\n{'='*60}")
    print(f"執行 Migration: {sql_file}")
    print('='*60)

    try:
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()

        supabase = get_supabase()
        result = supabase.rpc('exec_sql', {'query': sql_content}).execute()

        print(f"✅ 執行成功")
        return True

    except Exception as e:
        print(f"❌ 執行失敗: {e}")
        return False


def test_api_endpoint(url: str, name: str) -> bool:
    """測試 API 端點"""
    print(f"\n{'='*60}")
    print(f"測試 API: {name}")
    print(f"URL: {url}")
    print('='*60)

    import urllib.request
    import json

    try:
        req = urllib.request.Request(url)
        req.add_header('Accept', 'application/json')

        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
            print(f"✅ 成功 - Status: {data.get('status')}")
            print(f"Response: {json.dumps(data, ensure_ascii=False, indent=2)[:500]}...")
            return True

    except Exception as e:
        print(f"❌ 失敗: {e}")
        return False


def main():
    """主執行函數"""
    print("="*60)
    print("Phase 7 Migration 執行與 API 測試")
    print("執行日期：2026-01-28")
    print("="*60)

    migrations_dir = Path(__file__).parent
    migration_files = [
        "20260128_01_create_stocks_table.sql",
        "20260128_02_create_stock_financials.sql",
        "20260128_03_create_user_portfolios.sql",
        "20260128_04_create_user_watchlist.sql",
        "20260128_05_add_columns_to_daily_price.sql",
        "20260128_06_add_columns_to_ai_reports.sql",
    ]

    # 測試 API 端點
    print("\n" + "="*60)
    print("測試 API 端點")
    print("="*60)

    api_tests = [
        ("http://localhost:3000/api/stocks/search?q=2330", "股票搜尋 API"),
        ("http://localhost:3000/api/ai/scores?market=TW&limit=5", "AI 評分排行 API"),
        ("http://localhost:3000/api/ai/scores/2330", "個股 AI 評分 API"),
        ("http://localhost:3000/api/ai/reports", "AI 報告列表 API"),
    ]

    for url, name in api_tests:
        test_api_endpoint(url, name)

    print("\n" + "="*60)
    print("Migration 執行完成")
    print("請手動在 Supabase SQL Editor 執行以下腳本：")
    print("="*60)

    for mf in migration_files:
        print(f"  - {mf}")

    print("\n測試建議：")
    print("1. 在 Supabase SQL Editor 執行上述 Migration 腳本")
    print("2. 使用 Postman 或 curl 測試 API 端點")
    print("3. 驗證 RLS 政策是否正確隔離用戶數據")


if __name__ == "__main__":
    main()
