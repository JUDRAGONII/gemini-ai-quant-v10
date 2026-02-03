# 全站視覺風格與雙語 UI 統一實作計畫 (V10.3.3)

## 🎯 目標
將「投資組合 (Portfolios)」、「AI 智慧系列（策略、排名、搜索）」頁面全面對齊 V10 精品視覺規範：
1.  **側邊欄導航**: 引入左側側邊欄，解決分頁分散感。
2.  **響應式設計 (RWD)**: 確保在手機、平版、桌面端均有完美的適配顯示。
3.  **雙語精品化**: 實施「繁體中文優先，英文小字」的視覺邏輯 (如：**智慧策略 <span className="text-xs">Strategy</span>**)。
4.  **視覺層次**: 統一使用 `text-4xl font-black` 漸層標題與 Glassmorphism 組件。

## 🏛️ 架構變更：側邊欄佈局 (Sidebar Layout)
在 AI 與 Portfolio 模組引入全域側邊欄，解決目前分頁「漂浮」感與導航缺失。

### [NEW] [ai/layout.tsx](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/frontend/app/ai/layout.tsx)
-   整合 `Sidebar` 與 `MobileNav`。
-   提供統一的內容容器 (Content Container) 與 `ml-64` 偏置。

### [NEW] [portfolios/layout.tsx](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/frontend/app/portfolios/layout.tsx)
-   比照 `ai/layout.tsx` 實現側邊欄導航佈局。

## 🎨 視覺規範：雙語化與精品化 (Bilingual & Premium UI)
> [!IMPORTANT]
> **雙語規範**: 所有文字以「繁體中文」為主體，關鍵詞或標題後方跟隨「英文小字 (small/opacity-50)」。

### [MODIFY] [Sidebar.tsx](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/frontend/components/layout/Sidebar.tsx)
-   更新 `MENU_ITEMS` 標籤格式：`label: <span>智慧策略 <span className="text-[10px] opacity-40">Strategy</span></span>`。

### [MODIFY] AI & Portfolio 頁面內容
-   **標題**: 改為 `智慧策略 <span className="text-sm opacity-50">Strategy Hub</span>` 格式。
-   **色彩**: 統一使用 `Indigo-Purple` 漸層。
-   **卡片**: 統一圓角為 `rounded-[2.5rem]` 與 `backdrop-blur-md`。

## 🕵️ 代碼審核 (Code Review)
-   確保各分頁移除重複的 `Sidebar` 引用。
-   檢查 `router.back()` 導航邏輯的一致性。

## ✅ 驗證計畫
1.  **側邊欄驗證**: 確認進入各分頁時側邊欄持續存在且高亮狀態正確。
2.  **雙語檢視**: 人工檢查所有主標題與側欄項目是否符合「中大英小」規範。
3.  **RWD 測試**: 
    - 模擬 iPhone 14 (375px) 寬度：確認側欄隱藏，出現漢堡選單。
    - 模擬 Desktop (1440px) 寬度：確認側欄固定在左側，內容具備正確 `ml-64` 邊距。

---
**核准狀態**: 已完成 (COMPLETED)
