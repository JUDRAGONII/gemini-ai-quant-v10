# AI 投資分析儀 V10.0 - AI 代理開發指南

**文件編號**：DOC-V10.0-AGENTS
**版本**：1.0.0
**建立日期**：2026-02-03
**用途**：為 AI 代理提供專案上下文、開發慣例與工作流程指引

---

## 一、專案總覽

### 1.1 系統定位

AI 投資分析儀 V10.0 是一套私有化部署的人工智慧投資分析平台，專為專業投資人設計。系統整合市場行情、宏觀經濟、籌碼數據與 AI 預測，提供從數據收集、處理、分析到投資建議生成的完整解決方案。

**核心價值主張**：
- **高隱私**：所有數據儲存於用戶自有 NAS 設備，不經第三方伺服器
- **高效能**：針對 QNAP NAS (AMD V1500B) 優化的邊緣運算架構
- **可解釋**：AI 建議附帶決策邏輯與置信度說明

### 1.2 當前開發階段

| 階段 | 名稱 | 狀態 | 核心產出 |
|:---|:---|:---|:---|
| P1-P7 | 基礎設施至資料庫補全 | ✅ 完成 | Docker 環境、API 服務、數據 ETL |
| P8 | AI 智慧與策略驗證 | ✅ 完成 | 演化策略、回測引擎、策略看板 |
| **P9** | **行情監控與選股中心** | **🏗️ 進行中** | AI 選股引擎、行情中繼、熱力圖、警示引擎 |
| P10 | 部署與交付 | 待啟動 | 生產環境部署、使用手冊 |

**Phase 9 核心任務**：
- AI 多維度選股引擎 (9.1)
- 效能平衡行情中繼 (9.2)
- 市場熱力圖 (9.3)
- API 配額管理 (9.4)
- **市場異動警示引擎 (9.5)** - 當前任務

### 1.3 部署環境

| 環境 | 位置 | 用途 |
|:---|:---|:---|
| **開發環境** | MSI Windows 筆電 | 日常開發、本地測試 |
| **生產環境** | QNAP TS-h973AX-32G (AMD Ryzen V1500B) | 私有化部署運行 |

---

## 二、技術架構

### 2.1 整體架構圖

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AI 投資分析儀 V10.0 架構                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐              │
│   │   前端 UI    │     │   後端 API   │     │   AI Worker │              │
│   │  Next.js 14 │◄───►│   FastAPI   │◄───►│  Python 3.11│              │
│   │   (Port 3000)│     │   (Port 8000)│     │  Prefect    │              │
│   └──────┬──────┘     └──────┬──────┘     └──────┬──────┘              │
│          │                   │                   │                      │
│          ▼                   ▼                   ▼                      │
│   ┌─────────────────────────────────────────────────────────────┐      │
│   │                    Supabase 生態系統                          │      │
│   │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐         │      │
│   │  │PostgreSQL│  │ GoTrue  │  │Realtime │  │ Storage │         │      │
│   │  │  (db)   │  │ (auth)  │  │  (ws)   │  │  (S3)   │         │      │
│   │  └─────────┘  └─────────┘  └─────────┘  └─────────┘         │      │
│   └─────────────────────────────────────────────────────────────┘      │
│                                  │                                      │
│           ┌──────────────────────┼──────────────────────┐              │
│           ▼                      ▼                      ▼              │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐              │
│   │   Redis     │     │  外部 API   │     │   監控      │              │
│   │  (快取/隊列) │     │ (FRED等)   │     │(Prometheus) │              │
│   └─────────────┘     └─────────────┘     └─────────────┘              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 技術棧清單

#### 後端技術
| 類別 | 技術 | 版本/規格 | 用途 |
|:---|:---|:---|:---|
| 框架 | FastAPI | 0.100+ | RESTful API 服務 |
| 排程 | Prefect | v3 | 工作流編排與排程 |
| 資料庫 | PostgreSQL | 15 | 主資料庫，含 pgvector |
| 快取 | Redis | 7.0+ | 會話、快取、去重 |
| ORM | Supabase SDK | Python | 資料庫操作 |
| 數據處理 | Pandas/NumPy | 最新 | ETL 與因子計算 |
| AI/ML | DEAP/XGBoost | 最新 | 演化策略與預測模型 |

