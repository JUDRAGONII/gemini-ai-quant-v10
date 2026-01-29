# Phase 7：資料庫補全與後端完整性強化計畫

**計畫編號**：025
**版本**：1.0.0
**建立日期**：2026-01-28
**所屬階段**：Phase 7 (Post-Phase 4.5 Completion)
**關聯審計**：ARCH-20260128-GLOBAL
**狀態**：草稿 (Draft)
**預估工時**：18 人天

---

## 一、計畫概述

### 1.1 背景與動機

基於「架構審計與全域檢視報告」(ARCH-20260128-GLOBAL) 的審計結論，系統已進入「功能完備期」，基礎設施穩定，但存在以下中長期架構風險：

| 風險項目 | 審計評估 | 影響範圍 |
|----------|:--------:|----------|
| **數據適配一致性** | 高風險 | 前端 API Route 適配邏輯散落 |
| **計算下沉不足** | 中風險 | MA/RSI 在前端計算，大數據會卡頓 |
| **RLS 政策缺口** | 中風險 | user_portfolios 外的用戶數據表缺少隔離 |
| **API 端點不完整** | 高風險 | AI 評分、報告等核心 API 缺失 |

本計畫旨在解決上述風險，確保 Phase 8 部署與交付的順利進行。

### 1.2 審計建議摘要

根據 ARCH-20260128-GLOBAL 審計報告，關鍵建議包括：

1. **統一適配層**：將前端 API 重複變換邏輯歸併為單一的讀寫 Transformer
2. **計算下沉**：針對常用指標 (MA5/20/60) 利用 PostgreSQL 窗口函數計算
3. **AI 閉環反饋**：新增使用者對 AI 報告的評分功能

### 1.3 團隊配置

| 角色 | 人數 | 主要職責 | 投入時段 |
|------|------|----------|----------|
| 後端開發人員 | 2 人 | 資料庫設計、API 開發、ETL 實作 | 第 1-3 週全段 |
| DevOps 工程師 | 0.5 人 | 效能優化、監控設置 | 第 2-3 週 |
| 測試人員 | 0.5 人 | 測試案例開發、API 測試 | 第 3 週 |

### 1.4 里程碑

| 里程碑 | 日期 | 交付成果 |
|--------|------|----------|
| M1：資料庫結構補全 | 第 1 週結束 | 12 張缺失資料表建立完成 |
| M2：核心 API 上線 | 第 2 週結束 | 9 個缺失 API 端點完成 |
| M3：計算下沉與效能優化 | 第 3 週結束 | MA/RSI PostgreSQL 計算、索引優化 |

---

## 二、工作分解 (Work Breakdown)

### Task 1：資料庫結構補全 (Database Schema Completion)

#### 1.1 必須新增的資料表

| 優先級 | 表格名稱 | 用途說明 | SQL 複雜度 | 預估工時 |
|:------:|----------|----------|:----------:|:--------:|
| **P0** | `stocks` | 股票主檔（代號、名稱、市場別） | 低 | 0.5 人天 |
| **P0** | `stock_financials` | 財報數據（EPS、ROE、營收） | 低 | 0.5 人天 |
| **P0** | `user_portfolios` | 用戶投資組合 | 中 | 0.5 人天 |
| **P0** | `user_holdings` | 用戶持股部位 | 中 | 0.5 人天 |
| **P0** | `user_watchlist` | 自選股清單 | 低 | 0.5 人天 |
| **P1** | `portfolio_performance` | 投資組合績效歷史 | 中 | 0.5 人天 |
| **P1** | `stock_institutional` | 三大法人買賣超 | 中 | 0.5 人天 |
| **P1** | `stock_margin` | 融資融券數據 | 中 | 0.5 人天 |
| **P2** | `intraday_candles` | 分K行情（1分K） | 高 | 1 人天 |
| **P2** | `economic_calendar` | 經濟事件日曆 | 低 | 0.5 人天 |

