# Phase 9：行情即時監控與選股中心詳細實作計畫

**計畫編號**：032
**版本**：1.0.0
**建立日期**：2026-01-30
**所屬階段**：Phase 9 (Market Monitoring & AI Screener)
**關聯任務**：T-AI-009, T-AI-010
**狀態**：規劃中 (Planning)
**預估工時**：10 人天

---

## 一、計畫核心目標

本計畫旨在構建專業級的 **行情監控中樞** 與 **AI 多維度選股引擎**，將 Phase 8 產出的 AI 預測能力轉化為可即時指導交易的工具。

### 核心任務
1.  **AI 選股引擎 (AI Screener)**: 實作支持「技術面 + 籌碼面 + AI 預測」三位一體的交叉篩選器。
2.  **效能平衡報價中繼 (Quota-Balanced Market Relay)**: 建立具備配額感知的報價機制，預設每 30 分鐘更新一次全市場行情。
3.  **市場熱力圖 (Market Heatmap)**: 實作視覺化全市場資金流向的 Treemap。
4.  **智慧監控看板 (Market Bento)**: 提供 Bento Grid 風格的市場概覽，含異動紀錄。

---

## 二、技術架構設計

### 2.1 選股引擎架構 (Backend Screener)
*   **數據下沉**: 篩選邏輯將直接執行於 PostgreSQL。
*   **動態 SQL**: 使用 SQLAlchemy/SQL 構建器動態組合過濾條件。
*   **核心欄位**: `stock_factors.factors_all` (JSONB) 將是篩選的核心。

### 2.2 行情更新方案 (Market Update Strategy)
*   **智慧節流機制**: 建立 `QuotaManager` 監控 API Key 池 (Fugle, Tiingo) 剩餘配額。
*   **分層更新頻率**: 
    - *熱門標的 (自選股)*: 每 15 分鐘更新。
    - *全市場標的*: 每 30-60 分鐘執行一次「滾動式回補」，確保不耗盡免費配額。
*   **快取策略**: 使用 Redis 存儲最新行情快照，供選股引擎與前端即時讀取。

---

## 三、前端 UI/UX 設計 (Rich Aesthetics)

### 3.1 AI 選股器 (`app/screener/page.tsx`)
*   **Filter Panel**: 滑動式側邊欄或頂部彈出窗。
    *   *AI 條件*: 5D Alpha > 2%, 勝率 > 60%。
    *   *籌碼條件*: 法人連續買超 > 3日, 融資減少。
    *   *技術條件*: RSI 強勢、MA20 翻揚。
*   **Data Table**: 虛擬化滾動表格 (Virtual Scroll)，支援毫秒級排序。

### 3.2 行情熱力圖 (`components/Market/Heatmap.tsx`)
*   **視覺效果**: 使用 D3.js 或 Recharts 實作 Treemap。
*   **交互**: 點擊區塊跳轉至個股詳情，顏色深淺代表漲跌幅強度。

---

## 四、API 規格定義

### 4.1 執行選股 (`POST /api/v1/screener/filter`)
*   **Request**:
    ```json
    {
      "filters": {
        "technical": {"rsi_14": {"gt": 70}},
        "chips": {"inst_buy_days": {"gte": 3}},
        "ai": {"predicted_alpha": {"gt": 0.02}}
      },
      "sort_by": "predicted_alpha",
      "limit": 50
    }
    ```

### 4.2 市場異動 (`GET /api/v1/market/alerts`)
*   返回最近 5 分鐘內的異常波動 (如：爆量長紅、瞬間大單)。

---

## 五、執行步驟 (Action Plan)

### 第一階段：選股引擎與 API (Day 1-3)
1.  [BACKEND] 實作 `ScreenerRepository`，封裝動態 JSONB 查詢邏輯。
2.  [BACKEND] 建立 `/api/v1/screener` 端點。
3.  [FRONTEND] 建立選股基礎頁面與 Filter UI。

### 第二階段：即時報價與監控 (Day 4-7)
1.  [BACKEND] 實作 `MarketRelayWorker` (Fugle Polling -> Cache)。
2.  [FRONTEND] 實作行情快照組件 (Market Ticker)。
3.  [FRONTEND] 實作市場熱力圖 (Heatmap)。

### 第三階段：智慧看板整合 (Day 8-10)
1.  [FRONTEND] 實作 Bento Grid 布局。
2.  [UI/UX] 添加微動畫 (Motion) 與發光特效。
3.  [VERIFY] 全流程數據精度驗證。

---

## 六、驗證計畫

### 自動化測試
*   使用 `pytest` 測試 `ScreenerRepository` 的複雜 SQL 生成。
*   驗證 API 返回數據是否與資料庫真實因子一致。

### 手動驗證
1.  在選股器設定「法人買超 + AI 預測正向」，檢查結果是否正確過濾出對應股票。
2.  觀察熱力圖，確認顏色與數值是否隨行情即時跳動。

---

**文件結束**
*計畫編號：032*
*版本：1.0.0*
*建立日期：2026-01-30*
*文件狀態：正式發布*
