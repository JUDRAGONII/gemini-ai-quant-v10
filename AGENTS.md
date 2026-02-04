# AI 投資分析儀 V10.0 - 開發指南

**用途**：提供 AI 代理的專案上下文與開發規範

---

## 專案概覽

- **後端**：FastAPI + Python 3.11 + Prefect + Supabase SDK + Redis
- **前端**：Next.js 14 + TypeScript + Tailwind CSS + Recharts + SWR
- **資料庫**：PostgreSQL 15 (含 pgvector) + RLS 安全政策
- **當前任務**：Phase 9.5 - 市場異動警示引擎

---

## 開發命令

### 前端
```bash
cd frontend
npm run dev              # 啟動開發伺服器 (Port 3000)
npm run test             # 執行 Jest 測試
npm run test -- --testNamePattern="testName"  # 單一測試
npm run test -- --coverage              # 覆蓋率報告
npm run lint                            # ESLint 檢查
npm run typecheck                       # TypeScript 編譯檢查
npm run build                           # 生產建置
```

### 後端
```bash
cd backend
python -m uvicorn main:app --reload --port 8000  # 啟動 API 伺服器
pytest                           # 執行 pytest
pytest tests/test_file.py::TestClass::test_method  # 單一測試
pytest --cov --cov-report=html    # 覆蓋率報告
ruff check .                      # Python Lint
```

### Docker
```bash
docker-compose up -d    # 啟動所有服務
docker-compose ps       # 查看服務狀態
docker-compose logs -f backend  # 查看後端日誌
docker-compose down     # 停止所有服務
```

---

## 程式碼規範

### Python (後端)

**命名慣例**：
- 檔案/函式：`snake_case`
- 類別：`PascalCase`
- 常數：`UPPER_SNAKE_CASE`
- Redis Key 前綴：`MODULE:key_name` 格式

**匯入順序**：
```python
# 標準庫 → 第三方 → 本地模組 (使用 backend. 前綴)
from fastapi import APIRouter, HTTPException
from typing import List, Optional, Dict, Any
from backend.lib.supabase_client import get_supabase
```

**API Router 模式**：
```python
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional

router = APIRouter()
supabase = get_supabase()

class RequestModel(BaseModel):
    param: Optional[str] = "default"

@router.get("/endpoint")
async def handler(param: str = Query(...)):
    """端點說明"""
    try:
        return {"data": {}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

**錯誤處理**：所有 API 端點需使用 try/except 包裝，拋出 HTTPException

---

### TypeScript (前端)

**命名慣例**：
- 組件/類型：`PascalCase`
- 檔案/函式/變數：`camelCase`
- Hooks：以 `use` 開頭

**檔案結構**：
```
components/Feature/          # 功能模組化
├── ComponentName.tsx
└── index.ts
hooks/useFeature.ts          # 自定義 Hook
types/api.ts                 # API 類型定義
```

**組件規範**：
```typescript
"use client";  // 客戶端組件需標記

import { useMemo } from 'react';
import { Component } from 'lib/component';

interface Props {
  data: Type | null;
  height?: number;
}

export function ComponentName({ data, height = 500 }: Props) {
  const computed = useMemo(() => {
    if (!data) return [];
    return transform(data);
  }, [data]);

  return <div>{/* JSX */}</div>;
}
```

**API 類型定義**：
```typescript
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  meta?: { page?: number; total?: number };
  timestamp: string;
}
```

---

## API 設計規範

- 端點：`/api/v1/{module}/{resource}`
- 回應格式：`{"status": "success", "data": {...}, "timestamp": "..."}`
- 錯誤格式：`{"status": "error", "error": {"code": "...", "message": "..."}}`

---

## 資料庫規範

- 表名：`模組_功能` (snake_case)
- 主鍵：使用 `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- RLS：所有表需啟用 Row Level Security
- 索引：針對常用查詢建立複合索引

---

## 關鍵檔案

| 檔案 | 用途 |
|:---|:---|
| `backend/api/routers/*.py` | API 路由 |
| `backend/services/*.py` | 業務邏輯服務 |
| `backend/workers/*.py` | 背景 Worker |
| `frontend/hooks/*.ts` | 自定義 Hooks |
| `frontend/components/*/` | React 組件 |

---

## 參考文件

- 完整規格：`doc/憲級文件/AI 投資分析儀 V10.0 完整規格書.md`
- 架構設計：`doc/開發文件/001_系統架構總覽與設計原則.md`
- Phase 控制：`doc/PCM/0-0_V10.0_Phase_Control_Matrix.md`
