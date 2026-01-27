# 021_Phase5.2_Performance_Security_Audit_Plan (效能優化與安全性審計計畫)

## 1. 目標描述
對系統進行全面的基礎設施稽核，包含資料庫查詢優化、伺服器資源管理，以及關鍵 API 與數據存取的安全性加固。

## 2. 關鍵實作內容

### 2.1 效能優化 (Phase 5.2)
- **資料庫索引**: 針對 `daily_price`, `stock_financials` 等高頻讀寫資料表建立加速索引。
- **慢查詢診斷**: 使用 PostgreSQL `EXPLAIN ANALYZE` 識別效能瓶頸。
- **資源管理**: 監控 NAS 容器 CPU/RAM 佔用，優化 Python 工作線程與 Node.js 渲染效率。

### 2.2 安全性審計 (Phase 5.3)
- **RLS 策略強化**: 在 Supabase 中實作細粒度的行級安全策略 (Row Level Security)。
- **API 權限隔離**: 區分 `ANON_KEY` (唯讀) 與 `SERVICE_ROLE` (系統操作) 的使用範圍。
- **敏感數據防護**: 確保 `.env` 與金鑰管理系統 (KMS) 符合開發規範。

## 3. 驗證計畫
### 自動化測試
- `data_integrity.test.ts`: 驗證數據一致性與寫入攔截。
- `security_policies.test.ts`: 模擬非法請求驗證 RLS 是否生效。

### 手動驗證
- 使用 Browser 開發者工具檢查 API Response 是否包含敏感欄位。
- 在 NAS 環境執行負載測試，觀測系統穩定性。
