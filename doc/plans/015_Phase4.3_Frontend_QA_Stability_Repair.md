# 015 Phase 4.3: 前端測試穩定性修復 (Frontend QA Stability)

## 1. 任務背景
前端自動化測試在並行執行時不穩定，且 Console 充滿 React 渲染警告，影響 GitHub Actions CI 的可靠性。

## 2. 核心突破與修復

### A. 全域 Mock 穩定化 (`jest.setup.js`)
*   **Lucide 圖標快取 (Component Caching)**：
    - 問題：Proxy 每次調用都生成新元件，觸發 React 不斷重建 (Re-mounting)。
    - 方案：引入 `iconCache`，確保相同的圖標名稱返回相同的元件實體。
*   **導覽元件封裝**：補齊 `useParams` 與 `useSearchParams` 的全域 Mock，支援深層動態路由測試。
*   **背景環境模擬**：加入 `ResizeObserver` Polyfill 與 `Recharts` 基礎 SVG Mock。

### B. 測試套件衝突解決
*   **`macro/page.test.tsx`**：透過局部 Mock (`Sidebar`, `MobileNav`) 隔離導覽組件的異步干擾，解決了並行測試時的競爭崩潰。
*   **數據補齊**：為 AI 報告與列表渲染補齊測試需要的 `id` 屬性，消除 React "Missing Key" 警告。
*   **整合測試斷路器**：實作 `SUPABASE_SERVICE_ROLE_KEY` 檢測，在環境變數缺失時自動跳過 `dataIntegrity.test.ts`。

## 3. 實施成果
*   **Test Suites**: 18 Total (17 Passed, 1 Skipped).
*   **Test Cases**: 93 Passed.
*   **GitHub CI**: 通過自動化驗證。

---
**歸檔日期**：2026-01-26
**狀態**：✅ 已完成並通過 CI 驗證。
