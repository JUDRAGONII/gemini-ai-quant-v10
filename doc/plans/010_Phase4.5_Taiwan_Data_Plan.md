# Phase 4.5: 台灣高頻與基本面數據實作計畫 (Taiwan Data Implementation Plan)

本文件詳細規劃如何實作 `FugleFetcher` 與 `TwseFetcher`，以補強台股在本系統中的數據深度與廣度。目標是達成 **「秒級監控 (Fugle)」** 與 **「官方權威基本面 (TWSE)」** 的完美結合。

---

## 1. 核心目標說明

- **精準度**: 使用證交所 (TWSE) 官方 OpenAPI 獲取最權威的 **本益比 (PE)**、**股價淨值比 (PB)** 與 **殖利率 (Yield)**，作為 `FactorService` 的黃金標準。
- **高頻度**: 透過 Fugle (富果) API 獲取 **1分K (1-min Candles)** 與 **即時報價 (Real-time Snapshot)**，為未來的當沖策略或即時風控提供基礎。
- **架構一致性**: 繼承現有 `BaseFetcher` 架構，確保重試、錯誤處理與資料落庫邏輯的一致性。

---

## 2. 技術調研與架構設計

### 2.1 TWSE 官方基本面擷取器 (`TwseFetcher`)
*   **資料來源**: 台灣證券交易所 OpenAPI (或 `www.twse.com.tw` 數據接口)。
*   **關鍵端點 (Endpoints)**:
    *   `BWIBBU_ALL`: 上市個股日本益比、殖利率及股價淨值比。
    *   `STOCK_DAY`: 個股日成交資訊 (作為行情數據的官方校對源)。
*   **實作策略**:
    *   使用 `pandas.read_html` 或 `requests` 直接請求 TWSE JSON 接口。
    *   **Rate Limit**: TWSE 限制較嚴 (約 3-5 秒/次)，需實作 `RateLimiter` 或在 `BaseFetcher` 中加入 `time.sleep`。
*   **對應資料表**:
    *   寫入 `public.stock_factors` (補完目前的空表)。
    *   Mapping: `PE -> pe_ratio`, `PB -> pb_ratio`, `Yield -> dividend_yield`.

### 2.2 Fugle 富果高頻擷取器 (`FugleFetcher`)
*   **資料來源**: Fugle Market Data API (REST & WebSocket).
*   **關鍵數據**:
    *   `v1/historical/candles`: 歷史 K 線 (Day, 1min, 5min)。
    *   `v1/intraday/quote`: 即時報價快照。
*   **SDK**: 使用官方 `fugle-marketdata` Python 套件。
*   **對應資料表**:
    *   日 K 寫入 `public.daily_price`。
    *   **[新提案]** 分 K 寫入 `public.intraday_candles` (建議新增此表以儲存高頻數據)。

---

## 3. 資料庫 Schema 擴充提案

為了容納高頻數據，建議新增以下表格：

```sql
-- 分 K 線圖表 (Partitioned by Month 建議)
CREATE TABLE IF NOT EXISTS public.intraday_candles (
    stock_code TEXT NOT NULL,
    ts TIMESTAMPTZ NOT NULL, -- 使用精確時間戳
    open NUMERIC,
    high NUMERIC,
    low NUMERIC,
    close NUMERIC,
    volume BIGINT,
    timeframe TEXT DEFAULT '1m', -- 1m, 5m, 15m
    PRIMARY KEY (stock_code, ts, timeframe)
);
-- 建議啟用 TimescaleDB extension 如果有的話，否則標準 PG Partitioning
```

---

## 4. 實作步驟 (Action Plan)

### Step 1: 依賴安裝與環境配置 -> (Requirements)
- 新增 `fugle-marketdata` 至 `requirements.txt`。
- 設定 `FUGLE_API_KEY` 環境變數。

### Step 2: 擴充 Schema -> (Migration)
- 建立 `intraday_candles` 表格。

### Step 3: 實作 TwseFetcher -> (Code)
- 繼承 `BaseFetcher`。
- 實作 `fetch_financials(date)`: 抓取全市場 PE/PB。
- 實作 `transform()`: 轉換為 `stock_factors` 格式。

### Step 4: 實作 FugleFetcher -> (Code)
- 繼承 `BaseFetcher`。
- 實作 `fetch_history(symbol, timeframe)`: 支援 D1, 1m。
- 實作 `transform()`: 兼容 `daily_price` 與 `intraday_candles` 格式。

### Step 5: 自動化排程 -> (Flows)
- 於 `backend/flows.py` 註冊 `sync_tw_market` 任務。
- 設定每日 14:00 (收盤後) 執行 TWSE 更新。
- 設定每日 15:00 執行 Fugle 分 K 歸檔。

---

## 5. 預期成果
完成後，**數據監控中心**將能顯示：
1.  **Stock Factors**: 台積電 (2330) 的每日真實 PE/PB 走勢。
2.  **Daily Price**: 來自 Fugle 的精確成交量與價格。
3.  **Backfill**: 補齊過去 5-10 年的台灣基本面歷史數據。
