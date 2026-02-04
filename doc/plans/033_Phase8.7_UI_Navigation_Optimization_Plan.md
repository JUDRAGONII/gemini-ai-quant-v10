# 個股佈局優化、AI 報告標籤化與導航修復實作計畫 (Phase 8.7)

## 🎯 目標
優化個股詳情頁面的用戶體驗，解決導航冗餘與資訊分散問題：
1.  **佈局精簡**: 統一「返回」按鈕至 Header，移除頁面內重複元素。
2.  **資訊集成**: 將 AI 決策報告以標籤分頁 (Tabs) 形式整合進個股詳情。
3.  **導航強化**: 修正排行榜至 AI 報告的跳轉路徑，解決 Server-side 認證故障。

## 🏛️ 變更內容

### [MODIFY] [StockDetailLayout](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/frontend/app/stocks/[symbol]/layout.tsx)
-   將返回按鈕移至頂部 Header。
-   注入 `FileText` (Lucide) 圖標支援 AI 報告分頁標籤。

### [NEW] [AI Report Tab](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/frontend/app/stocks/[symbol]/report/page.tsx)
-   建立獨立路由頁面。
-   實作 Server-side Fetch 獲取最新報告並渲染 Markdown。
-   整合 `ScoreRadarChart` 展示 AI 評分。

### [MODIFY] [RankingPage](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/frontend/app/ai/ranking/page.tsx)
-   修正「查看 AI 投資報告」連結，導向 `/stocks/[symbol]/report`。
-   修復 `name` 屬性讀取錯誤。

### [MODIFY] [Infrastructure](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/docker-compose.yml)
-   為前端容器注入 `SERVICE_ROLE_KEY`。

## ✅ 驗證計畫
1.  **自動化測試**: 執行 `stock_optimization.test.tsx` 驗證佈局與導航。
2.  **回歸測試**: 確保 `portfolio_crud` 與 `ranking` 測試持續通過。
3.  **環境驗證**: 在 Docker 環境執行 `/local-ci-v10` 確保跨平台相容性。

---
**核准狀態**: 已完成 (COMPLETED)
