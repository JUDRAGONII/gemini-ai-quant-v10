# 020_Phase2_CoreData_Backend_Services_Plan (核心數據與後端服務計畫)

## 1. 目標描述
實作 V10.0 的數據基石，建立高性能的 PostgreSQL 資料庫模型與自動化數據擷取管道 (ETL)，確保市場行情與宏觀指標持續更新。

## 2. 關鍵實作內容

### 2.1 資料庫模型 (PostgreSQL)
- **Stock Metadata**: 儲存全球（美股/台股）標的基本資訊、上市狀態與市場分類。
- **Daily Price**: 儲存 OHLCV 歷史成交數據，建立 `(stock_code, date)` 複合索引與 `market_type` 分區邏輯。
- **Macro Indicators**: 儲存 FRED 宏觀數據，支援動態指標代號擴充。

### 2.2 數據擷取管道 (ETL)
- **BaseFetcher**: 封裝 API 速率限制 (Rate Limit)、重試機制與 Supabase Upsert 邏輯。
- **FugleFetcher (Taiwan)**: 對接 Fugle REST API v2 擷取台股歷史日線。
- **TiingoFetcher (US)**: 對接 Tiingo EOD API 擷取美股歷史日線，支援多 Key 輪詢。
- **FredFetcher (Macro)**: 對接 FRED API 擷取 CPI, GDP, VIX 等宏觀指標。

## 3. 技術規格與安全
- **資料持久性**: 透過 Supabase PostgreSQL 儲存，配置 RLS (Row Level Security) 政策。
- **寫入安全**: 僅限 Service Role 或 API 私有密鑰進行 Upsert。
- **數據完整性**: 建立 Unique Constraint 避免日期重複，並在 Python 腳本中實作 `NaN` 洗淨邏輯。

## 4. 驗證計畫
### 自動化測試
- `test_database_schema.py`: 驗證資料表結構與索引。
- `test_fetchers.py`: 模擬 API 回應，驗證數據清洗與存入邏輯。

### 手動驗證
- 執行 `backfill_history.py` 確認 0050.TW 與 AAPL 歷史數據可正確入庫。
- 檢查 Supabase Dashboard 資料表筆數與 Unique Key 衝突處理。
