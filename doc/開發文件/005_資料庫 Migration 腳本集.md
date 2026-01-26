# 005_資料庫 Migration 腳本集

**文件編號**：DB-V10.0-002
**版本**：2.0.0
**建立日期**：2026-02-25
**維護原則**：版本化、冪等性 (Idempotent)、向下相容。

---

## 1. 管理機制

本系統不採用複雜的 ORM Migration 框架，直接以 SQL 腳本配合 Supabase 進行管理，確保地端部署之透明度。

### 腳本命名規範
*   `[YYYYMMDD]_[Seq]_[Action]_[Table].sql`
*   範例：`20260126_01_add_index_to_daily_price.sql`

---

## 2. 重要歷史腳本紀錄

### M001: 基礎結構與 Extensions (Phase 1)
*   **目的**：啟動 `pgvector`, `pg_cron` 並建立 `stocks`, `daily_price` 核心表。
*   **腳本位置**：`backend/db/migrations/001_core.sql`

### M005: 宏觀數據強化 (Phase 4.1)
*   **目的**：建立 `macro_indicators` 與對應索引，支持 130+ 指標存儲。
*   **腳本位置**：`backend/db/migrations/005_macro.sql`

### M010: 量化因子與基因表 (Phase 4.6)
*   **目的**：建立 `stock_factors` 與 `evolution_genes`。
*   **腳本位置**：`backend/db/migrations/010_quant.sql`

---

## 3. 維護建議

1.  **部署前檢查**：所有 Migration 必須在 `supabase-db` 的 Staging 環境驗證無誤方可部署。
2.  **斷點復原**：若 Migration 失敗，應優先檢查 `daily_price` 的複合 PK 是否衝。
3.  **效能補強專區**：
    - 定期執行 `ANALYZE` 確保查詢計劃準確。
    - 對於超過 500 萬筆數據之 `daily_price` 表，索引變更應配合 `CONCURRENTLY` 關鍵字（如 PostgreSQL 支援）。

---
**文件結束**
