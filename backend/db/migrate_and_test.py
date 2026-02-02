#!/usr/bin/env python3
"""
Migration ?瑁???API 皜祈岫?單
?瑁??交?嚗?026-01-28
"""

import os
import sys
from pathlib import Path

# 瘛餃?敺垢?桅??啗楝敺?sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.lib.supabase_client import get_supabase

def execute_migration(sql_file: str) -> bool:
    """?瑁??桐? Migration ?單"""
    print(f"\n{'='*60}")
    print(f"?瑁? Migration: {sql_file}")
    print('='*60)

    try:
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()

        supabase = get_supabase()
        result = supabase.rpc('exec_sql', {'query': sql_content}).execute()

        print(f"???瑁???")
        return True

    except Exception as e:
        print(f"???瑁?憭望?: {e}")
        return False


def test_api_endpoint(url: str, name: str) -> bool:
    """皜祈岫 API 蝡舫?"""
    print(f"\n{'='*60}")
    print(f"皜祈岫 API: {name}")
    print(f"URL: {url}")
    print('='*60)

    import urllib.request
    import json

    try:
        req = urllib.request.Request(url)
        req.add_header('Accept', 'application/json')

        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
            print(f"???? - Status: {data.get('status')}")
            print(f"Response: {json.dumps(data, ensure_ascii=False, indent=2)[:500]}...")
            return True

    except Exception as e:
        print(f"??憭望?: {e}")
        return False


def main():
    """銝餃銵??""
    print("="*60)
    print("Phase 7 Migration ?瑁???API 皜祈岫")
    print("?瑁??交?嚗?026-01-28")
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

    # 皜祈岫 API 蝡舫?
    print("\n" + "="*60)
    print("皜祈岫 API 蝡舫?")
    print("="*60)

    api_tests = [
        ("http://localhost:3000/api/stocks/search?q=2330", "?∠巨?? API"),
        ("http://localhost:3000/api/ai/scores?market=TW&limit=5", "AI 閰??? API"),
        ("http://localhost:3000/api/ai/scores/2330", "? AI 閰? API"),
        ("http://localhost:3000/api/ai/reports", "AI ?勗??” API"),
    ]

    for url, name in api_tests:
        test_api_endpoint(url, name)

    print("\n" + "="*60)
    print("Migration ?瑁?摰?")
    print("隢?? Supabase SQL Editor ?瑁?隞乩??單嚗?)
    print("="*60)

    for mf in migration_files:
        print(f"  - {mf}")

    print("\n皜祈岫撱箄降嚗?)
    print("1. ??Supabase SQL Editor ?瑁?銝膩 Migration ?單")
    print("2. 雿輻 Postman ??curl 皜祈岫 API 蝡舫?")
    print("3. 撽? RLS ?輻??臬甇?Ⅱ??冽?豢?")


if __name__ == "__main__":
    main()
