# 20260122_DashboardUI_TestPlan.md

## 測試目標
驗證 V10.0 Dashboard 頁面 (`app/page.tsx`) 與圖表元件 (`MacroChart.tsx`) 的 UI 正確性、數據呈現邏輯與邊界狀況。

## 測試環境
*   **Framework**: Next.js 14 (App Router)
*   **Test Runner**: Jest + React Testing Library
*   **Mocking**: Supabase Client Mock

## 測試案例清單

### 1. MacroChart 元件單元測試 (`components/MacroChart.tsx`)
- [x] **渲染標題與當前數值**: 傳入正常數據時，標題應顯示且右下角數值應格式化正確 (toLocaleString)。
- [x] **渲染圖表區域**: `Recharts` 的 `ResponsiveContainer` 與 `AreaChart` 應存在於 DOM 中。
- [x] **空數據處理**: 當 `data` 為空陣列時，不應崩潰 (雖元件邏輯內部未阻擋，但父層有判斷，測試應驗證元件本身的容錯或父層行為)。
- [x] **顏色屬性應用**: 驗證傳入的 `color` prop 是否正確應用於文字樣式與圖表 Stroke。

### 2. Dashboard 頁面整合測試 (`app/page.tsx`)
- [x] **Sidebar 導航列渲染**: 應正確顯示「總覽」、「市場動態」、「演化分析」、「決策報告」連結。
- [x] **系統狀態徽章 (Status Badge)**: 應顯示 "AI Worker" 與 "Database" 狀態為 Online。
- [x] **宏觀數據區塊 (Macro Section)**:
    - [x] 應並行抓取三種指標 (GDP, CPI, VIX)。
    - [x] 若 API 回傳數據，應渲染 3 個 `MacroChart` 卡片。
    - [x] 若 API 回傳空 (Error Case)，應顯示「尚未有宏觀數據」的提示訊息。
- [x] **AI 報告區塊 (Reports Section)**:
    - [x] 若有報告，應渲染 `ReportCard`。
    - [x] 若無報告，應顯示「暫無 AI 報告」佔位符。
- [x] **系統狀態面板 (System Status)**: 應顯示 Gemini API 與 Fred Data Source 狀態列。

### 3. 安全性與邊界測試
- [x] **Supabase 斷線模擬**: 當 `supabase.from().select()` 拋出error時，頁面不應 500 Crash，應顯示錯誤狀態或空資料狀態。
- [x] **極端數值顯示**: 驗證當數值極大或極小時，UI 版面未跑版。

## 測試執行結果 (Execution Result)
```bash
Test Suites: 3 passed, 3 total
Tests:       12 passed, 12 total
Snapshots:   0 total
Time:        4.64 s
Ran all test suites.
```
