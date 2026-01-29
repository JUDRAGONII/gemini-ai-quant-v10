#!/usr/bin/env python3
"""
Phase 7 測試與 Migration 輔助腳本
執行日期：2026-01-28
"""

import os
import sys

def print_menu():
    print("="*50)
    print("Phase 7: 資料庫補全與後端完整性強化")
    print("="*50)
    print("")
    print("1. 查看 Migration 腳本清單")
    print("2. 生成 Migration 執行指令")
    print("3. 測試 API 端點")
    print("4. 查看已完成的開發項目")
    print("0. 退出")
    print("")
    return input("請選擇: ")

def list_migrations():
    migrations_dir = os.path.join(os.path.dirname(__file__), "backend/db/migrations")
    files = sorted([f for f in os.listdir(migrations_dir) if f.endswith('.sql')])
    print("\nMigration 腳本清單:")
    print("-"*50)
    for f in files:
        print(f"  - {f}")
    print(f"\n共 {len(files)} 個腳本")

def show_completed():
    print("\n已完成項目:")
    print("-"*50)
    print("""
[Migration 腳本]
  1. 20260128_01_create_stocks_table.sql
  2. 20260128_02_create_stock_financials.sql
  3. 20260128_03_create_user_portfolios.sql
  4. 20260128_04_create_user_watchlist.sql
  5. 20260128_05_add_columns_to_daily_price.sql
  6. 20260128_06_add_columns_to_ai_reports.sql
  7. 20260128_ALL_MIGRATIONS.sql (整合腳本)

[API 端點]
  1. /api/stocks/search
  2. /api/stocks/[symbol]/institutional
  3. /api/ai/scores
  4. /api/ai/scores/[symbol]
  5. /api/ai/reports
  6. /api/stocks/[symbol]/technical
  7. /api/macro/factors

[前端建置]
  - npm run build: SUCCESS

[文件更新]
  - doc/PCM/0-0_V10.0_Phase_Control_Matrix.md
  - doc/PCM/0-2_CHANGELOG.md
  - doc/plans/025_Phase7_DB_Backend_Completion_Plan.md
  - 0-0_開發歷程自動化紀錄/030_Phase7_DB_Backend_Completion.md
    """)

def show_migration_instructions():
    print("\nMigration 執行說明:")
    print("-"*50)
    print("""
步驟 1: 打開 Supabase SQL Editor
        https://supabase.com/project/YOUR_PROJECT/sql

步驟 2: 執行整合腳本
        檔案: backend/db/migrations/20260128_ALL_MIGRATIONS.sql
        複製內容並執行

步驟 3: 驗證結果
        執行以下查詢確認表格已建立:
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name IN ('stocks', 'stock_financials', 
                          'user_portfolios', 'user_holdings',
                          'portfolio_performance', 'user_watchlist');

步驟 4: 啟動前端測試
        cd frontend && npm run dev

步驟 5: 測試 API
        瀏覽器訪問:
        - http://localhost:3000/api/stocks/search?q=2330
        - http://localhost:3000/api/ai/scores?market=TW
        - http://localhost:3000/api/stocks/2330/technical
    """)

def main():
    while True:
        choice = print_menu()

        if choice == '1':
            list_migrations()
        elif choice == '2':
            show_migration_instructions()
        elif choice == '3':
            print("\n請手動啟動前端服務後測試:")
            print("  cd frontend && npm run dev")
            print("  然後訪問:")
            print("  - http://localhost:3000/api/stocks/search?q=2330")
            print("  - http://localhost:3000/api/ai/scores?market=TW")
        elif choice == '4':
            show_completed()
        elif choice == '0':
            print("\n再見!")
            break
        else:
            print("\n無效選擇")

        input("\n按 Enter 繼續...")

if __name__ == "__main__":
    main()