#### 前端技術
| 類別 | 技術 | 版本/規格 | 用途 |
|:---|:---|:---|:---|
| 框架 | Next.js | 14 (App Router) | React 框架 |
| 語言 | TypeScript | 5.x | 型別安全 |
| 樣式 | Tailwind CSS | 3.x | 原子化 CSS |
| 圖表 | Recharts | 最新 | 數據視覺化 |
| 圖表 | Lightweight Charts | 5.1.0 | K 線圖 |
| 狀態 | SWR | 最新 | 數據抓取與快取 |
| UI | Radix UI | 最新 | 無頭組件 |
| 圖標 | Lucide React | 最新 | 圖標庫 |

#### 基礎設施
| 類別 | 技術 | 用途 |
|:---|:---|:---|
| 容器化 | Docker Compose | 服務編排 |
| 反向代理 | Nginx | SSL 終止、負載均衡 |
| API 閘道 | Kong | 路由、認證、CORS |
| 監控 | Prometheus/Grafana | 效能監控 |

### 2.3 目錄結構

```
AI投資分析儀V10.0/
├── backend/                    # 後端服務
│   ├── api/routers/           # API 路由模組
│   │   ├── admin.py           # 管理 API
│   │   ├── ai.py              # AI 分析 API
│   │   ├── backtest.py        # 回測 API
│   │   ├── market.py          # 市場行情 API
│   │   └── screener.py        # 選股 API
│   ├── services/              # 業務邏輯服務
│   │   └── quota_service.py   # API 配額管理
│   ├── workers/               # 背景工作程序
│   │   └── market_relay_worker.py  # 行情中繼 Worker
│   ├── db/                    # 資料庫層
│   │   ├── migrations/        # 遷移腳本
│   │   └── repositories/      # 資料倉儲模式
│   │       └── screener_repo.py
│   ├── etl/                   # 數據抽取轉換
│   │   ├── macro.py           # 宏觀數據 Fetcher
│   │   ├── tiingo.py          # Tiingo API
│   │   ├── fugle.py           # Fugle API
│   │   └── twse.py            # 台灣證交所
│   ├── agents/                # AI 代理
│   │   ├── evolution.py       # 演化策略引擎
│   │   ├── backtest.py        # 回測引擎
│   │   └── dialectic.py       # 多空辯論引擎
│   ├── lib/                   # 基礎函式庫
│   │   ├── supabase_client.py # Supabase 客戶端
│   │   └── redis_client.py    # Redis 客戶端
│   ├── flows.py               # Prefect 工作流
│   └── requirements.txt       # Python 依賴
│
├── frontend/                  # 前端應用
│   ├── app/                   # Next.js App Router 頁面
│   │   ├── page.tsx           # 首頁/儀表板
│   │   ├── market/            # 市場頁面
│   │   │   └── screener/      # 選股器頁面
│   │   ├── stocks/            # 個股頁面
│   │   ├── ai/                # AI 分析頁面
│   │   ├── chips/             # 籌碼分析頁面
│   │   ├── macro/             # 宏觀數據頁面
│   │   ├── portfolios/        # 投資組合頁面
│   │   ├── watchlist/         # 自選股頁面
│   │   ├── admin/             # 管理後台
│   │   └── settings/          # 系統設定
│   ├── components/            # React 組件
│   │   ├── ui/                # 基礎 UI 組件
│   │   ├── Chart/             # 圖表組件
│   │   ├── Market/            # 市場組件
│   │   ├── Screener/          # 選股器組件
│   │   └── AI/                # AI 組件
│   ├── hooks/                 # 自定義 Hooks
│   │   ├── useMarketQuotes.ts # 行情 Hook
│   │   ├── useScreener.ts     # 選股 Hook
│   │   ├── useHeatmap.ts      # 熱力圖 Hook
│   │   └── useAIPrediction.ts # AI 預測 Hook
│   ├── types/                 # TypeScript 類型
│   │   └── api.ts             # API 類型定義
│   ├── lib/                   # 前端工具函式
│   ├── context/               # React Context
│   └── package.json           # Node 依賴
│
├── doc/                       # 文件目錄
│   ├── 憲級文件/              # 最高級別技術文件
│   ├── 開發文件/              # 開發詳細規格
│   ├── plans/                 # 實作計畫
│   ├── PCM/                   # 專案控制矩陣
│   └── test/                  # 測試計畫
│
├── openspec/                  # OpenSpec 工具配置
├── .agent/                    # Agent Workflow 配置
├── docker-compose.yml         # Docker 編排配置
├── .env                       # 環境變數
└── schema.sql                 # 資料庫 Schema
```

