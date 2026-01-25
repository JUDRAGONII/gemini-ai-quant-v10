# 全市場全歷史數據回補計畫 (Phase 4.5+ Extension)

本計畫旨在透過分階段方式，完成台股全市場（上市/上櫃/期權）與美股四大指數的全量歷史數據入庫。

## 需使用者審閱

> [!IMPORTANT]
> - **美股範圍限制**：依據最新指示，美股僅回補 **道瓊、標普500、那斯達克、費城半導體** 四大指數。
> - **台股全市場**：台股將執行最高規格回補，涵蓋 **上市 (TWSE)**、**上櫃 (OTC)** 及 **期交所 (Taifex) 期權** 數據。

## 擬議變更

### 1. 標的清單擴充 (Symbol Initialization)
---
#### [修改] [init_stock_list.py](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/backend/scripts/init_stock_list.py)
- **台股全量化**：
    - 整合 TWSE (上市) 與 OTC (上櫃) 標的抓取。
    - 預備期權標的清單（台指期、電子期、金融期等）。
- **美股精確化**：
    - 僅注入四大指數識別代號：**DJI, SPX, IXIC, SOX**。
    - 同步注入其代表性 ETF 以供行情參考：**DIA, SPY, QQQ, SOXX**。

### 2. 回補管理器強化 (Backfill Manager)
---
#### [修改] [backfill_manager.py](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/backend/scripts/backfill_manager.py)
- **跨市場支援**：完整整合美股歷史行情擷取邏輯 (Tiingo End-of-Day API)。
- **優先序隊列**：實作 `PriorityQueue`，確保 VIP 指數與成分股在第一梯次完成。
- **異常處理**：加入自動跳過錯誤標的並記錄日誌，確保大規模執行時不因單一標的報測而中斷。

### 3. [修正] 數據深度優化 (Historical Depth Fix)
---
#### [修改] [market.py](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/backend/etl/market.py)
- **ENDPOINT 修正**：將台股日線擷取從 `intraday.candles` 切換至 `historical.candles`。
- **歷史回溯**：確保 `from` 參數正確傳遞 2010-01-01，以獲取完整歷史紀錄而非僅單日數據。

### 4. 期權數據對接 (Future & Options) [新增]
---
#### [新增] [taifex_fetcher.py](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/backend/etl/taifex_fetcher.py)
- 抓取期交所數據，回補核心期貨品項的全歷史日線。

## 驗證計畫

### 自動化測試
- 執行 `init_stock_list.py` 並查核 `stocks` 表，確認台股筆數正確且美股僅含核心指數。
- 啟動回補腳本並觀察 `/admin/monitor` 即時動態。

### 手動驗證
- 抽樣檢查資料庫中台股上櫃股票（如 8069, 5347）與期貨行情。
- 確認美股四大指數與 ETF 之歷史跨度是否達標。
