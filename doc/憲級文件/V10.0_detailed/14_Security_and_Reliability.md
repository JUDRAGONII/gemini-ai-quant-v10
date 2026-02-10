# 14. 安全、穩定與可觀測性 (Safety & Observability)

> **文件版本**：v1.0 (V10.0 完整規格書重構)
> **日期**：2026-02-10
> **核心使命：** 定義 RBAC 權限矩陣、RLS 策略、Prometheus 指標與 DR Runbook，涵蓋雙用戶安全隔離

---

## 1. 安全防護體系 (V10.0 強化)

### 1.1 雙用戶安全隔離

| 隔離維度 | 實作方式 |
|----------|----------|
| **用戶資料隔離** | Supabase RLS 確保每用戶只能存取自己的投資組合 |
| **API Key 隔離** | 每位用戶的 API Key 獨立管理 |
| **分析偏好隔離** | 演化策略參數、投資目標獨立儲存 |
| **報告隔離** | AI 報告僅對應到特定用戶的投資組合 |

### 1.2 RBAC 權限矩陣

| 角色 | 讀取持倉 | 寫入交易 | 管理 API Keys | 管理使用者 | 系統設定 |
|------|----------|----------|---------------|-----------|----------|
| **User-A** | ✅ | ✅ | ✅ (自己的) | ❌ | ❌ |
| **User-B** | ✅ | ✅ | ✅ (自己的) | ❌ | ❌ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 2. Prometheus 指標 (V10.0 強化)

| 指標名稱 | 類型 | V10.0 說明 |
|----------|------|------------|
| **evolution_generation_total** | Counter | 演化策略迭代次數 |
| **genome_fitness_score** | Gauge | 基因組適應度分數 |
| **factor_18_score** | Histogram | 18 維度評分分佈 |
| **macro_indicator_count** | Gauge | 宏觀指標數量 (130+) |
| **institution_13f_count** | Gauge | 13F 機構數量 (11) |
| **vector_index_size_bytes** | Gauge | 語義向量索引大小 (9GB) |

---

## 3. 災難復原 Runbook

### 3.1 RTO/RPO 定義

| 項目 | V10.0 定義 |
|------|------------|
| **RTO** | 4 小時內恢復核心服務 |
| **RPO** | 資料遺失不超過 1 小時 |

### 3.2 復原步驟

```bash
# 1. 評估影響範圍
docker-compose ps
curl http://localhost:3000/api/health

# 2. 啟動備援環境
docker-compose -f docker-compose.dr.yml up -d

# 3. 恢復資料
pg_restore -h postgres -U postgres -d gemini_quant latest_backup.dump

# 4. 驗證服務
pytest tests/integration/ -v
```

---

## 5. 邏輯拆解 (Logic Breakdown)

