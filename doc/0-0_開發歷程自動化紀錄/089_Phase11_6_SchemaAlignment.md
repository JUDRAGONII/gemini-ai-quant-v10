# 089_Phase11.6_Schema_Alignment_SDD

## 1. 任務概要 (Task Summary)
- **階段**: Phase 11.6 (結構穩固與 Schema 對齊)
- **目標**: 對齊 SPEC-V10.0-001 規格書，補全 `daily_price` 的 `turnover` 欄位，並重構 `exchange_rates` 表以支援雙幣別過濾。
- **背景**: 調研發現現有匯率表結構 (currency_pair) 與規格書要求 (base/target) 不符，且行情表缺乏實體化成交值欄位，不利於高效熱力圖計算。

## 2. 實作內容 (Implementation Details)

### 2.1 資料庫層 (Database Layer)
- **SQL 遷移**: 建立 `20260209_01_alignment_p11_6.sql`。
    - `daily_price`: 新增 `turnover` (NUMERIC(20, 2))。
    - `exchange_rates`: 
        - 將 `reference_date` 重命名為 `trade_date`。
        - 新增 `base_currency`, `target_currency` 並從 `currency_pair` 拆分遷移資料。
        - 建立 `get_latest_exchange_rates` RPC 函數。
- **安全性**: 補全 `exchange_rates` 的 RLS 策略 (Public Read / Service Role CRUD)。

### 2.2 後端層 (Backend Layer)
- **API 路由**: 更新 `backend/api/routers/market.py`。
    - 新增 `GET /api/v1/market/exchange_rates`：支援分頁與日期過濾。
    - 新增 `GET /api/v1/market/exchange_rates/latest`：使用 RPC 獲取各幣別最新匯率。
- **Pydantic**: 實作 `ExchangeRateResponse` 與 `ExchangeRateLatestResponse` 模型。

### 2.3 前端層 (Frontend Layer)
- **型別定義**: 更新 `frontend/types/api.ts`。
    - `StockQuote`: 增加 `turnover` 選項。
    - `ExchangeRate`, `ExchangeRateResponse`: 建立最新介面對齊。

## 3. 遇到的問題與解決 (Issues & Solutions)
- **PowerShell 管道編碼**: 使用 `Get-Content | docker exec` 時中文字元導致 SQL 報錯。
    - **解決**: 移除 SQL 註釋中的中文，或顯式指定 `-Encoding UTF8`。
- **欄位衝突**: `exchange_rates` 已存在舊結構。
    - **解決**: 使用 `DO` 塊動態檢查並執行 `RENAME` 與 `UPDATE` 遷移邏輯。

## 4. 驗收狀態 (Validation)
- [x] SQL 遷移執行成功 (Postgres 15)。
- [x] 後端 API 通過邏輯校核。
- [x] 前端 TypeScript 型別無衝突。

---
**紀錄人**: Antigravity
**日期**: 2026-02-09
