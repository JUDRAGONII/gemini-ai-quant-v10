# Phase 9.4：API 配額管理與金鑰健康監控詳細實作計畫

**計畫編號**：038
**版本**：2.0.0
**最後更新**：2026-02-03
**所屬階段**：Phase 9.4 (Quota Management)
**狀態**：執行中 (Execution)

---

## 🧠 一、深度思考分析 (Thinking Phase)

### 1.1 需求解構
> **目標**：建立 API 金鑰配額監控系統，防止免費層級 API 被封禁，並提供視覺化的健康狀態儀表板。

### 1.2 底層分析 (First Principles)
| 問題 | 分析 |
|:---|:---|
| **核心痛點** | Tiingo/Fugle 免費層有嚴格的日請求限制，超限會導致 429 錯誤或暫時封禁 |
| **數據來源** | 需追蹤每個 API Key 的使用次數、最後使用時間、冷卻狀態 |
| **存儲選擇** | Redis (高頻讀寫) vs PostgreSQL (持久化) |
| **前端需求** | 管理員需即時查看金鑰健康狀態並手動重置 |

### 1.3 方案對比
| 方案 | 優點 | 缺點 | 推薦度 |
|:---|:---|:---|:---:|
| **A: Redis + PostgreSQL 混合** | Redis 高頻計數 + PG 歷史追蹤 | 架構複雜、需同步 | ⭐⭐⭐⭐⭐ |
| **B: 純 PostgreSQL** | 簡單、持久化、易查詢 | 高頻寫入效能較差 | ⭐⭐⭐ |
| **C: 純 Redis** | 極高效能 | 重啟遺失數據、查詢不便 | ⭐⭐ |

**決策**：採用 **方案 A (Redis + PostgreSQL 混合)**，依循開發文件架構規範：
- **Redis**：高頻計數器 (`requests_today`, `error_count`)、冷卻狀態標記
- **PostgreSQL**：金鑰元資料、歷史記錄持久化

---

## 🎯 二、核心目標
1. **資料庫表格** (`api_keys`)：儲存金鑰元資料與即時狀態。
2. **配額服務** (`QuotaService`)：追蹤使用量、判斷健康狀態、執行冷卻。
3. **API 端點** (`/api/v1/admin/quota`)：查詢與管理金鑰。
4. **管理儀表板** (`/admin/quota`)：視覺化金鑰健康狀態。

---

## 📐 三、技術規格 (SDD Spec)

### 3.1 資料庫 Schema
```sql
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL,                    -- tiingo, fugle, gemini
    key_name TEXT NOT NULL,                    -- 用戶友善名稱
    api_key TEXT NOT NULL,                     -- 加密存儲
    daily_limit INT DEFAULT 500,               -- 每日配額上限
    requests_today INT DEFAULT 0,              -- 今日已使用
    last_reset_date DATE DEFAULT CURRENT_DATE, -- 上次重置日期
    status TEXT DEFAULT 'active',              -- active, cooling, disabled
    cooldown_until TIMESTAMPTZ,                -- 冷卻結束時間
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 API 規格
```
GET  /api/v1/admin/quota        → 獲取所有金鑰狀態
POST /api/v1/admin/quota/reset  → 手動重置指定金鑰的冷卻
```

### 3.3 前端組件
- `hooks/useQuotaStatus.ts`：SWR 數據抓取 Hook。
- `components/Admin/QuotaDashboard.tsx`：金鑰健康儀表板。
- `app/admin/quota/page.tsx`：管理後台路由。

---

## 🎨 四、UI/UX 規範 (Rich Aesthetics)
- **健康指示燈**：綠色 (> 50%)、黃色 (20-50%)、紅色 (< 20% 或 cooling)
- **進度條**：顯示今日使用 / 每日上限百分比
- **Glassmorphism 卡片**：每個 API 提供者一張卡片
- **刷新動畫**：手動刷新時的旋轉圖標

---

## ✅ 五、驗收標準
- [ ] 資料庫表格已建立並可查詢
- [ ] API 返回正確的金鑰狀態
- [ ] 前端頁面正確渲染健康儀表板
- [ ] 使用量追蹤正確 (每次 API 呼叫後遞增)
- [ ] 冷卻機制正常運作

---

**文件結束**
*計畫編號：038 | 版本 2.0.0*