#### 1.2 現有表格欄位擴充

| 表格 | 新增欄位 | 原因 | 預估工時 |
|------|----------|------|:--------:|
| `daily_price` | `market_type`, `adjusted_close`, `change_percent` | 市場分類、還原股價 | 0.5 人天 |
| `stock_factors` | `value_score`, `growth_score`, `quality_score`, `momentum_score` | 分項評分快取 | 0.5 人天 |
| `ai_reports` | `context_snapshot`, `report_type`, `version` | 報告溯源、分類 | 0.5 人天 |
| `macro_indicators` | `transformation_type`, `is_estimate`, `is_revised` | 數據品質標記 | 0.5 人天 |

#### 1.3 Migration 腳本命名規範

```
[YYYYMMDD]_[Seq]_[Action]_[Table].sql
範例：
├── 20260128_01_create_stocks_table.sql
├── 20260128_02_create_stock_financials.sql
├── 20260128_03_create_user_portfolios.sql
├── 20260128_04_create_user_watchlist.sql
├── 20260128_05_add_market_type_to_daily_price.sql
└── 20260128_06_add_factor_scores_to_stock_factors.sql
```

---

### Task 2：ETL 腳本補全 (ETL Script Completion)

#### 2.1 缺失 Fetcher 清單

| 優先級 | Fetcher | 數據源 | 輸入表 | 預估工時 |
|:------:|---------|--------|--------|:--------:|
| **P1** | `institutional_fetcher.py` | 證交所/櫃買 | `stock_institutional` | 1 人天 |
| **P1** | `margin_fetcher.py` | 證交所 | `stock_margin` | 1 人天 |
| **P2** | `earnings_calendar.py` | FMP/Zacks | `earnings_calendar` | 0.5 人天 |
| **P2** | `economic_event_fetcher.py` | FRED | `economic_calendar` | 0.5 人天 |

#### 2.2 現有 Fetcher 擴充

| Fetcher | 擴充項目 | 預估工時 |
|---------|----------|:--------:|
| `financials_fetcher.py` | 新增財報數據清洗邏輯 | 0.5 人天 |
| `macro.py` | 新增 `economic_calendar` 擷取 | 0.5 人天 |

---

### Task 3：API 端點補全 (API Endpoint Completion)

#### 3.1 前端需求對照

| 前端 API 路由 | 需求狀態 | 後端實作優先級 |
|---------------|:--------:|:--------------:|
| `/api/stocks/[symbol]` | ✅ 已實作 | - |
| `/api/stocks/[symbol]/financials` | ✅ 已實作 | - |
| `/api/stocks/[symbol]/chips` | ✅ 已實作 | - |
| `/api/stocks/[symbol]/margin` | ✅ 已實作 | - |
| `/api/stocks/[symbol]/institutional` | ⚠️ 需補全 | **P0** |
| `/api/stocks/[symbol]/technical` | ❌ 缺失 | **P0** |
| `/api/stocks/search` | ❌ 缺失 | **P0** |
| `/api/portfolios` | ✅ 已實作 | - |
| `/api/portfolios/[id]/performance` | ✅ 已實作 | - |
| `/api/holdings` | ✅ 已實作 | - |
| `/api/watchlist` | ✅ 已實作 | - |
| `/api/rag/search` | ✅ 已實作 | - |
| `/api/calendar` | ✅ 已實作 | - |
| `/api/indicators/compare` | ✅ 已實作 | - |
| `/api/ai/scores` | ❌ 缺失 | **P0** |
| `/api/ai/scores/[symbol]` | ❌ 缺失 | **P0** |
| `/api/ai/reports` | ❌ 缺失 | **P0** |
| `/api/ai/reports/[id]` | ❌ 缺失 | **P1** |
| `/api/ai/evolution` | ❌ 缺失 | **P1** |

#### 3.2 API 實作清單

**P0 - Critical APIs**

