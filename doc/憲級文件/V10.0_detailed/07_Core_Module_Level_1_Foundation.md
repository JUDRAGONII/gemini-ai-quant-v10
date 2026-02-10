# 07. 核心模組 1：基礎持倉與儀表板 (Foundation & Dashboard)

> **文件版本**：v1.0 (V10.0 完整規格書重構)
> **日期**：2026-02-10
> **核心使命：** 定義 MOD-A/C/N 模組的完整 UI 規格、Widget 規範與交易日誌

---

## 1. [A] 儀表板 (Dashboard)

### 1.1 頁面佈局結構

| 元件 | 用途 | V10.0 強化 |
|------|------|------------|
| **PortfolioSummaryCard** | 資產摘要卡片 | 支援演化策略配置顯示 |
| **MarketIndexMonitor** | 市場核心指數 | 支援 130+ 宏觀指標快捷 |
| **AITacticalHub** | AI 戰略焦點 | 18 維度評分、雷達圖 |
| **SmartMoneyMatrix** | 量化紅綠燈矩陣 | 11 家 13F 機構持倉 |

### 1.2 資產摘要卡片欄位

| 欄位 | 類型 | 說明 |
|------|------|------|
| totalValue | currency | 總資產淨值 |
| dailyPnL | percent | 當日盈虧 |
| maxDrawdown | percent | 歷史最高回撤 |
| sharpeRatio | number | 夏普比率 |
| evolutionRegime | string | 當前宏觀 regime |
| genomeId | uuid | 使用的基因組 ID |

---

## 2. [C] 投資組合明細 (Portfolio Details)

### 2.1 下鑽式分析結構

| 層級 | 元件 | 說明 |
|------|------|------|
| **組合級** | AssetAllocationHeatmap | 資產配置熱圖 |
| **產業級** | SectorAllocationChart | 產業配置圖 |
| **標的級** | HoldingsTable | 持倉明細表 |
| **分析級** | PerformanceAttribution | 績效歸因 (Brinson) |

---

## 3. [N] 交易日誌 (Transaction Log)

### 3.1 完整欄位定義

| 欄位 | 類型 | V10.0 新增 |
|------|------|------------|
| id | UUID | - |
| entryReason | string | 買入理由 |
| exitPlan | string | 預計停利/停損位 |
| convictionScore | number | 信心評分 1-10 |
| genomeId | UUID | **V10.0** - 對應的基因組 ID |
| regimeAtTrade | string | **V10.0** - 當時宏觀 regime |

---

## 5. 邏輯拆解 (Logic Breakdown)

