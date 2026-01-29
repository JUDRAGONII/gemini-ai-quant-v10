# 005_資料庫 Migration 腳本集

**文件編號**：DB-V10.0-002
**版本**：3.0.0
**建立日期**：2026-02-25
**最後更新**：2026-01-29
**維護原則**：版本化、冪等性 (Idempotent)、向下相容。

---

## 1. 管理機制

本系統不採用複雜的 ORM Migration 框架，直接以 SQL 腳本配合 Supabase 進行管理，確保地端部署之透明度。

### 腳本命名規範
*   `[YYYYMMDD]_[Seq]_[Action]_[Table].sql`
*   範例：`20260126_01_add_index_to_daily_price.sql`

---

## 2. Phase 7 Migration 腳本清單 (v3.0)

### 2.1 P0 - 核心資料表

| 順序 | 腳本檔案 | 用途 | 狀態 |
|------|----------|------|------|
| 01 | `20260128_01_create_stocks_table.sql` | stocks 股票主檔 | ✅ 完成 |
| 02 | `20260128_02_create_stock_financials.sql` | stock_financials 財報數據 | ✅ 完成 |
| 03 | `20260128_03_create_user_portfolios.sql` | user_portfolios/holdings/performance | ✅ 完成 |
| 04 | `20260128_04_create_user_watchlist.sql` | user_watchlist 自選股 | ✅ 完成 |
| 05 | `20260128_05_add_columns_to_daily_price.sql` | market_type, adjusted_close | ✅ 完成 |
| 06 | `20260128_06_add_columns_to_ai_reports.sql` | context_snapshot, report_type | ✅ 完成 |

### 2.2 P1 - 籌碼資料表

| 順序 | 腳本檔案 | 用途 | 狀態 |
|------|----------|------|------|
| 07 | `20260128_PHASE7_P1_MIGRATIONS_FIXED.sql` | portfolio_performance, stock_institutional, stock_margin, intraday_candles, economic_calendar | ✅ 完成 |

### 2.3 P2 - 技術指標與效能優化

| 順序 | 腳本檔案 | 用途 | 狀態 |
|------|----------|------|------|
| 08 | `20260128_PHASE7_TECHNICAL_INDICATORS.sql` | MA/RSI/MACD/Bollinger Views 與索引優化 | ✅ 完成 |
| 09 | `20260128_daily_price_partition.sql` | daily_price 年度分區 (2023-2027) | ✅ 完成 |

---

## 3. 資料表結構總覽

### 3.1 核心資料表

| 表格名稱 | 主鍵 | 關聯說明 |
|----------|------|----------|
| `stocks` | UUID | 股票主檔，含 market_type, industry, sector |
| `daily_price` | UUID | 歷史行情，含 is_trading 標記，已分區 |
| `stock_financials` | UUID | 財報數據，UNIQUE(stock_code, report_type, fiscal_year) |
| `stock_factors` | UUID | AI 評分因子，含 composite_score 與各項分數 |
| `ai_reports` | UUID | AI 報告，含 context_snapshot 與 version |

### 3.2 用戶資料表 (含 RLS)

| 表格名稱 | RLS 政策 | 說明 |
|----------|----------|------|
| `user_portfolios` | Owner Only | 用戶只能存取自己的投資組合 |
| `user_holdings` | Portfolio Linked | 依 portfolio_id 關聯控制 |
| `user_watchlist` | Owner Only | 用戶只能存取自己的自選股 |

### 3.3 籌碼資料表

| 表格名稱 | 主鍵 | 說明 |
|----------|------|------|
| `stock_institutional` | UUID | 三大法人買賣超，UNIQUE(stock_code, trade_date) |
| `stock_margin` | UUID | 融資融券，UNIQUE(stock_code, trade_date) |
| `portfolio_performance` | UUID | 投資組合績效，UNIQUE(portfolio_id, trade_date) |

### 3.4 分區資料表

| 表格名稱 | 分區方式 | 說明 |
|----------|----------|------|
| `daily_price` | PARTITION BY RANGE (trade_date) | 按年度分區 (2023-2027) |

---

## 4. PostgreSQL 視圖清單

| 視圖名稱 | 用途 | 主要欄位 |
|----------|------|----------|
| `v_stock_ma` | 移動平均線 | ma5, ma10, ma20, ma60, ma120 |
| `v_stock_rsi` | RSI (14) | rsi_14 |
| `v_stock_macd` | MACD (12,26,9) | macd_line, signal_line, macd_histogram |
| `v_stock_bollinger_bands` | 布林通道 (20,2) | bb_upper, bb_middle, bb_lower |
| `v_stock_technical_indicators` | 技術指標整合視圖 | 聚合以上所有指標 |

---

## 5. 索引優化

| 索引名稱 | 表格 | 欄位 | 說明 |
|----------|------|------|------|
| `idx_daily_price_stock_date` | daily_price | (stock_code, trade_date DESC) | 股價歷史查詢優化 |
| `idx_daily_price_is_trading` | daily_price | (is_trading, trade_date DESC) | 交易日篩選優化 |
| `idx_stock_factors_stock_date` | stock_factors | (stock_code, trade_date DESC) | 因子查詢優化 |
| `idx_institutional_stock` | stock_institutional | stock_code | 法人查詢優化 |
| `idx_institutional_date` | stock_institutional | trade_date DESC | 法人日期查詢 |
| `idx_margin_stock` | stock_margin | stock_code | 融資券查詢優化 |
| `idx_margin_date` | stock_margin | trade_date DESC | 融資券日期查詢 |

---

## 6. 重要歷史腳本紀錄

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

## 7. ETL Fetcher 清單

| Fetcher | 數據源 | 目標表 | 狀態 |
|---------|--------|--------|------|
| `institutional_fetcher.py` | TWSE/TPEx | stock_institutional | ✅ 完成 |
| `margin_fetcher.py` | TWSE | stock_margin | ✅ 完成 |
| `financials_fetcher.py` | FMP/Tiingo | stock_financials | ✅ 完成 |
| `economic_event_fetcher.py` | FRED | economic_calendar | ⚠️ 待開發 |

---

## 8. 維護建議

1.  **部署前檢查**：所有 Migration 必須在 `supabase-db` 的 Staging 環境驗證無誤方可部署。
2.  **斷點復原**：若 Migration 失敗，應優先檢查 `daily_price` 的複合 PK 是否衝突。
3.  **效能補強專區**：
    *   定期執行 `ANALYZE` 確保查詢計劃準確。
    *   對於超過 500 萬筆數據之 `daily_price` 表，索引變更應配合 `CONCURRENTLY` 關鍵字。
    *   分區表查詢自動透過 Partition Pruning 優化。
4.  **分區管理**：
    *   新年份數據插入時自動透過觸發器建立分區。
    *   可透過 `SELECT * FROM pg_partitions WHERE tablename = 'daily_price'` 查詢分區狀態。

---

## 更新紀錄 (Changelog)

| 版本 | 日期 | 變更內容 |
|------|------|----------|
| 3.0.0 | 2026-01-29 | Phase 7 Migration 完整補全、ETL Fetcher、新增分區策略 |
| 2.0.0 | 2026-02-25 | 初始版本，基礎結構與 Extensions |

---

**文件結束**

*文件編號：DB-V10.0-002*
*版本：3.0.0*
*建立日期：2026-02-25*
*最後更新：2026-01-29*
