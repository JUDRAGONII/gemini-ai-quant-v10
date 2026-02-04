# Phase 9.5：市場異動警示與通知引擎實作摘要

**編號**：040
**功能**：Market Alerts & Notification System
**完成日期**：2026-02-03

## 1. 實作路徑回顧
本階段成功建立了一個自動化的市場行情監控體系，確保 AI 投資分析儀在發現異常行情時能毫秒級通知使用者。

### 1.1 資料庫層 (PostgreSQL)
- **market_alerts**: 核心警示表，儲存觸發細節與已讀狀態。
- **alert_rules**: 靜態規則配置（價格急漲 > 5%、爆量 > 2.0x 等）。
- **Realtime**: 啟動 `market_alerts` 表的 INSERT 事件廣播。

### 1.2 通訊層 (Redis)
- **Channel `market:quotes_updated`**: ETL 完成後的行情廣播通道。
- **Set `alert:dedup`**: 基於 `stock_code:rule_key` 的 5 分鐘防抖機制。

### 1.3 邏輯層 (Backend Services)
- **AlertService**: 核心掃描引擎，支援多維度條件判定與等級劃分。
- **AlertScannerWorker**: 異步 Worker，負責訂閱 Redis 並調用執行掃描。

### 1.4 展示層 (Frontend UI)
- **useAlerts Hook**: 整合 SWR 讀取與 Supabase Realtime 即時插入。
- **AlertToast**: 玻璃擬態發光彈窗，針對 Critical 級別具備脈衝動效。
- **AlertBadge/Panel**: 側邊欄警示中心，支援歷史檢閱與標記全讀。

## 2. 關鍵程式碼項目
- `backend/services/alert_service.py`
- `backend/workers/alert_scanner_worker.py`
- `frontend/hooks/useAlerts.ts`
- `frontend/components/Market/AlertToast.tsx`

決。
