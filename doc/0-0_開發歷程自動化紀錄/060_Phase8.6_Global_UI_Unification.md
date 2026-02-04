# 060_Phase8.6_Global_UI_Unification.md

## 📅 日期: 2026-02-02
## 🏷️ 標籤: #UIUX #Bilingual #RWD #Sidebar #NextJS

---

## 🚩 任務目標
將「投資組合」與「AI 智慧系列」頁面全面對齊 V10 精品視覺規範，實施左側導航佈局、RWD 響應式適配與「中大英小」雙語設計。

## 🛠️ 實作細節

### 1. 全域佈局重構 (Global Layout)
- **新增檔案**:
    - [ai/layout.tsx](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/frontend/app/ai/layout.tsx): 整合 `Sidebar` 與 `MobileNav`，為所有 AI 分頁提供統一導航環境。
    - [portfolios/layout.tsx](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/frontend/app/portfolios/layout.tsx): 為投資組合模組引入相同的佈局規範。
- **佈局特點**:
    - 桌面端固定側欄 (`ml-64`)。
    - 行動端自動切換至彈出式導航，內容區全屏顯示 (`ml-0`)。

### 2. 雙語 UI 規範實作 (Bilingual UI)
- **側邊欄更新**: 
    - 修改 `Sidebar.tsx` 的 `MENU_ITEMS` 與 `NavItem`。
    - 採用解析 `label (ENGLISH)` 格式，實現上方繁中大字、下方英文小字 (9px, Monospace) 的精品視覺。
- **頁面內容同步**:
    - [Strategy Hub](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/frontend/app/ai/strategy/page.tsx): 更新麵包屑與主標題為雙語格式。
    - [AI Ranking](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/frontend/app/ai/ranking/page.tsx): 重構標題層次。
    - [AI Search](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/frontend/app/ai/search/page.tsx): 優化搜尋框比例與標題風格。
    - [Portfolios](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/frontend/app/portfolios/page.tsx): 全面升級為 GlassContainer 風格。

### 3. RWD 適配優化
- 統一各分頁容器寬度為 `max-w-7xl`。
- 修改頂部間距以適應 `MobileNav` 的 Sticky 狀態。

## ✅ 驗證結果
- **導航測試**: 側邊欄高亮邏輯在各子路徑下運作正常。
- **視覺一致性**: 所有深度分頁之圓角、漸層與模糊度 (Backdrop Blur) 參數完成校準。
- **Git 提交**: `e24261f` (develop -> develop-ai-quant-v10)。

## 💡 經驗與教訓
- 在使用 `Sidebar` 的 Layout 模式時，必須加入 `pt-20` (Mobile) 與 `pt-8` (Desktop) 的間隙補償，以防內容被頂部導航遮擋。
- `split(' (')` 是處理現有 Label 格式並實現雙語分離最快且低改動的路徑，符合 KISS 原則。

---
決。
