# 15. 附錄、環境變數與擴充指南 (Appendix & Extensions)

> **文件版本**：v1.0 (V10.0 完整規格書重構)
> **日期**：2026-02-10
> **核心使命：** 定義完整環境變數、專業術語對照與擴充指南

---

## 1. 環境配置全清單 (.env - V10.0 強化)

```bash
# ============================================
# V10.0 Core AI Configuration
# ============================================
GEMINI_API_KEY_1=AIzaSy...
GEMINI_API_KEY_2=AIzaSy...
GEMINI_API_KEY_3=AIzaSy...
GEMINI_API_KEY_4=AIzaSy...
GEMINI_API_KEY_5=AIzaSy...

# ============================================
# V10.0 Market Data Configuration
# ============================================
FINNHUB_API_KEY=...
TIINGO_API_KEY=...
ALPHA_VANTAGE_API_KEY=...
FUGLE_API_KEY=...
FRED_API_KEY=...                    # 130+ 宏觀指標
MARKETAUX_API_KEY=...

# ============================================
# V10.0 Supabase Configuration
# ============================================
SUPABASE_URL=http://localhost:8000
SUPABASE_SERVICE_KEY=...
POSTGRES_DB_URL=postgresql+asyncpg://postgres:postgres@localhost:54322/gemini_quant
REDIS_URL=redis://localhost:6380/0

# ============================================
# V10.0 Evolution Strategy Configuration
# ============================================
EVOLUTION_POPULATION_SIZE=100
EVOLUTION_ITERATIONS=100
EVOLUTION_ELITE_RATIO=0.20
EVOLUTION_MUTATION_PROB=0.05

# ============================================
# V10.0 System Configuration
# ============================================
NODE_ENV=development
DOCKER_VOLUME_PATH=/var/lib/docker/volumes
PREFECT_API_URL=http://localhost:4200/api
```

---

## 2. API 限制備忘錄 (V10.0 強化)

| API | 限制 | V10.0 策略 |
|-----|------|------------|
| **Finnhub** | 60 請求/分鐘 | 請求合併、緩存 |
| **Tiingo** | 500 請求/月 | 批量請求 |
| **Gemini** | 15 請求/分鐘 (Flash) | 5 Key Pool |
| **FRED** | 1000 請求/日 | 130+ 指標批量獲取優化 |
| **yfinance** | ~2000 請求/小時 | IP 分散 |
| **TWSE** | 3 請求/秒 | 延遲控制 |

---

## 3. V10.0 專業術語對照表

| 術語 | 縮寫 | V10.0 定義 |
|------|------|------------|
| **Z-Score** | Z | 標準化分數 |
| **Winsorization** | - | 數據縮尾處理 |
| **Regime** | - | 宏觀景氣政體 (5 種) |
| **RAG** | - | 檢索增強生成 |
| **MDD** | Max Drawdown | 最大回撤 |
| **VaR** | Value at Risk | 風險值 |
| **Sharpe Ratio** | - | 風險調整後回報 |
| **Sortino Ratio** | - | 下行風險調整回報 |
| **Barra Risk Model** | - | 多因子風險模型 |
| **Brinson Attribution** | - | 績效歸因模型 |
| **Circuit Breaker** | - | 熔斷器 |
| **Evolution Strategy** | - | V10.0 演化策略遺傳演算法 |
| **Genome** | - | V10.0 26 基因組成的染色體 |
| **18-Factor Model** | - | V10.0 十八維度評分模型 |

---

## 4. 系統擴充指南 (V10.0)

### 4.1 新增量化因子步驟

```python
# 步驟 1: 在 factor_scorer.py 新增方法
class FactorScorerV10:
    async def calculate_custom_factor(
        self,
        security_id: int,
        data: Dict
    ) -> float:
        """計算自定義因子"""
        return score

# 步驟 2: 更新 Schema
# 在 daily_quant_scores 表新增欄位
ALTER TABLE analysis.daily_quant_scores
ADD COLUMN custom_factor NUMERIC(5, 2);

# 步驟 3: 更新演化策略基因組
# 在 evolution.genomes 表新增基因欄位

# 步驟 4: 更新前端
# 在 QuantDNARadarChart 新增維度
```

