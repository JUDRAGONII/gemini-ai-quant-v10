# 06. 數據處理工作流與 Prefect 排程 (Automation Workflow)

> **文件版本**：v1.0 (V10.0 完整規格書重構)
> **日期**：2026-02-10
> **核心使命：** 定義每日三層級 DAG 工作流、Prefect 任務設計與錯誤回補機制，涵蓋 V10.0 18 維度評分生成與演化策略更新

---

## 1. V10.0 三層級排程架構

```
┌─────────────────────────────────────────────────────────────────┐
│                    Prefect Workflow Architecture (V10.0)          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  TIER 1: 數據注入層 (17:00 - 18:30)                    │    │
│  │  ├─ fetch_ohlcv_prices         [依賴: None]           │    │
│  │  ├─ sync_securities_master     [依賴: prices]          │    │
│  │  ├─ fetch_macro_data (130+指標) [依賴: None]           │    │
│  │  ├─ fetch_institutional_13f    [依賴: None]            │    │
│  │  └─ fetch_sentiment_ptt        [依賴: None]            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  TIER 2: 量化與 AI 推理層 (19:30 - 21:00)              │    │
│  │  ├─ calculate_all_18factor_scores [依賴: T1 完成]      │    │
│  │  ├─ update_evolution_weights      [依賴: macro]        │    │
│  │  ├─ generate_ai_analysis (18維度) [依賴: factors]      │    │
│  │  └─ run_sentiment_analysis        [依賴: T1 完成]      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                            │                                    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  TIER 3: 成果彙整與通知層 (21:30 - 22:30)              │    │
│  │  ├─ generate_daily_house_view    [依賴: T2 完成]       │    │
│  │  ├─ send_telegram_briefing       [依賴: house_view]    │    │
│  │  ├─ update_portfolio_metrics     [依賴: T2 完成]       │    │
│  │  ├─ evolve_genome_parameters     [依賴: T2 完成]       │    │
│  │  └─ perform_db_vacuum            [依賴: None]          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 邏輯拆解 (Logic Breakdown)

### 3.1 TIER 1 數據注入層流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TIER 1: 數據注入層 (17:00 - 18:30)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                         並行數據拉取                                  │   │
│   │                                                                      │   │
│   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │   │
│   │   │   OHLCV     │  │   宏觀數據   │  │   13F 持倉  │             │   │
│   │   │   價格      │  │   130+指標   │  │   機構持倉  │             │   │
│   │   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │   │
│   │          │                 │                 │                       │   │
│   │          └────────────┬────┴────┬────────────┘                       │   │
│   │                       ▼         ▼                                     │   │
│   │          ┌───────────────────────────────┐                          │   │
│   │          │      數據驗證與品質檢查        │                          │   │
│   │          │   • 完整性檢查                │                          │   │
│   │          │   • 異常值檢測                 │                          │   │
│   │          │   • 時間戳記對齊               │                          │   │
│   │          └───────────────────────────────┘                          │   │
│   │                       │                                               │   │
│   │                       ▼                                               │   │
│   │          ┌───────────────────────────────┐                          │   │
│   │          │      寫入暫存 (Staging)        │                          │   │
│   │          │   • Redis Cache               │                          │   │
│   │          │   • 24h TTL                   │                          │   │
│   │          └───────────────────────────────┘                          │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**步驟分解：**

| 步驟 | 操作 | 輸入 | 輸出 | 處理邏輯 |
|------|------|------|------|----------|
| 1 | 並行 API 調用 | 外部 API | Raw JSON | asyncio.gather() 並行請求 |
| 2 | 數據驗證 | Raw JSON | Validated Data | Pydantic Schema 驗證 |
| 3 | 異常值檢測 | Validated Data | Flagged Data | IQR × 1.5 閾值 |
| 4 | 寫入 Redis | Cleaned Data | Cached Data | SETEX 24h TTL |

### 3.2 TIER 2 量化與 AI 推理層流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TIER 2: 量化與 AI 推理層 (19:30 - 21:00)                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                         因子計算                                      │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────┐    │   │
│   │   │              18 維度因子 Z-Score 計算                      │    │   │
│   │   │                                                         │    │   │
│   │   │   Value (10-25%) → Quality (15-30%) → Momentum (10-25%) │    │   │
│   │   │   Growth (10-25%) → Volatility (10-20%) → Size (5-15%)  │    │   │
│   │   │   ... 共 18 維度                                          │    │   │
│   │   │                                                         │    │   │
│   │   └─────────────────────────────────────────────────────────┘    │   │
│   │                       │                                               │   │
│   │                       ▼                                               │   │
│   │   ┌─────────────────────────────────────────────────────────┐    │   │
│   │   │                   演化策略更新                            │    │   │
│   │   │                                                         │    │   │
│   │   │   載入歷史族群 → 選擇 → 交叉 → 突變 → 替換              │    │   │
│   │   │   → 評估適應度 → 帕累托最優前端 → 存儲                   │    │   │
│   │   │                                                         │    │   │
│   │   └─────────────────────────────────────────────────────────┘    │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                         AI 分析生成                                   │   │
│   │                                                                      │   │
│   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │   │
│   │   │   GPT-4o    │  │   Claude 3.5  │  │   Gemini 2.0 │             │   │
│   │   │   分析       │  │   觀點       │  │   摘要       │             │   │
│   │   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │   │
│   │          │                 │                 │                       │   │
│   │          └────────────┬────┴────┬────────────┘                       │   │
│   │                       ▼         ▼                                     │   │
│   │          ┌───────────────────────────────┐                          │   │
│   │          │        觀點融合與衝突檢測      │                          │   │
│   │          └───────────────────────────────┘                          │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 TIER 3 成果彙整與通知層流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TIER 3: 成果彙整與通知層 (21:30 - 22:30)                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    每日綜合觀點生成                                   │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────┐    │   │
│   │   │              House View 決策框架                         │    │   │
│   │   │                                                         │    │   │
│   │   │   AI 分析  ──┬──  量化評分  ──┬──  市場情緒            │    │   │
│   │   │              │                │                        │    │   │
│   │   │              └──  綜合權重  ──┴──  最終建議              │    │   │
│   │   │                                                         │    │   │
│   │   │   • Buy/Sell/Hold 訊號                                  │    │   │
│   │   │   • 風險評級 (Low/Medium/High)                          │    │   │
│   │   │   • 置信度 (1-5 星)                                     │    │   │
│   │   │                                                         │    │   │
│   │   └─────────────────────────────────────────────────────────┘    │   │
│   │                       │                                               │   │
│   │                       ▼                                               │   │
│   │   ┌─────────────────────────────────────────────────────────┐    │   │
│   │   │                    多管道通知                            │    │   │
│   │   │                                                         │    │   │
│   │   │   Telegram  ──▶ 文字摘要 + 圖表                          │    │   │
│   │   │   LINE      ──▶ 簡短推送 + 連結                          │    │   │
│   │   │   Email     ──▶ 完整報告 (PDF)                           │    │   │
│   │   │   Discord   ──▶ Webhook 機器人                          │    │   │
│   │   │                                                         │    │   │
│   │   └─────────────────────────────────────────────────────────┘    │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. 邊界條件定義 (Edge Cases)

### 4.1 TIER 1 數據注入邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-W01** | API 響應時間 > 30 秒 | 任務超時 | 降級至備用 API |
| **EC-W02** | API 限流 (429 Too Many Requests) | 觸發速率限制 | 指數退避重試 |
| **EC-W03** | 數據源返回空結果集 | 數據完整性檢查失敗 | 標記為警告，跳過該源 |
| **EC-W04** | OHLCV 數據缺少收盤價 | 數據驗證失敗 | 使用最後有效價格填充 |
| **EC-W05** | 宏觀數據缺少最新月份 | 指標不完整 | 使用最近 3 個月均值 |
| **EC-W06** | 13F 持倉數據延遲發布 | 數據不可用 | 標記為延遲，稍後重試 |

### 4.2 TIER 2 量化計算邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-W07** | 因子計算耗時 > Timeout | 任務超時 | 分塊計算，先返回部分因子 |
| **EC-W08** | 演化策略族群退化 | 多樣性 < 5% | 重新隨機初始化 |
| **EC-W09** | AI API 響應錯誤 | 分析失敗 | 切換至備用 LLM |
| **EC-W10** | 多 AI 觀點完全衝突 | 融合決策困難 | 標記衝突，人工審核 |
| **EC-W11** | Redis 連接失敗 | 緩存不可用 | 直接寫入資料庫 |
| **EC-W12** | GPU 記憶體不足 | CUDA OOM | 回退至 CPU 計算 |

### 4.3 TIER 3 通知邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-W13** | Telegram 發送失敗 | 通知未送達 | 重試 3 次，失敗則 Email 備用 |
| **EC-W14** | 報告生成耗時過長 | 延遲通知 | 拆分報告，先發送摘要 |
| **EC-W15** | 資料庫連接中斷 | 存儲失敗 | 寫入本地檔案，稍後補錄 |
| **EC-W16** | PDF 轉換失敗 | 報告格式異常 | 降級為 HTML 格式 |

### 4.4 工作流整體邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-W17** | 任務鏈中斷 | DAG 失敗 | 自動重試 2 次 |
| **EC-W18** | 任務執行時間超出排程窗口 | 任務延遲 | 壓縮後續任務或延後至下一窗口 |
| **EC-W19** | 資源耗盡 (CPU > 90%, RAM > 90%) | 資源競爭 | 降低並行度或延後非關鍵任務 |
| **EC-W20** | 手動介入標記 | 流程暫停 | 等待人工審核後繼續 |

---

## 5. Schema 完整化

### 5.1 Prefect 工作流執行資料表 `prefect_workflow_runs`

```sql
-- ============================================================================
-- Prefect 工作流執行資料表
-- 用途：追蹤所有工作流執行狀態與效能指標
-- ============================================================================

