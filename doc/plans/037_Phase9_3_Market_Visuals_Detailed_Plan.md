# Phase 9.3：市場熱力圖 (Market Heatmap) 詳細實作計畫

**計畫編號**：037
**版本**：2.0.0
**最後更新**：2026-02-03
**所屬階段**：Phase 9.3 (Market Heatmap)
**狀態**：執行中 (Execution)

---

## 🧠 一、深度思考分析 (Thinking Phase)

### 1.1 需求解構
> **目標**：打造類似 Finviz/TradingView 的全市場動態熱力圖，讓用戶透過色塊面積與顏色直覺感知市場強弱。

### 1.2 底層分析 (First Principles)
| 問題 | 分析 |
|:---|:---|
| **數據來源** | `stocks` (sector/industry) JOIN `market_quotes` (price/change_percent) |
| **分組邏輯** | 按 `sector` → `industry` → `stock_code` 三級樹狀結構 |
| **面積權重** | 代表市值或成交量 (目前以 `volume` 作為代理) |
| **顏色映射** | 基於 `change_percent`：紅色 (跌) ↔ 綠色 (漲) |

### 1.3 方案對比
| 方案 | 優點 | 缺點 | 推薦度 |
|:---|:---|:---|:---:|
| **A: D3.js Treemap** | 彈性極高、動畫細膩 | 學習曲線陡峭、SSR 不友善 | ⭐⭐⭐ |
| **B: Recharts Treemap** | React 生態整合良好、SSR 友善 | 動畫與互動受限 | ⭐⭐⭐⭐ |
| **C: 純 CSS Grid + 手動繪製** | 零依賴、輕量 | 大量節點效能差、排版複雜 | ⭐⭐ |

**決策**：採用 **方案 B (Recharts Treemap)**，因其與專案現有圖表體系一致 (recharts)、避免引入額外依賴，且足以滿足 1000+ 節點之效能需求。

---

## 🎯 二、核心目標
1. **熱力圖組件** (`MarketHeatmap.tsx`)：視覺化全市場漲跌強弱。
2. **後端 API** (`/api/v1/market/heatmap`)：聚合 `stocks` + `market_quotes` 返回階層資料。
3. **整合至市場總覽頁面** (`/market`)：作為核心視覺焦點。

---

## 📐 三、技術規格 (SDD Spec)

### 3.1 API 規格
```
POST /api/v1/market/heatmap
Request: { "market_type"?: "TWSE" | "TIINGO" | "ALL", "group_by"?: "sector" | "industry" }
Response: {
  "name": "市場",
  "children": [
    {
      "name": "電子工業",
      "children": [
        { "name": "台積電", "stock_code": "2330", "value": 50000000, "change_percent": 1.25 },
        ...
      ]
    },
    ...
  ]
}
```

### 3.2 前端組件
- `hooks/useHeatmap.ts`：SWR 數據抓取 Hook。
- `components/Market/MarketHeatmap.tsx`：Recharts Treemap 封裝。
- `app/market/page.tsx`：整合熱力圖與市場總覽。

---

## 🎨 四、UI/UX 規範 (Rich Aesthetics)
- **色彩映射**：`-10% → #dc2626 (紅)` ↔ `+10% → #16a34a (綠)`，中間為 `#fbbf24 (黃)`。
- **Hover 效果**：浮現股票詳情 Tooltip (代號、名稱、漲跌幅、成交量)。
- **Glassmorphism 容器**：熱力圖外框使用玻璃擬態卡片包裹。

---

## ✅ 五、驗收標準
- [ ] API 返回正確的階層資料結構。
- [ ] 熱力圖正確渲染 1000+ 節點。
- [ ] 顏色映射與漲跌幅一致。
- [ ] Hover Tooltip 顯示正確資訊。
- [ ] 前端頁面無報錯 (Status 200)。

---

**文件結束**
*計畫編號：037 | 版本 2.0.0*

