# 039_Phase7_P1_Migration (P1)

## 1. 需求解構 (Thinking Phase)
- **目標**：執行 Phase 7 P1 優先級資料庫補全，建立績效、三大法人、融資券、分K行情與經濟事件日曆表。
- **挑戰**：
    - `intraday_candles` 表已存在且結構與最新 specs 不一致。
    - 自帶的 RLS 政策在重複執行時會導致 `policy already exists` 錯誤。
- **解決方案**：
    - 實作 `20260128_PHASE7_P1_MIGRATIONS_FIXED.sql`。
    - 採用 `ALTER TABLE RENAME` 備份舊版分K表。
    - 使用 `DROP POLICY IF EXISTS` 確保 RLS 部署穩定性。

## 2. 方案設計與架構審計 (/architect, /sdd)
- **結構對齊**：
    - 分K表從 `ts` (TIMESTAMPTZ) 遷移至 `candle_date` (DATE) + `candle_time` (TIME)，以利與日線數據對齊分析。
    - 統一所有新表採用 `stock_code` 命名。
- **安全性**：
    - 全面應用 RLS，公共數據（法人、日曆）Open Read，私有數據（績效）Owner Only。

## 3. 執行開發與驗證 (Execution & Verification)
- **執行方式**：透過 `docker cp` 將 SQL 載入容器，避開 PowerShell 編碼問題。
- **驗證手段**：實作 `verify_p1_migration.py` 對 5 個目標表進行連線測試。
- **執行結果**：
    - `portfolio_performance`: OK
    - `stock_institutional`: OK
    - `stock_margin`: OK
    - `intraday_candles`: OK (已重建)
    - `economic_calendar`: OK

## 4. 下一步計畫
- **數據填充**：啟動法人與融資券數據的 ETL 回補。
- **API 適配**：更新對應的 API Route 以支持新表查詢。
