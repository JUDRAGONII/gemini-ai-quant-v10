# 072_Phase9.6_Automated_Worker_Integration

## 日期: 2026-02-04
## 階段: Phase 9.6
## 功能: 自動化調度器與監聽器整合 (Automated Worker Integration)

### 1. 核心變更內容
- **進入點整合**: 建立 `backend/worker_entry.py`，作為 `ai-worker` 容器的單一進入點。
  - 使用 `asyncio.gather` 同時運行 `AlertScannerWorker` (Redis 監聽) 與 `schedule` 迴圈 (定時任務)。
- **資料精度修復**: 
  - 在 `backend/etl/base_fetcher.py` 強化 `upsert` 邏輯，使用 `pd.notnull` 過濾 `NaN`。
  - 在 `backend/workers/market_relay_worker.py` 加入 `sanitize_val` 函式，攔截 `NaN` 與 `Infinity` 並轉為 `None`。
  - 解決了 `Out of range float values are not JSON compliant` 導致的 Worker 崩潰問題。
- **日誌優化**:
  - 在 `worker_entry.py` 使用 `logging.basicConfig(force=True)`，解決第三方套件衝突導致的日誌遺失問題。
  - 確保所有輸出同時導向 `stdout` 與 `/app/worker.log`。

### 2. 驗證結果
- **功能驗證**: 重啟 `ai-worker` 後，日誌證實 `Scheduler` 與 `AlertScannerWorker` 均成功啟動。
- **異常修復驗證**: 成功處理 Fugle API 回傳的空值/異常浮點數，不再發生 JSON 序列化報錯。
- **整合測試**: 通過測試指令驗證 Redis 訊息發布後，Scanner 能正確接收並處理行情，並產生對應告警。

### 3. 下一步
- **Phase 10**: 正式進入部署與交付階段，包含環境清理與最終發行版本製作。
