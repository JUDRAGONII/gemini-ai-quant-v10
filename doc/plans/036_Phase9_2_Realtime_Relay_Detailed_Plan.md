# Phase 9.2：效能平衡報價中繼 (Quota-Balanced Market Relay) 詳細實作計畫

**計畫編號**：034
**版本**：1.2.0
**建立日期**：2026-02-03
**所屬階段** : Phase 9.2 (Balanced Relay)
**關聯任務**：T-AI-010
**狀態**：已核准 (Approved)

---

## 一、計畫核心目標

建立具備「配額感知」能力的行情中繼站。利用現有 PostgreSQL 儲存快照，並透過 Supabase Realtime 實現前端報價的亞秒級跳動，同時嚴格控制免費 API (Fugle/Tiingo) 配額。

---

## 二、架構設計 (Architect Audit)

### 2.1 數據流向 (Data Flow)
1.  **Quota Monitor**: 監控 API Key 池狀態與剩餘點數。
2.  **Smart Scraper (Worker)**: 
    - 優先更新「自選股 (Watchlist)」。
    - 迴圈更新「全市場標的」，每 30 分鐘完成一次全量覆蓋。
3.  **PostgreSQL (Relay Table)**: 儲存最新行情快照。
4.  **Supabase Realtime**: 當 Postgres 數據更新時，即時推送到前端 WebSocket。

### 2.2 更新策略 (Strategy Matrix)
| 類別 | 更新頻率 | 觸發機制 | 儲存層 |
|:---|:---|:---|:---|
| 自選股 | 15 分鐘 | 定時任務 (Cron) | PostgreSQL |
| 全市場標的 | 30-60 分鐘 | 滾動 Batch (50 檔/次) | PostgreSQL |

---

## 三、功能模組

### 3.1 智慧中繼 Worker (`backend/workers/market_relay_worker.py`)
*   **功能**:
    - 實作 `QuotaManager` 進行金鑰輪詢 (Round-robin)。
    - 分段式抓取 (Batch Fetching)，避免並發過高。
    - 數據入庫觸發 Realtime 事件。

### 3.2 報價 API (`backend/api/routers/market.py`)
*   **端點**: `GET /api/v1/market/quotes`
*   **邏輯**: 從 DB 讀取快照，並訂閱變動。

---

## 四、前端視覺化 (UI/UX Pro Max)

### 4.1 實時更新 Hook (`frontend/hooks/useMarketQuotes.ts`)
*   **技術**: `supabase.channel().on('postgres_changes', ...)`。
*   **視覺**: 行情更新時，卡片標價應具備「Flash」螢光閃爍特效。

---

## 五、執行步驟 (Action Plan)

1.  **DB Schema**: 建立 `market_quotes` 表並啟用 Realtime。
2.  **Quota Logic**: 實作 `QuotaManager` 管理金鑰池。
3.  **Relay Worker**: 實作分段更新邏輯並註冊至 `flows.py`。
4.  **Frontend Integration**: 實作 Realtime Hook 與介面閃爍動畫。

---

**文件結束**
*計畫編號：036*
*核准日期：2026-02-03*