---

## 6. 邏輯拆解 (Logic Breakdown)

### 6.1 環境變數載入流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    環境變數載入流程                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    環境變數來源                                        │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   1. .env 檔案 (本地開發)                                 │  │   │
│   │   │   2. 系統環境變數 (容器環境)                              │  │   │
│   │   │   3. 密碼管理服務 (生產環境)                             │  │   │
│   │   │   4. CI/CD Secret (GitHub Actions)                      │  │   │
│   │   │   5. QNAP NAS 環境腳本                                    │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    變數驗證層                                        │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   Pydantic Settings Validation                              │  │   │
│   │   │   • 類型檢查                                               │  │   │
│   │   │   • 必填欄位檢查                                           │  │   │
│   │   │   • 預設值設定                                             │  │   │
│   │   │   • 環境特定驗證                                           │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                              │                                     │
│   │                              ▼                                     │
│   │              ┌─────────────────────────────────┐                 │   │
│   │              │   ValidationError → Startup Fail│                 │   │
│   │              └─────────────────────────────────┘                 │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    變數注入層                                        │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   FastAPI Depends Injection                                  │  │   │
│   │   │   • Singleton Settings                                      │  │   │
│   │   │   • Lazy Loading                                           │  │   │
│   │   │   • Hot Reload (開發環境)                                   │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 API Key Pool 管理流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    API Key Pool 管理流程                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    Key Pool 配置                                       │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   Gemini API Keys:                                          │  │   │
│   │   │   • GEMINI_API_KEY_1                                      │  │   │
│   │   │   • GEMINI_API_KEY_2                                      │  │   │
│   │   │   • GEMINI_API_KEY_3                                      │  │   │
│   │   │   • GEMINI_API_KEY_4                                      │  │   │
│   │   │   • GEMINI_API_KEY_5                                      │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    Rate Limit 分配                                    │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   請求分配策略                                                │  │   │
│   │   │   • Round-Robin 分配                                       │  │   │
│   │   │   • 根據負載動態調整                                        │  │   │
│   │   │   • 失敗時自動切換                                          │  │   │
│   │   │   • 速率限制預留緩衝                                        │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    健康檢查與故障轉移                                 │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   Key Health Monitor                                       │  │   │
│   │   │   • 定期健康檢查                                           │  │   │
│   │   │   • 錯誤率監控                                             │  │   │
│   │   │   • 自動標記故障 Key                                       │  │   │
│   │   │   • 故障轉移到備用 Key                                     │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. 邊界條件定義 (Edge Cases)

### 7.1 環境變數邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-App01** | 必要環境變數缺失 | 啟動失敗 | 顯示明確錯誤 |
| **EC-App02** | 環境變數格式錯誤 | 驗證失敗 | 提示正確格式 |
| **EC-App03** | 生產環境使用開發變數 | 配置錯誤 | 部署檢查 |
| **EC-App04** | 環境變數包含特殊字元 | 解析錯誤 | 引號包裝 |
| **EC-App05** | 環境變數長度超限 | 截斷或拒絕 | 設定上限 |
| **EC-App06** | 環境變數注入攻擊 | 安全性檢查 | 白名單驗證 |

### 7.2 API Key 邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-App07** | 所有 Keys 都達 Rate Limit | 請求排隊 | 實施背壓 |
| **EC-App08** | Key 驗證失敗 | 切換 Key | 記錄日誌 |
| **EC-App09** | Key 餘額不足 | 警告用戶 | 切換備用 |
| **EC-App10** | Key 即將過期 | 提前通知 | 準備更換 |
| **EC-App11** | Key 洩漏檢測 | 自動撤銷 | 發出警報 |
| **EC-App12** | Key Pool 全部故障 | 服務降級 | 返回快取 |

