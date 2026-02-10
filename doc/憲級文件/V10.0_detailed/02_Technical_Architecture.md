# 02. 技術架構與極致效能優化 (Technical Architecture)

> **文件版本**：v1.0 (V10.0 完整規格書重構)
> **日期**：2026-02-10
> **核心使命**：定義完整的技術棧選擇、Supabase 整合架構、WSL2/Docker 環境優化與 Windows/WSL2/Docker 環境下的極致效能優化策略

---

## 1. 全方位技術棧 (The Complete Technology Stack)

V10.0 採用 **Self-Hosted Supabase** 架構，在用戶 NAS 設備上部署一套完整的開源 Backend-as-a-Service (BaaS) 平台，將原有的分散式微服務整合為統一的生態系統，大幅降低維運複雜度並提升開發效率。

### 1.1 前端技術規範 (Frontend Stack)

| 層級 | 技術選擇 | 版本要求 | 用途說明 |
|------|----------|----------|----------|
| **Framework** | Next.js | 14+ (App Router) | 核心框架，SSR 支援 |
| **Language** | TypeScript | 5.0+ | 嚴格型別檢查 |
| **UI Library** | shadcn/ui + Tailwind CSS | Latest | 現代化 UI 元件 |
| **Charting** | TradingView Lightweight Charts | Latest | 金融 K 線圖 |
| **Charting** | Recharts | Latest | 統計圖表 |
| **State** | Zustand | Latest | 輕量級狀態管理 |
| **Data Fetch** | TanStack Query | Latest | Server State 管理 |
| **Auth** | @supabase/ssr | Latest | Supabase 整合 |

### 1.2 後端技術規範 (Backend Stack)

| 層級 | 技術選擇 | 版本要求 | 用途說明 |
|------|----------|----------|----------|
| **Framework** | Flask API | 3.0+ | 高性能 API 服務 |
| **Language** | Python | 3.11+ | 核心開發語言 |
| **ORM** | SQLAlchemy 2.0 | Latest | 非同步資料庫 ORM |
| **Validation** | Pydantic V2 | Latest | 資料驗證與序列化 |
| **Task Queue** | Prefect | 2.10+ | 工作流編排 |
| **ML/AI** | LangChain | Latest | LLM 整合框架 |
| **Vector DB** | pgvector | Latest | AI 向量存儲 |
| **Workflow** | Prefect | 2.10+ | 數據處理排程 |

### 1.3 資料庫技術規範 (Database Stack - V10.0 強化)

| 技術選擇 | 版本要求 | 部署方式 | 用途說明 |
|----------|----------|----------|----------|
| **PostgreSQL** | 15+ | Docker (Self-hosted Supabase) | 主關聯式資料庫 |
| **pgvector** | Latest | PostgreSQL Extension | AI 向量存儲與語意搜尋 |
| **pg_graphql** | Latest | PostgreSQL Extension | 自動 GraphQL API |
| **pg_net** | Latest | PostgreSQL Extension | 外部 HTTP 請求 |
| **Redis** | 7.0+ | Docker | 快取與任務佇列 |
| **ZFS** | Latest | QNAP NAS | 資料持久化儲存 |

### 1.4 開發與維運工具 (DevOps Stack)

| 技術選擇 | 版本要求 | 用途說明 |
|----------|----------|----------|
| **Docker** | 24+ | 容器化 |
| **Docker Compose** | 2.24+ | 多容器編排 |
| **Supabase CLI** | Latest | Supabase 本地開發 |
| **GitHub Actions** | Latest | CI/CD |
| **Prometheus** | 2.45+ | 指標監控 |
| **Grafana** | 10+ | 視覺化監控 |

---

## 2. Supabase 整合架構 (V10.0 核心特性)

V10.0 採用 **Self-Hosted Supabase** 架構，在用戶 NAS 設備上部署完整的開源 Backend-as-a-Service 平台。

### 2.1 Supabase 服務群組

