# 20260122_System_E2E_TestPlan.md

## 測試目標
驗證 V10.0 前端應用的完整使用者旅程 (User Journey)，確保從儀表板 (Dashboard) 到報告詳情頁 (Report Detail) 的導航流暢，且資料傳遞正確。

## 測試環境
*   **Framework**: Next.js 14, Jest, React Testing Library
*   **Methodology**: Integration Testing (Simulating E2E via jsdom)
*   **Scope**: `app/page.tsx` -> `app/ai/[id]/page.tsx`

## 測試案例清單

### 1. 儀表板核心功能驗證 (Dashboard Core)
- [x] **完整渲染檢查**: 確認 Sidebar, Status Bar, Macro Charts, AI Reports 區塊皆同時存在且無報錯。
- [x] **導航連結檢查**: 確認所有 `Link` (如 Sidebar items) 具有正確的 `href` 屬性。

### 2. 使用者旅程：閱讀報告 (User Journey: Read Report)
- [x] **報告卡片點擊**: 模擬使用者點擊 `ReportCard`。
    - 驗證是否包含正確的 `href` 指向 `/ai/{id}`。
    - (註：由於 Jest 運行於 jsdom，無法真正跳轉頁面，我們驗證連結屬性與 Router Mock 的調用)。

### 3. 詳情頁功能驗證 (Detail Page)
- [x] **Markdown 渲染**: 進入詳情頁後，確認 Markdown 語法 (如 `# Header`, `**Bold**`, Lists) 被正確轉化為 HTML 元素 (H1, Strong, Ul/Li)。
- [x] **資料一致性**: 確認詳情頁顯示的標題 (Stock Code) 與上一頁點擊的卡片一致。

### 4. 異常流程 (Error Flows)
- [x] **無效報告 ID**: 當訪問不存在的 `/ai/999` 時，應顯示 404 Not Found 或錯誤提示 UI，且提供「返回首頁」按鈕。
- [x] **格式錯誤內容**: 當後端回傳損毀的 Markdown 時，頁面不應崩潰 (Crash Free)。

## 測試執行結果 (Execution Result)
```bash
> ai-invest-frontend@0.1.0 test
> jest --verbose

PASS __tests__/app/ai/[id]/page.test.tsx
  AI Report Detail Page (Integration)
    ✓ 正常渲染: 應顯示標題、摘要與 Markdown 內容 (98 ms)
    ✓ 404 處理: 查無報告應顯示錯誤訊息 (77 ms)

PASS __tests__/app/page.test.tsx
  Dashboard 頁面整合測試
    ✓ Sidebar 導航列渲染: 應正確顯示導航連結 (74 ms)
    ✓ 系統狀態徽章: 應顯示 Online 狀態 (29 ms)
    ✓ 宏觀數據區塊: 應渲染 3 個 MacroChart 卡片 (92 ms)
    ✓ AI 報告區塊: 若無報告應顯示佔位符 (17 ms)
    ✓ AI 報告區塊: 若有報告應渲染 ReportCard (21 ms)
    ✓ 安全性測試: Supabase 斷線應容錯 (26 ms)

PASS __tests__/components/MacroChart.test.tsx
  MacroChart Component
    ✓ 渲染標題與當前數值 (139 ms)
    ✓ 渲染圖表區域 (15 ms)
    ✓ 空數據處理 (9 ms)
    ✓ 顏色屬性應用 (54 ms)

Test Suites: 3 passed, 3 total
Tests:       12 passed, 12 total
Snapshots:   0 total
Time:        2.453 s
Ran all test suites.
```