### 7.3 擴充邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-App13** | 新因子計算錯誤 | 返回 NULL | 記錄錯誤 |
| **EC-App14** | 基因組維度不匹配 | 版本驗證失敗 | 提示升級 |
| **EC-App15** | 前端不支援新維度 | 顯示警告 | 提示更新 |
| **EC-App16** | 數據庫遷移衝突 | 遷移失敗 | 顯示衝突 |
| **EC-App17** | 新 API Rate Limit 變更 | 動態調整 | 更新配置 |
| **EC-App18** | 術語衝突 | 命名衝突錯誤 | 提示重新命名 |

---

## 8. Schema 完整化

### 8.1 環境變數定義資料表 `environment_variables`

```sql
-- ============================================================================
-- 環境變數定義資料表
-- 用途：追蹤和管理環境變數定義
-- ============================================================================

CREATE TABLE IF NOT EXISTS environment_variables (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variable_name       VARCHAR(100) NOT NULL,           -- 變數名稱
    variable_category   VARCHAR(50) NOT NULL,             -- 類別
    
    -- 變數定義
    description         TEXT NOT NULL,                      -- 變數描述
    data_type          VARCHAR(20) NOT NULL,             -- STRING/NUMBER/BOOLEAN/JSON
    is_required        BOOLEAN DEFAULT FALSE,              -- 是否必填
    default_value      TEXT,                               -- 預設值
    example_value      TEXT,                               -- 範例值
    
    -- 驗證規則
    validation_pattern  VARCHAR(500),                      -- Regex 驗證
    min_value          DECIMAL(18,6),                      -- 最小值
    max_value          DECIMAL(18,6),                      -- 最大值
    allowed_values     TEXT[],                             -- 允許值清單
    
    -- 敏感性
    is_sensitive       BOOLEAN DEFAULT FALSE,              -- 是否敏感
    masking_pattern    VARCHAR(100),                       -- 遮罩格式
    
    -- 環境關聯
    environments        VARCHAR(50)[],                      -- 適用的環境
    deprecated_version  VARCHAR(20),                       -- 廢棄版本
    deprecation_notice  TEXT,                               -- 廢棄通知
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT env_name_uniq UNIQUE (variable_name)
);

-- ============================================================================
-- API Key 管理資料表
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_keys (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_name       VARCHAR(50) NOT NULL,             -- 提供者名稱
    key_name           VARCHAR(100) NOT NULL,             -- Key 名稱
    encrypted_key      TEXT NOT NULL,                      -- 加密的 Key
    
    -- 使用統計
    total_requests     INTEGER DEFAULT 0,                  -- 總請求數
    successful_requests INTEGER DEFAULT 0,                 -- 成功請求數
    failed_requests    INTEGER DEFAULT 0,                 -- 失敗請求數
    last_used_at       TIMESTAMP WITH TIME ZONE,          -- 最後使用時間
    
    -- Rate Limit
    rate_limit_type    VARCHAR(50),                        -- per_minute/per_hour/per_day
    rate_limit_value   INTEGER,                           -- 限制值
    current_usage      INTEGER DEFAULT 0,                  -- 目前使用量
    
    -- 健康狀態
    health_status      VARCHAR(20) DEFAULT 'active',      -- active/inactive/blocked
    health_check_enabled BOOLEAN DEFAULT TRUE,            -- 是否健康檢查
    health_check_interval INTEGER DEFAULT 300,            -- 檢查間隔 (秒)
    last_health_check  TIMESTAMP WITH TIME ZONE,          -- 最後檢查
    health_check_result JSONB,                             -- 檢查結果
    
    -- 效期管理
    issued_at          TIMESTAMP WITH TIME ZONE NOT NULL, -- 發行時間
    expires_at         TIMESTAMP WITH TIME ZONE,          -- 過期時間
    auto_renew         BOOLEAN DEFAULT FALSE,              -- 自動續期
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- API Key 使用日誌資料表
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_key_usage_log (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id         UUID NOT NULL REFERENCES api_keys(id),
    
    -- 使用資訊
    request_timestamp  TIMESTAMP WITH TIME ZONE NOT NULL, -- 請求時間
    endpoint           VARCHAR(200) NOT NULL,            -- 請求端點
    request_count      INTEGER DEFAULT 1,                  -- 請求數
    
    -- 回應資訊
    status_code        INTEGER,                           -- HTTP 狀態碼
    response_time_ms   INTEGER,                           -- 回應時間 (毫秒)
    
    -- 速率限制
    rate_limit_remaining INTEGER,                         -- 剩餘配額
    
    -- 成本追蹤
    cost_estimate     DECIMAL(10,6),                     -- 成本估算
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- COMMENT 註解
COMMENT ON TABLE environment_variables IS '環境變數定義表';
COMMENT ON TABLE api_keys IS 'API Key 管理表';
COMMENT ON TABLE api_key_usage_log IS 'API Key 使用日誌表';
COMMENT ON COLUMN environment_variables.is_sensitive IS '敏感變數應加密儲存，不應顯示在日誌中';
COMMENT ON COLUMN api_keys.health_status IS '健康狀態: active=正常, inactive=停用, blocked=封鎖';
```