### 5.1 [A] 儀表板資料流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    [A] 儀表板資料流程                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                         資料聚合層                                    │   │
│   │                                                                      │   │
│   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │   │
│   │   │   Portfolio  │  │   Market    │  │   Evolution  │             │   │
│   │   │   Service   │  │   Service   │  │   Service   │             │   │
│   │   │              │  │              │  │              │             │   │
│   │   │ • 持倉明細   │  │ • 指數行情   │  │ • 策略狀態   │             │   │
│   │   │ • 績效指標   │  │ • 宏觀指標   │  │ • 基因組ID   │             │   │
│   │   │ • 部位敞口   │  │ • 市場情緒   │  │ • 演化狀態   │             │   │
│   │   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │   │
│   │          │                 │                 │                       │   │
│   │          └─────────────────┼─────────────────┘                       │   │
│   │                            │                                         │   │
│   │                            ▼                                         │   │
│   │          ┌─────────────────────────────────────┐                  │   │
│   │          │         API Gateway                 │                  │   │
│   │          │   • GraphQL Federation             │                  │   │
│   │          │   • Request Aggregation            │                  │   │
│   │          │   • Caching Layer (Redis)          │                  │   │
│   │          └─────────────────────────────────────┘                  │   │
│   │                            │                                         │   │
│   │                            ▼                                         │   │
│   │   ┌─────────────────────────────────────────────────────────────┐ │   │
│   │   │                    UI Components                            │ │   │
│   │   │                                                              │ │   │
│   │   │   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │ │   │
│   │   │   │  Portfolio      │  │  MarketIndex    │  │  AI         │ │ │   │
│   │   │   │  Summary Card   │  │  Monitor        │  │  Tactical   │ │ │   │
│   │   │   │                 │  │                 │  │  Hub        │ │ │   │
│   │   │   │ • Total Value   │  │ • TAIEX/SCI    │  │ • 18 維度   │ │ │   │
│   │   │   │ • Daily P&L     │  │ • VIX/Spread   │  │ • 雷達圖    │ │ │   │
│   │   │   │ • Sharpe        │  │ • 130+ Macro   │  │ • Regime    │ │ │   │
│   │   │   └─────────────────┘  └─────────────────┘  └─────────────┘ │ │   │
│   │   │                                                              │ │   │
│   │   │   ┌─────────────────┐  ┌─────────────────┐                    │ │   │
│   │   │   │  SmartMoney    │  │  Evolution      │                    │ │   │
│   │   │   │  Matrix        │  │  Status Panel   │                    │ │   │
│   │   │   │                 │  │                 │                    │ │   │
│   │   │   │ • 11 機構持倉  │  │ • Current Gen   │                    │ │   │
│   │   │   │ • 紅綠燈信號   │  │ • Progress     │                    │ │   │
│   │   │   │ • 異動追蹤     │  │ • Fitness      │                    │ │   │
│   │   │   └─────────────────┘  └─────────────────┘                    │ │   │
│   │   │                                                              │ │   │
│   │   └─────────────────────────────────────────────────────────────┘ │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 [C] 投資組合下鑽分析流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    [C] 投資組合下鑽分析流程                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Level 1: 組合級 ──▶ Level 2: 產業級 ──▶ Level 3: 標的級 ──▶ Level 4: 分析級 │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │   Level 1: 組合級 - AssetAllocationHeatmap                         │   │
│   │   ├─ 股票/債券/另類 配置比例                                         │   │
│   │   ├─ 內部/外部 管理區分                                               │   │
│   │   └─ 7 個風險區間                                                    │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │   Level 2: 產業級 - SectorAllocationChart                          │   │
│   │   ├─ GICS 11 產業分類                                                │   │
│   │   ├─ 相對基準超配/低配                                                │   │
│   │   └─ 產業動能評分                                                    │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │   Level 3: 標的級 - HoldingsTable                                   │   │
│   │   ├─ 持倉明細 (代碼/名稱/股數/成本/市價/損益)                         │   │
│   │   ├─ 18 維度評分顯示                                                  │   │
│   │   └─ 風險警示標記                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │   Level 4: 分析級 - PerformanceAttribution                         │   │
│   │   ├─ Brinson 歸因 (配置效應/選股效應/交互效應)                         │   │
│   │   ├─ Barra 風險分解 (系統性/特異性風險)                               │   │
│   │   └─ 因子曝險矩陣                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 [N] 交易日誌處理流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    [N] 交易日誌處理流程                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐               │
│   │   交易觸發   │     │   訂單執行   │     │   日誌記錄   │               │
│   │              │     │              │     │              │               │
│   │ • Signal     │     │ • Order Type │     │ • 自動記錄   │               │
│   │ • Manual     │     │ • Execution  │     │ • 補錄介面   │               │
│   │ • Rebalance  │     │ • Fill Info  │     │ • 附件上傳   │               │
│   └──────────────┘     └──────────────┘     └──────────────┘               │
│          │                   │                   │                          │
│          │                   │                   │                          │
│          └───────────────────┼───────────────────┘                          │
│                              ▼                                              │
│              ┌─────────────────────────────────────┐                      │
│              │       Validation Layer              │                      │
│              │                                      │                      │
│              │   • 欄位完整性檢查                   │                      │
│              │   • 金額合理性驗證                   │                      │
│              │   • 基因組關聯驗證                   │                      │
│              │   • 宏觀 Regime 標記                │                      │
│              └─────────────────────────────────────┘                      │
│                              │                                              │
│                              ▼                                              │
│              ┌─────────────────────────────────────┐                      │
│              │       Storage Layer                │                      │
│              │                                      │                      │
│              │   • PostgreSQL 主表                 │                      │
│              │   • Redis Cache 更新                │                      │
│              │   • Elasticsearch 索引              │                      │
│              └─────────────────────────────────────┘                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. 邊界條件定義 (Edge Cases)

