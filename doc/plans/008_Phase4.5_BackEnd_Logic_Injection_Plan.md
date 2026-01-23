# Phase 4.5: 後端邏輯注入實施計畫 (ETL & Evolution Engine) - V2

本計畫依據《憲級文件》3.0.0 與《開發文件》009 章節進行修訂，落實「混合資料源策略」。

---

## 🛠️ 擬議變更 (Proposed Changes)

### 1. ETL 數據擷取層 (Data Ingestion Layer)
採用「商業速補 + 官方驗證」之混合模型。

#### [NEW] [base_fetcher.py](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/backend/etl/base_fetcher.py)
- 實作具備指數退避 (Exponential Backoff) 的 `BaseFetcher`。

#### [NEW] [market.py](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/backend/etl/market.py)
- **TiingoFetcher**: 實作美股歷史行情擷取。
- **FugleFetcher**: 實作台股歷史「復權」K 線數據（用於 Backtest）。
- **OfficialFetcher**: 實作台股官方收盤、除權息公告與三大法人資料（對接 TWSE/TPEx OpenAPI）。

#### [NEW] [futures.py](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/backend/etl/futures.py)
- **TaifexFetcher**: 實作台指期與選擇權未平倉數據（對接期交所 OpenAPI）。

---

### 2. AI 演化運算引擎 (Evolution Engine)
#### [NEW] [evolution.py](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/backend/agents/evolution.py)
- 定義 26 項基因組與適應度函式。
#### [NEW] [backtest.py](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/backend/agents/backtest.py)
- 實作模擬交易環節，輸出 Sharpe Ratio。

---

### 3. 資料持久化補完 (Schema Update)
#### [MODIFY] [schema.sql](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/schema.sql)
- 補齊 `stock_factors`, `macro_factors`, `backtest_results` 表。

---

## 🧪 驗證計畫 (Verification Plan)
- **資料一致性檢查**: 比對 Fugle 復權數據與 Official 原始數據之關聯。
- **演化收斂測試**: 驗證 Generation 5 之適應度優於 Generation 0。
