# 13. 部署、CI/CD 與測試體系 (CI/CD & Testing)

> **文件版本**：v1.0 (V10.0 完整規格書重構)
> **日期**：2026-02-10
> **核心使命：** 定義 GitHub Actions CI/CD Pipeline、測試金字塔與 Supabase 部署流程

---

## 1. GitHub Actions CI/CD Pipeline

### 1.1 Pipeline 階段

| 階段 | 作業 | V10.0 測試重點 |
|------|------|----------------|
| **測試** | pytest, vitest | 18 維度評分驗證、演化策略單元測試 |
| **安全掃描** | Trivy, CodeQL | API Key 洩漏檢測 |
| **建構** | Docker Build | Supabase 服務群組建構 |
| **部署** | SSH Deploy | NAS 私有化部署 |

---

## 2. 測試金字塔 (V10.0 強化)

| 測試層級 | 工具 | V10.0 範疇 |
|----------|------|------------|
| **Unit Test** | Pytest/Vitest | 18 因子計算、演化策略、Z-Score |
| **Integration Test** | FastAPI TestClient | API 路由、DB CRUD、RAG 整合 |
| **E2E Test** | Playwright | 登入、下單、Dashboard、18 維度介面 |
| **Backtest QA** | Custom Validator | 歷史回測一致性、演化策略驗證 |

---

## 4. 邏輯拆解 (Logic Breakdown)

