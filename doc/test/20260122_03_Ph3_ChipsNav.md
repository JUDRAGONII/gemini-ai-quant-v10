# 20260122_Dashboard_ChipsNav_TestPlan.md

## 測試目標
驗證儀表板 (Dashboard) 側邊欄導航功能，確保新增的「籌碼分析 (Chips Analysis)」連結正確運作。

## 測試環境
*   **Framework**: Next.js 14, Jest, React Testing Library
*   **Target File**: `frontend/app/page.tsx`
*   **Test File**: `frontend/__tests__/app/page.test.tsx`

## 測試案例清單

### 1. 側邊欄導航 (Sidebar Navigation)
- [x] **籌碼分析連結存在**: 驗證側邊欄中包含 label 為 "籌碼分析 (Chips)" 的連結。
- [x] **連結屬性正確**: 驗證該連結的 `href` 屬性指向 `/chips`。
- [x] **Icon 渲染**: 驗證該連結包含正確的 Icon (Layers)。

### 2. 回歸測試 (Regression)
- [x] **原有連結保持**: 確認「總覽」、「市場動態」等舊有連結未被覆蓋或移除。

## 測試執行結果 (Execution Result)
```bash
> ai-invest-frontend@0.1.0 test
> jest

PASS __tests__/app/page.test.tsx
  Dashboard 頁面整合測試
    ...
    ✓ Sidebar 連結: 驗證籌碼分析指向正確路徑 (22 ms)
    ...

Test Suites: 3 passed, 3 total
Tests:       13 passed, 13 total
Snapshots:   0 total
Time:        3.643 s
Ran all test suites.
```