| 服務 | 容器名稱 | 用途 | 端口配置 |
|------|----------|------|----------|
| **PostgreSQL** | db | 核心資料庫，擴充 pgvector, pg_graphql, pg_net | 內部: 5432 → Host: 54322 |
| **GoTrue** | auth | 處理用戶註冊、登入與 JWT 憑證簽發 | 內部: 54321 → Host: 54321 |
| **PostgREST** | rest | 自動將 PostgreSQL Schema 轉換為 RESTful API | 內部: 3000 → Host: 3000 |
| **Realtime** | realtime | 監聽資料庫變更 (WAL)，透過 WebSocket 向前端推送 | 內部: 4000 → Host: 4000 |
| **Storage** | storage-api | 管理檔案上傳與下載 | 內部: 5000 → Host: 5000 |
| **Studio** | studio | 提供圖形化資料庫管理介面 | 內部: 3000 → Host: 3002 |
| **Kong** | kong | API 閘道器，統一管理認證、速率限制與 CORS | 內部: 8000 → Host: 8000 |

### 2.2 AI Worker 自定義服務

V10.0 保留 Python (Flask/Prefect) 容器，專責處理複雜的 AI 推理、量化因子計算與外部數據 ETL：

| 服務 | 技術棧 | 用途 |
|------|--------|------|
| **AI Inference** | Flask + LangChain + Gemini API | AI 推理、報告生成 |
| **Quant Engine** | Python + Pandas + NumPy | 18 維度評分計算 |
| **Evolution Strategy** | Python + DEAP | 遺傳演算法優化 |
| **Data ETL** | Prefect + Python | 數據獲取、清洗、轉換 |

### 2.3 容器編排架構

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      V10.0 Supabase 容器架構                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     Supabase Network                             │   │
│  │                                                                  │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │   │
│  │  │  Kong   │  │  Studio │  │  rest   │  │ realtime│            │   │
│  │  │  :8000  │  │  :3002  │  │  :3000  │  │  :4000  │            │   │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘            │   │
│  │       │            │            │            │                   │   │
│  │       └────────────┴─────┬──────┴────────────┘                   │   │
│  │                          │                                         │   │
│  │                   ┌──────▼──────┐                                 │   │
│  │                   │    PostgreSQL │  :5432                        │   │
│  │                   │ + pgvector   │                                │   │
│  │                   │ + pg_graphql│                                │   │
│  │                   │ + pg_net    │                                │   │
│  │                   └──────┬──────┘                                 │   │
│  │                          │                                         │   │
│  │       ┌──────────────────┼──────────────────┐                     │   │
│  │       │                  │                  │                     │   │
│  │       ▼                  ▼                  ▼                     │   │
│  │  ┌─────────┐      ┌─────────┐      ┌─────────┐                  │   │
│  │  │  auth   │      │ storage │      │AI Worker│                  │   │
│  │  │ GoTrue  │      │  :5000  │      │Flask    │                  │   │
│  │  │ :54321  │      │         │      │Prefect  │                  │   │
│  │  └─────────┘      └─────────┘      └─────────┘                  │   │
│  │                                                                  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                │                                         │
│                                │                                         │
│                     ┌──────────┴──────────┐                            │
│                     │     Nginx / SSL     │                            │
│                     │      :443 (HTTPS)   │                            │
│                     └──────────┬──────────┘                            │
│                                │                                         │
│                                ▼                                         │
│                     ┌─────────────────────┐                             │
│                     │   Client (Next.js)  │                             │
│                     └─────────────────────┘                             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Windows/WSL2/Docker 極致效能優化策略

針對 Windows 環境下 Docker 運算的常見效能瓶頸（特別是 I/O），V10.0 實施以下優化：

### 3.1 WSL 2 檔案系統直連 (WSL 2 Direct Access)

#### 強制要求 (Mandatory)

```bash
# ✅ 正確做法：所有持久化目錄位於 WSL 2 內部
volumes:
  - postgres_data:/var/lib/postgresql/data
  - redis_data:/data

# 或明確指定 WSL 路徑
volumes:
  - /var/lib/docker/volumes/postgres_data:/var/lib/postgresql/data
```

#### 禁止事項