### 8.2 專業術語定義資料表

```sql
-- ============================================================================
-- 專業術語定義資料表
-- ============================================================================

CREATE TABLE IF NOT EXISTS terminology (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    term_code           VARCHAR(50) NOT NULL UNIQUE,      -- 術語代碼
    term_name           VARCHAR(200) NOT NULL,           -- 術語名稱
    abbreviation        VARCHAR(50),                       -- 縮寫
    
    -- 術語定義
    definition          TEXT NOT NULL,                      -- 術語定義
    detailed_description TEXT,                             -- 詳細說明
    formula             TEXT,                              -- 相關公式
    
    -- 分類
    category            VARCHAR(50) NOT NULL,             -- 分類
    subcategory         VARCHAR(50),                        -- 子分類
    related_terms       VARCHAR(50)[],                      -- 相關術語
    
    -- V10.0 上下文
    v10_context         TEXT,                              -- V10.0 上下文說明
    v10_relevance       VARCHAR(20),                        -- 相關程度
    
    -- 版本
    version            VARCHAR(20) NOT NULL,             -- 定義版本
    effective_from     DATE NOT NULL,                      -- 生效日期
    effective_to       DATE,                               -- 失效日期
    
    -- 審核
    reviewed_by        VARCHAR(100),                       -- 審核人
    reviewed_at        TIMESTAMP WITH TIME ZONE,          -- 審核時間
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 擴充歷程記錄表
-- ============================================================================

CREATE TABLE IF NOT EXISTS extension_history (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    extension_type      VARCHAR(50) NOT NULL,             -- 擴充類型
    extension_name       VARCHAR(200) NOT NULL,           -- 擴充名稱
    
    -- 擴充內容
    description         TEXT NOT NULL,                      -- 擴充描述
    implementation     TEXT,                             -- 實作說明
    affected_components VARCHAR(100)[],                    -- 影響元件
    
    -- 版本資訊
    version            VARCHAR(20) NOT NULL,             -- 擴充版本
    from_version       VARCHAR(20),                        -- 起始版本
    to_version         VARCHAR(20) NOT NULL,             -- 目標版本
    
    -- 狀態
    status            VARCHAR(20) DEFAULT 'planned',   -- planned/approved/developed/tested/deployed
    deployed_at        TIMESTAMP WITH TIME ZONE,          -- 部署時間
    
    -- 風險評估
    risk_level        VARCHAR(20),                       -- low/medium/high
    risk_mitigation   TEXT,                               -- 風險緩解措施
    
    -- 審核
    approved_by       VARCHAR(100),                       -- 審核人
    approved_at       TIMESTAMP WITH TIME ZONE,          -- 審核時間
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- COMMENT 註解
COMMENT ON TABLE terminology IS '專業術語定義表';
COMMENT ON TABLE extension_history IS '系統擴充歷程記錄表';
COMMENT ON COLUMN terminology.v10_relevance IS 'V10.0 相關程度: core/enhanced/new/optional';
COMMENT ON COLUMN extension_history.extension_type IS '擴充類型: factor/genome/database/api/ui/report';
```

