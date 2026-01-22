# 004_Phase3_Frontend_Plan.md

## 📅 任務元數據 (Metadata)
*   **日期**: 2026-01-22
*   **階段**: Phase 3 Frontend Development
*   **目標**: 實作 Next.js 14 前端介面，視覺化展示宏觀數據與 AI 分析報告。

## ✅ 執行項目 (Executed)
1.  **基礎建設**:
    *   `package.json`: 引入 `lucide-react`, `recharts`, `@supabase/supabase-js`.
    *   `lib/supabase.ts`: 建構 Client-side Singleton，支援 SSR/CSR 雙模式環境變數。
2.  **Dashboard 因為 (Dashboard UI)**:
    *   **Trend Charts**: 使用 `recharts` 實作 `MacroChart.tsx` (AreaChart + Gradient + Glassmorphism).
    *   **Grid Layout**: 響應式佈局 (Mobile/Desktop) 展示 GDP, CPI, VIX 趨勢。
    *   **System Status**: 實作即時狀態面板 (Gemini API, DB Connection).
3.  **UI 設計 (Design System)**:
    *   色票: Cyan/Blue (Tech), Amber/Pink (Data).
    *   風格: Glassmorphism (白/黑透明疊加), Backdrop Blur.

## 🚧 待辦項目 (Pending)
1.  **AI Report Detail Page**: `app/ai/[id]/page.tsx` - 完整呈現 Markdown 報告。
2.  **Mobile Navigation**: 手機版漢堡選單 (目前側邊欄在 Mobile 隱藏)。

## 📊 成果指標
*   **視覺化**: 成功渲染 3 組宏觀指標的歷史趨勢圖。
*   **效能**: 頁面載入速度 < 1.5s (ISR Revalidate 30s).
*   **整合度**: 前端可直接讀取後端 ETL 寫入的 `macro_indicators` 表。

## 🔗 相關文件
*   [003_Phase3_CICD_Plan.md](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/doc/plans/003_Phase3_CICD_Plan.md)
*   [page.tsx](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/frontend/app/page.tsx)