CREATE TABLE IF NOT EXISTS prefect_workflow_runs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_name       VARCHAR(100) NOT NULL,           -- 工作流名稱
    flow_run_id         VARCHAR(100) UNIQUE,             -- Prefect Flow Run ID
    run_type            VARCHAR(20) NOT NULL,            -- scheduled/manual/retry/backfill
    
    -- 執行時間
    scheduled_start    TIMESTAMP WITH TIME ZONE,         -- 排程開始時間
    actual_start       TIMESTAMP WITH TIME ZONE,         -- 實際開始時間
    actual_end         TIMESTAMP WITH TIME ZONE,         -- 實際結束時間
    duration_seconds   INTEGER,                          -- 執行時長 (秒)
    
    -- 狀態管理
    status             VARCHAR(20) NOT NULL,             -- pending/running/success/failed/cancelled
    retry_count        INTEGER DEFAULT 0,               -- 重試次數
    retry_reason       TEXT,                             -- 重試原因
    
    -- 參數配置
    parameters         JSONB,                            -- 輸入參數
    run_config         JSONB,                            -- 執行配置
    
    -- 執行摘要
    total_tasks        INTEGER,                          -- 總任務數
    completed_tasks    INTEGER,                          -- 完成任務數
    failed_tasks       INTEGER,                          -- 失敗任務數
    skipped_tasks      INTEGER,                          -- 跳過任務數
    
    -- 資源使用
    cpu_usage_avg      DECIMAL(8,4),                     -- 平均 CPU 使用率
    memory_usage_avg   BIGINT,                           -- 平均記憶體使用 (MB)
    peak_memory_usage  BIGINT,                           -- 尖峰記憶體使用 (MB)
    
    -- 錯誤追蹤
    error_message      TEXT,                             -- 錯誤訊息
    error_traceback    TEXT,                             -- 錯誤堆疊
    failed_task_name   VARCHAR(100),                    -- 失敗任務名稱
    
    -- 輸出產出
    output_summary     JSONB,                           -- 輸出摘要
    artifact_paths     JSONB,                            -- 產出檔案路徑
    
    -- 觸發資訊
    triggered_by       VARCHAR(50),                       -- 觸發者 (schedule/api/manual)
    triggered_user     VARCHAR(100),                     -- 手動觸發用戶
    parent_run_id      UUID,                             -- 父執行 ID (重試/補跑)
    
    -- 標籤與元數據
    tags               JSONB,                            -- 標籤
    metadata           JSONB,                            -- 元數據
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT pwr_status_check CHECK (status IN ('pending', 'running', 'success', 'failed', 'cancelled', 'paused'))
);