### 4.1 CI/CD Pipeline 流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    GitHub Actions CI/CD Pipeline 流程                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    Git Push / Pull Request                            │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   Push to main/develop                                     │  │   │
│   │   │   Pull Request opened/updated                              │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    Stage 1: Checkout & Setup                         │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   1. Checkout code                                        │  │   │
│   │   │   2. Setup Python / Node.js                               │  │   │
│   │   │   3. Install dependencies                                  │  │   │
│   │   │   4. Configure environment variables                       │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    Stage 2: Testing (並行執行)                       │   │
│   │                                                                      │   │
│   │   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │   │
│   │   │   Backend Test │  │  Frontend Test │  │   Security Scan │   │   │
│   │   │   (Pytest)    │  │   (Vitest)     │  │   (Trivy/QL)   │   │   │
│   │   │                │  │                │  │                │   │   │
│   │   │ • 因子計算    │  │ • 組件測試    │  │ • API Key 洩漏 │   │   │
│   │   │ • 演化策略    │  │ • Hook 測試    │  │ • 漏洞掃描     │   │   │
│   │   │ • API 測試     │  │ • API Mock     │  │ • 依賴審計     │   │   │
│   │   └─────────────────┘  └─────────────────┘  └─────────────────┘   │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                           ┌──────────┴──────────┐                        │
│                           ▼                         ▼                        │
│              ┌─────────────────┐       ┌─────────────────┐                 │
│              │   All Tests    │       │   Any Test     │                 │
│              │   Pass        │       │   Fail        │                 │
│              └────────┬────────┘       └───────┬─────────┘                 │
│                       │                        │                            │
│                       ▼                         X                            │
│              ┌─────────────────┐                                             │
│              │   Stage 3:     │                                             │
│              │   Build         │                                             │
│              └────────┬────────┘                                             │
│                       │                                                      │
│                       ▼                                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    Stage 3: Build (並行執行)                          │   │
│   │                                                                      │   │
│   │   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │   │
│   │   │   Backend Build │  │  Frontend Build │  │   Docker Build │   │   │
│   │   │   (Python)     │  │   (Next.js)    │  │   (Services)   │   │   │
│   │   │                │  │                │  │                │   │   │
│   │   │ • FastAPI     │  │ • Production  │  │ • Supabase    │   │   │
│   │   │ • Prefect     │  │ • TypeScript  │  │ • Redis      │   │   │
│   │   │ • Workers     │  │ • Tailwind    │  │ • Postgres   │   │   │
│   │   └─────────────────┘  └─────────────────┘  └─────────────────┘   │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    Stage 4: Deploy                                    │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   Deploy to QNAP NAS                                        │  │   │
│   │   │   • SSH connection                                         │  │   │
│   │   │   • Docker Compose pull                                    │  │   │
│   │   │   • Database migration                                     │  │   │
│   │   │   • Health check                                          │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 測試金字塔流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    測試金字塔流程                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                              ▲                                             │
│                             /│\                                            │
│                            / │ \                                           │
│                           /  │  \                                          │
│                          /   │   \                                         │
│                         /    │    \                                        │
│                        /     │     \                                       │
│                       /      │      \                                      │
│                      /       │       \                                     │
│                     /        │        \                                    │
│                    /         │         \                                   │
│                   /          │          \                                  │
│                  /           │           \                                 │
│                 /            │            \                                │
│                /             │             \                               │
│               /              │              \                              │
│              /               │               \                             │
│             /                │                \                            │
│            ▼                 ▼                 ▼                            │
│   ┌───────────────┐ ┌───────────────┐ ┌───────────────┐                  │
│   │   E2E Test    │ │ Integration   │ │   Unit Test   │                  │
│   │   (Playwright)│ │   Test        │ │ (Pytest/Vitest)│                  │
│   └───────────────┘ └───────────────┘ └───────────────┘                  │
│       數量少           數量中            數量多                              │
│       速度慢           速度中            速度快                              │
│       成本高           成本中            成本低                              │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    Unit Test 範疇 (最大範圍)                       │   │
│   │                                                                      │   │
│   │   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │   │
│   │   │   因子計算     │  │   演化策略     │  │   Z-Score      │   │   │
│   │   │                │  │                │  │                │   │   │
│   │   │ • Value Score │  │ • Selection   │  │ • Standardize │   │   │
│   │   │ • Quality Score│  │ • Crossover  │  │ • Clip       │   │   │
│   │   │ • Momentum    │  │ • Mutation   │  │ • Validate   │   │   │
│   │   │ • Growth      │  │ • Fitness    │  │                │   │   │
│   │   └─────────────────┘  └─────────────────┘  └─────────────────┘   │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    Integration Test 範疇                           │   │
│   │                                                                      │   │
│   │   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │   │
│   │   │   API Routes  │  │   Database    │  │   RAG Pipeline │   │   │
│   │   │                │  │   CRUD        │  │                │   │   │
│   │   │ • /api/v1/*   │  │ • Supabase   │  │ • Embedding   │   │   │
│   │   │ • Auth       │  │ • Redis      │  │ • Vector Search│   │   │
│   │   │ • WebSocket   │  │ • Migration  │  │ • Generation  │   │   │
│   │   └─────────────────┘  └─────────────────┘  └─────────────────┘   │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    E2E Test 範疇 (最小範圍)                         │   │
│   │                                                                      │   │
│   │   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │   │
│   │   │   User Flows   │  │   Critical    │  │   Reporting    │   │   │
│   │   │                │  │   Paths        │  │   Flows        │   │   │
│   │   │ • Login       │  │ • Buy/Sell    │  │ • Report Gen  │   │   │
│   │   │ • Dashboard   │  │ • Deposit     │  │ • Export      │   │   │
│   │   │ • Settings    │  │ • Withdraw    │  │ • Schedule    │   │   │
│   │   └─────────────────┘  └─────────────────┘  └─────────────────┘   │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. 邊界條件定義 (Edge Cases)

### 5.1 CI/CD Pipeline 邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-Dev01** | 測試失敗 | Pipeline 中止 | 通知開發者 |
| **EC-Dev02** | 安全掃描發現高危漏洞 | Pipeline 中止 | 阻止部署 |
| **EC-Dev03** | Docker Build 失敗 | 嘗試重構 | 檢查 Dockerfile |
| **EC-Dev04** | SSH 連接超時 | 重試 3 次 | 通知運維 |
| **EC-Dev05** | 資料庫遷移失敗 | 回滾部署 | 執行回滾腳本 |
| **EC-Dev06** | Health Check 失敗 | 自動重啟 | 最多重試 3 次 |

### 5.2 測試邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-Dev07** | 測試超時 ( > 5 分鐘) | 標記為失敗 | 增加 timeout |
| **EC-Dev08** | 測試資料庫連接失敗 | 使用 Mock | 標記 "Mocked" |
| **EC-Dev09** | API Key 洩漏檢測 | 阻止提交 | 警告開發者 |
| **EC-Dev10** | 依賴版本衝突 | 安裝失敗 | 更新 lockfile |
| **EC-Dev11** | E2E 測試隨機失敗 | 重試機制 | 最多 3 次 |
| **EC-Dev12** | 測試覆蓋率不足 (< 80%) | 警告 | 不阻止合併 |

### 5.3 部署邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-Dev13** | 目標環境不可達 | 部署失敗 | 通知運維 |
| **EC-Dev14** | 磁碟空間不足 | 建構失敗 | 清理暫存 |
| **EC-Dev15** | Docker 映像過大 | 推送失敗 | 優化映像 |
| **EC-Dev16** | 配置衝突 | 部署失敗 | 使用覆蓋 |
| **EC-Dev17** | 回滾超時 (> 10 分鐘) | 手動介入 | 發出警報 |
| **EC-Dev18** | 同時多個部署 | 隊列處理 | 按順序執行 |

---

## 6. Schema 完整化

### 6.1 CI/CD 執行記錄資料表 `cicd_executions`

```sql
-- ============================================================================
-- CI/CD 執行記錄資料表
-- 用途：追蹤 CI/CD Pipeline 執行歷史
-- ============================================================================

CREATE TABLE IF NOT EXISTS cicd_executions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_name       VARCHAR(100) NOT NULL,           -- 工作流名稱
    run_id              VARCHAR(100) UNIQUE,             -- GitHub Run ID
    commit_sha          VARCHAR(40) NOT NULL,             -- Commit SHA
    branch_name         VARCHAR(255) NOT NULL,            -- 分支名稱
    
    -- 觸發資訊
    trigger_type       VARCHAR(50) NOT NULL,             -- push/pull_request/workflow_dispatch
    triggered_by       VARCHAR(100),                       -- 觸發者
    pull_request_id    INTEGER,                           -- PR 編號
    
    -- 執行狀態
    status             VARCHAR(20) NOT NULL,            -- queued/in_progress/success/failure/cancelled
    conclusion         VARCHAR(50),                       -- success/failure/cancelled/skipped/timed_out
    
    -- 時間追蹤
    queued_at          TIMESTAMP WITH TIME ZONE,         -- 排隊時間
    started_at         TIMESTAMP WITH TIME ZONE,          -- 開始時間
    completed_at       TIMESTAMP WITH TIME ZONE,          -- 完成時間
    duration_seconds   INTEGER,                           -- 執行時長
    
    -- 階段追蹤
    stages_summary     JSONB,                            -- 各階段摘要
    
    -- 環境
    runner_os          VARCHAR(50),                       -- Runner 作業系統
    runner_version     VARCHAR(50),                       -- Runner 版本
    
    --Artifacts
    artifact_url       VARCHAR(500),                     -- Artifacts URL
    
    -- 日誌
    log_url            VARCHAR(500),                     -- 日誌 URL
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT ce_status_check CHECK (status IN ('queued', 'in_progress', 'success', 'failure', 'cancelled'))
);

-- ============================================================================
-- CI/CD 階段執行資料表
-- ============================================================================

CREATE TABLE IF NOT EXISTS cicd_stage_executions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id       UUID NOT NULL REFERENCES cicd_executions(id),
    stage_name         VARCHAR(100) NOT NULL,           -- 階段名稱
    stage_order        INTEGER NOT NULL,                  -- 階段順序
    
    -- 執行狀態
    status             VARCHAR(20) NOT NULL,            -- queued/in_progress/success/failure/skipped
    conclusion         VARCHAR(50),                       -- 結果
    
    -- 時間追蹤
    started_at         TIMESTAMP WITH TIME ZONE,          -- 開始時間
    completed_at       TIMESTAMP WITH TIME ZONE,          -- 完成時間
    duration_seconds   INTEGER,                           -- 執行時長
    
    -- 詳細資訊
    steps_summary      JSONB,                            -- 步驟摘要
    error_message      TEXT,                             -- 錯誤訊息
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT cse_execution_order UNIQUE (execution_id, stage_order)
);

-- ============================================================================
-- 測試結果資料表
-- ============================================================================

CREATE TABLE IF NOT EXISTS test_results (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id       UUID REFERENCES cicd_executions(id),
    test_run_id        VARCHAR(100),                     -- 測試執行 ID
    test_type          VARCHAR(50) NOT NULL,             -- unit/integration/e2e/performance
    
    -- 測試套件
    test_suite         VARCHAR(100) NOT NULL,            -- 測試套件名稱
    test_file          VARCHAR(500),                     -- 測試檔案
    test_class         VARCHAR(100),                     -- 測試類別
    test_function      VARCHAR(200),                     -- 測試函數
    
    -- 結果
    status             VARCHAR(20) NOT NULL,             -- passed/failed/skipped/error
    duration_seconds   DECIMAL(10,4),                    -- 執行時長
    
    -- 失敗資訊
    error_type         VARCHAR(100),                     -- 錯誤類型
    error_message      TEXT,                             -- 錯誤訊息
    stack_trace        TEXT,                             -- 堆疊追蹤
    
    -- 覆蓋率
    coverage_percent   DECIMAL(5,2),                    -- 覆蓋率 %
    coverage_report    JSONB,                            -- 覆蓋率報告
    
    -- 截圖/日誌
    artifacts          JSONB,                            -- 附加檔案
    
    executed_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT tr_execution_uniq UNIQUE (execution_id, test_run_id)
);

-- ============================================================================
-- 部署記錄資料表
-- ============================================================================

CREATE TABLE IF NOT EXISTS deployment_records (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    environment        VARCHAR(50) NOT NULL,             -- 環境 (staging/production)
    service_name       VARCHAR(100) NOT NULL,            -- 服務名稱
    
    -- 版本資訊
    version            VARCHAR(50) NOT NULL,             -- 部署版本
    commit_sha         VARCHAR(40) NOT NULL,             -- Commit SHA
    artifact_url       VARCHAR(500),                     -- Artifacts URL
    
    -- 部署狀態
    status             VARCHAR(20) NOT NULL,             -- deploying/success/failure/rolled_back
    
    -- 時間追蹤
    started_at         TIMESTAMP WITH TIME ZONE,          -- 開始時間
    completed_at       TIMESTAMP WITH TIME ZONE,          -- 完成時間
    duration_seconds   INTEGER,                           -- 執行時長
    
    -- 部署詳情
    deployment_method  VARCHAR(50),                       -- rolling/blue_green/canary
    target_hosts      VARCHAR(100)[],                     -- 目標主機
    target_port       INTEGER,                           -- 目標埠
    
    -- 健康檢查
    health_check_url   VARCHAR(500),                     -- 健康檢查 URL
    health_check_result VARCHAR(20),                     -- passed/failed
    health_check_delay INTEGER,                          -- 檢查延遲 (秒)
    
    -- Rollback
    previous_version   VARCHAR(50),                     -- 前一版本
    rollback_reason    TEXT,                             -- 回滾原因
    
    -- 部署者
    deployed_by       VARCHAR(100),                      -- 部署者
    deployment_note   TEXT,                             -- 部署備註
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- COMMENT 註解
COMMENT ON TABLE cicd_executions IS 'CI/CD 執行記錄表';
COMMENT ON TABLE cicd_stage_executions IS 'CI/CD 階段執行表';
COMMENT ON TABLE test_results IS '測試結果表';
COMMENT ON TABLE deployment_records IS '部署記錄表';
COMMENT ON COLUMN cicd_executions.status IS '狀態: queued/in_progress/success/failure/cancelled';
COMMENT ON COLUMN test_results.test_type IS '測試類型: unit/integration/e2e/performance';
```

---

## 7. 硬體/環境關聯 (QNAP TS-h973AX)

### 7.1 GitHub Actions Runner 配置

```yaml
# ============================================================================
# GitHub Actions Self-Hosted Runner Docker Compose
# ============================================================================

services:
  github-runner:
    image: my-runner:latest
    container_name: github-runner
    environment:
      - RUNNER_NAME=quant-runner-01
      - RUNNER_WORKDIR=/runner
      - GITHUB_URL=https://github.com/anomalyco
      - RUNNER_TOKEN=${RUNNER_TOKEN}
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /share/quant_pool/runner:/runner:rw
      - /share/quant_pool/cache:/root/.cache:rw
    deploy:
      resources:
        limits:
          cpus: '8'
          memory: 16G
        reservations:
          cpus: '4'
          memory: 8G
    restart: unless-stopped

  runner-worker:
    image: my-runner:latest
    container_name: runner-worker
    environment:
      - RUNNER_NAME=quant-runner-02
      - RUNNER_WORKDIR=/runner
    volumes:
      - /share/quant_pool/runner:/runner:rw
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 8G
    restart: unless-stopped
```

### 7.2 ZFS 儲存配置

```bash
#!/bin/bash
# ============================================================================
# CI/CD ZFS 配置
# ============================================================================

# 創建 Runner 快取 Dataset
zfs create quant_pool/runner
zfs set compression=lz4 quant_pool/runner
zfs set atime=off quant_pool/runner
zfs set primarycache=metadata quant_pool/runner

# 創建建構暫存 Dataset
zfs create quant_pool/build
zfs set compression=zstd quant_pool/build
zfs set atime=off quant_pool/build
zfs set quota=200G quant_pool/build

# 創建測試報告 Dataset
zfs create quant_pool/test_reports
zfs set compression=lz4 quant_pool/test_reports
zfs set quota=100G quant_pool/test_reports

# 創建部署歷史 Dataset
zfs create quant_pool/deployments
zfs set compression=lz4 quant_pool/deployments
zfs set snapshot=on quant_pool/deployments
```

---

## 8. 開發者備註 (Developer Notes)

### ⚠️ 技術陷阱警示

#### TT-Dev01: 測試隔離問題
```python
# 問題：測試之間共享狀態導致 flaky tests
# 
# 解決方案：
# 1. 每個測試使用獨立資料庫連接
# 2. 測試後清理
# 3. 使用 fixture 隔離

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

@pytest.fixture(scope="function")
def db_session():
    # 每個測試建立新連接
    engine = create_engine("postgresql://test:test@localhost/test")
    connection = engine.connect()
    transaction = connection.begin()
    
    # 建立 session
    Session = sessionmaker(bind=connection)
    session = Session()
    
    yield session
    
    # 測試後回滾
    session.close()
    transaction.rollback()
    connection.close()
```

#### TT-Dev02: CI Pipeline 效能
```yaml
# 問題：Pipeline 執行時間過長
# 
# 解決方案：
# 1. 實施並行執行
# 2. 快取依賴
# 3. 增量建構

# GitHub Actions 優化範例
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/cache@v3
        with:
          path: |
            ~/.cache/pip
            ~/.cache/pnpm
            node_modules
          key: ${{ runner.os }}-deps-${{ hashFiles('**/requirements.txt', '**/package.json') }}
      
      - name: Run tests in parallel
        run: |
          pytest -n auto  # 使用 pytest-xdist 並行
          vitest run --threads
