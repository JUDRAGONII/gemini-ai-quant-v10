# 006_Phase4.2_CoreListings.md
**日期**: 2026-01-22
**階段**: Phase 4.2 - 核心功能強化
**執行者**: Antigravity AI Agent

---

## 📋 任務目標
完成個股核心業務流程，包含卡片展示、行情圖表、列表與排行榜頁面。

---

## 🛠️ 開發內容

### 1. 個股卡片 (`components/StockCard.tsx`)
- 實作互動式股票卡片，顯示即時漲跌幅與 Sparkline 小圖。
- 支援台美股雙市場標示 (TW/US)。

### 2. 個股列表頁 (`app/stocks/page.tsx`)
- 實作分頁列表與快速篩選器。
- 整合 `StockCard` 進行網格展示。

### 3. 市場排行榜 (`app/ranking/page.tsx`)
- 實作「成交量」、「漲幅」、「跌幅」三大排行榜。
- 引入 `Tab` 切換組件與動態排序邏輯。

### 4. 基礎圖表 (`components/Chart/PriceChart.tsx`)
- 實作基於 Recharts 的簡易 K 線預覽圖 (AreaChart)。
- 用於列表頁的快速走勢預覽。

---

## ✅ 驗證結果
- [x] TDD: 完成 Phase 4.2 相關測試共 49 項全數通過。
- [x] UI: 確認卡片在各種尺寸下的 RWD 適配性。
