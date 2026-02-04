# 開發日誌：Phase 9.4 API 配額管理系統實作

## 1. 任務概要
- **目標**：實作 API 配額管理系統，防止外部 API (Fugle, Tiingo, FRED) 被打爆或產生預期外費用。
- **架構**：採用 Redis + PostgreSQL 混合架構。
  - **Redis**：處理高頻、低延遲的計數需求與瞬時冷卻狀態。
  - **PostgreSQL**：管理 API 金鑰元資料、冷卻期限持久化與歷史追蹤。
- **功能**：
  - 子秒級的使用量計數。
  - 自動冷卻機制 (連續錯誤或達到限額)。
  - 管理儀表板 (即時監控金鑰健康度)。
  - 整合至所有資料擷取器 (Fetcher Integration)。

## 2. 核心變動內容

### 2.1 後端架構
- **Redis Client** (`backend/lib/redis_client.py`)：建立連線池單例。
- **Quota Service** (`backend/services/quota_service.py`)：核心邏輯，支援同步模式以相容 ETL 流程。
- **Admin Router** (`backend/api/routers/admin.py`)：提供配額狀態查詢與手動重置冷卻 API。
- **BaseFetcher Integration** (`backend/etl/base_fetcher.py`)：自動在 `run()` 週期中植入配額計數與錯誤記錄。

### 2.2 前端管理 (Admin UI)
- **Monitoring Hook** (`frontend/hooks/useQuotaStatus.ts`)：封裝 SWR 數據抓取與 API 互動。
- **Quota Dashboard** (`frontend/components/Admin/QuotaDashboard.tsx`)：採用 Glassmorphism 設計，視覺化配額使用率與金鑰狀態。
- **Admin Page** (`frontend/app/admin/quota/page.tsx`)：整合監控頁面。

### 2.3 基礎設施
- **Docker Compose**：新增 `ai-redis` 服務 (Alpine 映像檔)，限制記憶體 256MB 並開啟 AOF 持久化。
- **DB Migration**：建立 `api_keys` 表格與相關 RLS 策略。

## 3. 驗證結果
- **功能測試**：執行 `scripts/test_quota_integration.py` 驗證配額在 Tiingo 與 Fugle 同步時能正確遞增。
- **整合驗證**：Admin API 成功讀取 Redis 快取計數，並能在數據庫 Schema 重載後正確返回資料。
- **性能影響**：Redis 讀寫延遲 < 1ms，對 ETL 流程幾乎無任何可察覺影響。

決。
