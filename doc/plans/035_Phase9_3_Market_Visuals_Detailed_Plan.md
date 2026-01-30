# Phase 9.3：市場熱力圖與看板視覺化詳細實作計畫

**計畫編號**：035
**版本**：1.0.0
**建立日期**：2026-01-30
**所屬階段**：Phase 9.3 (Visual Dashboard)
**狀態**：規劃中 (Planning)

---

## 一、計畫核心目標

利用高級視覺化技術，打造全透明、具備深度洞察力的市場監控看板，符合「Rich Aesthetics」設計規範。

---

## 二、視覺化中心 (Visual Hub)

### 2.1 全市場熱力圖 (`components/Market/Heatmap.tsx`)
*   **技術**: D3.js (Treemap) 或 Recharts。
*   **維度**:
    *   **面積**: 代表成交值 (Value) 或市值。
    *   **顏色**: 代表漲跌幅 (Strength)。
*   **交互**: 鼠標懸停顯示 AI 預測 Alpha 與法人動向。

### 2.2 異動警報看板 (`components/Market/AlertsPanel.tsx`)
*   **Bento Style**: 使用不規則網格展示市場當前亮點。
    *   「爆量長紅排行榜」。
    *   「AI 看多標的異動」。
    *   「法人防禦板塊」。

---

## 三、UI/UX 設計細則 (Premium Design)

### 3.1 配色與光效
*   **Dark Mode**: 預設深色背景。
*   **Glassmorphism**: 卡片具備 20% 透明度與 10px 模糊。
*   **Shadows**: 為熱力圖區塊添加動態陰影，增強層次感。

### 3.2 動態過渡
*   **Layout Transition**: 當市場數據載入時，區塊應具備 Staggered (交錯) 淡入效果。
*   **Number Counting**: 指標數值跳動時使用 Count-up 動畫。

---

## 四、前端路由整理

*   `app/market/page.tsx`: 市場總覽 (Heatmap + Bento Alerts)。
*   `app/screener/page.tsx`: 選股中心 (Filter + Table)。

---

## 五、執行步驟 (Action Plan)

1.  **組件基礎**: 安裝 D3.js 並實作基礎 Treemap 結構。
2.  **數據整合**: 串接 Phase 9.2 的即時報價數據至熱力圖。
3.  **頁面佈置**: 構建 Bento Grid 佈局頁面。
4.  **視覺打磨**: 添加發光邊框與微動畫。
5.  **性能測試**: 確保 500+ 個 DOM 節點渲染時依然流暢。

---

**文件結束**
*計畫編號：035*