---

## 9. 硬體/環境關聯 (QNAP TS-h973AX)

### 9.1 環境變數配置腳本

```bash
#!/bin/bash
# ============================================================================
# QNAP NAS 環境配置腳本
# ============================================================================

# ============================================
# 環境變數載入腳本
# ============================================

# 載入基礎環境
source /share/quant_pool/config/base.env

# 載入環境特定配置
case "${ENVIRONMENT}" in
    development)
        source /share/quant_pool/config/dev.env
        ;;
    staging)
        source /share/quant_pool/config/staging.env
        ;;
    production)
        source /share/quant_pool/config/prod.env
        # 生產環境額外安全檢查
        if [ -z "${PRODUCTION_API_KEY}" ]; then
            echo "ERROR: PRODUCTION_API_KEY is not set"
            exit 1
        fi
        ;;
esac

# 驗證必要環境變數
validate_required_vars() {
    local missing=0
    for var in "$@"; do
        if [ -z "${!var}" ]; then
            echo "ERROR: Required environment variable $var is not set"
            missing=1
        fi
    done
    return $missing
}

# 應用 QNAP 特定配置
export DOCKER_VOLUME_PATH="${DOCKER_VOLUME_PATH:-/share/CACHEDEV1_DATA/.docker}"
export PREFECT_STORAGE_PATH="${PREFECT_STORAGE_PATH:-/share/quant_pool/prefect}"
export REDIS_DATA_PATH="${REDIS_DATA_PATH:-/share/quant_pool/redis}"
```

### 9.2 ZFS 環境配置儲存

```bash
#!/bin/bash
# ============================================================================
# 環境配置 ZFS 儲存配置
# ============================================================================

# 創建配置 Dataset
zfs create quant_pool/config
zfs set compression=lz4 quant_pool/config
zfs set atime=off quant_pool/config

# 創建環境變數 Dataset
zfs create quant_pool/config/env
zfs set compression=zstd quant_pool/config/env
zfs set quota=10G quant_pool/config/env

# 創建 API Key 加密 Dataset
zfs create quant_pool/config/secrets
zfs set compression=lz4 quant_pool/config/secrets
zfs set atime=off quant_pool/config/secrets
zfs set primarycache=metadata quant_pool/config/secrets
zfs set encryption=aes-256-gcm quant_pool/config/secrets

# 創建擴充歷史 Dataset
zfs create quant_pool/config/extensions
zfs set compression=lz4 quant_pool/config/extensions
zfs set quota=20G quant_pool/config/extensions
```

---

## 10. 開發者備註 (Developer Notes)

### ⚠️ 技術陷阱警示

#### TT-App01: 環境變數洩露
```python
# 問題：環境變數在日誌中被洩露
# 
# 解決方案：
# 1. 敏感變數不記錄日誌
# 2. 使用變數遮罩
# 3. 實施日誌審查

import logging

class SecureSettings(BaseSettings):
    api_key: str = Field(..., description="API Key (sensitive)")
    
    @validator("api_key", pre=True)
    def mask_sensitive(cls, v):
        # 僅顯示前 4 個字元
        if len(v) > 4:
            return v[:4] + "****"
        return "****"
    
    class Config:
        @classmethod
        def parse_env(cls, env_data):
            result = super().parse_env(env_data)
            # 從日誌中排除敏感欄位
            sensitive_fields = {'api_key', 'secret', 'password'}
            for field in sensitive_fields:
                if hasattr(result, field):
                    setattr(result, field, '***REDACTED***')
            return result

# 日誌過濾
class SensitiveDataFilter(logging.Filter):
    def filter(self, record):
        sensitive_patterns = [
            r'API_KEY[=:]\s*\S+',
            r'GEMINI_API_KEY[=:]\s*\S+',
            r'password[=:]\s*\S+',
        ]
        
        for pattern in sensitive_patterns:
            record.msg = re.sub(pattern, r'\1=***REDACTED***', record.msg)
        
        return True
```