```bash
# ❌ 錯誤做法：將資料庫掛載到 Windows NTFS
volumes:
  - /mnt/c/backup/postgres:/var/lib/postgresql/data

# 問題：
# - I/O 損耗高達 5-10 倍
# - 檔案鎖定衝突
# - 效能極度不穩定
```

#### 效能對照表

| 掛載方式 | 隨機讀取 IOPS | 順序寫入 MB/s | 相對效能 |
|----------|---------------|---------------|----------|
| Windows NTFS (/mnt/c) | ~500 | ~15 | 1x (基準) |
| WSL2 ext4 (/var/lib) | ~15,000 | ~150 | 10-30x |
| NVMe Direct (Linux) | ~50,000 | ~500 | 30-100x |

### 3.2 WSL Config 優化 (.wslconfig)

```ini
# %USERPROFILE%\.wslconfig

[wsl2]
memory=8GB                  # 分配 8GB 記憶體 (建議系統 50% 以上)
processors=8                # 分配 8 核心
swap=4GB                    # SWAP 大小
localhostForwarding=true    # 允許 localhost 轉發

[experimental]
autoProxy=true              # 啟用自動代理
networkingMode=mirrored     # 鏡像網路模式
```

### 3.3 Docker 資源分配

```yaml
# docker-compose.yml

services:
  postgres:
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 4G        # 限制記憶體，防止 ETL 掃描時導致宿主機死機
        reservations:
          cpus: '2'
          memory: 2G
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - /var/lib/docker/volumes/wal:/var/lib/postgresql/wal

  redis:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M

  flask_api:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
    volumes:
      - ./backend:/app

  prefect:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

---

## 4. 跨組件通訊架構 (Internal Communication)

### 4.1 通訊協議矩陣

| 通訊路徑 | 協議 | 用途 | 技術實現 |
|----------|------|------|----------|
| **Frontend ↔ Backend** | RESTful API | 資料查詢、下單 | Next.js Server Actions + Flask API |
| **Frontend ↔ Database** | Supabase Client | 實時訂閱 | WebSocket (Realtime) |
| **Backend ↔ Worker** | Redis Queue | 任務排程 | Prefect |
| **Backend ↔ AI** | REST | 模型調用 | LangChain + Gemini API |
| **Worker ↔ Database** | Async SQLAlchemy | 大量數據處理 | AsyncIO |
| **AI ↔ Database** | pgvector | 向量檢索 | 語意搜尋 |

### 4.2 API 閘道設計 (Kong)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         V10.0 API 閘道架構                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐                                                     │
│  │  Client (Next.js│                                                     │
│  └────────┬────────┘                                                     │
│           │ HTTPS (:443)                                                 │
│           ▼                                                              │
│  ┌─────────────────┐                                                     │
│  │    Nginx        │  SSL 終止、反向代理                                  │
│  └────────┬────────┘                                                     │
│           │                                                              │
│           ▼                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      Kong API Gateway                            │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │   │
│  │  │Rate Limiting│  │Authentication│ │Request Logging│              │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│           │                                                              │
│           ├──► /api/v1/*  ──► Flask API (8088)                         │
│           ├──► /rest/*   ──► PostgREST (3000)                         │
│           ├──► /storage/* ──► Storage API (5000)                      │
│           └──► /realtime/* ──► Realtime (4000)                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. 存儲架構配置 (V10.0 強化)

基於 QNAP TS-h973AX-32G NAS 的硬體規格與系統需求，V10.0 採用分層存儲架構。

### 5.1 三層存儲架構

| 層級 | 存儲介質 | 配置 | 用途 |
|------|----------|------|------|
| **NVMe SSD** | Intel P4510 ×2 | RAID 1 (2TB) | Docker 容器、系統資料庫、pgvector |
| **SATA SSD** | WD Red SA500 ×2 | RAID 1 (1TB) | 近期行情數據、18 維度評分、AI 計算結果 |
| **HDD** | Seagate IronWolf Pro ×2 | RAID 1 (24TB) | 歷史行情數據、宏觀指標歸檔、9GB 向量索引 |

### 5.2 容量規劃

| 數據類型 | 存儲層級 | 容量需求 |
|----------|----------|----------|
| Docker 容器與系統程式碼 | NVMe SSD | 50GB |
| PostgreSQL 資料庫 (熱數據) | NVMe SSD | 200GB |
| Redis 快取 | NVMe SSD | 50GB |
| 近期行情數據 (3 年) | SATA SSD | 300GB |
| AI 計算資源與向量索引 | SATA SSD | 150GB |
| 歷史行情數據 (>3 年) | HDD | 8TB |
| 宏觀數據歸檔 | HDD | 500GB |
| 備份資料 | HDD | 10TB |

**總容量需求**: 19.3TB，預留 20% 安全邊界後，24TB 可用容量足夠支撐未來 3-5 年的數據增長。

---

## 6. 可擴展性設計 (Scalability)

### 6.1 無狀態後端設計

```python
# Flask API 設計原則