-- ============================================================================
-- Prefect 任務執行資料表
-- ============================================================================

CREATE TABLE IF NOT EXISTS prefect_task_runs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_run_id     UUID NOT NULL REFERENCES prefect_workflow_runs(id),
    task_name           VARCHAR(100) NOT NULL,           -- 任務名稱
    task_index          INTEGER,                          -- 任務索引
    
    -- 執行時間
    scheduled_start    TIMESTAMP WITH TIME ZONE,         -- 排程開始時間
    actual_start       TIMESTAMP WITH TIME ZONE,         -- 實際開始時間
    actual_end         TIMESTAMP WITH TIME ZONE,         -- 實際結束時間
    duration_seconds   INTEGER,                          -- 執行時長 (秒)
    
    -- 狀態管理
    status             VARCHAR(20) NOT NULL,             -- pending/running/success/failed/scheduled/upstream_failed
    attempt_number     INTEGER DEFAULT 1,               -- 嘗試次數
    retryable          BOOLEAN DEFAULT TRUE,            -- 是否可重試
    
    -- 依賴關係
    upstream_task_ids  UUID[],                           -- 上游任務 ID
    downstream_task_ids UUID[],                         -- 下游任務 ID
    
    -- 輸入輸出
    input_summary      JSONB,                            -- 輸入摘要
    output_summary     JSONB,                            -- 輸出摘要
    
    -- 資源追蹤
    cpu_seconds        DECIMAL(12,4),                    -- CPU 使用時間
    memory_bytes       BIGINT,                           -- 記憶體使用量
    io_bytes           BIGINT,                           -- IO 流量
    
    -- 錯誤處理
    error_message      TEXT,                             -- 錯誤訊息
    error_type         VARCHAR(50),                      -- 錯誤類型
    
    -- 快取
    cache_key          VARCHAR(256),                     -- 快取鍵值
    cache_hit          BOOLEAN,                          -- 是否命中快取
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT ptr_status_check CHECK (status IN ('pending', 'running', 'success', 'failed', 'scheduled', 'upstream_failed', 'cached'))
);

