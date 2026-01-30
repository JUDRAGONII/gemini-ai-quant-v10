# Phase 9.2：實時報價中繼與快取詳細實作計畫

**計畫編號**：034
**版本**：1.0.0
**建立日期**：2026-01-30
**所屬階段** : Phase 9.2 (Real-time Relay)
**關聯任務**：T-AI-010
**狀態**：規劃中 (Planning)

---

## 一、計畫核心目標

建立高性能的數據中繼站，將外部交易所報價（透過 Fugle/Tiingo）高效分發至前端，解決大規模並發請求對外部 API 的壓力。

---

## 二、架構設計

### 2.1 數據流向 (Data Flow)
1.  **Relay Worker**: Python 背景程式，定時 Polling 或連線 WebSocket。
2.  **Redis Cache**: 儲存全市場標的的 Snapshot (Price, Change, Vol)。
3.  **FastAPI Relay**: 提供 `/api/v1/market/quotes` 給前端。

### 2.2 技術棧
*   **Storage**: Redis (使用 `HSET` 儲存全市場快照)。
*   **Client**: `aioredis` (FastAPI 異步連接)。

---

## 三、功能模組

### 3.1 Relay Worker (`backend/workers/market_relay.py`)
*   **功能**:
    *   監控開盤時間。
    *   每 30 秒從 Fugle 抓取全市場 (2000+ 檔) 的最新成交價。
    *   批次寫入 Redis。

### 3.2 報價 API (`backend/api/routers/market.py`)
*   **端點**: `GET /api/v1/market/quotes?symbols=2330,0050`
*   **邏輯**: 直接從 Redis 讀取，目標延遲 < 50ms。

---

## 四、前端視覺化 (Frontend)

### 4.1 市場跑馬燈 (`components/Market/MarketTicker.tsx`)
*   **視覺**: 螢光色系的即時跳動報價。
*   **位置**: Dashbaord 頂部。

### 4.2 即時個股卡片
*   **特性**: 數據變動時具備「Flash」閃爍動畫效果 (Green/Red)。

---

## 五、執行步驟 (Action Plan)

1.  **環境建置**: 配置 Redis 容器 (如果尚未配置)。
2.  **Worker 開發**: 實作 `MarketRelayWorker` 的抓取與存入邏輯。
3.  **API 實作**: 完成 FastAPI 從 Redis 讀取的端點。
4.  **前端對接**: 建立實時輪詢機制 (SWR/React Query) 更新報價。

---

**文件結束**
*計畫編號：034*