app = Flask(__name__)

# 確保後端無狀態，支援橫向擴展
# 所有狀態存儲於 Redis
# 會話管理透過 JWT (Supabase Auth)
```

### 6.2 分區表策略 (Table Partitioning)

```sql
-- PostgreSQL 分區表示例

-- 每日價格分區 (按年份)
CREATE TABLE daily_prices (
    id BIGSERIAL,
    security_id INTEGER NOT NULL,
    date DATE NOT NULL,
    open NUMERIC(19, 6),
    high NUMERIC(19, 6),
    low NUMERIC(19, 6),
    close NUMERIC(19, 6),
    volume BIGINT,
    PRIMARY KEY (security_id, date)
) PARTITION BY RANGE (date);

-- 建立年度分區
CREATE TABLE daily_prices_2024 PARTITION OF daily_prices
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE daily_prices_2025 PARTITION OF daily_prices
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

CREATE TABLE daily_prices_2026 PARTITION OF daily_prices
    FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
```

### 6.3 多級快取架構 (Multi-level Cache)

| 層級 | 技術 | TTL | 用途 |
|------|------|-----|------|
| **L1** | 內存快取 | 1 分鐘 | 價格快照 |
| **L2** | Redis | 1 小時 | 技術指標計算結果 |
| **L3** | PostgreSQL | 永久 | 持久化歷史數據、18 維度評分 |

---

## 7. 效能基準 (Performance Benchmark Targets)

### 7.1 API 響應時間目標

| 端點類型 | P50 | P95 | P99 | 目標 |
|----------|------|------|------|------|
| **價格查詢** | 50ms | 150ms | 300ms | ✅ |
| **因子打分 (18 維度)** | 200ms | 500ms | 800ms | ✅ |
| **AI 分析** | 3s | 8s | 15s | ⚠️ |
| **組合計算** | 500ms | 1s | 2s | ✅ |
| **語義搜尋** | 100ms | 300ms | 500ms | ✅ |
| **演化策略計算** | 5s | 15s | 30s | ⚠️ |

### 7.2 數據處理目標

| 操作類型 | 數據量 | 時限 | 目標 |
|----------|--------|------|------|
| **批量注入** | 50 檔標的 × 5 年歷史 | 10s | ✅ |
| **全市場打分** | 2500 檔 × 18 因子 | 30min | ⚠️ |
| **AI 報告生成** | 1 份深度報告 | 15s | ✅ |
| **每日數據同步** | TWSE + FINNHUB + FRED + 130+ 指標 | 1h | ✅ |
| **演化策略迭代** | 450 基因組 × 100 迭代 | 10min | ⚠️ |

### 7.3 資源使用基準

| 資源 | 空閒 | 滿載 | 尖峰限制 |
|------|------|------|----------|
| **CPU** | 10% | 60% | 80% |
| **Memory** | 4GB | 10GB | 12GB |
| **Disk I/O** | 10MB/s | 100MB/s | 200MB/s |
| **DB Connections** | 10 | 50 | 80 |
| **Redis Memory** | 100MB | 400MB | 512MB |

---

## 8. 埠口分配策略 (V10.0 完整版)

### 8.1 全域埠口分配表

| 服務 | 內部埠口 | 主機埠口 | 環境變數 | 衝突迴避策略 |
|------|----------|----------|----------|--------------|
| **Next.js Frontend** | 3000 | **3000** | `PORT` | 核心應用，若佔用則順延 (3001) |
| **Flask Backend** | 8088 | **8088** | `API_PORT` | 避開 QNAP/Tomcat (8080) |
| **Supabase Kong** | 8000 | **8000** | `KONG_PORT` | API Gateway 統一入口 |
| **Supabase Studio** | 3000 | **3002** | `STUDIO_PORT` | 避開 Next.js (3000/3001) |
| **PostgreSQL** | 5432 | **54322** | `DB_PORT` | 避開本地 PG (5432) |
| **Redis** | 6379 | **6380** | `REDIS_PORT` | 避開本地 Redis |
| **GoTrue Auth** | 54321 | **54321** | `AUTH_PORT` | Supabase 內部服務 |
| **PostgREST** | 3000 | **3003** | `PGREST_PORT` | 避開 Next.js/Studio |
| **Realtime** | 4000 | **4000** | `REALTIME_PORT` | WebSocket 推送 |
| **Storage API** | 5000 | **5000** | `STORAGE_PORT` | 檔案管理 |
| **Prefect UI** | 4200 | **4200** | `PREFECT_PORT` | 工作流監控面板 |

### 8.2 防衝突執行規範

```bash
#!/bin/bash
# scripts/check_ports.sh

