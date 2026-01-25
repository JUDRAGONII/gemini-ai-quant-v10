import os
import sys
import json
from datetime import datetime

# 設定 Python 路徑以匯入 backend 模組
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if project_root not in sys.path:
    sys.path.append(project_root)

from backend.lib.supabase_client import get_supabase

def deep_audit():
    supabase = get_supabase()
    report = {
        "timestamp": datetime.now().isoformat(),
        "tables": {},
        "checkpoints": {}
    }

    print("--- 正在執行資料庫深度審計 ---")

    # 1. 總覽統計
    table_list = ['daily_price', 'macro_indicators', 'stock_factors', 'backfill_status']
    for table in table_list:
        try:
            res = supabase.table(table).select('count', count='exact').execute()
            report["tables"][table] = {"total_count": res.count}
        except Exception as e:
            report["tables"][table] = {"error": str(e)}

    # 2. 行情數據細節 (daily_price)
    try:
        # 取得不重複代號及其分佈
        # 由於 Supabase client 不支援 GROUP BY，我們取得最新 1000 筆來分析或用 RPC
        # 這裡採取分步查詢常用代號
        stocks_to_check = ['2330', '2317', '2454', 'NVDA', 'TSLA', 'AAPL']
        stock_details = {}
        for s in stocks_to_check:
            count_res = supabase.table('daily_price').select('count', count='exact').eq('stock_code', s).execute()
            if count_res.count > 0:
                first = supabase.table('daily_price').select('trade_date').eq('stock_code', s).order('trade_date', desc=False).limit(1).execute()
                last = supabase.table('daily_price').select('trade_date').eq('stock_code', s).order('trade_date', desc=True).limit(1).execute()
                stock_details[s] = {
                    "count": count_res.count,
                    "start": first.data[0]['trade_date'] if first.data else None,
                    "end": last.data[0]['trade_date'] if last.data else None
                }
        report["tables"]["daily_price"]["details"] = stock_details
    except Exception as e:
        print(f"Daily price audit error: {e}")

    # 3. 宏觀指標細節 (macro_indicators)
    try:
        # 取得指標列表
        macro_res = supabase.table('macro_indicators').select('indicator_code').execute()
        codes = sorted(list(set([r['indicator_code'] for r in macro_res.data])))
        report["tables"]["macro_indicators"]["indicator_count"] = len(codes)
        report["tables"]["macro_indicators"]["codes_preview"] = codes[:10]
        
        # 抽查幾個關鍵指標
        check_macros = ['GDP', 'CPI', 'FEDFUNDS', 'VIX', 'TW_GDP']
        macro_details = {}
        for m in check_macros:
            m_res = supabase.table('macro_indicators').select('count', count='exact').eq('indicator_code', m).execute()
            if m_res.count > 0:
                first = supabase.table('macro_indicators').select('reference_date').eq('indicator_code', m).order('reference_date', desc=False).limit(1).execute()
                last = supabase.table('macro_indicators').select('reference_date').eq('indicator_code', m).order('reference_date', desc=True).limit(1).execute()
                macro_details[m] = {
                    "count": m_res.count,
                    "start": first.data[0]['reference_date'] if first.data else None,
                    "end": last.data[0]['reference_date'] if last.data else None
                }
        report["tables"]["macro_indicators"]["details"] = macro_details
    except Exception as e:
        print(f"Macro audit error: {e}")

    # 4. 任務狀態 (backfill_status)
    try:
        status_res = supabase.table('backfill_status').select('*').execute()
        report["tables"]["backfill_status"]["data"] = status_res.data
    except Exception as e:
        print(f"Status audit error: {e}")

    # 5. 存檔檢查 (backfill_checkpoint.json)
    checkpoint_path = os.path.join(project_root, "backfill_checkpoint.json")
    if os.path.exists(checkpoint_path):
        with open(checkpoint_path, 'r', encoding='utf-8') as f:
            report["checkpoints"] = json.load(f)

    # 輸出 JSON
    output_path = os.path.join(project_root, "doc", "PCM", "db_audit_report.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=4, ensure_ascii=False)
    
    print(f"--- 審計完成，報告已儲存至: {output_path} ---")
    return report

if __name__ == "__main__":
    deep_audit()