#### TT-App02: 配置漂移
```python
# 問題：開發、生產環境配置不一致
# 
# 解決方案：
# 1. 使用配置即程式碼
# 2. 定期配置審計
# 3. 自動化配置比對

class ConfigurationDriftDetector:
    def detect_drift(self, env1: str, env2: str) -> List[DriftReport]:
        # 取得兩環境配置
        config1 = self.get_environment_config(env1)
        config2 = self.get_environment_config(env2)
        
        drift_reports = []
        
        for key in set(config1.keys()) | set(config2.keys()):
            value1 = config1.get(key)
            value2 = config2.get(key)
            
            if value1 != value2:
                drift_reports.append(DriftReport(
                    key=key,
                    env1_value=value1,
                    env2_value=value2,
                    severity=self.calculate_severity(key, value1, value2)
                ))
        
        return drift_reports
    
    def calculate_severity(self, key: str, value1: str, value2: str) -> str:
        # 高風險配置漂移
        high_risk = {'api_key', 'rate_limit', 'timeout'}
        
        if key in high_risk:
            return 'high'
        elif value1 and value2:
            return 'medium'
        else:
            return 'low'
```

#### TT-App03: API Key 輪換
```python
# 問題：API Key 過期導致服務中斷
# 
# 解決方案：
# 1. 實施 Key 輪換政策
# 2. 提前通知過期
# 3. 自動化輪換流程

class APIKeyRotationManager:
    def __init__(self):
        self.rotation_days = 90  # 90 天輪換
        self.notification_days = 14  # 提前 14 天通知
    
    def check_expiration(self) -> List[ExpirationWarning]:
        warnings = []
        
        for key in self.get_all_keys():
            days_until_expiry = (key.expires_at - datetime.utcnow()).days
            
            if days_until_expiry <= 0:
                # 已過期
                self.block_key(key)
                warnings.append(ExpirationWarning(
                    key_id=key.id,
                    severity='critical',
                    message=f"API Key {key.name} has expired"
                ))
            elif days_until_expiry <= self.notification_days:
                # 即將過期
                warnings.append(ExpirationWarning(
                    key_id=key.id,
                    severity='warning',
                    message=f"API Key {key.name} expires in {days_until_expiry} days"
                ))
        
        return warnings
    
    def rotate_key(self, key_id: str) -> APIKey:
        # 創建新 Key
        new_key = self.create_new_key(key_id)
        
        # 測試新 Key
        self.test_key(new_key)
        
        # 切換到新 Key
        self.switch_to_key(key_id, new_key)
        
        # 標記舊 Key 為過期
        self.mark_key_expired(key_id)
        
        return new_key
```

### 📝 開發建議

#### DEV-App01: 環境變數命名規範
```python
# 建議：實施一致的環境變數命名規範
# 
// 命名規範：
// 1. 前綴表示模組
// 2. 大寫字母與底線
// 3. 描述性名稱
// 4. 版本標註

# 前綴規範
BACKEND_*: 後端服務
FRONTEND_*: 前端服務
DATABASE_*: 資料庫配置
CACHE_*: 快取配置
QUEUE_*: 佇列配置
AI_*: AI 模型配置
DATA_*: 數據源配置
LOGGING_*: 日誌配置
SECURITY_*: 安全配置

# 版本標註
GEMINI_API_KEY=v1_*
GEMINI_API_KEY=v2_*

# 示例
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
DATABASE_URL=postgresql://...
CACHE_REDIS_URL=redis://...
AI_GEMINI_API_KEY=...
DATA_FINNHUB_API_KEY=...
```

