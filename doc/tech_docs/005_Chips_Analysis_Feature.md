# 籌碼分析功能說明書 (Chips Analysis Feature)

**版本**: 1.0.0
**日期**: 2026-01-22
**狀態**: Prototype (Mock Data)

## 📖 1. 導論 (Introduction)
本文件描述「籌碼分析 (Chips Analysis)」模組之前端實作細節。該功能旨在透過視覺化圖表，揭示三大法人（外資、投信、自營商）與市場主力對個股或大盤的資金佈局，輔助使用者判斷潛在的多空趨勢。

## 🏗️ 2. 系統架構 (Architecture)

### 2.1 組件結構
*   **Page**: `app/chips/page.tsx` (Client Component)
    *   負責頁面佈局、導航與數據聚合。
    *   目前使用 `MOCK_CHIPS_DATA` 作為數據源。
*   **Visual**: `components/ChipChart.tsx`
    *   基於 `Recharts` 的 `ComposedChart`。
    *   **雙軸設計**:
        *   左軸 (Left Y): 法人買賣超金額 (Bar Chart)。
        *   右軸 (Right Y): 加權指數/股價 (Line Chart)。
*   **Data**: `data/mockChips.ts`
    *   提供 30 天期的隨機漫步數據，模擬法人的趨勢性買盤。

### 2.2 技術選型
*   **Framework**: Next.js 14 App Router
*   **Styling**: Tailwind CSS + Glassmorphism (Utility-first)
*   **Icons**: Lucide React (`Layers`, `DollarSign`, `TrendingUp`)
*   **Charts**: Recharts v2.10

## 💾 3. 資料模型 (Data Model)
目前採用 TypeScript Interface 定義模擬數據結構，未來將對接 Supabase `market_chips` 表。

```typescript
export interface ChipData {
    date: string;              // 日期 (YYYY-MM-DD)
    price: number;             // 收盤價
    foreign_investors: number; // 外資買賣超
    investment_trust: number;  // 投信買賣超
    dealer: number;            // 自營商買賣超
    margin_balance: number;    // 融資餘額 (張)
}
```

## 🎨 4. 介面設計 (UI/UX)
*   **Header**: 使用漸層文字 (`bg-clip-text`) 與動態光暈背景，營造高科技質感。
*   **Cards**: 頂部 4 張關鍵指標卡 (StatCard)，依據數值正負自動顯示 紅/綠 顏色 (台股慣例：紅漲綠跌)。
*   **Chart**: 暗色系底圖，搭配霓虹配色 (`#06B6D4`, `#EC4899`)，並具備互動式 Tooltip。

## 🔮 5. 未來規劃 (Future Work)
1.  **Backend Integration**: 實作 `etl/chips.py` 爬取證交所 CSV。
2.  **Date Picker**: 允許使用者自訂查詢區間 (近3月、近半年)。
3.  **Stock Filter**: 支援個股切換 (目前僅模擬單一標的)。
