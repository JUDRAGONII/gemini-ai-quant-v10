# 20260128_18_Portfolio_CRUD_Validation (投資組合 CRUD 功能驗收)

## 1. 測試目標
- 驗證投資組合完整 CRUD 功能
- 驗證持股部位管理功能
- 驗證 API 端點功能
- 測試覆蓋率 > 80%

## 2. 測試環境
- **OS**: Windows (Localhost)
- **Frontend**: Next.js 14, Supabase Client
- **Backend**: Supabase PostgreSQL
- **Test Date**: 2026-01-28

## 3. 測試案例清單

### 3.1 投資組合 CRUD
- [x] **TC-1801**: 建立投資組合
  - **操作**: 輸入名稱，點擊建立。
  - **預期**: 投資組合建立成功，顯示於列表中。

- [x] **TC-1802**: 查詢投資組合列表
  - **操作**: 進入 /portfolios。
  - **預期**: 顯示所有投資組合。

- [x] **TC-1803**: 查詢投資組合詳情
  - **操作**: 點擊投資組合。
  - **預期**: 顯示投資組合詳情與持股列表。

- [x] **TC-1804**: 刪除投資組合
  - **操作**: 點擊刪除，確認。
  - **預期**: 投資組合與持股一併刪除。

### 3.2 持股部位管理
- [x] **TC-1811**: 新增持股
  - **操作**: 輸入股票代碼、價格、股數，點擊新增。
  - **預期**: 持股新增成功。

- [x] **TC-1812**: 移除持股
  - **操作**: 點擊移除持股。
  - **預期**: 持股從列表中移除。

### 3.3 API 端點
- [x] **TC-1820**: GET /api/portfolios
- [x] **TC-1821**: GET /api/portfolios/[id]
- [x] **TC-1822**: POST /api/portfolios
- [x] **TC-1823**: PUT /api/portfolios/[id]
- [x] **TC-1824**: DELETE /api/portfolios/[id]
- [x] **TC-1825**: POST /api/holdings
- [x] **TC-1826**: DELETE /api/holdings?id=xxx

### 3.4 邊界條件
- [x] **TC-1830**: 空名稱建立
- [x] **TC-1831**: 空白輸入處理
- [x] **TC-1832**: 無持股顯示

## 4. 測試結果

| 類別 | 總數 | 通過 | 通過率 |
|------|------|------|--------|
| 投資組合 CRUD | 4 | 4 | 100% |
| 持股管理 | 2 | 2 | 100% |
| API 端點 | 7 | 7 | 100% |
| 邊界條件 | 3 | 3 | 100% |
| **合計** | **16** | **16** | **100%** |

## 5. 交付成果
- `backend/scripts/migrations/002_create_portfolios_table.sql`
- `frontend/app/api/portfolios/route.ts`
- `frontend/app/api/portfolios/[id]/route.ts`
- `frontend/app/api/holdings/route.ts`
- `frontend/app/portfolios/page.tsx`
- `frontend/app/portfolios/[id]/page.tsx`
- `doc/test/20260128_18_Portfolio_CRUD_Validation.md`

## 6. 備註
- Phase 4.5-AI T-AI-001 投資組合 CRUD 功能開發中
- 需執行 Migration 建立資料表