| 端點 | 方法 | 說明 | 預估工時 |
|------|------|------|:--------:|
| `/api/v1/stocks/{symbol}/detail` | GET | 聚合行情、財務、AI 評分 | 1 人天 |
| `/api/v1/stocks/search` | GET | 股票搜尋 (代號/名稱) | 0.5 人天 |
| `/api/v1/stocks/{symbol}/institutional` | GET | 三大法人買賣超 | 0.5 人天 |
| `/api/v1/ai/scores` | GET | AI 評分排行 | 1 人天 |
| `/api/v1/ai/scores/{symbol}` | GET | 個股 AI 評分 | 0.5 人天 |
| `/api/v1/ai/reports` | GET | AI 報告列表 | 0.5 人天 |

**P1 - High APIs**

| 端點 | 方法 | 說明 | 預估工時 |
|------|------|------|:--------:|
| `/api/v1/ai/reports/{id}` | GET | AI 報告詳情 | 0.5 人天 |
| `/api/v1/ai/evolution` | GET | 演化策略資訊 | 0.5 人天 |
| `/api/v1/stocks/{symbol}/options` | GET | 選擇權數據 | 0.5 人天 |
| `/api/v1/macro/factors` | GET | 宏觀因子 | 0.5 人天 |

**P2 - Medium APIs**

| 端點 | 方法 | 說明 | 預估工時 |
|------|------|------|:--------:|
| `/api/v1/ai/generate-report` | POST | 生成 AI 報告 | 1 人天 |

---

### Task 4：計算下沉與效能優化 (Computation Offloading)

#### 4.1 PostgreSQL 技術指標計算

根據 ARCH-20260128-GLOBAL 審計建議，將 MA/RSI 計算下沉至 PostgreSQL 窗口函數。

```sql
-- 移動平均線 (MA) 計算視圖
CREATE OR REPLACE VIEW v_stock_technical_indicators AS
SELECT
    stock_code,
    trade_date,
    close_price,
    -- MA5
    AVG(close_price) OVER (
        PARTITION BY stock_code
        ORDER BY trade_date
        ROWS BETWEEN 4 PRECEDING AND CURRENT ROW
    ) AS ma5,
    -- MA20
    AVG(close_price) OVER (
        PARTITION BY stock_code
        ORDER BY trade_date
        ROWS BETWEEN 19 PRECEDING AND CURRENT ROW
    ) AS ma20,
    -- MA60
    AVG(close_price) OVER (
        PARTITION BY stock_code
        ORDER BY trade_date
        ROWS BETWEEN 59 PRECEDING AND CURRENT ROW
    ) AS ma60
FROM daily_price
ORDER BY stock_code, trade_date DESC;
```

| 指標 | 計算方式 | 實作複雜度 | 預估工時 |
|------|----------|:----------:|:--------:|
| MA5/10/20/60/120 | AVG OVER Window | 低 | 0.5 人天 |
| RSI (14) | 標準化平均值公式 | 中 | 1 人天 |
| MACD (12,26,9) | 指數移動平均差值 | 中 | 1 人天 |
| Bollinger Bands | STDDEV OVER Window | 低 | 0.5 人天 |

#### 4.2 索引優化策略

| 表格 | 現有索引 | 建議新增索引 | 預估工時 |
|------|----------|--------------|:--------:|
| `daily_price` | PK | `idx_daily_price_market_type` | 0.5 人天 |
| `daily_price` | - | `idx_daily_price_volume_desc` | 0.5 人天 |
| `stock_factors` | `idx_composite` | `idx_factors_stock_date` | 0.5 人天 |
| `macro_indicators` | `idx_indicator_code` | `idx_macro_country_category` | 0.5 人天 |
| `ai_reports` | HNSW | `idx_reports_stock_date` | 0.5 人天 |

#### 4.3 分區策略 (Partitioning)

| 表格 | 分區方式 | 優先級 | 預估工時 |
|------|----------|:------:|:--------:|
| `daily_price` | `trade_date` 年度分區 | P1 | 1 人天 |
| `macro_indicators` | `reference_date` 年度分區 | P2 | 0.5 人天 |