---

## 三、開發慣例與規範

### 3.1 後端開發慣例 (Python)

#### 3.1.1 程式碼風格

```python
# 檔案命名：snake_case
backend/services/quota_service.py
backend/api/routers/market.py

# 類別命名：PascalCase
class QuotaService:
    """服務類別需包含 docstring 說明"""
    
    def __init__(self, supabase_client=None, redis_client=None):
        """初始化方法，支援依賴注入"""
        self.supabase = supabase_client or get_supabase()
        try:
            self.redis = redis_client or get_redis()
        except Exception:
            self.redis = None
            logger.warning("Redis unavailable, falling back to PostgreSQL only")

# 函式命名：snake_case
async def get_all_keys(self) -> List[Dict[str, Any]]:
    """異步方法使用 async/await，返回類型提示"""
    pass
```

#### 3.1.2 API Router 模式

```python
# backend/api/routers/market.py
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from backend.lib.supabase_client import get_supabase

router = APIRouter()
supabase = get_supabase()

class HeatmapRequest(BaseModel):
    market_type: Optional[str] = "ALL"
    group_by: Optional[str] = "sector"

@router.get("/quotes")
async def get_market_quotes(
    symbols: Optional[str] = Query(None, description="Comma separated symbols")
):
    """
    獲取最新行情快照。
    - 需處理異常並拋出 HTTPException
    - 使用 Query 參數而非 Path 參數作為可選值
    """
    try:
        query = supabase.table("market_quotes").select("*")
        if symbols:
            symbol_list = [s.strip() for s in symbols.split(",")]
            query = query.in_("stock_code", symbol_list)
        response = query.order("stock_code").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

#### 3.1.3 Repository 模式

```python
# backend/db/repositories/screener_repo.py
from typing import Dict, Any, List
from backend.lib.supabase_client import get_supabase

class ScreenerRepository:
    """選股倉儲模式 - 封裝數據訪問邏輯"""
    
    def __init__(self):
        self.supabase = get_supabase()
    
    async def screen_stocks(
        self,
        filters: Dict[str, Any],
        sort_by: str = "ai_score",
        sort_order: str = "desc",
        page: int = 1,
        page_size: int = 50
    ) -> List[Dict[str, Any]]:
        """實現動態 SQL 構建與查詢"""
        # 實作邏輯...
        pass
```

#### 3.1.4 Redis Key 命名規範

```python
# Redis Key 命名規範
REDIS_KEY_PREFIX = "alert"           # 前綴標識模組
ALERT_DEDUP_KEY = f"{REDIS_KEY_PREFIX}:dedup"  # Set: 去重
ALERT_RATE_KEY = f"{REDIS_KEY_PREFIX}:rate"    # Hash: 計數
ALERT_STATE_KEY = f"{REDIS_KEY_PREFIX}:state"  # Hash: 狀態
```

#### 3.1.5 Prefect Flow 編寫規範

```python
# backend/flows.py
from prefect import flow, task
import asyncio

@task(name="Sync All Macro Data", retries=3)
def sync_macro():
    """排程任務 - 支援重試機制"""
    client = get_supabase()
    fetcher = MacroFetcher(client)
    fetcher.run_all(lookback_days=365)

@task(name="Run Quota-Balanced Market Relay", retries=1)
def sync_relay():
    """行情中繼任務"""
    client = get_supabase()
    worker = MarketRelayWorker(client)
    asyncio.run(worker.run_once())

@flow(name="Daily V10 Quantitative Pipeline")
def daily_pipeline():
    """每日量化管線流程"""
    sync_macro()
    sync_market()
    sync_relay()
```

### 3.2 前端開發慣例 (TypeScript/React)

#### 3.2.1 檔案命名與結構

```typescript
// 檔案命名：PascalCase (組件) / camelCase (工具)
components/Market/MarketHeatmap.tsx    // 組件
hooks/useMarketQuotes.ts               // 自定義 Hook
types/api.ts                          // 類型定義
lib/supabase.ts                       // 工具函式

