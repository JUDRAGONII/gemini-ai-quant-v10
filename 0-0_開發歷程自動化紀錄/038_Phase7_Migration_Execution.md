# 038_Phase7_Migration_Execution (P0)

## 1. 需求解構 (Thinking Phase)
- **目標**：執行 Phase 7 資料庫補全腳本，對齊 `stock_code` 命名規範，並建立用戶投資組合、自選股、財報等新表。
- **挑戰**：`stocks` 與 `daily_price` 已存在 Legacy 數據與舊欄位命名（symbol），直接執行 `CREATE TABLE` 無效且可能造成衝突。
- **解決方案**：採用 `DO` block 檢測欄位是否存在並執行 `ALTER TABLE ... RENAME`。同時注入 `auth.uid()` 等輔助函數以支援本地 RLS。

## 2. 方案設計與架構審計 (/architect, /sdd)
- **欄位一致性**：統一採用 `stock_code` 取代 `symbol` 或 `stock_id`。
- **安全性 (RLS)**：
    - `stocks`, `stock_financials`：Public Read, Service Role Full Access。
    - `user_portfolios`, `user_watchlist`：Owner Access Only (via `auth.uid() = user_id`)。
- **性能**：為 `stock_code`, `report_date`, `market_type` 建立 B-Tree 索引。

## 3. 執行開發與審查 (Execution & /code-review)
- **修正版腳本**：`backend/db/migrations/20260128_FIXED_MIGRATIONS.sql`。
- **關鍵修正**：
    - 增加 `DROP FUNCTION IF EXISTS auth.uid()` 以應對本地環境型別衝突。
    - 使用 `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` 補全 `daily_price` 與 `ai_reports` 表。

## 4. 驗證結果
- **執行狀態**：透過 `docker exec` 成功執行 SQL，輸出 `??Migration (FIXED) ??????`。
- **結構驗證**：
    - `stocks` 表已包含 `stock_code`, `stock_name`, `market_type`。
    - `user_portfolios`, `user_holdings` 等表已建立。
    - RLS 輔助函數已注入 `auth` schema。

## 5. 下一步計畫
- **Phase 7.1 Sync**: 雖然之前有部分同步，但需確認所有後端腳本（如 Pydantic Models）與前端 API 是否完全適配此次 Migration 後的精確 Schema。