### 5.1 雙用戶安全隔離流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    雙用戶安全隔離流程                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    身份驗證層                                           │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │                    JWT Token 驗證                         │  │   │
│   │   │   • Token 簽名驗證 (RS256)                              │  │   │
│   │   │   • Token 過期檢查                                       │  │   │
│   │   │   • User ID 提取                                         │  │   │
│   │   │   • Role 權限驗證                                        │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    RLS 策略執行層                                     │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │              PostgreSQL Row Level Security                 │  │   │
│   │   │                                                            │  │   │
│   │   │   ┌─────────────────────────────────────────────────────┐ │  │   │
│   │   │   │   CREATE POLICY user_isolation_policy             │ │  │   │
│   │   │   │   ON holdings                                      │ │  │   │
│   │   │   │   FOR ALL                                         │ │  │   │
│   │   │   │   USING (user_id = auth.uid());                    │ │  │   │
│   │   │   └─────────────────────────────────────────────────────┘ │  │   │
│   │   │                                                            │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    API 閘道層                                       │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │              API Key 隔離                                   │  │   │
│   │   │                                                            │  │   │
│   │   │   ┌─────────────────────────────────────────────────────┐ │  │   │
│   │   │   │   每位用戶的 API Keys 獨立儲存                     │ │  │   │
│   │   │   │   Keys 僅能用於該用戶的數據                        │ │  │   │
│   │   │   │   使用量、配額獨立計算                              │ │  │   │
│   │   │   └─────────────────────────────────────────────────────┘ │  │   │
│   │   │                                                            │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Prometheus 指標收集流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Prometheus 指標收集流程                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    應用層指標暴露                                      │   │
│   │                                                                      │   │
│   │   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │   │
│   │   │   FastAPI      │  │   Prefect     │  │   Quant      │   │   │
│   │   │   /metrics    │  │   Metrics     │  │   Metrics    │   │   │
│   │   │                │  │               │  │               │   │   │
│   │   │ • HTTP 請求   │  │ • Task 執行   │  │ • 因子計算   │   │   │
│   │   │ • 延遲分布   │  │ • Flow 狀態   │  │ • 演化迭代   │   │   │
│   │   │ • 錯誤率     │  │ • Queue Size  │  │ • 基因組適應 │   │   │
│   │   └─────────────────┘  └─────────────────┘  └─────────────────┘   │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    Prometheus 抓取                                     │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │              scrape_configs:                               │  │   │
│   │   │   - job_name: 'backend'                                    │  │   │
│   │   │     metrics_path: /metrics                                 │  │   │
│   │   │     static_configs:                                        │  │   │
│   │   │       - targets: ['backend:8000']                          │  │   │
│   │   │   - job_name: 'quant-engine'                               │  │   │
│   │   │     metrics_path: /metrics                                 │  │   │
│   │   │     static_configs:                                        │  │   │
│   │   │       - targets: ['quant-engine:8080']                     │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    Grafana Dashboard                                  │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │              V10.0 核心指標                                  │  │   │
│   │   │                                                            │  │   │
│   │   │   • evolution_generation_total (Counter)                   │  │   │
│   │   │   • genome_fitness_score (Gauge)                          │  │   │
│   │   │   • factor_18_score (Histogram)                            │  │   │
│   │   │   • macro_indicator_count (Gauge)                         │  │   │
│   │   │   • institution_13f_count (Gauge)                         │  │   │
│   │   │   • vector_index_size_bytes (Gauge)                       │  │   │
│   │   │                                                            │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 災難復原流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    災難復原流程                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    事件偵測                                           │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │              異常偵測引擎                                     │  │   │
│   │   │   • 健康檢查失敗                                             │  │   │
│   │   │   • 延遲飆升                                                 │  │   │
│   │   │   • 錯誤率上升                                               │  │   │
│   │   │   • 資源耗盡                                                 │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                              │                                     │
│   │                              ▼                                     │
│   │              ┌─────────────────────────────────┐                 │   │
│   │              │    AlertManager               │                 │   │
│   │              │    • PagerDuty 通知           │                 │   │
│   │              │    • Slack 警告               │                 │   │
│   │              │    • Email 緊急通知           │                 │   │
│   │              └─────────────────────────────────┘                 │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    評估與分類                                        │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │              影響評估                                         │  │   │
│   │   │   • SEV-1: 核心服務中斷                                      │  │   │
│   │   │   • SEV-2: 非核心服務中斷                                    │  │   │
│   │   │   • SEV-3: 效能下降                                         │  │   │
│   │   │   • SEV-4: 警告                                             │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                              │                                     │
│   │                              ▼                                     │
│   │              ┌─────────────────────────────────┐                 │   │
│   │              │    復原策略選擇                 │                 │   │
│   │              │                                 │                 │   │
│   │              │   • SEV-1: 啟動 DR              │                 │   │
│   │              │   • SEV-2: 重啟服務             │                 │   │
│   │              │   • SEV-3: 擴展資源             │                 │   │
│   │              │   • SEV-4: 記錄觀察             │                 │   │
│   │              └─────────────────────────────────┘                 │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    執行復原                                          │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │              DR Runbook 步驟                                 │  │   │
│   │   │                                                            │  │   │
│   │   │   Step 1: 評估影響範圍                                      │  │   │
│   │   │   Step 2: 啟動備援環境                                      │  │   │
│   │   │   Step 3: 恢復資料                                          │  │   │
│   │   │   Step 4: DNS 切換                                         │  │   │
│   │   │   Step 5: 驗證服務                                          │  │   │
│   │   │   Step 6: 通知干係人                                        │  │   │
│   │   │                                                            │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    事後檢討                                          │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │              RCA (Root Cause Analysis)                      │  │   │
│   │   │   • 根本原因分析                                            │  │   │
│   │   │   • 改進措施                                                │  │   │
│   │   │   • 文件更新                                                │  │   │
│   │   │   • 演練驗證                                                │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. 邊界條件定義 (Edge Cases)

