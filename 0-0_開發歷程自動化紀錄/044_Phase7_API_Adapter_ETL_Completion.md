# 042_Phase7_API_Adapter_ETL_Completion.md

## 1. 任務概述

依據開發紀錄 30-41 與 Phase 7 計畫書比對結果，補全以下項目：
- 共用類型定義 (types/api.ts)
- 聚合端點 (/api/v1/stocks/{symbol}/detail)
- ETL Fetcher (institutional_fetcher.py, margin_fetcher.py)
- 資料庫分區策略

## 2. 執行開發

### 2.1 共用類型定義
**檔案**: `frontend/types/api.ts`

**內容**:
- `ApiResponse<T>` - 統一 API 響應格式
- `StockQuote`, `StockFinancials`, `AIScore` - 核心資料類型
- `TechnicalIndicator`, `StockInstitutional`, `StockMargin` - 技術/籌碼類型
- `Portfolio`, `Holding`, `Watchlist` - 用戶資料類型
- `TechnicalIndicatorsResponse`, `AIScoresResponse` - API 響應類型

### 2.2 聚合端點
**檔案**: `frontend/app/api/v1/stocks/[symbol]/detail/route.ts`

**功能**:
- GET `/api/v1/stocks/{symbol}/detail`
- 一次返回：stock (基本資料)、quote (報價)、financials (財務)、ai_score (AI評分)、technical_indicators (技術指標)
- 支援 `include_technical` 參數控制是否包含技術指標
- 支援 `technical_limit` 參數控制技術指標筆數

**關鍵程式碼**:
```typescript
const { data: stockData, error: stockError } = await supabase
    .from('stocks')
    .select('stock_code, stock_name, market_type, industry, sector, list_date, currency, is_active')
    .eq('stock_code', symbol)
    .single();
```

### 2.3 ETL Fetcher

#### institutional_fetcher.py
**檔案**: `backend/etl/institutional_fetcher.py`

**功能**:
- 從 TWSE/TPEx 獲取三大法人買賣超數據
- 數據來源:
  - TWSE: `https://www.twse.com.tw/rwd/zh/fund/T86`
  - TPEx: `https://www.tpex.org.tw/web/stock/aftertrading/institutional_trading/`
- 目標表: `stock_institutional`
- on_conflict: `stock_code,trade_date`

#### margin_fetcher.py
**檔案**: `backend/etl/margin_fetcher.py`

**功能**:
- 從 TWSE 獲取融資融券數據
- 數據來源: `https://www.twse.com.tw/rwd/zh/margin/T86`
- 目標表: `stock_margin`
- on_conflict: `stock_code,trade_date`

### 2.4 資料庫分區策略
**檔案**: `backend/db/migrations/20260128_daily_price_partition.sql`

**功能**:
- 建立 `daily_price` 表的分區父表 (PARTITION BY RANGE)
- 自動建立 2023-2027 年度分區
- 自動創建分區觸發器 (auto_create_daily_price_partition)
- 驗證分區狀態查詢

## 3. 檔案變更清單

### 新增檔案

| 類型 | 檔案 | 說明 |
|------|------|------|
| Types | `frontend/types/api.ts` | 共用 API 類型定義 |
| API | `frontend/app/api/v1/stocks/[symbol]/detail/route.ts` | 聚合端點 |
| ETL | `backend/etl/institutional_fetcher.py` | 三大法人 Fetcher |
| ETL | `backend/etl/margin_fetcher.py` | 融資融券 Fetcher |
| Migration | `backend/db/migrations/20260128_daily_price_partition.sql` | 分區腳本 |

### 更新檔案

| 檔案 | 變更內容 |
|------|----------|
| `doc/PCM/0-0_V10.0_Phase_Control_Matrix.md` | 新增 Phase 7.1 延伸區塊 |
| `doc/PCM/0-2_CHANGELOG.md` | 新增 V10.2.5 變更紀錄 |

## 4. 下一步待辦

| 優先級 | 工作項目 | 說明 |
|:------:|----------|------|
| P1 | 執行分區腳本 | `docker exec supabase-db psql -f /tmp/20260128_daily_price_partition.sql` |
| P1 | ETL 數據回補 | 執行法人與融資券數據回補 |
| P2 | API 端點 | `/api/v1/ai/reports/{id}`, `/api/v1/ai/generate-report` |
| P2 | 文件更新 | 更新 `008_API 端點詳細規格.md` v3.0 |
| P2 | 測試交付 | `backend/tests/test_api_endpoints.py` |

---

**日期**: 2026-01-28
**作者**: AI Antigravity Assistant