### 6.1 [A] 儀表板邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-F01** | 持倉數據延遲 (> 5 分鐘) | 顯示數據過期警告 | 標記 "Stale Data" |
| **EC-F02** | API 全部不可用 | 顯示離線模式 | 展示最近快取資料 |
| **EC-F03** | 基因組 ID 無效 | 基因組面板顯示錯誤 | 提示 "Unknown Genome" |
| **EC-F04** | 宏觀 Regime 切換中 | Regime 顯示閃爍 | 顯示 "Transitioning" |
| **EC-F05** | 紅綠燈矩陣數據缺失 | 部分機構顯示灰色 | 標記 "Data Delayed" |
| **EC-F06** | 即時行情中斷 | 降級至延時行情 | 顯示行情來源與延遲時間 |

### 6.2 [C] 投資組合邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-F07** | 下鑽層級過深 (> 4 層) | 限制最大下鑽層數 | 返回頂層提示 |
| **EC-F08** | 持倉數據與實際不符 | 觸發對帳警報 | 顯示差異摘要 |
| **EC-F09** | Brinson 歸因數據不足 | 顯示不完全歸因 | 提示 "Insufficient Data" |
| **EC-F10** | 產業分類缺失 | 使用 "Unknown" 分類 | 稍後人工分類 |
| **EC-F11** | 計算超時 ( > 30 秒) | 顯示載入中狀態 | 提供非同步查詢 |
| **EC-F12** | 篩選條件無結果 | 顯示空狀態頁面 | 提供清除篩選建議 |

### 6.3 [N] 交易日誌邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-F13** | 必填欄位缺失 | 提交驗證失敗 | 高亮缺失欄位 |
| **EC-F14** | 信心評分超出 1-10 | 顯示錯誤提示 | 限制輸入範圍 |
| **EC-F15** | 基因組 ID 不存在 | 無法關聯策略 | 提示選擇有效基因組 |
| **EC-F16** | 宏觀 Regime 無效 | 顯示可選列表 | 限制選擇範圍 |
| **EC-F17** | 同一交易重複提交 | 交易去重檢查 | 提示已存在 |
| **EC-F18** | 補錄交易日期過期 | 限制補錄範圍 | 僅允許 30 天內 |

---

## 7. Schema 完整化

### 7.1 儀表板配置資料表 `dashboard_config`

```sql
-- ============================================================================
-- 儀表板配置資料表
-- 用途：存儲用戶自定義儀表板配置
-- ============================================================================

CREATE TABLE IF NOT EXISTS dashboard_config (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES auth.users(id),
    config_name         VARCHAR(100) NOT NULL,           -- 配置名稱
    is_default          BOOLEAN DEFAULT FALSE,            -- 是否為預設
    
    -- 布局配置
    layout_type         VARCHAR(20) DEFAULT 'grid',      -- grid/compact/fullscreen
    refresh_interval    INTEGER DEFAULT 30000,          -- 刷新間隔 (ms)
    
    -- 元件可見性
    show_portfolio_summary BOOLEAN DEFAULT TRUE,         -- 顯示資產摘要
    show_market_monitor BOOLEAN DEFAULT TRUE,           -- 顯示市場監控
    show_ai_hub         BOOLEAN DEFAULT TRUE,            -- 顯示 AI 戰略
    show_smart_money    BOOLEAN DEFAULT TRUE,            -- 顯示聰明錢矩陣
    show_evolution_status BOOLEAN DEFAULT TRUE,        -- 顯示演化狀態
    
    -- 自定義元件
    custom_widgets      JSONB,                          -- 自定義 Widget
    widget_positions    JSONB,                          -- 元件位置配置
    
    -- 主題配置
    theme               VARCHAR(20) DEFAULT 'dark',     -- dark/light/auto
    accent_color        VARCHAR(7) DEFAULT '#00C896',   -- 強調色
    
    -- 數據偏好
    default_view_period VARCHAR(20) DEFAULT '1M',       -- 預設顯示期間
    show_pnl_type       VARCHAR(10) DEFAULT 'both',     -- unrealized/realized/both
    benchmark_symbol    VARCHAR(20) DEFAULT '0050.TW',  -- 比較基準
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT dc_user_default UNIQUE (user_id, is_default)
);

-- ============================================================================
-- 儀表板快捷方式資料表
-- ============================================================================

CREATE TABLE IF NOT EXISTS dashboard_shortcuts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES auth.users(id),
    shortcut_name       VARCHAR(100) NOT NULL,           -- 捷徑名稱
    shortcut_type       VARCHAR(50) NOT NULL,            -- url/filter/action
    
    -- 捷徑目標
    target_url          VARCHAR(500),                    -- 目標 URL
    target_view         VARCHAR(50),                     -- 目標視圖
    filter_params       JSONB,                           -- 篩選參數
    
    -- 捷徑屬性
    icon                VARCHAR(50),                     -- 圖標名稱
    display_order       INTEGER DEFAULT 0,               -- 顯示順序
    is_favorite         BOOLEAN DEFAULT FALSE,           -- 是否收藏
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- COMMENT 註解
COMMENT ON TABLE dashboard_config IS '用戶儀表板配置表';
COMMENT ON TABLE dashboard_shortcuts IS '儀表板快捷方式表';
```