```

#### TT-Dev03: Docker 映像過大
```dockerfile
# 問題：Docker 映像過大導致推送緩慢
# 
# 解決方案：
# 1. 多階段建構
# 2. 移除不必要的依賴
# 3. 使用 .dockerignore

# 多階段建構範例
FROM python:3.11-slim as builder

# 安裝依賴
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 生產映像
FROM python:3.11-slim
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY ./app /app
WORKDIR /app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]
```

### 📝 開發建議

#### DEV-Dev01: 測試覆蓋率目標
```python
# 建議：設定測試覆蓋率目標
# 
// 目標：
// - Unit Test: >= 90%
// - Integration Test: >= 70%
// - E2E Test: 核心流程 100%

# pytest-cov 配置
[tool.pytest.ini_options]
addopts = "--cov=app --cov-report=term-missing --cov-report=html --cov-fail-under=90"

# Coverage 追蹤
@pytest.mark.coverage(min=90)
def test_factor_calculation():
    # 測試內容
    pass
```

#### DEV-Dev02: Pipeline 監控
```python
# 建議：實施 Pipeline 效能監控
# 
// 監控維度：
// - 執行時間趨勢
// - 失敗率趨勢
// - 資源使用趨勢

class PipelineMonitor:
    def track_execution(self, execution: CICDExecution):
        # 記錄執行
        self.db.insert('pipeline_metrics', {
            'workflow': execution.workflow_name,
            'duration': execution.duration_seconds,
            'status': execution.status,
            'timestamp': execution.started_at
        })
    
    def alert_on_slowness(self, execution: CICDExecution):
        # 如果執行時間超過平均值 2 倍，發出警報
        avg_duration = self.get_average_duration(execution.workflow_name)
        if execution.duration_seconds > avg_duration * 2:
            self.send_alert(f"Pipeline {execution.workflow_name} 執行時間異常: {execution.duration_seconds}s")
