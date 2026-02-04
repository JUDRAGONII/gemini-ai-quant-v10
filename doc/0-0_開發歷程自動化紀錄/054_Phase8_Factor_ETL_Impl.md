# 054_Phase8_Factor_ETL_Impl.md

## 任務背景
依據 Phase 8.2 計畫 (Plan 028)，將 `AlphaFactory` 接入真實 ETL 流程，實現每日自動運算與入庫。

## 開發成果
1.  **資料庫遷移**：成功執行 `20260130_add_dynamic_factors.sql`，在 `stock_factors` 表中新增 `JSONB` 欄位與 GIN 索引。
2.  **FactorETL 服務** (`backend/etl/factor_etl.py`)：
    *   **Fetch**: 實作 `fetch_data` 從 `daily_price`, `stock_institutional`, `stock_margin` 聚合原始數據。
    *   **Pipeline**: 串接 `AlphaFactory` 進行向量化計算。
    *   **Upsert**: 實作批量寫入邏輯，利用 Supabase Upsert 機制處理重複數據。
3.  **整合驗證**：
    *   成功對 `2330` (TSMC) 與 `0050` 執行全流程。
    *   因子矩陣正確寫入 `factors_all` 欄位。

## 技術亮點
*   **JSONB 動態擴充**：解決了 50+ 因子需頻繁修改 Schema 的問題。
*   **Robust Fetching**: 自動處理部分數據缺失 (如籌碼不足) 的情況，保證至少產出技術因子。

## 下一步
*   將 `FactorETL` 整合至 Workflow 排程 (`backend/flows.py`)。

## ⚠️ 故障排除與經驗教訓 (Troubleshooting & Lessons)

### 1. Python Module Path 陷阱
*   **現象**：執行 `python backend/etl/factor_etl.py` 失敗 (`ModuleNotFoundError: No module named 'backend'`)；執行 `python -m backend.etl.factor_etl` 失敗並引發未使用的 `market.py` 報錯。
*   **原因**：Python script execution vs Module execution 的路徑差異，以及 `__init__.py` 導致的連鎖引用。
*   **解法**：修正所有 `backend/etl/*.py` 中的相對引用 (如 `from lib` -> `from backend.lib`)，並統一使用 `python -m` 執行。

### 2. PostgREST Schema Cache
*   **現象**：DB Migration 成功後，API 仍回報 `PGRST204` (Column not found)。
*   **原因**：PostgREST 會快取 Schema，不會自動偵測 DDL 變更。
*   **解法**：執行 `NOTIFY pgrst, 'reload schema'` 並強制重啟服務 (`docker compose restart rest`)。
