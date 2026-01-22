# 📚 Phase 4.2 核心功能強化 - 技術說明書

**版本**: v1.0
**日期**: 2026-01-22
**作者**: Tech Writer Expert
**狀態**: 已發布

---

## 1. 概述
本階段 (Phase 4.2) 核心目標為強化前台量化分析功能，落實 **UI/UX Pro Max** 設計規範，並解決伺服器端渲染 (SSR) 與客戶端 (CSR) 數據不一致問題。重點交付包含全新的股票查詢模組與 AI 智能評分排行系統。

## 2. 核心功能

### 2.1 股票查詢模組 (Stock Analysis Module)
- **路徑**: `/stocks` & `/stocks/[symbol]`
- **功能**:
  - **即時篩選**: 支援代碼/名稱搜尋，及台股/美股市場切換。
  - **動態走勢**: 利用 `Recharts` 繪製響應式價格走勢區域圖 (Area Chart)。
  - **智能雷達**: 五維度 (價值/成長/動能/品質/籌碼) 雷達圖，直觀展示個股體質。

### 2.2 AI 評分排行 (AI Ranking System)
- **路徑**: `/ai/ranking`
- **功能**:
  - **綜合評分**: 整合五大因子計算 0-100 分綜合指標。
  - **動態排序**: 支援依據任一維度進行升冪/降冪排序。
  - **互動式分析**: 點擊排行榜行項目，右側即時聯動顯示雷達分析圖。

## 3. 技術架構

### 3.1 前端技術棧
- **Framework**: Next.js 14 (App Router)
- **UI Library**: Tailwind CSS + Glassmorphism (Glass UI)
- **Charts**: Recharts (AreaChart, RadarChart)
- **Icons**: Lucide React

### 3.2 數據流設計
- **Mock Data Strategy**:
  - 使用 `mockRanking.ts` 提供穩定的測試數據。
  - 解決 Hydration Mismatch: 移除 `Math.random()`，改用預定義固定數據集 (`FIXED_SCORES`)。

### 3.3 組件設計 (Atomic Components)
| 組件 | 用途 | props |
|:---|:---|:---|
| `StockCard` | 列表頁單個股票展示 | `symbol`, `price`, `changePercent`, `sparklineData` |
| `PriceChart` | 價格走勢圖 | `data` (OHLCV array), `symbol` |
| `ScoreRadarChart` | 評分雷達圖 | `data` (dimension array), `size` |
| `RankingTable` | 可排序表格 | `data`, `pageSize`, `onRowClick` |

## 4. 測試策略
- **Unit/Integration Test**: Jest + React Testing Library。
- **Coverage**: 涵蓋組件渲染、互動邏輯 (Sorting/Filtering)、以及非同步更新 (Fake Timers)。
- **E2E**: 瀏覽器驗證流程包含首頁導航、列表篩選、詳情頁跳轉。

## 5. 後續規劃
- **API 整合**: Phase 4.3 將對接 Supabase 真實數據源。
- **Server Component 優化**: 減少 Client Bundle Size。