### 7.2 持倉明細資料表 `holdings`

```sql
-- ============================================================================
-- 持倉明細資料表
-- 用途：記錄投資組合持倉狀態
-- ============================================================================

CREATE TABLE IF NOT EXISTS holdings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id        UUID NOT NULL,                   -- 投資組合 ID
    symbol              VARCHAR(20) NOT NULL,             -- 標的代碼
    symbol_name         VARCHAR(200),                     -- 標的名稱
    
    -- 持倉數量
    shares              DECIMAL(18,6) NOT NULL,          -- 持有股數
    average_cost       DECIMAL(18,6) NOT NULL,          -- 平均成本
    current_price       DECIMAL(18,6),                   -- 最新價格
    market_value        DECIMAL(24,2),                   -- 市值
    
    -- 損益計算
    unrealized_pnl      DECIMAL(24,2),                   -- 未實現損益
    unrealized_pnl_pct  DECIMAL(10,4),                  -- 未實現損益 %
    realized_pnl_total24,2),  DECIMAL(                   -- 累計實現損益
    
    -- 持倉屬性
    position_type       VARCHAR(10) DEFAULT 'long',     -- long/short
    sector              VARCHAR(50),                      -- 產業分類
    industry_group      VARCHAR(100),                     -- 產業群組
    
    -- V10.0 因子評分
    factor_composite_score DECIMAL(8,4),                -- 18 維度綜合評分
    factor_value_score   DECIMAL(8,4),                 -- 價值評分
    factor_quality_score DECIMAL(8,4),                 -- 品質評分
    factor_momentum_score DECIMAL(8,4),                -- 動能評分
    
    -- 風險指標
    beta_1y             DECIMAL(8,4),                    -- Beta
    volatility_1y       DECIMAL(8,4),                    -- 波動率
    var_daily_95        DECIMAL(18,6),                   -- 95% VaR
    
    -- 交易關聯
    genome_id           UUID,                            -- 關聯基因組 ID
    regime_at_open      VARCHAR(20),                     -- 建倉時 Regime
    
    -- 風險狀態
    risk_level          VARCHAR(10) DEFAULT 'medium',   -- low/medium/high
    alert_status        VARCHAR(20) DEFAULT 'none',    -- none/warning/critical
    alert_message       TEXT,                            -- 警示訊息
    
    -- 時間戳記
    opened_at           TIMESTAMP WITH TIME ZONE,        -- 建倉時間
    last_rebalanced_at TIMESTAMP WITH TIME ZONE,        -- 最後調倉時間
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT h_portfolio_symbol_uniq UNIQUE (portfolio_id, symbol)
);

-- ============================================================================
-- 持倉歷史快照資料表
-- ============================================================================

CREATE TABLE IF NOT EXISTS holding_snapshots (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id        UUID NOT NULL,                   -- 投資組合 ID
    snapshot_date       DATE NOT NULL,                   -- 快照日期
    
    -- 快照內容 (完整持倉 JSON)
    holdings_data       JSONB NOT NULL,                  -- 持倉快照 JSON
    
    -- 快照元數據
    total_market_value  DECIMAL(24,2),                   -- 總市值
    total_shares        INTEGER,                         -- 總股數
    snapshot_type       VARCHAR(20) DEFAULT 'daily',    -- daily/monthly/rebalance
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT hs_date_uniq UNIQUE (portfolio_id, snapshot_date, snapshot_type)
);

-- COMMENT 註解
COMMENT ON TABLE holdings IS '投資組合持倉明細表';
COMMENT ON TABLE holding_snapshots IS '持倉歷史快照表';
COMMENT ON COLUMN holdings.factor_composite_score IS '18 維度 Z-Score 加權平均 (-3 to +3)';
COMMENT ON COLUMN holdings.genome_id IS 'V10.0 演化策略基因組關聯';
```

