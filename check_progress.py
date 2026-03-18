import json
import os
import time

filepath = 'backfill_checkpoint.json'
total_stocks = 1610  # Roughly 1070 TW + 537 US + 3 Taifex

if not os.path.exists(filepath):
    print("尚無進度快取檔 (可能剛開始或已結束)。")
else:
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    stocks_completed = len(data.get("stocks", {}))
    macro_completed = len(data.get("macro", {}))
    
    elapsed_time_minutes = 15  # Approx 15 mins since 10:27
    speed = stocks_completed / elapsed_time_minutes if elapsed_time_minutes > 0 else 0
    remaining_stocks = total_stocks - stocks_completed
    remaining_time_minutes = remaining_stocks / speed if speed > 0 else 0
    
    print(f"=== 回補進度報告 ===")
    print(f"總體經濟指標 (Macro): 完成 {macro_completed} 項")
    print(f"全市場股票 (Stocks): 完成 {stocks_completed} / {total_stocks} 檔 ({stocks_completed/total_stocks*100:.2f}%)")
    print(f"目前平均速度: 每分鐘 {speed:.1f} 檔")
    if remaining_stocks > 0:
        print(f"預估剩餘時間: {remaining_time_minutes:.1f} 分鐘 (大約 {remaining_time_minutes/60:.2f} 小時)")
    else:
        print("股票回補已全數完成！")
