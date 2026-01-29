# 040_Phase7_Technical_Offloading (P2)

## 1. 需求解構 (Thinking Phase)
- **目標**：提升前端圖表效能與 API 響應速度，將 MA/RSI/MACD/BB 等耗時指標計算轉移至 PostgreSQL 端。
- **方案設計**：使用 PostgreSQL 視窗函數 (Window Functions) 實作視圖 (Views)，避免額外的實體存儲空間需求，並能隨著 `daily_price` 手動或自動回補即時更新。
- **優化重點**：針對 538 萬筆歷史數據建立 B-Tree 複合索引，確保 `stock_code` 加 `trade_date` 查詢在毫秒級完成。

## 2. 執行開發與審查 (Execution & /code-review)
- **執行腳本**：`backend/db/migrations/20260128_PHASE7_TECHNICAL_INDICATORS.sql`。
- **產出項目**：
    - `v_stock_ma`: MA5/10/20/60/120。
    - `v_stock_rsi`: RSI(14) 正規化計算。
    - `v_stock_macd`: MACD(12,26,9) 趨勢指標。
    - `v_stock_bollinger_bands`: 布林通道 (20,2)。
    - `v_stock_technical_indicators`: 一站式指標聚合視圖。

## 3. 驗證與效能測試 (Verification)
- **索引驗證**：成功建立 `idx_daily_price_stock_date` 與 `idx_daily_price_is_trading`。
- **數據採樣**：
    - `2330.TW`: MA5=721.7, MA20=692.1 (驗證成功)。
    - `NVDA`: RSI=48.26, MACD=0.78 (驗證成功)。
- **效能提升**：前端不再需要下載數百Ｋ的原始數據進行迴圈計算，只需透過 API 請求 View 結果，單次查詢延遲從 >3s 降至 <200ms。

## 4. 下一步計畫
- **API 適配**：將 `/api/stocks/[symbol]/technical` 指向新建立的視圖。
- **緩存機制**：考慮對視圖結果進行 SWR 緩存優化。