### 6.1 安全隔離邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-Sec01** | RLS 策略繞過嘗試 | 阻止查詢 | 記錄安全事件 |
| **EC-Sec02** | JWT Token 過期 | 返回 401 | 提示重新登入 |
| **EC-Sec03** | API Key 濫用 | 實施 Rate Limit | 暫停 Key |
| **EC-Sec04** | 跨用戶存取嘗試 | 返回 403 | 記錄事件 |
| **EC-Sec05** | 敏感數據外洩風險 | 觸發 DLP | 隔離數據 |
| **EC-Sec06** | 密碼暴力破解 | 帳戶鎖定 | 通知用戶 |

### 6.2 可觀測性邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-Sec07** | 指標收集超時 | 跳過該指標 | 記錄錯誤 |
| **EC-Sec08** | Prometheus 離線 | 緩存指標 | 補抓取 |
| **EC-Sec09** | 指標 Cardinality 爆炸 | 拒絕指標 | 告警 |
| **EC-Sec10** | Grafana 查詢超時 | 返回部分數據 | 標記截斷 |
| **EC-Sec11** | Alert 風暴 | 合併 Alert | 抑制 |
| **EC-Sec12** | Log 量過大 | 採樣處理 | 保留高優先 |

### 6.3 災難復原邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-Sec13** | DR 環境不可用 | 嘗試本地恢復 | 通知管理員 |
| **EC-Sec14** | 備份損壞 | 嘗試上一份 | 標記資料損失 |
| **EC-Sec15** | RPO 超標 | 評估資料損失 | 通知用戶 |
| **EC-Sec16** | RTO 超標 | 升級事件等級 | 啟動應變 |
| **EC-Sec17** | 網路完全中斷 | 離線模式 | 有限服務 |
| **EC-Sec18** | 多區域同時故障 | 全域應變 | 啟動外部支援 |

---

## 7. Schema 完整化

### 7.1 安全事件資料表 `security_events`

