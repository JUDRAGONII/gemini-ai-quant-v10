# 架構與實作計畫：Phase 9.6 - 自動化調度器與監聽器整合

**日期**: 2026-02-04  
**狀態**: 已歸檔 (已實作)  
**參照**: Plan 042

## 1. 目標
將 `AlertScannerWorker` (實時) 與 `MarketRelayWorker` (定時) 整合至單一統一的 `ai-worker` 進入點，確保系統在無需人工介入的情況下完全自動化運行。

## 2. 技術策略
### 2.1 統一進入點 (`worker_entry.py`)
- 利用 `asyncio.gather` 實現以下任務的非阻塞併發執行：
  - `Scheduler Loop (調度器迴圈)`：定期觸發行情中繼 (Market Relay) 流程。
  - `Redis Scanner (Redis 監聽器)`：持續監聽市場報價更新。
- 集中式日誌配置，以處理多個第三方函式庫之間的日誌衝突。

### 2.2 資料完整性強制執行
- 在 `MarketRelayWorker` 中實作 `sanitize_val`，將 `NaN`/`Infinity` 浮點數轉換為 `None`。
- 強化 `BaseFetcher.upsert`，加入基於 Pandas 的空值檢查 (`df.where(pd.notnull(df), None)`)，確保符合 Supabase/PostgREST 的 JSON 規範。

## 3. 實作細節
### `backend/worker_entry.py` [新增]
- 將 `schedule.run_pending()` 封裝在異步迴圈中。
- 編排 `AlertScannerWorker.start()` 的執行。

### `backend/etl/base_fetcher.py` [修改]
- 在資料庫更新 (Upsert) 前增加資料清洗層。

### `backend/workers/market_relay_worker.py` [修改]
- 在資料轉換過程中增加數值清洗邏輯。

## 4. 驗證結果
- **日誌確認**：調度器與監聽器均在單一容器行程中正常運作。
- **錯誤修復**：成功處理 Fugle API 的異常數據，未導致 Worker 崩潰。
- **整合驗證**：確認已根據定時行情更新產生實時警示。
