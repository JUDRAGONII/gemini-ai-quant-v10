# Phase 4.5-CORE：前端核心功能強化計畫

**計畫編號**：023
**版本**：1.0.0
**建立日期**：2026-01-28
**所屬階段**：Phase 4.5 (Core Features)
**關聯任務**：T-CORE-001, T-CORE-002, T-CORE-003, T-CORE-004
**狀態**：已完成 (Completed)

---

## 一、計畫概述

### 1.1 階段背景
本計畫旨在強化 AI 投資分析儀的核心金融數據呈現與用戶自定義功能。基於 Phase 4.2 的基礎，進一步實作專業級的技術分析圖表、自選股管理、以及融資融券與籌碼面的深度分析頁面，為後續的 AI 智能分析奠定堅實的數據視覺化基礎。

### 1.2 核心目標
1.  **K線圖技術分析**：整合 TradingView Lightweight Charts，提供如同業水準的互動式 K 線圖與技術指標。
2.  **自選股管理**：建立用戶個性化的投資追蹤清單，支援即時報價與管理。
3.  **籌碼與信用交易**：視覺化呈現融資融券變化與三大法人買賣超，輔助判讀市場情緒。

---

## 二、功能規格與工作分解

### 2.1 K線圖技術分析 (T-CORE-001)

*   **功能描述**：
    *   整合 TradingView Lightweight Charts v5.1.0。
    *   支援日/週/月 K 線週期切換。
    *   疊加 MA 移動平均線 (5, 10, 20, 60, 120)。
    *   獨立面板顯示成交量、RSI (14)、MACD (12, 26, 9)。
*   **技術實現**：
    *   建立 `KLineChart` 與 `TechnicalIndicatorPanel` 組件。
    *   指標計算採前端即時運算 (`technicalindicators` library) 以確保響應速度。
    *   RWD 響應式設計，支援 ResizeObserver。

### 2.2 自選股管理功能 (T-CORE-002)

*   **功能描述**：
    *   用戶可新增、刪除、查看自選股票。
    *   列表顯示即時價格、漲跌幅。
    *   支援股票代碼搜尋添加。
*   **技術實現**：
    *   Backend: PostgreSQL `user_watchlist` 表，啟用 RLS (Row Level Security) 確保資料隔離。
    *   API: `GET`, `POST`, `DELETE` `/api/watchlist`。
    *   Frontend: SWR 緩存策略，每 60 秒自動刷新報價。

### 2.3 融資融券分析 (T-CORE-003)

*   **功能描述**：
    *   展示融資餘額、融券餘額、券資比趨勢。
    *   標示 20% 券資比警戒線 (軋空訊號)。
    *   整合股價走勢對比。
*   **技術實現**：
    *   API: `/api/stocks/[symbol]/margin`。
    *   UI: Recharts `ComposedChart` (Area + Line)。
    *   Hook: `useStockMargin` 封裝數據獲取邏輯。

### 2.4 三大法人買賣超 (T-CORE-004)

*   **功能描述**：
    *   展示外資、投信、自營商每日買賣超金額。
    *   累計買賣超統計 (近 7/30 日)。
    *   法人佔比圓餅圖。
*   **技術實現**：
    *   API: 整合既有 `/api/stocks/[symbol]/chips`。
    *   UI: Stacked Bar Chart (買賣超) + Line Chart (收盤價)。
    *   配色: 標準化法人代表色 (外資-藍, 投信-粉, 自營-橙)。

---

## 三、驗收標準

1.  **功能完整性**：所有規劃功能 (K線, 自選, 融資, 法人) 均需實作完畢並可操作。
2.  **安全性**：自選股功能必須通過 RLS 驗證，用戶無法存取他人資料。
3.  **效能**：圖表渲染不應造成頁面卡頓，API 回應時間需在合理範圍 (<500ms)。
4.  **測試覆蓋**：核心組件需具備單元測試，總覆蓋率 > 80%。

---

## 四、交付成果

| 項目 | 類型 | 內容 |
| :--- | :--- | :--- |
| **程式碼** | Frontend | `KLineChart`, `WatchlistPage`, `MarginPage`, `InstitutionalPage` |
| **程式碼** | Backend | `watchlist` migration, 相關 API Routes |
| **測試** | Documents | `Validation.md` (KLine, Watchlist, Margin, Institutional) |
| **測試** | Test Suites | `*.test.tsx` (覆蓋率 100%) |

---

*文件狀態：已歸檔 (Archived)*
