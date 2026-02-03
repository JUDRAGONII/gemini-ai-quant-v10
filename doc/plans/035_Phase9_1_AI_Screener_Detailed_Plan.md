# Phase 9.1：AI 多維度選股引擎詳細實作計畫

**計畫編號**：035
**版本**：1.1.0
**最後更新**：2026-02-03
**所屬階段**：Phase 9.1 (AI Screener)
**狀態**：執行中 (Execution)

---

## 🎯 一、核心目標
實作一個高性能、動態感知的選股引擎，整合「技術、籌碼、AI」三種維度，支持千萬級數據量下的毫秒級過濾體驗。

## 🏛️ 二、架構設計 (Architect Audit)
### 2.1 數據模型與過濾策略
- **主查詢對象**：`stock_factors` (JSONB 因子表)。
- **即時數據整合**：JOIN `market_quotes` 表，以支援「即時漲跌幅、即時價」過濾。
- **高性能特化**：
    - 針對選股常用的 JSONB 鍵 (如 `rsi_14`, `ai_score`) 建立 B-Tree 函數索引。
    - 設定 SQL 響應閾值為 **500ms**。

### 2.2 API 規範 (SDD)
- **端點**：`POST /api/v1/market/screen`
- **過濾語法格式**：Range-based (陣列型)，例如 `"rsi_14": [70, 100]`。

---

## 🎨 三、UI/UX 規範 (Pro Max)
### 3.1 選股控制面板
- **視覺**：Glassmorphism (毛玻璃) 漸進式側邊欄。
- **交互**：實作 **Debounce (防炫) 過濾**，避免 Slider 拖動時頻繁請求。

### 3.2 虛擬化表格 (Virtual Table)
- **Sparklines**：內核內嵌迷你走勢圖。
- **AI-Badges**：高分標的具備 **動態發光 (Glow Effect)**。

---

## 🛠️ 四、執行步驟 (Action Plan)
1.  **[後端]** 實作 `ScreenerRepository`：動態構建支持 JSONB 的 SQL 查詢。
2.  **[後端]** 完成 `/api/v1/market/screen` 端點。
3.  **[前端]** 封裝 `useScreener` Hook。
4.  **[前端]** 打造 Glassmorphism 篩選器面板與虛擬表格。
5.  **[驗證]** 進行千萬級數據壓力測試與 UI 視覺審核。

---
**核准記錄**：已由 USER 核准。執行路徑對齊 V10 精品規範。决。