-- ============================================================================
-- 工作流排程配置資料表
-- ============================================================================

CREATE TABLE IF NOT EXISTS prefect_schedules (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_name       VARCHAR(100) NOT NULL,           -- 工作流名稱
    schedule_name       VARCHAR(100),                    -- 排程名稱
    cron_expression     VARCHAR(100),                    -- Cron 表達式
    timezone            VARCHAR(50) DEFAULT 'Asia/Taipei', -- 時區
    
    -- 排程狀態
    is_active           BOOLEAN DEFAULT TRUE,            -- 是否啟用
    paused_at           TIMESTAMP WITH TIME ZONE,        -- 暫停時間
    next_scheduled_run  TIMESTAMP WITH TIME ZONE,       -- 下次執行時間
    
    -- 參數模板
    parameters_template JSONB,                           -- 參數模板
    override_params     JSONB,                           -- 覆蓋參數
    
    -- 通知配置
    notify_on_success   BOOLEAN DEFAULT TRUE,           -- 成功通知
    notify_on_failure    BOOLEAN DEFAULT TRUE,           -- 失敗通知
    notification_channels JSONB,                        -- 通知管道
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 索引定義
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_pwr_workflow ON prefect_workflow_runs(workflow_name, actual_start DESC);
CREATE INDEX IF NOT EXISTS idx_pwr_status ON prefect_workflow_runs(status, scheduled_start DESC);
CREATE INDEX IF NOT EXISTS idx_pwr_duration ON prefect_workflow_runs(workflow_name, duration_seconds DESC);
CREATE INDEX IF NOT EXISTS idx_ptr_workflow_run ON prefect_task_runs(workflow_run_id);
CREATE INDEX IF NOT EXISTS idx_ptr_task_status ON prefect_task_runs(task_name, status);
CREATE INDEX IF NOT EXISTS idx_ps_active ON prefect_schedules(is_active, next_scheduled_run);

-- COMMENT 註解
COMMENT ON TABLE prefect_workflow_runs IS 'Prefect 工作流執行追蹤表';
COMMENT ON TABLE prefect_task_runs IS 'Prefect 任務執行追蹤表';
COMMENT ON TABLE prefect_schedules IS 'Prefect 工作流排程配置表';
COMMENT ON COLUMN prefect_workflow_runs.run_type IS '執行類型: scheduled=排程, manual=手動, retry=重試, backfill=補跑';
```

### 5.2 工作流錯誤回補資料表 `workflow_error_log`

```sql
-- ============================================================================
-- 工作流錯誤回補資料表
-- 用途：追蹤錯誤與回補歷史
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_error_log (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_run_id     UUID REFERENCES prefect_workflow_runs(id),
    task_run_id         UUID REFERENCES prefect_task_runs(id),
    
    -- 錯誤分類
    error_type          VARCHAR(50) NOT NULL,           -- error_type (API/Timeout/Validation/etc)
    error_severity      VARCHAR(20) NOT NULL,           -- critical/high/medium/low
    error_category      VARCHAR(50),                     -- 錯誤類別
    
    -- 錯誤詳情
    error_message       TEXT NOT NULL,                   -- 錯誤訊息
    error_traceback     TEXT,                            -- 錯誤堆疊
    error_context       JSONB,                           -- 錯誤上下文
    
    -- 回補追蹤
    is_recovered        BOOLEAN DEFAULT FALSE,           -- 是否已回補
    recovery_attempts   INTEGER DEFAULT 0,               -- 回補嘗試次數
    recovery_method     VARCHAR(50),                     -- 回補方式
    recovered_at        TIMESTAMP WITH TIME ZONE,        -- 回補時間
    recovery_note       TEXT,                            -- 回補備註
    
    -- 人工介入
    requires_manual     BOOLEAN DEFAULT FALSE,           -- 需要人工介入
    manual_assignee     VARCHAR(100),                     -- 指派人員
    manual_resolved_at  TIMESTAMP WITH TIME ZONE,       -- 人工解決時間
    manual_note         TEXT,                            -- 人工解決備註
    
    -- 影響評估
    affected_records    INTEGER,                         -- 影響資料筆數
    data_completeness   DECIMAL(5,2),                    -- 資料完整性 %
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT wel_severity_check CHECK (error_severity IN ('critical', 'high', 'medium', 'low'))
);

-- ============================================================================
-- 索引定義
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_wel_workflow_run ON workflow_error_log(workflow_run_id);
CREATE INDEX IF NOT EXISTS idx_wel_error_type ON workflow_error_log(error_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wel_unresolved ON workflow_error_log(is_recovered, requires_manual);
CREATE INDEX IF NOT EXISTS idx_wel_severity ON workflow_error_log(error_severity, created_at DESC);

-- COMMENT 註解
COMMENT ON TABLE workflow_error_log IS '工作流錯誤追蹤與回補記錄表';
COMMENT ON COLUMN workflow_error_log.error_type IS '錯誤類型: API_ERROR/TIMEOUT/VALIDATION/RESOURCE_LIMIT/CONFIGURATION';
COMMENT ON COLUMN workflow_error_log.error_severity IS '錯誤嚴重性: critical=阻斷, high=高, medium=中, low=低';
```

### 5.3 每日工作流監控資料表 `daily_workflow_dashboard`

```sql
-- ============================================================================
-- 每日工作流監控儀表板資料表
-- 用途：支援 Dashboard 查詢
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_workflow_dashboard (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_date      DATE NOT NULL,                   -- 儀表板日期
    
    -- 工作流執行摘要
    total_workflows     INTEGER,                          -- 總工作流數
    successful_runs     INTEGER,                          -- 成功執行數
    failed_runs         INTEGER,                          -- 失敗執行數
    success_rate        DECIMAL(5,4),                    -- 成功率
    
    -- 時間效能
    avg_duration_min    DECIMAL(10,2),                   -- 平均執行時間 (分鐘)
    total_duration_min  DECIMAL(12,2),                   -- 總執行時間 (分鐘)
    longest_run_min     DECIMAL(10,2),                   -- 最長執行時間 (分鐘)
    
    -- 錯誤摘要
    critical_errors    INTEGER,                          -- 重大錯誤數
    high_errors         INTEGER,                          -- 高錯誤數
    medium_errors       INTEGER,                          -- 中錯誤數
    low_errors          INTEGER,                          -- 低錯誤數
    
    -- 資料完整性
    data_sources_ok     INTEGER,                          -- 正常數據源數
    data_sources_total  INTEGER,                          -- 總數據源數
    data_completeness   DECIMAL(5,2),                    -- 資料完整性 %
    
    -- 觸發統計
    scheduled_triggers  INTEGER,                          -- 排程觸發次數
    manual_triggers     INTEGER,                          -- 手動觸發次數
    api_triggers       INTEGER,                          -- API 觸發次數
    
    -- 預測指標
    predicted_duration_min DECIMAL(10,2),                -- 預測下次執行時間
    predicted_success_rate DECIMAL(5,4),                -- 預測成功率
    
    -- 快照時間
    snapshot_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT dwd_date_uniq UNIQUE (dashboard_date)
);

-- COMMENT 註解
COMMENT ON TABLE daily_workflow_dashboard IS '每日工作流監控儀表板摘要';
COMMENT ON COLUMN daily_workflow_dashboard.success_rate IS '成功率 = 成功執行 / 總執行數';
COMMENT ON COLUMN daily_workflow_dashboard.data_completeness IS '資料完整性 = 正常數據源 / 總數據源';
```

---

## 6. 硬體/環境關聯 (QNAP TS-h973AX)

### 6.1 資源需求對照表

| 工作流層級 | CPU | RAM | Storage | Docker 配置 |
|------------|-----|-----|---------|-------------|
| **TIER 1 數據注入** | 8 核心 | 16 GB | NVMe 100 GB | concurrent requests |
| **TIER 2 量化計算** | 16 核心 | 32 GB | NVMe 200 GB | multiprocessing |
| **TIER 3 成果彙整** | 4 核心 | 8 GB | SSD 50 GB | single thread |
| **Prefect Server** | 4 核心 | 8 GB | SSD 50 GB | API + UI |

### 6.2 Prefect Docker Compose 配置

```yaml
# ============================================================================
# Prefect 服務 Docker Compose
# ============================================================================

services:
  prefect-server:
    image: prefecthq/prefect:3.2.0
    container_name: prefect-server
    environment:
      - PREFECT_API_DATABASE_CONNECTION_URL=postgresql://user:pass@postgres:5432/prefect
      - PREFECT_API_REDIS_URL=redis://redis:6379/0
      - PREFECT_SERVER_CSRF_TRUSTED_ORIGINS=http://localhost:4200
    ports:
      - "4200:4200"
      - "4201:4201"
    volumes:
      - prefect_data:/root/.prefect
      - /share/quant_pool/prefect:/prefect:rw
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  prefect-worker:
    image: prefecthq/prefect:3.2.0
    container_name: prefect-worker
    environment:
      - PREFECT_API_URL=http://prefect-server:4200/api
      - PREFECT_WORKER_PREFETCH_SECONDS=60
      - PREFECT_WORKER_STORAGE_PATH=/prefect
    volumes:
      - prefect_data:/root/.prefect
      - /share/quant_pool/prefect:/prefect:rw
      - /var/run/docker.sock:/var/run/docker.sock
    command: >
      prefect worker start
      --type docker
      --name quant-worker
      --limit 4
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '16'
          memory: 32G
        reservations:
          cpus: '4'
          memory: 8G

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  prefect_data:
    driver: local
```

### 6.3 ZFS 儲存配置

```bash
#!/bin/bash
# ============================================================================
# Prefect 工作流儲存池配置
# ============================================================================

# 創建 Prefect 資料 Dataset
zfs create quant_pool/prefect
zfs set compression=lz4 quant_pool/prefect
zfs set atime=off quant_pool/prefect
zfs set primarycache=all quant_pool/prefect

# 創建每日監控 Dataset
zfs create quant_pool/prefect/dashboard
zfs set compression=zstd quant_pool/prefect/dashboard
zfs set quota=50G quant_pool/prefect/dashboard

# 創建工作流快取 Dataset
zfs create quant_pool/prefect/cache
zfs set compression=lz4 quant_pool/prefect/cache
zfs set atime=off quant_pool/prefect/cache
zfs set primarycache=metadata quant_pool/prefect/cache

# 配置 ZFS 屬性
zfs set logbias=throughput quant_pool/prefect
zfs set sync=standard quant_pool/prefect
```

---

## 7. 開發者備註 (Developer Notes)

### ⚠️ 技術陷阱警示

#### TT-W01: Prefect 工作流持久化
```python
# 問題：工作流狀態未正確持久化導致重啟後丢失
# 
# 解決方案：
# 1. 使用 PostgreSQL 作為後端儲存
# 2. 配置 Prefect 事件匯出
# 3. 實現自定義恢復邏輯

from prefect import Flow
from prefect_sqlalchemy import SqlAlchemy

# 配置強健的資料庫連接
@Flow
def robust_workflow():
    # 確保每個步驟有明確的狀態回調
    result = task_with_retry.submit()
    result.add_done_callback(on_complete)
    return result
```

#### TT-W02: 工作流 Timeout 處理
```python
# 問題：單一任務超時導致整個工作流失敗
# 
# 解決方案：
# 1. 為長時間任務設置 Timeout
# 2. 使用 Async 處理 IO-bound 任務
# 3. 實現漸進式超時策略

from prefect import task
from prefect.concurrent.futures import as_completed
import signal

class TimeoutException(Exception):
    pass

def timeout_handler(signum, frame):
    raise TimeoutException("Task timed out")

@task(timeout_seconds=1800)  # 30 分鐘超時
def long_running_task():
    signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(1800)  # 30 分鐘 alarm
    try:
        result = heavy_computation()
        return result
    finally:
        signal.alarm(0)  # 取消 alarm
```

#### TT-W03: 並發請求速率限制
```python
# 問題：大量並發 API 請求觸發速率限制
# 
# 解決方案：
# 1. 使用 Semaphore 控制並發數
# 2. 實現指數退避重試
# 3. 使用 AsyncRateLimiter

from prefect import task
from prefect.concurrent.futures import ThreadPoolExecutor
import asyncio

@task
def rate_limited_api_call(tasks: List[Task], max_concurrent: int = 5):
    semaphore = asyncio.Semaphore(max_concurrent)
    
    async def bounded_task(task):
        async with semaphore:
            return await task.execute()
    
    results = []
    for batch in chunks(tasks, max_concurrent):
        batch_results = await asyncio.gather(*[bounded_task(t) for t in batch])
        results.extend(batch_results)
    
    return results
```

#### TT-W04: 資料一致性問題
```python
# 問題：工作流中斷導致資料狀態不一致
# 
# 解決方案：
# 1. 使用 Idempotent 操作
# 2. 實現 checkpoint 機制
# 3. 使用 Upsert 而非 Insert

@task
def upsert_factor_scores(scores: pd.DataFrame, trade_date: date):
    """
    Idempotent upsert：多次執行結果相同
    """
    scores['trade_date'] = trade_date
    scores['updated_at'] = datetime.utcnow()
    
    # 使用 ON CONFLICT DO UPDATE
    query = """
    INSERT INTO factor_scores (...)
    VALUES (...)
    ON CONFLICT (symbol, trade_date)
    DO UPDATE SET 
        updated_at = EXCLUDED.updated_at,
        zscore_pe = EXCLUDED.zscore_pe,
        ...
    """
    
    return execute_query(query, scores.to_dict('records'))
```

### 📝 開發建議

#### DEV-W01: 工作流監控最佳實踐
```python
# 建議：實施完整的工作流監控
# 
# 監控維度：
# 1. 執行時間分布
# 2. 失敗率追蹤
# 3. 資源使用趨勢
# 4. 資料完整性指標

WORKFLOW_METRICS = {
    "execution_time": {
        "histogram": True,
        "buckets": [60, 300, 600, 1800, 3600, 7200],
        "labels": ["workflow", "status"]
    },
    "task_duration": {
        "histogram": True,
        "buckets": [10, 30, 60, 300, 600, 1800],
        "labels": ["task_name", "status"]
    },
    "data_completeness": {
        "gauge": True,
        "labels": ["data_source"]
    },
    "error_rate": {
        "counter": True,
        "labels": ["error_type", "severity"]
    }
}
```

#### DEV-W02: 工作流版本管理
```python
# 建議：實現工作流的版本控制
# 
# 版本策略：
# 1. 工作流名稱包含版本號
# 2. 參數模板版本化
# 3. 回測相容性標記

WORKFLOW_VERSION = {
    "name": "daily_pipeline_v2",
    "version": "2.1.0",
    "effective_date": "2026-02-01",
    "compatibility": {
        "min_data_version": "2025-01-01",
        "deprecated_versions": ["1.0.0", "1.1.0"]
    },
    "changes": {
        "added": ["new_sentiment_task"],
        "modified": ["factor_calculation_optimized"],
        "removed": []
    }
}
```

#### DEV-W03: 備份與災難復原
```python
# 建議：實施工作流配置的備份策略
# 
# 備份策略：
# 1. 每次部署自動備份
# 2. 保留最近 30 天版本
# 3. 跨機器同步備份

BACKUP_CONFIG = {
    "schedule": "0 */6 * * *",  # 每 6 小時
    "retention_days": 30,
    "destinations": [
        "s3://backup-bucket/workflows/",
        "/share/quant_pool/backup/workflows/"
    ],
    "include": [
        "prefect_deployments",
        "prefect_flows",
        "prefect_schedules",
        "custom_tasks"
    ]
}
```

#### DEV-W04: 工作流除錯技巧
```python
# 建議：使用 Prefect 內建工具除錯
# 
# 除錯方法：
# 1. Local 執行測試
# 2. 使用 Prefect UI 視覺化
# 3. 提取子圖執行

# Local 測試
from prefect import flow

@flow
def test_workflow():
    return task_1.submit()

# 子圖執行
from prefect import extract_flow_from_subflow

# 開發模式：只執行部分任務
if os.getenv("DEBUG_MODE"):
    # 跳過 AI 分析任務
    skip_ai_analysis = True
```

---

## 8. 關聯文件索引

| 文件 | 說明 | 交互關係 |
|------|------|----------|
| [00_Full_Reconstruction_TOC.md](00_Full_Reconstruction_TOC.md) | 完整檔案結構索引 | 工作流模組位置 |
| [04_Data_Sources_and_API_Governance.md](04_Data_Sources_and_API_Governance.md) | 數據源治理 | API 速率限制 |
| [05_Quant_Theory_and_Calculations.md](05_Quant_Theory_and_Calculations.md) | 量化理論 | 因子計算任務 |
| [12_Daily_Strategy_Report_Spec.md](12_Daily_Strategy_Report_Spec.md) | 每日報告生成 | 報告觸發流程 |
| [13_Development_and_Deployment_Ops.md](13_Development_and_Deployment_Ops.md) | CI/CD | 部署整合 |

---

> **文件版本**：v1.0.1 (細節顯性化擴張)
> **關聯文件**：[00_Full_Reconstruction_TOC](00_Full_Reconstruction_TOC.md)
> **維護責任**：系統架構師 / DevOps 工程師
> **最後更新**：2026-02-10

