# Dev Log: Phase 9.2 全棧行情中繼開發完成

## 1. 任務概要
- **目標**：實作 Phase 9.2 「效能平衡報價中繼 (Quota-Balanced Market Relay)」。
- **方案**：使用 PostgreSQL + Supabase Realtime 取代 Redis，降低架構複雜度。
- **週期**：全市場 30 分鐘，自選股 15 分鐘（由調度器觸發）。

## 2. 核心變動
### 後端 (Backend)
- **資料表 (DB)**: 
    - 建立 `market_quotes` (行情快照) 與 `api_key_usage` (配額監控)。
    - 啟用 `supabase_realtime` 監聽 `market_quotes`。
- **配額管理器 (`backend/lib/quota_manager.py`)**:
    - 實作智慧輪詢與使用量記錄。
- **中繼 Worker (`backend/workers/market_relay_worker.py`)**:
    - 分段抓取 (Batch Fetching) 邏輯。
    - 受託 `flows.py` 的 `sync_relay` 任務定時執行。
- **API 端點 (`backend/api/routers/market.py`)**:
    - 提供 `/api/v1/market/quotes` 查詢。

### 前端 (Frontend)
- **Hook (`frontend/hooks/useMarketQuotes.ts`)**:
    - 整合 SWR 與 Supabase Realtime。
    - 支援自動更新與快取同步。

## 3. 驗證結果
- **單元測試**：`backend/tests/test_quota_relay.py` 通過 3 項核心測試。
    - QuotaManager 邏輯驗證：PASS
    - RelayWorker 轉換邏輯：PASS
    - 資料獲取邏輯：PASS
- **環境修正**：修正了 `SERVICE_ROLE_KEY` 命名不一致問題。

## 4. 下一步預告
- 開始 Phase 9.1 AI Screener 之開發。
- 完善全市場熱力圖視覺組件。
