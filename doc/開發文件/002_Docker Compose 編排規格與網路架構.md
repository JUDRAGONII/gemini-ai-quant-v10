# 002_Docker Compose 編排規格與網路架構

**文件編號**：INFRA-V10.0-001
**版本**：2.0.0
**建立日期**：2026-02-25
**依據**：`AI 投資分析儀 V10.0 的完整可執行程式碼.md` (Section 1.1)

---

## 1. 系統編排總覽

本系統採用 **Self-Hosted Supabase** 架構，透過 Docker Compose 統一管理 9 個核心容器。

### 1.1 服務相依圖 (Service Dependency)

```mermaid
graph TD
    User((User/Browser)) -->|HTTPS/443| Nginx[Nginx Reverse Proxy]
    Nginx -->|Proxy Pass| Kong[Kong API Gateway]
    
    subgraph "Docker Network: supabase-network"
        Kong -->|Route| Auth[GoTrue (Auth)]
        Kong -->|Route| Rest[PostgREST (API)]
        Kong -->|Route| Realtime[Realtime (WS)]
        Kong -->|Route| Storage[Storage API]
        Kong -->|Route| Meta[Supabase Studio]
        
        Auth -->|Connect| DB[(PostgreSQL 15)]
        Rest -->|Connect| DB
        Realtime -->|Connect| DB
        Storage -->|Connect| DB
        
        Worker[AI Worker (Python)] -->|Supabase SDK| Kong
        Worker -->|Direct SQL| DB
        
        Frontend[Next.js App] -->|Supabase Client| Kong
    end
```

---

## 2. 容器詳細規格

### 2.1 基礎設施層

| 服務名稱 | Image | Port (Host) | 職責 | 關鍵環境變數 |
|:---|:---|:---|:---|:---|
| `db` | `supabase/postgres:15.1` | 5432 | 核心資料庫、向量搜索 | `POSTGRES_PASSWORD`, `POSTGRES_DB` |
| `kong` | `library/kong:2.8.1` | 8000, 8443 | API 閘道器、CORS | `KONG_DECLARATIVE_CONFIG` |

### 2.2 Supabase 中介層

| 服務名稱 | Image | Port (Internal) | 職責 | 依賴服務 |
|:---|:---|:---|:---|:---|
| `auth` | `supabase/gotrue` | 9999 | 用戶認證 (JWT) | `db` |
| `rest` | `postgrest/postgrest` | 3000 | Auto REST API | `db` |
| `realtime` | `supabase/realtime` | 4000 | WebSocket 推送 | `db` |
| `storage` | `supabase/storage-api` | 5000 | 檔案儲存 (S3) | `db`, `rest` |

### 2.3 應用層

| 服務名稱 | Build Context | 職責 | 資源限制 (建議) |
|:---|:---|:---|:---|
| `ai-worker` | `./backend` | ETL、AI 推理、排程 | CPU: 2 Core, RAM: 4GB |
| `frontend` | `./frontend` | UI 介面、互動邏輯 | CPU: 1 Core, RAM: 1GB |

---

## 3. 網路與存儲架構

### 3.1 網路分區
*   **External Access**: 僅開放 `Nginx (443)` 與 `Kong (8000/8443)`。
*   **Internal Network**: 所有後端服務皆位於 `default` bridge network，透過 container name 互連。

### 3.2 Volume 掛載策略 (Persistence)

所有持久化數據儲存於 `./volumes` 目錄，便於備份與遷移。

```yaml
volumes:
  - ./volumes/db:/var/lib/postgresql/data          # DB 數據 (NVMe)
  - ./volumes/storage:/var/lib/storage             # 上傳檔案 (HDD)
  - ./volumes/kong:/var/lib/kong/kong.yml          # Gateway 設定
```

---

## 4. 安全配置

*   **API Security**: 所有對外 API 存取必須包含 `apikey` (Anon/Service) header。
*   **Database Security**: `postgres` 超級用戶密碼透過 `.env` 注入，禁止預設密碼。
*   **Service Role**: `ai-worker` 使用 `SERVICE_ROLE_KEY` 繞過 RLS，執行系統級任務。

---
**文件結束**
