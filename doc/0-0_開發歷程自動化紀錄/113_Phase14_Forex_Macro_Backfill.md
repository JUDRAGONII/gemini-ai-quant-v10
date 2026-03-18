# [113] Phase 14 匯率與宏觀指標歷史回補

## 1. 任務目標
- 依據專案規範補足資料庫內所有短缺資料（特別是匯率、貴金屬與經濟日曆）。
- 確保前端資料正確無誤。
- 修復開發過程中的異常並建立錯誤教訓。

## 2. 執行過程
1. **問題診斷與分析**：檢查 `schema.sql`、`backend/etl` 與前端程式碼，確認資料表架構無虞，且前端頁面具備動態載入能力，僅缺少資料實體入庫。
2. **經濟日曆同步**：執行 `run_economic_backfill.py` 成功將未來 14 天的 419 筆經濟日曆事件同步至 `economic_calendar`。
3. **匯率與貴金屬同步**：
    - 遭遇 `NameError`：修復 `currency_fetcher.py` 缺少 `import logging`。
    - 遭遇 `42P10` 與 `23505` 錯誤：發現 ON CONFLICT 的約束條件與 DB 定義 (`unique_pair_date`) 不符。建立並執行了 `emergency_fx_fix.sql` 以確保 UNIQUE 限制，並調校 `upsert` 使用正確的 Conflict Target (`currency_pair,trade_date`)。
    - 遭遇 `23502` 錯誤：因 `currency_pair` 為 NOT NULL，但在欄位重構時未帶入該值。已修補對應字典鍵值並新增容錯機制印出首筆資料樣本。
    - 最終成功將 31,065 筆歷史匯率資料（含 USD/TWD, XAU/USD 黃金, XAG/USD 白銀等）回補完畢。

## 3. 解決的技術難點
- **Schema Alignment 衝突**：Python ETL 腳本與資料庫因經歷多次 Migration 發生脫鉤，透過補齊 Constraint 與 Dictionary Key 解決了 Bulk Upsert 問題。
- **Docker Redis Port 報錯梳理**：確認了 Python 腳本本地端連線 Redis (10061) 的警告不會影響程式運行，因架構具備向 PostgreSQL 優雅降級 (Graceful Degradation) 的容錯機制。
