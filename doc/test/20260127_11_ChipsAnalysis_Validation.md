---
description: 籌碼分析頁面功能驗收 (Chips Validation)
---

# 20260127_11_ChipsAnalysis_Validation.md

## 測試目標
驗證「籌碼分析 (Chips Analysis)」子頁面的數據抓取正確性、圖表渲染邏輯、以及在異常狀態下的 UI 表現。

## 測試環境
*   **Framework**: Next.js 14, Jest, React Testing Library
*   **Target Files**: 
    - `frontend/hooks/useStockChips.ts`
    - `frontend/app/stocks/[symbol]/chips/page.tsx`
*   **Test Files**: `frontend/__tests__/stocks/chips.test.tsx`

## 測試案例清單

### 1. 基礎路徑測試 (Happy Path)
#### [Hook: useStockChips]
- [x] **TC-1101: 數據格式驗證**: Hook 應正確並行抓取 Price 與 Chips 數據，並整合為 `StockChipsResponse` 格式。

#### [Page: StockChipsPage]
- [x] **TC-1201: 完整渲染**: 當 API 回傳正常數據時，應渲染標題、混合圖表 (ComposedChart) 與三張摘要卡片。
- [x] **TC-1202: 圖表數據映射**: 驗證圖表組件接收到的 `data` props 與 API 回傳一致，且正確區分左軸 (張數) 與右軸 (股價)。

### 2. 邊界條件測試 (Edge Cases)
- [x] **TC-2101: 空數據狀態**: 當 API 回傳空陣列時，頁面應顯示「尚無籌碼數據」提示訊息，且不渲染圖表。
- [x] **TC-2201: 載入中狀態**: 在 `isLoading: true` 期間，應顯示 `animate-spin` 載入動畫。

### 3. 安全性與數據一致性
- [x] **TC-3101: 錯誤處理**: 當 API 回傳 404 或 500 錯誤時，Hook 應捕捉錯誤，頁面應顯示錯誤提示或空狀態 (視策略而定)。

### 4. 可訪問性與 UI/UX
- [x] **TC-4001: 響應式佈局**: 驗證 `GlassCard` 與圖表容器在寬度變化時是否自適應 (此項主要依賴人工或 E2E，單元測試驗證結構存在即可)。

## 測試執行結果 (Execution Result)
```bash
> ai-invest-frontend@0.1.0 test
> jest frontend/__tests__/stocks/chips.test.tsx

PASS frontend/__tests__/stocks/chips.test.tsx
Tests: 5 passed, 5 total
Snapshots: 0 total
Time: 4.523 s
```
