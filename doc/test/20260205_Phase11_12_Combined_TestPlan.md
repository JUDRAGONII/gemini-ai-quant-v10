# 20260205_Phase11_12_Combined_TestPlan.md

## 測試目標
驗證 Phase 11（數據監控中心對接與即時性）與 Phase 12（AI 跨資產洞察引擎與 Bento Grid V3 佈局）的系統完整性、數據精度與 UIUX 巔峰表現。

## 測試環境
*   **Framework**: Next.js 14, Jest, React Testing Library, Pytest, Pandas
*   **Target Files**: 
    - `frontend/app/admin/monitor/page.tsx`
    - `frontend/app/macro/page.tsx`
    - `frontend/components/macro/InsightsPanel.tsx`
    - `backend/services/insights_service.py`
*   **Test Files**: 
    - `frontend/__tests__/monitor_v2.test.tsx`
    - `frontend/__tests__/insights_v2.test.tsx`
    - `backend/tests/test_insights_service.py`

## 測試案例清單

### 1. 基礎路徑測試 (Happy Path)
#### [Phase 11: Monitor Center V2]
- [x] **TC-1101: 描述**: 驗證監控中心首頁正確載入 9 大分類卡片。
- [x] **TC-1102: 描述**: 驗證卡片顯示之數據總量（Data Points）與後端統計一致。
- [x] **TC-1103: 描述**: 驗證數據表格正確渲染 `null` 值為 `-`。

#### [Phase 12: AI Insights Engine]
- [x] **TC-1201: 描述**: 驗證 `InsightsService` 在給定兩組資產數據時，計算出正確的 Pearson 相關係數。
- [x] **TC-1202: 描述**: 驗證 API `/api/v1/insights/correlation` 回傳 JSON 包含 `correlation` 與 `summary` 欄位。
- [x] **TC-1203: 描述**: 驗證 `InsightsPanel` 組件渲染出圖表與相關性文字描述（如「強烈負相關」）。

#### [Phase 12: Bento Grid V3 Layout]
- [ ] **TC-1301: 描述**: 驗證 `MacroPage` 頂部顯示 3 個核心經濟指標卡片（GDP, CPI, FED）。
- [ ] **TC-1302: 描述**: 驗證搜尋功能可過濾下方指標網格內容。

### 2. 邊界條件測試 (Edge Cases)
- [x] **TC-2101: 描述**: 驗證當資產數據長度不一致（如一週 vs 一年）時，`InsightsService` 執行 Outer Join 的容錯性。
- [x] **TC-2201: 描述**: 驗證當 API 回傳空數據時，`InsightsPanel` 顯示「No data available」而非崩潰。
- [ ] **TC-2202: 描述**: 驗證 SWR 輪詢在網路不穩時的重試機制。

### 3. 安全性與數據一致性
- [x] **TC-3101: 描述**: 驗證非管理員用戶無法存取 `/admin/monitor` (Redirect to Home)。
- [ ] **TC-3102: 描述**: 驗證 RPC `get_category_counts` 僅限特定角色調用（驗證安全性權限）。
- [ ] **TC-3201: 描述**: 驗證 Insights API 對於極端 NaN 數值的處理，確保不輸出非標準 JSON。

### 4. 可訪問性與 UI/UX
- [ ] **TC-4001: 描述**: 驗證 Bento Grid 在行動端（375px）自動坍縮為單欄佈局。
- [ ] **TC-4002: 描述**: 驗證玻璃擬態（Glassmorphism）組件之 Hover 發光效果與 1px 邊框渲染符合 V3 規範。


## 測試執行結果 (Execution Result)
```bash
# 待執行測試後填入
```