### 7.3 交易日誌資料表 `transaction_log`

```sql
-- ============================================================================
-- 交易日誌資料表
-- 用途：記錄所有交易決策與執行
-- ============================================================================

CREATE TABLE IF NOT EXISTS transaction_log (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id        UUID NOT NULL,                   -- 投資組合 ID
    symbol              VARCHAR(20) NOT NULL,             -- 標的代碼
    symbol_name         VARCHAR(200),                     -- 標的名稱
    
    -- 交易類型
    transaction_type    VARCHAR(10) NOT NULL,            -- buy/sell/split/dividend
    order_type          VARCHAR(20),                     -- market/limit/stop
    limit_price         DECIMAL(18,6),                   -- 限價
    stop_price          DECIMAL(18,6),                   -- 停損價
    
    -- 數量與金額
    shares              DECIMAL(18,6) NOT NULL,          -- 交易股數
    execution_price     DECIMAL(18,6),                   -- 成交價格
    execution_time      TIMESTAMP WITH TIME ZONE,        -- 成交時間
    total_amount        DECIMAL(24,2) NOT NULL,         -- 成交金額
    commission          DECIMAL(12,2) DEFAULT 0,         -- 手續費
    slippage            DECIMAL(12,2) DEFAULT 0,         -- 滑價
    
    -- V10.0 決策理由
    entry_reason        TEXT,                             -- 買入/建倉理由
    exit_plan           TEXT,                            -- 預計停利/停損
    conviction_score    INTEGER CHECK (conviction_score BETWEEN 1 AND 10), -- 信心評分
    signal_source       VARCHAR(50),                     -- 訊號來源 (AI/System/Manual)
    ai_analysis_summary TEXT,                            -- AI 分析摘要
    
    -- V10.0 演化策略關聯
    genome_id           UUID,                            -- 使用的基因組 ID
    genome_version      VARCHAR(20),                     -- 基因組版本
    regime_at_trade     VARCHAR(20),                     -- 交易時宏觀 Regime
    factor_scores       JSONB,                           -- 當時因子評分
    
    -- 風險管理
    stop_loss_price     DECIMAL(18,6),                   -- 停損價
    take_profit_price   DECIMAL(18,6),                   -- 停利價
    risk_reward_ratio   DECIMAL(8,4),                    -- 風險報酬比
    
    -- 執行狀態
    status              VARCHAR(20) DEFAULT 'pending',   -- pending/filled/cancelled/rejected
    rejection_reason    VARCHAR(200),                     -- 拒絕原因
    
    -- 結案資料
    closed_at           TIMESTAMP WITH TIME ZONE,        -- 平倉時間
    exit_execution_price DECIMAL(18,6),                  -- 平倉價格
    realized_pnl        DECIMAL(24,2),                   -- 實現損益
    holding_days        INTEGER,                         -- 持有天數
    
    -- 審核追蹤
    requires_review     BOOLEAN DEFAULT FALSE,           -- 需要審核
    reviewed_by         UUID,                            -- 審核人
    reviewed_at         TIMESTAMP WITH TIME ZONE,        -- 審核時間
    review_note         TEXT,                            -- 審核備註
    
    -- 附件
    attachments         JSONB,                            -- 附件路徑
    
    -- 元數據
    notes               TEXT,                            -- 備註
    tags                VARCHAR(50)[],                    -- 標籤
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT tl_status_check CHECK (status IN ('pending', 'filled', 'partially_filled', 'cancelled', 'rejected', 'expired'))
);

-- ============================================================================
-- 交易日誌附件資料表
-- ============================================================================

CREATE TABLE IF NOT EXISTS transaction_attachments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id      UUID NOT NULL REFERENCES transaction_log(id),
    file_name           VARCHAR(255) NOT NULL,           -- 檔案名稱
    file_path           VARCHAR(500) NOT NULL,           -- 儲存路徑
    file_type           VARCHAR(50),                     -- 檔案類型
    file_size           BIGINT,                           -- 檔案大小 (bytes)
    uploaded_by         UUID,                            -- 上傳者
    description         VARCHAR(500),                     -- 檔案描述
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- COMMENT 註解
COMMENT ON TABLE transaction_log IS '交易日誌表 - 完整交易記錄與決策理由';
COMMENT ON TABLE transaction_attachments IS '交易日誌附件表';
COMMENT ON COLUMN transaction_log.conviction_score IS '信心評分 1-10，10 為最高';
COMMENT ON COLUMN transaction_log.genome_id IS 'V10.0 演化策略基因組關聯';
COMMENT ON COLUMN transaction_log.regime_at_trade IS '交易時的宏觀 Regime 狀態';
```

