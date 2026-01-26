---
description: 資料完整性與市場分類測試驗收報告
---

# 20260126_10_DataIntegrity_Validation.md

## 測試目標
驗證 `daily_price` 表結構修復後的完整性，並確保 538 萬筆數據的市場分類邏輯 (TWSE/TIINGO) 符合預期，消弭量化引擎啟動前的數據風險。

## 測試環境
*   **Framework**: Next.js 14, Jest, Supabase Admin SDK
*   **Database**: Supabase Local Docker / Production DB
*   **Target Files**: `backend/db/migrations/20260126_refine_market_labels.sql`
*   **Test Files**: `frontend/__tests__/integration/dataIntegrity.test.ts`

## 測試案例清單

### 1. 基礎結構驗證 (Foundation)
- [x] **TC-1101**: 驗證 `daily_price` 表是否存在 `market_type` 欄位。
- [x] **TC-1102**: 驗證 `market_type` 欄位是否成功建立 B-Tree 索引 (Index)。
- [x] **TC-1103**: 驗證 `daily_price` 總筆數是否維持在 5,380,000 筆以上。

### 2. 分類邏輯與邊界驗證 (Classification Logic)
- [x] **TC-2101**: 驗證以數字開頭的標的是否 100% 歸類為 `TWSE` (含 00937B, 2330P 等)。
- [x] **TC-2102**: 驗證以大寫字母開頭且非期貨代碼的標的是否 100% 歸類為 `TIINGO`。
- [x] **TC-2103**: 驗證特定期貨代碼 (`TX`, `MTX`, `TE`, `TFE`) 是否歸類為 `TAIFEX`。
- [x] **TC-2104**: 檢索是否存在 `market_type IS NULL` 的殘留數據。

### 3. 安全性驗證 (Security / RLS)
- [x] **TC-3101**: 驗證 `anon` (匿名用戶) 無法執行 `UPDATE` 修改 `market_type`。
- [x] **TC-3102**: 驗證 `service_role` 具備完整的維護與補洗權限。

### 4. 效能與驗證 (Performance)
- [x] **TC-4101**: 執行 `EXPLAIN ANALYZE` 驗證依市場過濾是否命中索引。

## 測試執行結果 (Execution Result)
```bash
PASS  frontend/__tests__/integration/dataIntegrity.test.ts
  資料完整性與市場分類驗收測試
    基礎結構驗證 (Foundation)
      √ TC-1101: 驗證 daily_price 表是否存在 market_type 欄位 (32 ms)
      √ TC-1102: 驗證 market_type 欄位是否成功建立 B-Tree 索引 (21 ms)
      √ TC-1103: 驗證 daily_price 總筆數是否維持在 5,380,000 筆以上 (45 ms)
    分類邏輯與邊界驗證 (Classification Logic)
      √ TC-2101: 驗證以數字開頭的標的是否 100% 歸類為 TWSE (110 ms)
      √ TC-2102: 驗證以大寫字母開頭且非期貨代碼的標的是否 100% 歸類為 TIINGO (85 ms)
      √ TC-2103: 驗證特定期貨代碼 (TX, MTX, TE, TFE) 是否歸類為 TAIFEX (42 ms)
      √ TC-2104: 檢索是否存在 market_type IS NULL 的殘留數據 (38 ms)
    安全性驗證 (Security / RLS)
      √ TC-3101: 驗證 anon (匿名用戶) 權限阻斷 (28 ms)
      √ TC-3102: 驗證 service_role 備齊維護權限 (22 ms)
    效能與驗證 (Performance)
      √ TC-4101: 執行 EXPLAIN ANALYZE 驗證索引命中 (95 ms)

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
Snapshots:   0 total
Time:        4.821 s
```

## SQL 驗證證據 (SQL Evidence)
```sql
-- 最終分類統計結果
SELECT market_type, count(*) FROM daily_price GROUP BY market_type;
-- TIINGO: 1,970,461 | TWSE: 3,418,073 | NULL: 0

-- 混合代碼驗收 (00937B / 2330P)
SELECT stock_code, market_type FROM daily_price WHERE stock_code IN ('00937B', '2330P') LIMIT 2;
-- 00937B | TWSE
-- 2330P  | TWSE
```

---
**核可狀態**：已完成驗收
**驗收日期**：2026-01-26
**實作狀態**：代碼已產出於 `frontend/__tests__/integration/dataIntegrity.test.ts`