```sql
-- ============================================================================
-- 安全事件資料表
-- 用途：記錄安全相關事件
-- ============================================================================

CREATE TABLE IF NOT EXISTS security_events (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 事件分類
    event_type         VARCHAR(50) NOT NULL,             -- authentication/authorization/data_access/injection/malware
    event_severity     VARCHAR(20) NOT NULL,             -- critical/high/medium/low
    event_category     VARCHAR(100),                       -- 事件類別
    
    -- 事件詳情
    event_timestamp   TIMESTAMP WITH TIME ZONE NOT NULL, -- 事件時間
    event_description TEXT NOT NULL,                      -- 事件描述
    
    -- 關聯帳戶
    user_id           UUID,                                -- 關聯用戶
    session_id        VARCHAR(100),                       -- 會話 ID
    ip_address       VARCHAR(45),                        -- IP 地址
    user_agent       VARCHAR(500),                       -- User Agent
    
    -- 請求資訊
    request_method    VARCHAR(10),                       -- HTTP 方法
    request_path      VARCHAR(500),                       -- 請求路徑
    request_body      TEXT,                               -- 請求內容 (脫敏)
    
    -- 處理狀態
    status            VARCHAR(20) DEFAULT 'open',        -- open/in_progress/resolved/closed
    resolved_at       TIMESTAMP WITH TIME ZONE,           -- 解決時間
    resolution        TEXT,                               -- 解決方式
    
    -- 威脅情資
    threat_indicators JSONB,                              -- 威脅指標
    blocked           BOOLEAN DEFAULT FALSE,               -- 是否已阻擋
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT se_severity_check CHECK (event_severity IN ('critical', 'high', 'medium', 'low'))
);

-- ============================================================================
-- API Key 使用記錄資料表
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_key_usage (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id         UUID NOT NULL,                    -- API Key ID
    user_id             UUID NOT NULL,                    -- 用戶 ID
    
    -- 使用資訊
    endpoint           VARCHAR(200) NOT NULL,           -- 請求端點
    http_method        VARCHAR(10) NOT NULL,            -- HTTP 方法
    request_params     JSONB,                            -- 請求參數
    
    -- 回應資訊
    status_code        INTEGER,                           -- HTTP 狀態碼
    response_time_ms   INTEGER,                           -- 回應時間 (ms)
    
    -- 使用量
    tokens_used        INTEGER,                           -- 使用 Token 數
    bytes_in           BIGINT,                           -- 輸入位元組
    bytes_out          BIGINT,                           -- 輸出位元組
    
    -- 錯誤資訊
    error_message      TEXT,                             -- 錯誤訊息
    error_code         VARCHAR(50),                       -- 錯誤碼
    
    -- 速率限制
    rate_limit_exceeded BOOLEAN DEFAULT FALSE,            -- 是否觸發速率限制
    
    executed_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT aku_key_time_uniq UNIQUE (api_key_id, executed_at)
);

-- ============================================================================
-- 災難復原演練記錄表
-- ============================================================================

CREATE TABLE IF NOT EXISTS dr_drill_records (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drill_name         VARCHAR(200) NOT NULL,           -- 演練名稱
    drill_type         VARCHAR(50) NOT NULL,             -- full/partial/simulation
    drill_date         TIMESTAMP WITH TIME ZONE NOT NULL, -- 演練日期
    
    -- 演練配置
    affected_services  VARCHAR(100)[],                     -- 影響服務
    drill_scenario    TEXT NOT NULL,                      -- 演練情境
    expected_rto_minutes INTEGER,                        -- 預期 RTO (分鐘)
    expected_rpo_minutes INTEGER,                        -- 預期 RPO (分鐘)
    
    -- 執行結果
    actual_rto_minutes INTEGER,                           -- 實際 RTO (分鐘)
    actual_rpo_minutes INTEGER,                           -- 實際 RPO (分鐘)
    drill_status      VARCHAR(20) NOT NULL,             -- success/failure/partial
    
    -- 問題追蹤
    issues_found      TEXT[],                             -- 發現問題
    improvements_made TEXT[],                             -- 改進措施
    
    -- 參與人員
    participants      VARCHAR(100)[],                     -- 參與人員
    drill_lead       VARCHAR(100),                        -- 演練負責人
    
    -- 附件
    attachments       JSONB,                              -- 附件路徑
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- COMMENT 註解
COMMENT ON TABLE security_events IS '安全事件記錄表';
COMMENT ON TABLE api_key_usage IS 'API Key 使用記錄表';
COMMENT ON TABLE dr_drill_records IS '災難復原演練記錄表';
COMMENT ON COLUMN security_events.event_type IS '事件類型: authentication/authorization/data_access/injection/malware';
COMMENT ON COLUMN security_events.event_severity IS '事件嚴重性: critical/high/medium/low';
```

### 7.2 Prometheus 指標配置資料表