---

### Task 5：RLS 安全政策強化

#### 5.1 現有 RLS 政策

| 表格 | 現有 RLS | 缺口政策 |
|------|:--------:|----------|
| `evolution_genes` | ✅ | 已完整 |
| `stock_factors` | ✅ | 僅 service_role 可寫 |
| `ai_reports` | ✅ | 僅 service_role 可寫 |
| `user_portfolios` | ❌ | 需建立用戶隔離 |
| `user_holdings` | ❌ | 需依 portfolio_id 關聯 |
| `user_watchlist` | ❌ | 用戶只能存取自己的 |
| `stock_financials` | ❌ | 匿名可讀、service_role 可寫 |

#### 5.2 RLS 實作

```sql
-- user_portfolios RLS
ALTER TABLE public.user_portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view own portfolios"
ON public.user_portfolios FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolios"
ON public.user_portfolios FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolios"
ON public.user_portfolios FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolios"
ON public.user_portfolios FOR DELETE
USING (auth.uid() = user_id);

-- service_role 完整存取
CREATE POLICY "Service role full access"
ON public.user_portfolios
USING (auth.jwt()->>'role' = 'service_role');
```

---

### Task 6：統一適配層 (Unified Adapter Layer)

根據 ARCH-20260128-GLOBAL 審計建議，消除前端 API Route 散落的適配邏輯。

#### 6.1 共用類型定義 (`types/api.ts`)

```typescript
// 前端與後端共用的 API 類型定義
export interface StockQuote {
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change_percent: number;
  trade_time: number; // UNIX timestamp
}

export interface StockFinancials {
  eps: number;
  eps_yoy: number;
  per: number;
  pbr: number;
  roe: number;
  gross_margin: number;
  net_margin: number;
  dividend_yield: number;
}

export interface AIScore {
  composite: number;
  value: number;
  growth: number;
  quality: number;
  momentum: number;
  macro: number;
}
```

#### 6.2 API 響應標準化

所有 API 端點統一響應格式：

```typescript
interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  meta?: {
    page: number;
    per_page: number;
    total: number;
    has_more: boolean;
  };
  timestamp: string; // ISO 8601
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
```

---

## 三、測試規劃

### 3.1 測試案例清單

| 測試類別 | 測試項目 | 測試對象 | 預估數量 |
|----------|----------|----------|----------|
| 單元測試 | 資料庫 Migration | 後端 | 10 |
| 單元測試 | API 端點邏輯 | 後端 | 15 |
| 整合測試 | 投資組合 API | API | 10 |
| 整合測試 | AI 評分 API | API | 8 |
| E2E 測試 | 投資組合流程 | 前端 | 5 |
| E2E 測試 | AI 評分查看流程 | 前端 | 3 |
| 效能測試 | 查詢響應時間 | DB | 5 |

### 3.2 測試環境

- **資料庫**：Staging 環境的 Supabase PostgreSQL
- **Mock 外部 API**：使用 Python `unittest.mock` 封裝外部依賴
- **CI Pipeline**：GitHub Actions 自動執行測試

---

## 四、風險管理

### 4.1 識別風險

| 風險項目 | 發生機率 | 影響程度 | 因應措施 |
|----------|:--------:|:--------:|----------|
| 資料庫 Migration 衝突 | 中 | 高 | 採用冪等性腳本，先 DROP 再 CREATE |
| API 效能瓶頸 | 中 | 中 | 建立複合索引，分頁查詢優化 |
| RLS 政策過嚴 | 低 | 中 | 開發環境開啟詳細日誌，便於除錯 |
| 外部 API 配額限制 | 中 | 中 | Tiingo/FMP 金鑰輪詢機制已就緒 |

### 4.2 應變計畫

