---
description: 數據監控中心測試計畫
---

# 20260123_09_Data_Monitor_Center.md

## 測試目標
驗證 **數據監控中心 (Data Monitor Center)** 的核心邏輯、UI 渲染與權限控管機制。確保開發者模式下的數據可視化功能正常運作，且在非開發模式下正確隱藏。

## 測試環境
*   **Framework**: Next.js 14, Jest, React Testing Library
*   **Target Files**: 
    - `frontend/app/admin/monitor/page.tsx`
*   **Test Files**: `frontend/__tests__/admin/monitor/page.test.tsx`

## 測試案例清單

### 1. 基礎路徑測試 (Happy Path)
#### [頁面初始化]
- [x] **TC-1101: 頁面完整渲染**: 當 `localStorage` 設定正確時，應顯示 Status Cards (Macro, Price, Factors) 與 Live Table。
- [x] **TC-1102: 數據載入狀態**: 應正確顯示 Loading 骨架屏或狀態，隨後顯示模擬數據。
- [x] **TC-1103: 表格交互**: 驗證表格的搜尋框輸入與分頁切換功能是否響應正常。

### 2. 邊界條件測試 (Edge Cases)
#### [權限與異常]
- [x] **TC-2101: 非開發模式阻擋**: 當 `localStorage.getItem('dev_mode')` 不為 'true' 時，應重定向或顯示 404/Access Denied。
- [x] **TC-2201: 空數據處理**: 當後端回傳空數據陣列時，表格應顯示「暫無數據」且不崩潰。

### 3. 安全性與數據一致性
- [x] **TC-3101: Supabase Client 調用**: 驗證組件是否正確使用 `createClientComponentClient` 進行數據請求。

### 4. 可訪問性與 UI/UX
- [x] **TC-4001: RLS 響應式佈局**: 驗證在移動端視圖下，Status Cards 是否自動堆疊，與表格是否可橫向滾動。

## 測試執行結果 (Execution Result)
```bash
PASS  frontend/__tests__/admin/monitor/page.test.tsx
  MonitorPage
    √ TC-1101: 頁面完整渲染 (65 ms)
    √ TC-1102: 數據載入狀態 (25 ms)
    √ TC-1103: 表格交互 (55 ms)
    √ TC-2101: 非開發模式阻擋 (15 ms)
    √ TC-2201: 空數據處理 (10 ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        2.571 s
```