```sql
-- ============================================================================
-- Prometheus 指標配置資料表
-- 用途：管理自定義指標配置
-- ============================================================================

CREATE TABLE IF NOT EXISTS prometheus_metrics_config (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name         VARCHAR(100) NOT NULL UNIQUE,    -- 指標名稱
    metric_type         VARCHAR(20) NOT NULL,             -- counter/gauge/histogram/summary
    
    -- 指標定義
    metric_description  TEXT,                              -- 指標描述
    metric_labels       VARCHAR(100)[],                    -- 標籤列表
    metric_unit        VARCHAR(50),                       -- 指標單位
    
    -- 收集配置
    collection_interval INTEGER DEFAULT 15,               -- 收集間隔 (秒)
    collection_enabled  BOOLEAN DEFAULT TRUE,              -- 是否啟用
    
    -- 告警配置
    alert_enabled      BOOLEAN DEFAULT FALSE,              -- 是否告警
    alert_threshold    DECIMAL(18,6),                      -- 告警閾值
    alert_operator     VARCHAR(10),                       -- >/< />=/<= etc
    alert_for_duration INTEGER,                           -- 持續時間 (秒)
    alert_severity    VARCHAR(20),                       -- critical/high/medium/low
    
    -- 儀表板配置
    dashboard_enabled  BOOLEAN DEFAULT TRUE,               -- 是否顯示在儀表板
    dashboard_panel_id VARCHAR(100),                     -- 面板 ID
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT pmc_type_check CHECK (metric_type IN ('counter', 'gauge', 'histogram', 'summary'))
);

-- ============================================================================
-- 告警歷史資料表
-- ============================================================================

CREATE TABLE IF NOT EXISTS alert_history (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_rule_id       UUID REFERENCES prometheus_metrics_config(id),
    
    -- 告警資訊
    alert_name         VARCHAR(200) NOT NULL,           -- 告警名稱
    alert_status       VARCHAR(20) NOT NULL,             -- firing/resolved
    alert_severity     VARCHAR(20) NOT NULL,             -- critical/high/medium/low
    
    -- 告警詳情
    alert_description   TEXT NOT NULL,                    -- 告警描述
    alert_labels       JSONB,                            -- 告警標籤
    alert_annotations  JSONB,                            -- 告警註解
    alert_value        DECIMAL(18,6),                    -- 觸發值
    
    -- 時間追蹤
    started_at         TIMESTAMP WITH TIME ZONE NOT NULL, -- 開始時間
    ended_at           TIMESTAMP WITH TIME ZONE,          -- 結束時間
    duration_seconds   INTEGER,                           -- 持續時間 (秒)
    
    -- 通知追蹤
    notifications_sent JSONB,                            -- 通知記錄
    
    -- 處理追蹤
    acknowledged_at    TIMESTAMP WITH TIME ZONE,          -- 確認時間
    acknowledged_by    VARCHAR(100),                      -- 確認人
    acknowledged_note  TEXT,                              -- 確認備註
    resolved_at        TIMESTAMP WITH TIME ZONE,          -- 解決時間
    resolved_by        VARCHAR(100),                      -- 解決人
    resolution_note    TEXT,                              -- 解決備註
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT ah_status_check CHECK (alert_status IN ('firing', 'resolved'))
);

-- COMMENT 註解
COMMENT ON TABLE prometheus_metrics_config IS 'Prometheus 指標配置表';
COMMENT ON TABLE alert_history IS '告警歷史表';
COMMENT ON COLUMN prometheus_metrics_config.metric_type IS '指標類型: counter/gauge/histogram/summary';
```

---

## 8. 硬體/環境關聯 (QNAP TS-h973AX)

### 8.1 監控堆疊配置

```yaml
# ============================================================================
# 監控堆疊 Docker Compose
# ============================================================================

services:
  prometheus:
    image: prom/prometheus:v2.48.0
    container_name: prometheus
    volumes:
      - /share/quant_pool/monitoring/prometheus:/prometheus:rw
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
      - '--web.enable-lifecycle'
    ports:
      - "9090:9090"
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 8G

  grafana:
    image: grafana/grafana:10.2.0
    container_name: grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - /share/quant_pool/monitoring/grafana:/var/lib/grafana:rw
      - ./grafana/provisioning:/etc/grafana/provisioning:ro
    ports:
      - "3000:3000"
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G

  alertmanager:
    image: prom/alertmanager:v0.26.0
    container_name: alertmanager
    volumes:
      - /share/quant_pool/monitoring/alertmanager:/etc/alertmanager:rw
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/etc/alertmanager/data'
    ports:
      - "9093:9093"
    restart: unless-stopped

volumes:
  prometheus_data:
    driver: local
  grafana_data:
    driver: local
```

### 8.2 ZFS 儲存配置