```

#### DEV-Dev03: 自動化回滾
```python
# 建議：實施自動化回滾機制
# 
// 回滾策略：
// 1. 健康檢查失敗自動回滾
// 2. 錯誤率飆升回滾
// 3. 手動回滾觸發

class AutoRollback:
    def __init__(self, deployment: Deployment):
        self.deployment = deployment
    
    async def check_health(self) -> bool:
        response = await self.http.get(f"http://{self.deployment.host}:{self.deployment.port}/health")
        return response.status_code == 200
    
    async def should_rollback(self) -> bool:
        # 健康檢查失敗
        if not await self.check_health():
            return True
        
        # 錯誤率飆升
        error_rate = await self.get_error_rate()
        if error_rate > 0.05:  # 5% 錯誤率閾值
            return True
        
        return False
    
    async def rollback(self):
        # 執行回滾
        previous = await self.get_previous_version()
        await self.deploy(previous)
```

#### DEV-Dev04: 版本號管理
```python
# 建議：實施 Semantic Versioning
# 
// 版本格式：
// MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]
//
// MAOR: 不相容的 API 變更
// MINOR: 向後相容的新功能
// PATCH: 向後相容的 bug 修復

class VersionManager:
    VERSION_PATTERN = re.compile(r'^(?P<major>\d+)\.(?P<minor>\d+)\.(?P<patch>\d+)(?:-(?P<pre>[^+]+))?(?:\+(?P<build>[^.]+))?$')
    
    def bump_version(self, current: str, bump_type: str) -> str:
        match = self.VERSION_PATTERN.match(current)
        major, minor, patch = int(match.group('major')), int(match.group('minor')), int(match.group('patch'))
        
        if bump_type == 'major':
            major += 1
            minor = 0
            patch = 0
        elif bump_type == 'minor':
            minor += 1
            patch = 0
        else:  # patch
            patch += 1
        
        return f"{major}.{minor}.{patch}"
```

---

## 9. 關聯文件索引

| 文件 | 說明 | 交互關係 |
|------|------|----------|
| [00_Full_Reconstruction_TOC.md](00_Full_Reconstruction_TOC.md) | 完整檔案結構索引 | CI/CD 位置 |
| [02_Technical_Architecture.md](02_Technical_Architecture.md) | 技術架構 | 服務配置 |
| [14_Security_and_Reliability.md](14_Security_and_Reliability.md) | 安全與可靠性 | 安全掃描 |

---

> **文件版本**：v1.0.1 (細節顯性化擴張)
> **關聯文件**：[00_Full_Reconstruction_TOC](00_Full_Reconstruction_TOC.md)
> **維護責任**：系統架構師 / DevOps 工程師
> **最後更新**：2026-02-10