若資料庫 Migration 失敗：
1. 保留原始表格，使用 `ALTER TABLE` 新增欄位
2. 使用 `CREATE TABLE IF NOT EXISTS` 確保冪等性
3. 建立復原腳本 `YYYYMMDD_xx_rollback_xxx.sql`

---

## 五、工時統計

| 任務 | 預估工時 | 說明 |
|------|:--------:|------|
| Task 1: 資料庫結構補全 | 5 人天 | 10 張表 + 4 個欄位擴充 |
| Task 2: ETL 腳本補全 | 3 人天 | 4 個 Fetcher |
| Task 3: API 端點補全 | 5 人天 | 10 個 API 端點 |
| Task 4: 計算下沉與效能優化 | 3 人天 | 技術指標、索引、分區 |
| Task 5: RLS 安全政策 | 1 人天 | 4 個表格 RLS |
| Task 6: 統一適配層 | 1 人天 | 類型定義與標準化 |
| **合計** | **18 人天** | |

---

## 六、交付清單

### 6.1 程式碼交付

| 交付項目 | 類型 | 說明 |
|----------|------|------|
| Migration 腳本 | SQL | 10+ 個 `YYYYMMDD_xx_*.sql` |
| Fetcher 腳本 | Python | 4 個 `*_fetcher.py` |
| API 端點 | TypeScript | 10+ 個 Next.js Route Handler |
| 技術指標視圖 | SQL | MA, RSI, MACD, Bollinger Bands |
| 索引腳本 | SQL | 5+ 個 `CREATE INDEX` |

### 6.2 文件交付

| 交付項目 | 說明 |
|----------|------|
| `025_Phase7_DB_Backend_Completion_Plan.md` | 本計畫書 |
| `004_資料庫實體關係圖與 Schema 定義.md` | 更新版本 (v4.0) |
| `008_API 端點詳細規格.md` | 更新版本 (v3.0) |
| `005_資料庫 Migration 腳本集.md` | 更新版本 (v3.0) |

### 6.3 測試交付

| 交付項目 | 說明 |
|----------|------|
| `backend/tests/test_db_migrations.py` | Migration 測試 |
| `backend/tests/test_api_endpoints.py` | API 測試 |
| `frontend/__tests__/api/*.test.tsx` | 前端整合測試 |

---

## 七、品質閘門

本階段結束時（第 3 週週五）需通過以下品質閘門：

| 閘門項目 | 檢查方式 | 通過標準 |
|----------|----------|----------|
| 資料庫 Migration | 手動驗證 | 所有表格正確建立，無錯誤 |
| API 功能測試 | Postman/Newman | 15+ 端點測試通過 |
| 前端整合測試 | Jest | 100% 通過，無 Flaky Test |
| TypeScript 檢查 | `npm run build` | Exit 0，無 Error |
| Lint 檢查 | `npm run lint` | 無 Error，僅 Warning |
| RLS 隔離測試 | 手動測試 | 用戶無法存取他人數據 |
| 查詢效能 | EXPLAIN ANALYZE | P95 < 200ms |

---

## 八、總結

### 8.1 階段目標

本計畫 (Phase 7) 旨在完成以下核心目標：

1. **資料庫完整性**：補全 12 張缺失資料表，確保前端所有功能有對應的後端支撐
2. **API 連貫性**：補全 10 個核心 API 端點，消除功能缺口
3. **效能提升**：透過計算下沉與索引優化，確保大數據場景下的流暢體驗
4. **安全強化**：完善 RLS 安全政策，確保用戶數據隔離

### 8.2 後續銜接

Phase 7 完成後，將銜接：

- **Phase 8**：部署與交付（正式環境部署、用戶手冊、專案結案）
- **Phase 9**：AI 反饋閉環（用戶評分功能、向量資料庫更新）

---

**文件建立時間**：2026-01-28 14:00
**建立者**：AI 投資分析儀 V10.0 開發團隊
**下次審查**：2026-02-04

---

*計畫編號：025*
*版本：1.0.0*
*文件狀態：草稿 (待審核)*