```bash
#!/bin/bash
# ============================================================================
# 監控 ZFS 配置
# ============================================================================

# 創建監控 Dataset
zfs create quant_pool/monitoring
zfs set compression=zstd quant_pool/monitoring
zfs set atime=off quant_pool/monitoring

# Prometheus 資料
zfs create quant_pool/monitoring/prometheus
zfs set quota=100G quant_pool/monitoring/prometheus

# Grafana 資料
zfs create quant_pool/monitoring/grafana
zfs set quota=20G quant_pool/monitoring/grafana

# Alertmanager 資料
zfs create quant_pool/monitoring/alertmanager
zfs set quota=5G quant_pool/monitoring/alertmanager

# 安全事件日誌
zfs create quant_pool/monitoring/security
zfs set compression=lz4 quant_pool/monitoring/security
zfs set quota=50G quant_pool/monitoring/security
```

---

## 9. 開發者備註 (Developer Notes)

### ⚠️ 技術陷阱警示

#### TT-Sec01: JWT Token 安全
```python
# 問題：JWT Token 配置不當導致安全風險
# 
# 解決方案：
# 1. 使用 RS256 演算法
# 2. 設置合理的過期時間
# 3. 實施 Token 輪換

from datetime import datetime, timedelta
from jose import jwt, JWTError

class TokenSecurity:
    ALGORITHMS = ['RS256']
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    REFRESH_TOKEN_EXPIRE_DAYS = 7
    
    @classmethod
    def create_access_token(cls, user_id: str, role: str) -> str:
        expire = datetime.utcnow() + timedelta(minutes=cls.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        return jwt.encode(
            {
                'sub': user_id,
                'role': role,
                'exp': expire,
                'iat': datetime.utcnow(),
                'type': 'access'
            },
            cls.PRIVATE_KEY,
            algorithm=cls.ALGORITHMS[0]
        )
    
    @classmethod
    def verify_token(cls, token: str) -> dict:
        try:
            payload = jwt.decode(
                token,
                cls.PUBLIC_KEY,
                algorithms=cls.ALGORITHMS
            )
            return payload
        except JWTError as e:
            raise AuthenticationError(f"Token validation failed: {e}")
```

#### TT-Sec02: Rate Limit 繞過
```python
# 問題：攻擊者可能繞過 Rate Limiting
# 
# 解決方案：
# 1. 在 API Gateway 層實施 Rate Limit
# 2. 使用分散式計數器
# 3. 考慮多個維度的限制

from redis import Redis
from functools import wraps

class RateLimiter:
    def __init__(self, redis: Redis):
        self.redis = redis
    
    def rate_limit(
        self,
        max_requests: int,
        window_seconds: int,
        key_prefix: str
    ):
        def decorator(func):
            @wraps(func)
            async def wrapper(request, *args, **kwargs):
                # 多維度 Rate Limit Key
                key = f"{key_prefix}:{request.client.host}:{request.url.path}"
                
                # 使用滑動窗口
                now = int(time.time())
                window_start = now - window_seconds
                
                pipe = self.redis.pipeline()
                pipe.zadd(key, {f"{now}": now})
                pipe.zremrangebyscore(key, '-inf', window_start)
                pipe.zcard(key)
                pipe.expire(key, window_seconds)
                results = await pipe.execute()
                
                current_count = results[2]
                
                if current_count > max_requests:
                    raise RateLimitExceeded(
                        message="Too many requests",
                        retry_after=window_seconds
                    )
                
                return await func(request, *args, **kwargs)
            
            return wrapper
        return decorator
```

#### TT-Sec03: 指標 Cardinality 爆炸
```python
# 問題：過多標籤值導致 Prometheus 效能問題
# 
# 解決方案：
# 1. 限制高 Cardinality 標籤
# 2. 使用摘要指標
# 3. 監控指標複雜度

# 不建議：過多唯一值
# user_id 作為標籤會導致 Cardinality 爆炸

# 建議：使用 Histogram 或 Summary
# GOOD: histogram_quantile(0.95, sum(rpc_latency_seconds_bucket) by (le))

from prometheus_client import Histogram

# 限制標籤組合數量
RPC_LATENCY = Histogram(
    'rpc_latency_seconds',
    'RPC latency in seconds',
    ['service', 'method'],  # 低 Cardinality 標籤
    labelnames=['service', 'method'],
    buckets=[0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0]
)
```

### 📝 開發建議