#### DEV-App02: API Key Pool 監控儀表板
```python
# 建議：建立 API Key Pool 監控儀表板
# 
// 監控指標：
// 1. 各 Key 使用量
// 2. Rate Limit 使用率
// 3. 錯誤率趨勢
// 4. 成本趨勢

API_KEY_DASHBOARD_CONFIG = {
    "panels": [
        {
            "title": "API Key Usage Distribution",
            "type": "pie_chart",
            "targets": [
                "sum by (key_name) (api_requests_total)"
            ]
        },
        {
            "title": "Rate Limit Utilization",
            "type": "gauge",
            "targets": [
                "api_requests_total / api_rate_limit * 100"
            ]
        },
        {
            "title": "Error Rate by Key",
            "type": "line_chart",
            "targets": [
                "rate(api_requests_failed[5m]) by (key_name)"
            ]
        },
        {
            "title": "Cost Trend",
            "type": "bar_chart",
            "targets": [
                "sum by (key_name) (api_cost_estimate)"
            ]
        }
    ]
}
```

#### DEV-App03: 擴充管理最佳實踐
```python
# 建議：實施系統化擴充管理
# 
// 擴充流程：
// 1. 需求評估
// 2. 設計審查
// 3. 實作開發
// 4. 測試驗證
// 5. 部署發布
// 6. 文檔更新

EXTENSION_MANAGEMENT = {
    "checklist": {
        "factor_extension": {
            "required": [
                "factor_scorer.py 更新",
                "schema 遷移",
                "演化策略整合",
                "前端雷達圖更新",
                "單元測試",
                "整合測試"
            ],
            "documentation": [
                "術語表更新",
                "環境變數說明",
                "API 文檔更新"
            ]
        },
        "genome_extension": {
            "required": [
                "基因組結構更新",
                "適應度函數更新",
                "演化參數配置",
                "回測驗證"
            ]
        }
    },
    "versioning": {
        "strategy": "semantic",
        "major_changes": ["因子維度變更", "基因組結構變更"],
        "minor_changes": ["新增因子", "新增產業"],
        "patch_changes": ["Bug Fix", "效能優化"]
    }
}
```

#### DEV-App04: 術語表維護
```python
# 建議：建立術語表維護流程
# 
// 維護原則：
// 1. 定期審查術語定義
// 2. 追蹤術語使用情況
// 3. 收集使用者回饋
// 4. 版本化術語定義

class TerminologyMaintenance:
    def review_terminology(self):
        """定期審查術語"""
        # 檢查術語使用情況
        usage = self.analyze_term_usage()
        
        # 識別需要更新的術語
        outdated_terms = self.identify_outdated_terms(usage)
        
        # 生成審查報告
        return {
            'terms_to_review': outdated_terms,
            'unused_terms': self.identify_unused_terms(usage),
            'new_terms_needed': self.identify_missing_terms()
        }
    
    def update_terminology(self, term_code: str, update: dict):
        """更新術語定義"""
        # 版本控制
        old_version = self.get_current_version(term_code)
        new_version = self.increment_version(old_version)
        
        # 更新術語
        self.save_term_update({
            'term_code': term_code,
            'version': new_version,
            'update': update,
            'updated_by': get_current_user(),
            'updated_at': datetime.utcnow()
        })
        
        # 通知相關人員
        self.notify_term_change(term_code, old_version, new_version)
```

---

## 11. 關聯文件索引

| 文件 | 說明 | 交互關係 |
|------|------|----------|
| [00_Full_Reconstruction_TOC.md](00_Full_Reconstruction_TOC.md) | 完整檔案結構索引 | 附錄位置 |
| [02_Technical_Architecture.md](02_Technical_Architecture.md) | 技術架構 | 環境配置 |
| [13_Development_and_Deployment_Ops.md](13_Development_and_Deployment_Ops.md) | CI/CD | 部署配置 |
| [14_Security_and_Reliability.md](14_Security_and_Reliability.md) | 安全與可靠性 | API Key 安全 |

---

> **文件版本**：v1.0.1 (細節顯性化擴張)
> **關聯文件**：[00_Full_Reconstruction_TOC](00_Full_Reconstruction_TOC.md)
> **維護責任**：系統架構師 / DevOps 工程師
> **最後更新**：2026-02-10

