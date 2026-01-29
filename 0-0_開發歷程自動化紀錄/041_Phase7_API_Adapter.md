# 041_Phase7_API_Adapter (P0)

## 1. 需求解構 (Thinking Phase)
- **目標**：將 Phase 7 建立的 PostgreSQL 技術指標視圖與真實數據庫連接對接到前端 API，消除 Mock 數據依賴。
- **問題診斷**：
  - `/api/stocks/[symbol]/technical` 使用 `generateMAData()` 等函數生成假數據
  - `/api/ai/scores` 使用 `generateMockScores()` 生成虛擬評分
- **解決方案**：
  - 對接 `v_stock_technical_indicators` 視圖查詢真實技術指標
  - 改用 `stock_factors` + `stocks` 表查詢真實 AI 評分數據

## 2. 執行開發與審查 (Execution & /code-review)

### 2.1 技術指標 API 適配
**檔案**：`frontend/app/api/stocks/[symbol]/technical/route.ts`

**變更內容**：
- 移除 `generateMAData()`, `generateRSIData()`, `generateMACDData()`, `generateBollingerData()` 假數據函數
- 新增 Supabase 連接與 `v_stock_technical_indicators` 視圖查詢
- 支援 `indicators` 參數動態過濾 MA/RSI/MACD/Bollinger
- 支援 `limit` 參數控制返回筆數

**關鍵程式碼**：
```typescript
const { data, error } = await supabase
    .from('v_stock_technical_indicators')
    .select('*')
    .eq('stock_code', symbol)
    .order('trade_date', { ascending: false })
    .limit(limit);
```

### 2.2 AI 評分 API 適配
**檔案**：`frontend/app/api/ai/scores/route.ts`

**變更內容**：
- 移除 `generateMockScores()` 假數據函數
- 新增 `stock_factors` 真實數據查詢
- 計算評分統計數據 (avg_composite, highest, lowest)
- 支援分頁與排序參數

**關鍵程式碼**：
```typescript
const { data: factorsData, error: factorsError } = await supabase
    .from('stock_factors')
    .select('stock_code, trade_date, pe_ratio, pb_ratio, revenue_growth, eps_growth, momentum_1m, roe, gross_margin, composite_score')
    .ilike('stock_code', market === 'TW' ? '%TW' : '%')
    .order('trade_date', { ascending: false });
```

## 3. 驗證與效能測試 (Verification)

### 3.1 API 返回格式標準化
所有 API 端點統一響應格式：
```json
{
  "status": "success" | "error",
  "data": { ... },
  "meta": { "page": 1, "per_page": 50, "total": 980, "has_more": true },
  "timestamp": "2026-01-28T15:30:00.000Z"
}
```

### 3.2 技術指標查詢效能
- **預期延遲**：< 200ms (對比之前 >3s)
- **數據來源**：PostgreSQL 視圖 `v_stock_technical_indicators`
- **索引支援**：idx_daily_price_stock_date

## 4. 下一步計畫
- **數據填充**：啟動 `stock_institutional` 與 `stock_margin` ETL 回補
- **API 補全**：建立 `/api/v1/stocks/{symbol}/detail` 聚合端點
- **緩存優化**：考慮對技術指標結果實施 SWR 緩存

---
**日期**：2026-01-28
**作者**：AI Antigravity Assistant