// 目錄結構：功能模組化
components/
├── Market/           # 市場相關組件
│   ├── MarketHeatmap.tsx
│   └── index.ts
├── Screener/         # 選股相關組件
│   ├── FilterPanel.tsx
│   ├── ScreenerTable.tsx
│   └── index.ts
└── ui/               # 基礎 UI 組件
```

#### 3.2.2 自定義 Hook 模式

```typescript
// hooks/useMarketQuotes.ts
import useSWR, { mutate } from 'swr';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface MarketQuote {
  stock_code: string;
  name: string;
  price: number;
  change_percent: number;
  volume: number;
  updated_at: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * useMarketQuotes Hook
 * 結合 SWR (初始載入) 與 Supabase Realtime (即時推送)
 */
export function useMarketQuotes(symbols?: string[]) {
  const url = symbols 
    ? `/api/v1/market/quotes?symbols=${symbols.join(',')}` 
    : '/api/v1/market/quotes';

  const { data, error, isLoading } = useSWR<MarketQuote[]>(url, fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 600000,
  });

  useEffect(() => {
    const channel = supabase
      .channel('market-relay-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'market_quotes' },
        (payload) => {
          const updatedQuote = payload.new as MarketQuote;
          mutate(url, (currentData: MarketQuote[] | undefined) => {
            if (!currentData) return [updatedQuote];
            return currentData.map((item) =>
              item.stock_code === updatedQuote.stock_code ? updatedQuote : item
            );
          }, false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [url]);

  return {
    quotes: data || [],
    isLoading,
    isError: error,
  };
}
```

#### 3.2.3 組件撰寫規範

```typescript
// "use client" 標記客戶端組件
"use client";

import React, { useMemo } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { HeatmapNode } from '@/hooks/useHeatmap';

interface MarketHeatmapProps {
    data: HeatmapNode | null;
    height?: number;
}

/**
 * MarketHeatmap - 市場熱力圖組件
 * 使用 Recharts Treemap 呈現全市場漲跌強弱。
 */
export function MarketHeatmap({ data, height = 500 }: MarketHeatmapProps) {
    // 使用 useMemo 優化計算
    const flattenedData = useMemo(() => {
        if (!data || !data.children) return [];
        // 實作邏輯...
        return [];
    }, [data]);

    if (!data || flattenedData.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                <p>暫無熱力圖資料</p>
            </div>
        );
    }

    return (
        <div className="w-full rounded-xl overflow-hidden border border-white/10 bg-black/20 backdrop-blur-md">
            <ResponsiveContainer width="100%" height={height}>
                <Treemap
                    data={flattenedData}
                    dataKey="size"
                    content={<CustomContent />}
                >
                    <Tooltip content={<CustomTooltip />} />
                </Treemap>
            </ResponsiveContainer>
        </div>
    );
}
```

#### 3.2.4 Glassmorphism UI 風格

```typescript
// Tailwind CSS Glassmorphism 規範
// 基礎玻璃卡片
glass-card = "bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl"

// 發光效果
glow-critical = "shadow-red-500/50 pulse"
glow-warning = "shadow-yellow-500/50"

// 輸入框樣式
input = "px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/50"
```

#### 3.2.5 API 類型定義

```typescript
// types/api.ts
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  meta?: {
    page?: number;
    per_page?: number;
    total?: number;
    has_more?: boolean;
  };
  timestamp: string;
}

export interface MarketQuote {
  stock_code: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  updated_at: string;
  source: string;
}

export interface ScreenerFilters {
  price_range?: [number, number];
  change_range?: [number, number];
  ai_score_range?: [number, number];
  rsi_14_range?: [number, number];
}
```

### 3.3 資料庫設計規範

#### 3.3.1 表命名慣例

```sql
-- 主表：模組_功能
daily_price              -- 行情日 K 數據
stock_factors            -- 股票因子
market_quotes            -- 市場報價快照
market_alerts            -- 市場警示

-- 關聯表：主表_關聯表
user_portfolios          -- 用戶投資組合
user_holdings            -- 持倉記錄
user_watchlist           -- 自選股

-- 日誌/歷史表：模組_動作
api_keys                 -- API 金鑰配置（動態狀態）
```

#### 3.3.2 RLS 安全政策

```sql
-- user_portfolios：用戶只能存取自己的投資組合
ALTER TABLE user_portfolios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access own portfolios" 
ON user_portfolios FOR ALL 
USING (auth.uid() = user_id);

-- market_alerts：所有人可讀（警示是公開的）
CREATE POLICY "Public read alerts" ON market_alerts FOR SELECT USING (true);
CREATE POLICY "System insert alerts" ON market_alerts FOR INSERT WITH CHECK (true);

-- stock_financials：匿名可讀
CREATE POLICY "Anonymous read financials" ON stock_financials 
FOR SELECT USING (true);
```

#### 3.3.3 索引策略

```sql
-- 複合索引優化查詢
CREATE INDEX idx_daily_price_code_date 
ON daily_price(stock_code, trade_date DESC);

CREATE INDEX idx_alerts_stock_time 
ON market_alerts(stock_code, triggered_at DESC);

-- 部分索引優化
CREATE INDEX idx_alerts_unread 
ON market_alerts(is_read, triggered_at DESC) 
WHERE is_read = FALSE;
```

### 3.4 API 設計規範

#### 3.4.1 端點命名慣例

```yaml
# RESTful API 設計
GET    /api/v1/market/quotes              # 資源列表
GET    /api/v1/market/quotes/{symbol}     # 單一資源
POST   /api/v1/market/screen              # 複雜查詢/篩選
POST   /api/v1/market/heatmap             # 聚合查詢
POST   /api/v1/alerts/{id}/read           # 操作行為
PUT    /api/v1/alerts/preferences         # 更新資源
DELETE /api/v1/alerts/{id}                # 刪除資源
```

#### 3.4.2 Request/Response 格式

```json
// 成功回應
{
  "status": "success",
  "data": {
    "stock_code": "2330",
    "price": 1050.0
  },
  "meta": {
    "page": 1,
    "total": 100
  },
  "timestamp": "2026-02-03T10:00:00Z"
}

// 錯誤回應
{
  "status": "error",
  "error": {
    "code": "40001",
    "message": "Invalid parameter: stock_code",
    "details": {
      "stock_code": "Stock code not found"
    }
  },
  "timestamp": "2026-02-03T10:00:00Z"
}
```

---

## 四、工作流程與程序

### 4.1 開發流程

```
1. 需求分析
   ├── 閱讀 Phase 計畫文件 (doc/plans/)
   ├── 參考憲級文件 (doc/憲級文件/)
   └── 檢查 PCM 狀態 (doc/PCM/)

2. 規格設計
   ├── 撰寫/更新詳細實作計畫 (doc/plans/)
   ├── 定義 API 規格
   └── 設計資料庫 Schema

3. 實作
   ├── 後端：API → Service → Repository → Worker
   ├── 前端：Types → Hooks → Components → Pages
   └── 測試：單元測試 → 整合測試

4. 驗證
   ├── 本地 CI 驗證 (npm run test, pytest)
   ├── Lint 檢查 (npm run lint)
   ├── TypeScript 編譯 (tsc)
   └── 手動功能測試

5. 提交
   ├── git add .
   ├── git commit -m "feat: 新增功能描述"
   └── git push
```

### 4.2 本地開發環境啟動

```bash
# 1. 啟動後端服務
cd backend
python -m uvicorn main:app --reload --port 8000

# 2. 啟動前端服務 (新終端)
cd frontend
npm run dev

# 3. 啟動 Prefect 排程 (可選)
cd backend
python flows.py

# 4. 存取頁面
# 前端：http://localhost:3000
# API Docs：http://localhost:8000/docs
```

### 4.3 Docker 環境啟動

```bash
# 啟動所有服務
docker-compose up -d

# 查看服務狀態
docker-compose ps

# 查看日誌
docker-compose logs -f backend
docker-compose logs -f frontend

# 停止所有服務
docker-compose down
```

### 4.4 測試命令

```bash
# 前端測試
cd frontend
npm run test              # 執行 Jest 測試
npm run test:watch        # 監聽模式
npm run test:coverage     # 覆蓋率報告

# 後端測試
cd backend
pytest                    # 執行 pytest
pytest --cov             # 覆蓋率報告
pytest tests/ -v         # 詳細輸出

# Lint 檢查
cd frontend
npm run lint             # ESLint
npm run typecheck        # TypeScript

cd backend
ruff check .             # Python Lint
```

---

## 五、關鍵檔案指南

### 5.1 後端關鍵檔案

| 檔案 | 用途 | 維護時機 |
|:---|:---|:---|
| `backend/lib/supabase_client.py` | Supabase 客戶端單例 | 新增資料庫操作時 |
| `backend/lib/redis_client.py` | Redis 客戶端單例 | 新增快取/隊列時 |
| `backend/api/routers/market.py` | 市場行情 API | 新增行情端點時 |
| `backend/api/routers/screener.py` | 選股 API | 新增篩選功能時 |
| `backend/services/quota_service.py` | API 配額管理 | 調整配額邏輯時 |
| `backend/workers/market_relay_worker.py` | 行情中繼 Worker | 修改行情更新邏輯時 |
| `backend/flows.py` | Prefect 工作流 | 新增排程任務時 |
| `backend/db/repositories/screener_repo.py` | 選股資料倉儲 | 修改篩選查詢時 |

### 5.2 前端關鍵檔案

| 檔案 | 用途 | 維護時機 |
|:---|:---|:---|
| `frontend/hooks/useMarketQuotes.ts` | 行情 Hook | 修改行情交互時 |
| `frontend/hooks/useScreener.ts` | 選股 Hook | 修改篩選功能時 |
| `frontend/hooks/useHeatmap.ts` | 熱力圖 Hook | 修改熱力圖數據時 |
| `frontend/components/Market/MarketHeatmap.tsx` | 熱力圖組件 | 修改熱力圖 UI 時 |
| `frontend/components/Screener/FilterPanel.tsx` | 篩選面板組件 | 修改篩選 UI 時 |
| `frontend/types/api.ts` | API 類型定義 | 新增 API 回應時 |
| `frontend/lib/supabase.ts` | Supabase 配置 | 修改 Realtime 設定時 |

### 5.3 配置檔案

| 檔案 | 用途 |
|:---|:---|
| `.env` | 環境變數（API Key、資料庫連線） |
| `docker-compose.yml` | Docker 服務編排 |
| `frontend/tailwind.config.ts` | Tailwind 主題配置 |
| `frontend/tsconfig.json` | TypeScript 編譯配置 |
| `backend/requirements.txt` | Python 依賴 |
| `frontend/package.json` | Node 依賴 |

### 5.4 文件檔案

| 檔案 | 用途 |
|:---|:---|
| `doc/憲級文件/AI 投資分析儀 V10.0 完整規格書.md` | 系統完整規格 |
| `doc/開發文件/001_系統架構總覽與設計原則.md` | 架構設計原則 |
| `doc/PCM/0-0_V10.0_Phase_Control_Matrix.md` | 階段控制矩陣 |
| `doc/PCM/0-1_DEV_SUMMARY.md` | 開發摘要與待辦 |
| `doc/plans/*_Detailed_Plan.md` | 各階段詳細實作計畫 |

---

## 六、常见任務處理指南

### 6.1 新增 API 端點

```python
# 1. 在 backend/api/routers/ 新增或修改 router 檔案
from fastapi import APIRouter, HTTPException

router = APIRouter()

@router.get("/new-endpoint")
async def new_endpoint(param: str = Query(...)):
    """新端點說明"""
    try:
        # 實作邏輯
        return {"result": "success", "data": {}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

```typescript
// 2. 前端 hooks/useNewFeature.ts
import useSWR from 'swr';

export function useNewFeature(param: string) {
  const { data, error } = useSWR(
    `/api/v1/module/new-endpoint?param=${param}`,
    fetcher
  );
  return { data, error, isLoading: !data && !error };
}
```

### 6.2 新增資料庫表

```sql
-- 1. 建立 Migration 檔案 (backend/db/migrations/)
-- 命名格式：YYYYMMDD_XX_create_table_name.sql

CREATE TABLE IF NOT EXISTS example_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    value DECIMAL(18, 6),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 建立索引
CREATE INDEX idx_example_name ON example_table(name);

-- 3. 設定 RLS
ALTER TABLE example_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON example_table FOR SELECT USING (true);
```

### 6.3 新增排程任務

```python
# backend/flows.py

@task(name="Task Name", retries=2)
def task_function():
    """任務說明"""
    # 實作邏輯
    pass

@flow(name="Flow Name")
def main_flow():
    task_function()
    # 其他任務...
```

### 6.4 新增 Realtime 訂閱

```typescript
// frontend/hooks/useRealtimeSubscription.ts
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useRealtimeSubscription(table: string, callback: (payload: any) => void) {
  useEffect(() => {
    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, callback]);
}
```

### 6.5 新增警示規則

```python
# backend/services/alert_service.py

BUILTIN_ALERTS = {
    "new_alert_type": {
        "description": "新警示類型說明",
        "condition": {"field": "change_percent_5m", "operator": "gt", "value": 2.0},
        "levels": [
            {"min": 5.0, "level": "critical", "title": "嚴重"},
            {"min": 2.0, "level": "warning", "title": "警告"}
        ]
    }
}
```

---

## 七、故障排除指南

### 7.1 常見問題

| 問題 | 原因 | 解決方案 |
|:---|:---|:---|
| API 429 錯誤 | 超過 API 配額 | 檢查 quota_service，使用輪詢策略 |
| Supabase 連線失敗 | 環境變數未設定 | 檢查 .env 中的 SUPABASE_URL/KEY |
| 前端構建失敗 | 類型錯誤 | 執行 `npm run typecheck` 定位 |
| Redis 連線失敗 | Redis 未啟動 | 確認 Docker 服務運行 |
| CORS 錯誤 | 跨域設定 | 檢查 Kong/Nginx 設定 |

### 7.2 開發環境除錯

```bash
# 檢查環境變數
cd backend
python -c "import os; print(os.environ.get('SUPABASE_URL'))"

# 測試 Supabase 連線
cd backend
python -c "from backend.lib.supabase_client import get_supabase; s = get_supabase(); print(s.table('stocks').select('count').execute())"

# 測試 Redis 連線
cd backend
python -c "from backend.lib.redis_client import get_redis; r = get_redis(); print(r.ping())"
```

### 7.3 日誌查看

```bash
# 後端日誌
docker-compose logs -f backend

# 前端日誌
docker-compose logs -f frontend

# PostgreSQL 日誌
docker-compose logs -f db

# 即時監控 ( Prefect Dashboard )
# 存取 http://localhost:4200
```

---

## 八、參考資源

### 8.1 內部文件

| 文件 | 路徑 |
|:---|:---|
| 完整規格書 | `doc/憲級文件/AI 投資分析儀 V10.0 完整規格書.md` |
| 架構設計原則 | `doc/開發文件/001_系統架構總覽與設計原則.md` |
| Phase 控制矩陣 | `doc/PCM/0-0_V10.0_Phase_Control_Matrix.md` |
| 開發摘要 | `doc/PCM/0-1_DEV_SUMMARY.md` |

### 8.2 外部資源

| 資源 | URL |
|:---|:---|
| Next.js 文檔 | https://nextjs.org/docs |
| FastAPI 文檔 | https://fastapi.tiangolo.com |
| Supabase 文檔 | https://supabase.com/docs |
| Prefect 文檔 | https://docs.prefect.io |
| Tailwind CSS | https://tailwindcss.com/docs |
| Recharts | https://recharts.org |
| TradingView Lightweight Charts | https://github.com/tradingview/lightweight-charts |

---

## 九、AGENTS.md 維護指南

### 9.1 更新時機

當發生以下情況時，應更新本文件：

1. **新技術引入**：新增技術棧、框架或工具
2. **架構變更**：系統架構重大調整
3. **慣例更新**：開發規範或命名慣例變更
4. **流程調整**：開發流程或工作流程變更
5. **關鍵檔案變更**：新增或移除關鍵檔案

### 9.2 更新頻率

- **季度審核**：每季檢視文件準確性
- **Phase 切換**：新 Phase 開始時更新當前狀態
- **重大變更**：架構或慣例變更時即時更新

---

**文件結束**
*文件編號：DOC-V10.0-AGENTS*
*版本：1.0.0*
*建立日期：2026-02-03*
*最後更新：2026-02-03*