# 檢查關鍵埠口是否被佔用
for port in 3000 8088 8000 54322 6380 4200; do
    if lsof -i:$port > /dev/null 2>&1; then
        echo "⚠️ 埠口 $port 已被佔用:"
        lsof -i:$port
        exit 1
    fi
done

echo "✅ 所有關鍵埠口可用"
```

---

## 9. 開發環境配置 (Development Environment)

### 9.1 Docker Compose Profiles

```yaml
# docker-compose.yml

services:
  postgres:
    profiles: [dev, prod]
  
  redis:
    profiles: [dev, prod]
  
  backend:
    profiles: [dev, prod]
  
  frontend:
    profiles: [dev, prod]
  
  prefect:
    profiles: [dev, prod]

  # 只在開發環境開啟
  studio:
    profiles: [dev]
    ports:
      - "3002:3000"

  # 只在開發環境開啟
  jupyter:
    profiles: [dev]
    command: jupyter lab --ip=0.0.0.0 --port=8888
```

### 9.2 熱重載配置

```python
# flask_config.py

flask_config = {
    "app": "src.main:app",
    "host": "0.0.0.0",
    "port": 8088,
    "reload": True,              # 開發環境開啟熱重載
    "reload_dirs": ["src"],     # 監控目錄
    "workers": 1,                # 開發環境單 worker
    "debug": True,
}
```

---

## 10. 關聯文件索引

| 文件 | 說明 | 交互關係 |
|------|------|----------|
| [01_Vision_and_Philosophy.md](01_Vision_and_Philosophy.md) | 願景與投資哲學 | 定義技術架構需求 |
| [03_Data_Management_and_Database.md](03_Data_Management_and_Database.md) | 資料庫設計 | Supabase Schema 設計 |
| [04_Data_Sources_and_API_Governance.md](04_Data_Sources_and_API_Governance.md) | 數據源治理 | API 對接配置 |
| [06_Automation_and_Prefect_Workflow.md](06_Automation_and_Prefect_Workflow.md) | 工作流自動化 | Prefect 部署配置 |
| [13_Development_and_Deployment_Ops.md](13_Development_and_Deployment_Ops.md) | CI/CD 部署 | GitHub Actions Pipeline |
| [14_Security_and_Reliability.md](14_Security_and_Reliability.md) | 安全與可靠性 | RLS 策略、監控配置 |

---

> **文件版本**：v1.0.0
> **關聯文件**：[00_Full_Reconstruction_TOC](00_Full_Reconstruction_TOC.md)
> **維護責任**：系統架構師
> **最後更新**：2026-02-10

