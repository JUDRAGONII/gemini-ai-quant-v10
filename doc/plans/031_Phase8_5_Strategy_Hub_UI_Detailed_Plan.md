# Phase 8.5：智慧策略看板 (Strategy Hub) UI 詳細實作計畫

**計畫編號**：031
**版本**：1.0.0
**建立日期**：2026-01-30
**所屬階段**：Phase 8.5 (Strategy Hub UI)
**關聯任務**：T-AI-008
**狀態**：已完成 (Completed)
**預估工時**：4 人天

---

## 一、計畫核心目標

本計畫旨在將 Phase 8.3/8.4 的 AI 核心能力透過高品質的 Web 介面呈現給用戶。我們將建立一個具備 **Rich Aesthetics (Premium Design)** 的智慧策略看板，並在個股詳情中整合 AI 預測指標。

### 核心視覺原則 (UI/UX Pro Max)
*   **風格**: Glassmorphism (毛玻璃質感)、Glow Effects (發光邊框)。
*   **色彩**: 採用 HSL 調諧的能量色彩 (如：AI 看多使用 #00F2FE -> #4FACFE 漸層)。
*   **動畫**: 使用 Framer Motion 實作卡片載入與指標撥動動畫。

---

## 二、技術架構

### 2.1 API 代理層 (Next.js API Routes)
為了解決跨網域 (CORS) 與隱藏後端端口 (8001) 問題，建立前端 Proxy：
*   `app/api/ai/predict/[symbol]/route.ts` -> 轉發至 `ai-api:8001/api/v1/ai/predict/{symbol}`
*   `app/api/ai/backtest/run/route.ts` -> 轉發至 `ai-api:8001/api/v1/backtest/run` (POST)

### 2.2 前端組件庫 (New Components)
1.  **AIPredictionIndicator**: 位於個股詳情，顯示未來 5 日 Alpha 預測值與熱度計。
2.  **EquityCurveChart**: 基於 Recharts，展示策略淨值 vs 大盤基準。
3.  **StrategyMetricsGrid**: 展示 Sharpe, MDD, Win Rate 的發光卡片組。

---

## 三、詳細設計 (Component Specs)

### 3.1 AI 預測指標 (`AIPredictionIndicator.tsx`)
*   **外觀**: 近似汽車儀表板的半圓環熱度計。
*   **數值**:
    *   中心顯示預測 Alpha (e.g., +2.5%)。
    *   底部顯示勝率 (Win Rate) 與信賴區間。
*   **色調**: 隨 Alpha 正負動態切換主題色 (Emerald/Rose)。

### 3.2 策略看板頁面 (`app/ai/strategy/page.tsx`)
*   **功能**:
    *   標的選擇器 (Stock Selector)。
    *   回測控制台 (參數設定: 手續費、滑價)。
    *   即時運算回傳 Equity Curve。

---

## 四、專案變更路徑

### [NEW]
*   `frontend/app/api/ai/predict/[symbol]/route.ts`
*   `frontend/app/ai/backtest/run/route.ts`
*   `frontend/app/ai/strategy/page.tsx`
*   `frontend/components/AI/AIPredictionIndicator.tsx`
*   `frontend/components/AI/StrategyMetricsGrid.tsx`
*   `frontend/hooks/useAIPrediction.ts`
*   `frontend/hooks/useBacktest.ts`

### [MODIFY]
*   `frontend/app/stocks/[symbol]/page.tsx`: 嵌入 `AIPredictionIndicator`。

---

## 五、執行步驟 (Action Plan)

1.  **API Proxy 實作**: 先通訊，確保前端能抓到 8001 的 JSON 數據。
2.  **組件開發**: 實作 `AIPredictionIndicator` 並在個股頁掛載。
3.  **看板組裝**: 實作回測執行頁面與圖表。
4.  **視覺優化**: 調整 Tailwind 配置提升 Glassmorphism 質感。

---

## 六、驗證計畫

### 自動化測試
*   使用 Jest 測試 API Proxy 轉發邏輯。
*   使用 Cypress/Playwright 驗證回測圖表渲染。

### 手動驗證
1.  點擊個股「2330」，確認「AI 預測指標」正常顯示且具備動畫。
2.  進入 /ai/strategy，輸入「2330」並執行回測，確認 Equity Curve 正確產出。

---

**文件結束**
*計畫編號：031*
*版本：1.0.0*
*建立日期：2026-01-30*
*文件狀態：正式發布*