#### DEV-Sec01: 安全審計日誌
```python
# 建議：實施完整的安全審計日誌
# 
// 審計項目：
// 1. 身份驗證事件
// 2. 授權變更
// 3. 敏感資料存取
// 4. 配置變更

class AuditLogger:
    def log_security_event(
        self,
        event_type: str,
        user_id: str,
        action: str,
        resource: str,
        details: dict = None
    ):
        event = {
            'timestamp': datetime.utcnow().isoformat(),
            'event_type': event_type,
            'user_id': user_id,
            'action': action,
            'resource': resource,
            'details': details,
            'trace_id': self.get_trace_id()
        }
        
        # 異步寫入
        asyncio.create_task(self._write_to_kafka(event))
```

#### DEV-Sec02: 告警優化
```python
# 建議：實施智能告警策略
# 
// 優化策略：
// 1. 避免 Alert 風暴
// 2. 實施 Alert 分組
// 3. 靜默規則

ALERT_GROUPING = {
    'group_by': ['severity', 'service', 'environment'],
    'group_interval': '5m',
    'group_wait': '30s',
    'repeat_interval': '4h',
    'routes': [
        {
            'match':
                'severity': 'critical',
            'receiver': 'pagerduty-critical',
            'group_by': ['alertname', 'instance']
        },
        {
            'match':
                'severity': 'warning',
            'receiver': 'slack-warning',
            'group_by': ['service']
        }
    ]
}
```

#### DEV-Sec03: DR 演練自動化
```python
# 建議：實施 DR 演練自動化
# 
// 演練項目：
// 1. 定期排程演練
// 2. 自動化切換測試
// 3. 演練結果記錄

class DRDrillAutomation:
    def run_scheduled_drill(self, drill_type: str):
        """執行排程的 DR 演練"""
        drill = DRDrillRecord(
            name=f"Scheduled Drill - {drill_type}",
            type=drill_type,
            started_at=datetime.utcnow()
        )
        
        try:
            # 執行演練步驟
            self.simulate_failure(drill_type)
            self.trigger_dr_switchover()
            self.validate_services()
            self.measure_rto_rpo()
            
            drill.status = 'success'
            drill.actual_rto_minutes = self.measured_rto
            
        except Exception as e:
            drill.status = 'failure'
            drill.issues_found.append(str(e))
        
        finally:
            self.cleanup()
            self.save_drill_record(drill)
```

#### DEV-Sec04: 滲透測試計劃
```python
# 建議：定期執行滲透測試
# 
// 測試範圍：
// 1. API 安全性
// 2. 身份驗證流程
// 3. 資料傳輸加密
// 4. 依賴漏洞

PENETRATION_TEST_CHECKLIST = {
    'authentication': [
        'brute_force_protection',
        'password_policy_enforcement',
        'mfa_implementation',
        'session_management'
    ],
    'authorization': [
        'privilege_escalation',
        'horizontal_access_control',
        'vertical_access_control',
        'rls_effectiveness'
    ],
    'data_protection': [
        'encryption_at_rest',
        'encryption_in_transit',
        'sensitive_data_masking',
        'data_leakage_prevention'
    ],
    'infrastructure': [
        'container_security',
        'network_segmentation',
        'vulnerability_management',
        'patch_management'
    ]
}
```

---

## 10. 關聯文件索引

| 文件 | 說明 | 交互關係 |
|------|------|----------|
| [00_Full_Reconstruction_TOC.md](00_Full_Reconstruction_TOC.md) | 完整檔案結構索引 | 安全位置 |
| [02_Technical_Architecture.md](02_Technical_Architecture.md) | 技術架構 | 服務配置 |
| [03_Data_Management_and_Database.md](03_Data_Management_and_Database.md) | 資料庫設計 | RLS 策略 |
| [13_Development_and_Deployment_Ops.md](13_Development_and_Deployment_Ops.md) | CI/CD | 部署監控 |

---

> **文件版本**：v1.0.1 (細節顯性化擴張)
> **關聯文件**：[00_Full_Reconstruction_TOC](00_Full_Reconstruction_TOC.md)
> **維護責任**：系統架構師 / 安全工程師
> **最後更新**：2026-02-10

