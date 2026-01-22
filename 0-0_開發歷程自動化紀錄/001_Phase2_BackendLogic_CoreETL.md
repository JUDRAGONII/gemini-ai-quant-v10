# 001_Phase2_BackendLogic (Core & ETL)

## ✅ 已完成項目
1.  **基礎框架 (Core Framework)**
    *   `backend/lib/config.py`: 集中環境變數管理。
    *   `backend/lib/supabase_client.py`: Supabase 單例連線。
    *   修復 Docker 容器內的 Python Import 路徑問題 (`__init__.py`, `python -m`).

2.  **ETL 模組 (Macro)**
    *   `backend/etl/macro.py`: 整合 `pandas-datareader` 擷取 FRED 數據。
    *   資料寫入: 成功將 GDP, CPI, VIX 等關鍵指標 Upsert 至 `macro_indicators` 表。
    *   驗證結果: 執行日誌顯示成功寫入數千筆數據。

## 📊 驗證日誌
```text
Processing GDP (GDP)... Upserted 18 records
Processing CPI (CPIAUCSL)... Upserted 58 records
Processing VIX (VIXCLS)... Upserted 1280 records
Macro ETL Completed. Code: 0
```

## ⚠️ 待解問題 (Backlog)
*   `FRED_API_KEY` 在容器中似乎未讀取到 (顯示 Warning)，但資料來源仍允許存取。建議後續確認 `.env` 變數注入情況。