---

## 8. 硬體/環境關聯 (QNAP TS-h973AX)

### 8.1 資源需求對照表

| 模組 | CPU | RAM | Storage | 配置重點 |
|------|-----|-----|---------|----------|
| **[A] 儀表板** | 4 核心 | 8 GB | SSD 50 GB | Redis Cache, WebSocket |
| **[C] 組合分析** | 8 核心 | 16 GB | SSD 100 GB | Pandas/Numpy 運算 |
| **[N] 交易日誌** | 2 核心 | 4 GB | SSD 30 GB | PostgreSQL Write |

### 8.2 Redis Cache 配置

```bash
# ============================================================================
# 儀表板 Redis Cache 配置
# ============================================================================

# 持倉數據 Cache Key 前綴
SETEX "dashboard:portfolio:{portfolio_id}:summary" 300 $data

# 市場指數 Cache Key 前綴
SETEX "dashboard:market:{symbol}:realtime" 60 $data

# 演化狀態 Cache Key 前綴
SETEX "dashboard:evolution:{genome_id}:status" 600 $data

# 機構持倉 Cache Key 前綴
SETEX "dashboard:smartmoney:{institution_id}" 3600 $data

# 交易日誌 Cache Key 前綴
SETEX "transactions:{portfolio_id}:recent" 300 $data

# 配置 Redis 記憶體限制
maxmemory 4gb
maxmemory-policy allkeys-lru
```

### 8.3 ZFS 儲存配置

```bash
#!/bin/bash
# ============================================================================
# 儀表板與持倉資料 ZFS 配置
# ============================================================================

# 創建持倉快照 Dataset
zfs create quant_pool/holdings
zfs set compression=lz4 quant_pool/holdings
zfs set atime=off quant_pool/holdings
zfs set primarycache=all quant_pool/holdings
zfs set quota=200G quant_pool/holdings

# 創建交易日誌附件 Dataset
zfs create quant_pool/transactions/attachments
zfs set compression=zstd quant_pool/transactions/attachments
zfs set quota=100G quant_pool/transactions/attachments

# 創建儀表板配置 Dataset
zfs create quant_pool/dashboard
zfs set compression=lz4 quant_pool/dashboard
zfs set atime=off quant_pool/dashboard
```

---

## 9. 開發者備註 (Developer Notes)

### ⚠️ 技術陷阱警示

#### TT-F01: 即時數據與快取同步
```typescript
// 問題：Redis 快取與資料庫不一致
// 
// 解決方案：
// 1. 使用 Write-Through Cache
// 2. 實現快取失效策略
// 3. 使用 Redis Pub/Sub 通知更新

async function updatePortfolioWithCache(portfolioId: string, data: PortfolioData) {
    // 同步寫入資料庫
    await db.portfolio.update(portfolioId, data);
    
    // 同步更新 Cache
    await redis.setex(`portfolio:${portfolioId}`, 300, JSON.stringify(data));
    
    // 發布更新通知
    await redis.publish(`portfolio:${portfolioId}:updated`, '1');
}
```

#### TT-F02: WebSocket 連線管理
```typescript
// 問題：大量 WebSocket 連線導致記憶體問題
// 
// 解決方案：
// 1. 使用連線池
// 2. 實現心跳檢測
// 3. 自動斷線重連

class DashboardWebSocket {
    private connections = new Map<string, WebSocket>();
    private heartbeatInterval = 30000; // 30 秒
    
    async broadcast(message: MarketUpdate) {
        for (const [id, ws] of this.connections) {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(message));
            }
        }
    }
    
    // 清理閒置連線
    cleanupIdleConnections(maxIdleMs = 300000) {
        // 移除超過 5 分鐘無活動的連線
    }
}
```

#### TT-F03: 大量持倉渲染效能
```typescript
// 問題：持有 500+ 標的時表格渲染卡頓
// 
// 解決方案：
// 1. 虛擬滾動 (Virtual Scrolling)
// 2. 分頁載入
// 3. Web Worker 計算

function HoldingsTable({ holdings }: { holdings: Holding[] }) {
    // 使用虛擬滾動
    const rowVirtualizer = useVirtualizer({
        count: holdings.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 48,
        overscan: 5,
    });
    
    return (
        <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
            <div
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
            >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => (
                    <HoldingRow
                        key={virtualRow.key}
                        data={holdings[virtualRow.index]}
                    />
                ))}
            </div>
        </div>
    );
}
```

