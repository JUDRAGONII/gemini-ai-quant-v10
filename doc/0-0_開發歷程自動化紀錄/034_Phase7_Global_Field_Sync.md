# 033_Phase 7.1 全域 API 與腳本欄位同步更新

## 1. 任務概述
配合 Phase 7 資料庫結構調整（`symbol` -> `stock_code` 等），完成了全專案代碼層級的欄位同步。確保後端 ETL 腳本、資料庫查詢以及前端 API 回傳格式完全一致。

## 2. 核心變更內容
### 2.1 資料庫主檔屬性同步 (Stocks Table)
- `symbol` 變更為 `stock_code`
- `name` 變更為 `stock_name`
- `market` 變更為 `market_type`

### 2.2 行情與財報表欄位同步
- `daily_price`：`symbol` -> `stock_code`
- `stock_financials`：`fiscal_date` -> `report_date`
- `stock_factors`：`stock_id` -> `stock_code`

### 2.3 修改代碼清單
- **後端腳本**:
    - `backend/scripts/init_stock_list.py`: 更新為新欄位並修正 `upsert` 衝突鍵。
    - `backend/scripts/backfill_manager.py`: 更新資料庫查詢邏輯與屬性取值。
    - `backend/etl/tw_official.py`: 更新 `stock_factors` 插入鍵。
    - `backend/etl/financials_fetcher.py`: 更新 `report_date`。
- **前端 API**:
    - `frontend/app/api/stocks/[symbol]/route.ts`: 修正查詢語法，並在回傳 `metadata` 時提供別名（Alias）以維持兼容。
    - `frontend/app/api/stocks/[symbol]/financials/route.ts`: 修正排序與查詢欄位。

## 3. 驗證結果
- **初始化腳本執行**: 成功執行 `python backend/scripts/init_stock_list.py`，標的清單（台、美、期貨）已正確存入 `stocks` 表。
- **數據回補測試**: 執行 `backfill_manager.py` 測試 2330 歷史行情，能正確讀取 `stock_code` 並更新狀態。
- **API 通訊驗證**: 成功重新載入 PostgREST Schema 並驗證 `/api/stocks/[symbol]` 能夠正確回傳資料。

## 4. 後續計畫
- **Phase 7.2**: 強化美股財務報表數據源 (FMP/Tiingo) 的穩定性。
- **性能優化**: 針對 `daily_price` 的大規模查詢增加快取機制。