#### TT-F04: 交易日誌並發寫入
```sql
-- 問題：多策略同時寫入導致鎖定
-- 
-- 解決方案：
-- 1. 使用 Row Level Locking
-- 2. 實現乐观锁
-- 3. 批次寫入

BEGIN;
SELECT * FROM transaction_log 
WHERE id = $1 
FOR UPDATE NOWAIT;  -- 不等待鎖

-- 執行寫入
INSERT INTO transaction_log ...;

COMMIT;
```

### 📝 開發建議

#### DEV-F01: 儀表板效能優化
```typescript
// 建議：實施分層載入策略
// 
// 載入策略：
// Layer 1: 即時數據 (Portfolio Summary) - 同步載入
// Layer 2: 快速查詢 (Market Data) - 300ms 內
// Layer 3: 複雜計算 (Attribution) - 非同步載入

interface DashboardLoadStrategy {
    immediate: ['portfolio-summary', 'market-indices'];
    fast: ['ai-radar', 'smart-money-matrix'];
    async: ['performance-attribution', 'factor-analysis'];
}
```

#### DEV-F02: 持倉下鑽優化
```typescript
// 建議：使用 React Query 實現智能預載入
// 
// 預載入策略：
// 1. 滑入可見區域時預載入
// 2. 滑鼠懸停時預載入
// 3. 層級轉換時預載入

function useSmartPrefetch(holdingId: string) {
    useQuery({
        queryKey: ['holding', holdingId, 'details'],
        queryFn: () => fetchHoldingDetails(holdingId),
        staleTime: 60000, // 1 分鐘內不重複請求
        prefetchInterval: 300000, // 每 5 分鐘背景刷新
    });
}
```

#### DEV-F03: 交易日誌搜尋優化
```sql
-- 建議：使用 Elasticsearch 實現全文搜尋
-- 
-- 索引設計：
-- 1. 標的代碼/名稱
-- 2. 交易理由 (全文)
-- 3. AI 分析摘要
-- 4. 標籤

CREATE INDEX idx_transaction_log_search 
ON transaction_log 
USING gin(to_tsvector('chinese', 
    symbol || ' ' || 
    coalesce(entry_reason, '') || ' ' || 
    coalesce(ai_analysis_summary, '')
));
```

#### DEV-F04: 離線支援設計
```typescript
// 建議：實現 Service Worker 離線支援
// 
// 離線策略：
// 1. 快取最近查看的持倉
// 2. 隊列化待發送交易
// 3. 網路恢復時自動同步

class OfflineTransactionQueue {
    async addTransaction(transaction: Transaction): Promise<void> {
        const queue = await this.getQueue();
        queue.push(transaction);
        await this.saveQueue(queue);
        
        // 註冊同步事件
        if ('sync' in ServiceWorkerRegistration.prototype) {
            await registration.sync.register('sync-transactions');
        }
    }
}
```

---

## 10. 關聯文件索引

| 文件 | 說明 | 交互關係 |
|------|------|----------|
| [00_Full_Reconstruction_TOC.md](00_Full_Reconstruction_TOC.md) | 完整檔案結構索引 | L1 模組位置 |
| [02_Technical_Architecture.md](02_Technical_Architecture.md) | 技術架構 | 前端技術棧 |
| [03_Data_Management_and_Database.md](03_Data_Management_and_Database.md) | 資料庫設計 | Schema 對應 |
| [05_Quant_Theory_and_Calculations.md](05_Quant_Theory_and_Calculations.md) | 量化理論 | 因子評分 |
| [09_Core_Module_Level_3_Decision.md](09_Core_Module_Level_3_Decision.md) | AI 決策輔助 | 訊號整合 |
| [11_Decision_Templates_Spec.md](11_Decision_Templates_Spec.md) | 決策模板 | 交易理由模板 |

---

> **文件版本**：v1.0.1 (細節顯性化擴張)
> **關聯文件**：[00_Full_Reconstruction_TOC](00_Full_Reconstruction_TOC.md)
> **維護責任**：系統架構師 / 前端工程師
> **最後更新**：2026-02-10

