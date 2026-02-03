# Phase 9.5：市場異動警示與通知引擎詳細實作計畫

**計畫編號**：039
**版本**：2.0.0
**建立日期**：2026-02-03
**最後更新**：2026-02-03
**所屬階段**：Phase 9.5 (Alert Engine)
**狀態**：規劃中 (Planning)
**關聯任務**：T-AI-011

---

## 🧠 一、深度思考分析 (Thinking Phase)

### 1.1 需求解構
> **目標**：建立高性能的異動掃描引擎，在行情回補後自動匹配特定條件（如爆量、急拉、AI 預測轉向），並透過 Supabase Realtime 即時推送通知至前端。

### 1.2 底層分析 (First Principles)
| 問題 | 分析 |
|:---|:---|
| **觸發時機** | 需與 Phase 9.2 `QuotaRelayWorker` 解耦，採用 Pub/Sub 模式 |
| **掃描範圍** | 全市場 1,800+ 標的，需控制在 500ms 內完成 |
| **防抖策略** | 同一標的 5 分鐘內不重複警示，採 Redis Set 追蹤 |
| **即時推送** | 依循 Phase 9.2 既有 Realtime 架構，避免額外 WebSocket 伺服器 |
| **存儲選擇** | PostgreSQL (持久化) + Redis (高頻去重計數) |

### 1.3 架構定位
```
┌─────────────────────────────────────────────────────────────────────┐
│                     Phase 9.5 Alert Engine                           │
├─────────────────────────────────────────────────────────────────────┤
│  Trigger: QuotaRelayWorker 完成一組標的更新後發布 Redis Channel      │
│  Scan:   AlertScanner 訂閱 Channel 並執行多維度條件匹配              │
│  Store:  警示寫入 market_alerts 表 (PostgreSQL)                     │
│  Notify: Supabase Realtime 推送至前端 AlertToast                    │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.4 與現有 Phase 整合
- **Phase 9.2 (Relay)**：提供行情快照數據來源
- **Phase 9.4 (Quota)**：監控 API 配額，避免警示掃描佔用配額
- **Phase 9.1 (Screener)**：可將警示結果匯入選股器

---

## 🎯 二、核心目標

### 2.1 功能目標
1. **多維度警示掃描**：價格、成交量、AI 評分突變
2. **防抖去重機制**：避免同一事件重複觸發
3. **即時推送整合**：依循 Supabase Realtime 架構
4. **使用者偏好**：支援自訂警示規則閾值
5. **歷史回溯**：查詢歷史警示紀錄

### 2.2 非功能目標
| 指標 | 目標值 | 測量方式 |
|:---|:---|:---|
| 掃描延遲 | < 500ms | Redis Channel 觸發至警示寫入 |
| 推送延遲 | < 100ms | PostgreSQL WAL 至前端 Toast |
| 去重準確率 | 100% | Redis Set 比對 |
| 記憶體佔用 | < 100MB | Redis 監控 |

---

## 📐 三、技術規格 (SDD Spec)

### 3.1 資料庫 Schema (PostgreSQL)
```sql
-- 市場警示主表
CREATE TABLE IF NOT EXISTS market_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 標的識別
    stock_code VARCHAR(20) NOT NULL,
    stock_name VARCHAR(100),
    market_type VARCHAR(10) NOT NULL,
    
    -- 警示內容
    alert_type VARCHAR(50) NOT NULL,          -- price_surge, volume_surge, ai_score_change
    alert_level VARCHAR(20) NOT NULL,         -- info, warning, critical
    alert_title VARCHAR(200) NOT NULL,
    alert_description TEXT,
    
    -- 觸發數值
    trigger_value DECIMAL(18, 6),             -- 觸發時的數值
    threshold_value DECIMAL(18, 6),           -- 警示閾值
    change_percent DECIMAL(8, 4),             -- 漲跌幅
    
    -- 時間戳
    triggered_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ,                   -- 過期時間 (防抖窗口)
    
    -- 狀態
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    is_dismissed BOOLEAN DEFAULT FALSE,
    
    -- 元數據
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 警示規則配置表
CREATE TABLE IF NOT EXISTS alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 規則識別
    rule_name VARCHAR(100) NOT NULL UNIQUE,
    rule_type VARCHAR(50) NOT NULL,           -- price, volume, ai, composite
    is_active BOOLEAN DEFAULT TRUE,
    
    -- 條件設定
    condition_expr JSONB NOT NULL,            -- JSON 格式條件表達式
    -- 例如: {"field": "change_percent_5m", "operator": "gt", "value": 2.0}
    
    -- 等級判定
    level_expr JSONB,                         -- 等級判定條件
    -- 例如: {"field": "change_percent_5m", "ranges": [{"min": 5, "level": "critical"}, {"min": 2, "level": "warning"}]}
    
    -- 系統預設規則
    is_system_default BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 使用者自訂警示偏好
CREATE TABLE IF NOT EXISTS user_alert_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- 偏好設定
    enable_push BOOLEAN DEFAULT TRUE,
    enable_email BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    
    -- 自訂閾值 (覆蓋系統預設)
    custom_rules JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- 索引優化
CREATE INDEX idx_alerts_stock_time ON market_alerts(stock_code, triggered_at DESC);
CREATE INDEX idx_alerts_type ON market_alerts(alert_type, triggered_at DESC);
CREATE INDEX idx_alerts_unread ON market_alerts(is_read, triggered_at DESC) WHERE is_read = FALSE;
CREATE INDEX idx_alerts_user ON market_alerts(user_id, triggered_at DESC);  -- 若實作用戶隔離
CREATE INDEX idx_rules_active ON alert_rules(rule_type, is_active);

-- RLS 安全政策
ALTER TABLE market_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_alert_preferences ENABLE ROW LEVEL SECURITY;

-- market_alerts: 所有人可讀，service_role 可寫
CREATE POLICY "Public read alerts" ON market_alerts FOR SELECT USING (true);
CREATE POLICY "System insert alerts" ON market_alerts FOR INSERT WITH CHECK (true);

-- alert_rules: 所有人可讀系統預設
CREATE POLICY "Read system rules" ON alert_rules FOR SELECT USING (is_system_default = true OR auth.uid() IN (SELECT id FROM auth.users WHERE email = 'admin'));
```

### 3.2 Redis 數據結構
```python
# Redis Key 命名規範
REDIS_KEY_PREFIX = "alert"

# 警示去重 Set (5 分鐘防抖窗口)
ALERT_DEDUP_KEY = f"{REDIS_KEY_PREFIX}:dedup"  # Set: stock_code:alert_type

# 警示計數 (速率限制)
ALERT_RATE_KEY = f"{REDIS_KEY_PREFIX}:rate"    # Hash: alert_type -> count

# 當前警示狀態 (供前端查詢)
ALERT_STATE_KEY = f"{REDIS_KEY_PREFIX}:state"  # Hash: stock_code -> latest_alert_json

# 警示規則快取
ALERT_RULES_KEY = f"{REDIS_KEY_PREFIX}:rules"  # JSON: 序列化後的規則
```

### 3.3 警示條件定義
```python
# 內建警示規則配置
BUILTIN_ALERTS = {
    "price_surge_5m": {
        "description": "5 分鐘內價格急拉",
        "condition": {"field": "change_percent_5m", "operator": "gt", "value": 2.0},
        "levels": [
            {"min": 5.0, "level": "critical", "title": "價格飆漲"},
            {"min": 3.0, "level": "warning", "title": "價格異動"},
            {"min": 2.0, "level": "info", "title": "價格微漲"}
        ]
    },
    "volume_surge": {
        "description": "成交量急劇放大",
        "condition": {"field": "volume_ratio", "operator": "gt", "value": 2.0},
        "levels": [
            {"min": 5.0, "level": "critical", "title": "爆量"},
            {"min": 3.0, "level": "warning", "title": "大量"},
            {"min": 2.0, "level": "info", "title": "量能增加"}
        ]
    },
    "ai_score_change": {
        "description": "AI 評分突變",
        "condition": {"field": "ai_score_change", "operator": "abs_gt", "value": 20},
        "levels": [
            {"min": 30, "level": "critical", "title": "AI 訊號劇變"},
            {"min": 20, "level": "warning", "title": "AI 訊號改變"}
        ]
    },
    "price_drop_5m": {
        "description": "5 分鐘內價格急跌",
        "condition": {"field": "change_percent_5m", "operator": "lt", "value": -2.0},
        "levels": [
            {"min": -5.0, "level": "critical", "title": "價格暴跌"},
            {"min": -3.0, "level": "warning", "title": "價格重挫"},
            {"min": -2.0, "level": "info", "title": "價格下跌"}
        ]
    }
}
```

---

## 🔌 四、API 規格定義 (API Spec)

### 4.1 RESTful API
```yaml
# 警示相關端點

GET /api/v1/alerts
  Description: 獲取警示列表
  Query Parameters:
    - page: int (default: 1)
    - page_size: int (default: 20, max: 100)
    - alert_type: string (optional)
    - is_read: boolean (optional)
    - since: ISO8601 datetime (optional)
  Response:
    {
      "status": "success",
      "data": [...],
      "meta": {"page": 1, "total": 150}
    }

GET /api/v1/alerts/{id}
  Description: 獲取單一警示詳情
  Response:
    {
      "status": "success",
      "data": {...}
    }

POST /api/v1/alerts/{id}/read
  Description: 標記警示為已讀
  Response: {"status": "success"}

POST /api/v1/alerts/read-all
  Description: 標記所有警示為已讀
  Response: {"status": "success"}

DELETE /api/v1/alerts/{id}
  Description: 刪除警示
  Response: {"status": "success"}

GET /api/v1/alerts/count
  Description: 獲取未讀警示數量
  Response:
    {
      "status": "success",
      "data": {
        "total": 15,
        "by_type": {"price_surge_5m": 5, "volume_surge": 10}
      }
    }

GET /api/v1/alerts/rules
  Description: 獲取可用警示規則 (系統預設)
  Response:
    {
      "status": "success",
      "data": [...]
    }

PUT /api/v1/alerts/preferences
  Description: 更新使用者警示偏好
  Request Body: {...}
  Response: {"status": "success"}
```

### 4.2 Supabase Realtime Events
```typescript
// 訂閱警示事件
const alertChannel = supabase
  .channel('market_alerts')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'market_alerts'
    },
    (payload) => {
      // 新警示觸發前端 Toast
      showAlertToast(payload.new);
    }
  )
  .subscribe();
```

---

## 🎨 五、前端組件設計 (UI/UX Pro Max)

### 5.1 組件架構
```
frontend/
├── hooks/
│   └── useAlerts.ts          # 警示數據 Hook (含 Realtime)
├── components/
│   └── Market/
│       ├── AlertToast.tsx    # 彈出式警示通知
│       ├── AlertPanel.tsx    # 警示面板 (側邊欄)
│       ├── AlertList.tsx     # 警示列表
│       ├── AlertItem.tsx     # 單一警示項目
│       └── AlertBadge.tsx    # 未讀數量徽章
├── types/
│   └── alert.ts              # 類型定義
└── app/
    └── alerts/
        └── page.tsx          # 獨立警示頁面
```

### 5.2 AlertToast 組件規格
```typescript
interface AlertToastProps {
  alert: MarketAlert;
  onDismiss?: () => void;
  onViewDetails?: () => void;
  duration?: number;  // 自動關閉時間 (ms)
}

function AlertToast({ alert, onDismiss, onViewDetails, duration = 8000 }: AlertToastProps) {
  // 依 alert_level 顯示不同發光色
  const glowColors = {
    critical: 'shadow-red-500/50',
    warning: 'shadow-yellow-500/50',
    info: 'shadow-blue-500/50'
  };
  
  return (
    <Toast.Root className={`glass-card ${glowColors[alert.alert_level]} animate-glow`}>
      <Toast.Title>{alert.alert_title}</Toast.Title>
      <Toast.Description>{alert.alert_description}</Toast.Description>
      <Toast.Action onClick={onViewDetails}>查看詳情</Toast.Action>
      <Toast.Close onClick={onDismiss}>✕</Toast.Close>
    </Toast.Root>
  );
}
```

### 5.3 useAlerts Hook
```typescript
function useAlerts() {
  // 1. 初始數據載入
  const { data, error, mutate } = useSWR('/api/v1/alerts', fetcher);
  
  // 2. Realtime 訂閱
  useEffect(() => {
    const channel = supabase
      .channel('market_alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'market_alerts' }, (payload) => {
        // 新警示加入列表頂部
        mutate((current) => [payload.new, ...(current || [])], false);
        // 觸發 Toast
        showAlertToast(payload.new);
      })
      .subscribe();
    
    return () => { supabase.removeChannel(channel); };
  }, [mutate]);
  
  // 3. 標記已讀
  const markAsRead = async (alertId: string) => {
    await fetch(`/api/v1/alerts/${alertId}/read`, { method: 'POST' });
    mutate();
  };
  
  return { alerts: data, error, markAsRead, markAllAsRead: ... };
}
```

### 5.4 UI/UX 規範 (Rich Aesthetics)
- **發光特效**：critical 級別使用紅色脈衝光暈
- **動畫過渡**：警示彈出時採用 slide-in + scale 動畫
- **Glassmorphism**：所有警示卡片使用毛玻璃效果
- **音效提示**：可選的提示音 (需使用者授權)
- **視覺層級**：
  ```
  Critical (最高) → 紅色 + 閃爍 + 音效
  Warning → 黃色 + 放大
  Info (最低) → 藍色 + 淡入
  ```

---

## 🛠️ 六、後端服務實作 (Backend Implementation)

### 6.1 服務架構
```python
# backend/services/alert_service.py

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from backend.lib.redis_client import get_redis
from backend.lib.supabase_client import get_supabase

logger = logging.getLogger(__name__)

# Redis Key 定義
REDIS_KEY_PREFIX = "alert"
ALERT_DEDUP_KEY = f"{REDIS_KEY_PREFIX}:dedup"
ALERT_RATE_KEY = f"{REDIS_KEY_PREFIX}:rate"
ALERT_STATE_KEY = f"{REDIS_KEY_PREFIX}:state"
ALERT_CHANNEL = "market:alerts"

# 防抖窗口 (分鐘)
DEBOUNCE_WINDOW = 5


class AlertService:
    """
    市場警示服務 (Redis + PostgreSQL 混合架構)。
    - Redis: 高頻去重、速率限制、狀態快取
    - PostgreSQL: 警示持久化、歷史查詢
    """
    
    def __init__(self, supabase_client=None, redis_client=None):
        self.supabase = supabase_client or get_supabase()
        self.redis = redis_client or get_redis()
        
        # 內建警示規則 (可從 DB 動態載入)
        self.builtin_rules = BUILTIN_ALERTS
    
    async def scan_and_alert(self, quotes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        掃描行情並產生警示。
        由 QuotaRelayWorker 觸發，傳入更新後的行情快照。
        """
        alerts = []
        
        for quote in quotes:
            stock_code = quote.get("stock_code")
            for rule_key, rule_config in self.builtin_rules.items():
                try:
                    # 1. 防抖檢查
                    dedup_key = f"{stock_code}:{rule_key}"
                    if self.redis and self.redis.sismember(ALERT_DEDUP_KEY, dedup_key):
                        continue  # 已在防抖窗口內
                    
                    # 2. 條件匹配
                    condition = rule_config["condition"]
                    if self._evaluate_condition(quote, condition):
                        # 3. 等級判定
                        level_info = self._evaluate_level(quote, rule_config.get("levels", []))
                        
                        # 4. 產生警示
                        alert = await self._create_alert(
                            stock_code=stock_code,
                            quote=quote,
                            rule_key=rule_key,
                            rule_config=rule_config,
                            level_info=level_info
                        )
                        alerts.append(alert)
                        
                        # 5. 設定防抖
                        if self.redis:
                            self.redis.sadd(ALERT_DEDUP_KEY, dedup_key)
                            self.redis.expire(ALERT_DEDUP_KEY, DEBOUNCE_WINDOW * 60)
                        
                except Exception as e:
                    logger.error(f"Alert scan error for {stock_code}: {e}")
        
        # 6. 批量寫入資料庫
        if alerts:
            await self._batch_insert_alerts(alerts)
        
        return alerts
    
    def _evaluate_condition(self, data: Dict[str, Any], condition: Dict[str, Any]) -> bool:
        """評估單一條件是否成立。"""
        field = condition.get("field")
        operator = condition.get("operator")
        value = condition.get("value")
        
        field_value = data.get(field)
        if field_value is None:
            return False
        
        if operator == "gt":
            return float(field_value) > float(value)
        elif operator == "lt":
            return float(field_value) < float(value)
        elif operator == "gte":
            return float(field_value) >= float(value)
        elif operator == "lte":
            return float(field_value) <= float(value)
        elif operator == "abs_gt":
            return abs(float(field_value)) > float(value)
        
        return False
    
    def _evaluate_level(self, data: Dict[str, Any], levels: List[Dict[str, Any]]) -> Dict[str, Any]:
        """評估警示等級。"""
        for level_config in sorted(levels, key=lambda x: x.get("min", 0), reverse=True):
            field = level_config.get("field", "change_percent")
            threshold = level_config.get("min", 0)
            if abs(data.get(field, 0)) >= threshold:
                return {
                    "level": level_config["level"],
                    "title": level_config["title"]
                }
        return {"level": "info", "title": "通知"}
    
    async def _create_alert(self, stock_code: str, quote: Dict[str, Any],
                           rule_key: str, rule_config: Dict[str, Any],
                           level_info: Dict[str, Any]) -> Dict[str, Any]:
        """建立警示資料物件。"""
        condition = rule_config["condition"]
        
        return {
            "stock_code": stock_code,
            "stock_name": quote.get("stock_name") or quote.get("name"),
            "market_type": quote.get("market_type", "TWSE"),
            "alert_type": rule_key,
            "alert_level": level_info["level"],
            "alert_title": level_info["title"],
            "alert_description": f"{stock_code} 在 {condition['field']} 達到 {quote.get(condition['field'])} (閾值: {condition['value']})",
            "trigger_value": quote.get(condition["field"]),
            "threshold_value": condition["value"],
            "change_percent": quote.get("change_percent"),
            "triggered_at": datetime.utcnow().isoformat(),
            "expires_at": (datetime.utcnow() + timedelta(minutes=DEBOUNCE_WINDOW)).isoformat(),
            "metadata": json.dumps({"rule_key": rule_key, "quote": quote})
        }
    
    async def _batch_insert_alerts(self, alerts: List[Dict[str, Any]]) -> None:
        """批量寫入警示至 PostgreSQL。"""
        try:
            response = self.supabase.table("market_alerts").insert(alerts).execute()
            logger.info(f"Batch inserted {len(alerts)} alerts")
            return response
        except Exception as e:
            logger.error(f"Failed to insert alerts: {e}")
    
    async def get_recent_alerts(self, limit: int = 50, alert_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """獲取最近警示。"""
        try:
            query = self.supabase.table("market_alerts") \
                .select("*") \
                .order("triggered_at", desc=True) \
                .limit(limit)
            
            if alert_type:
                query = query.eq("alert_type", alert_type)
            
            response = query.execute()
            return response.data
        except Exception as e:
            logger.error(f"Failed to get alerts: {e}")
            return []
    
    async def mark_as_read(self, alert_id: str) -> bool:
        """標記警示為已讀。"""
        try:
            self.supabase.table("market_alerts") \
                .update({
                    "is_read": True,
                    "read_at": datetime.utcnow().isoformat()
                }) \
                .eq("id", alert_id) \
                .execute()
            return True
        except Exception as e:
            logger.error(f"Failed to mark alert as read: {e}")
            return False
```

### 6.2 警示掃描 Worker
```python
# backend/workers/alert_scanner_worker.py

"""
AlertScannerWorker - 訂閱行情更新並執行警示掃描。
由 Prefect 管理生命週期。
"""

import asyncio
import logging
from backend.services.alert_service import AlertService
from backend.lib.redis_client import get_redis

logger = logging.getLogger(__name__)

class AlertScannerWorker:
    def __init__(self):
        self.alert_service = AlertService()
        self.redis = get_redis()
        self.running = False
    
    async def start(self):
        """啟動 Worker，訂閱 Redis Channel。"""
        self.running = True
        logger.info("AlertScannerWorker started")
        
        # 訂閱行情更新 channel
        pubsub = self.redis.pubsub()
        await pubsub.subscribe("market:quotes_updated")
        
        async for message in pubsub.listen():
            if not self.running:
                break
            
            if message["type"] == "message":
                try:
                    # 解析行情數據
                    import json
                    data = json.loads(message["data"])
                    quotes = data.get("quotes", [])
                    
                    # 執行警示掃描
                    alerts = await self.alert_service.scan_and_alert(quotes)
                    if alerts:
                        logger.info(f"Generated {len(alerts)} alerts")
                        
                except Exception as e:
                    logger.error(f"Alert scan error: {e}")
    
    async def stop(self):
        """停止 Worker。"""
        self.running = False
        logger.info("AlertScannerWorker stopped")


# Prefect Flow 註冊
from prefect import flow

@flow(name="AlertScanFlow")
def alert_scan_flow(quotes: list):
    service = AlertService()
    return asyncio.run(service.scan_and_alert(quotes))
```

---

## 📊 七、執行步驟 (Action Plan)

### Phase 9.5.1：資料庫與基礎設施 (Day 1-2)
1. [ ] 建立 `market_alerts`、`alert_rules`、`user_alert_preferences` 表
2. [ ] 設定 RLS 安全政策
3. [ ] 建立資料庫索引
4. [ ] 啟用 Supabase Realtime (postgres_changes INSERT)

### Phase 9.5.2：後端服務實作 (Day 3-5)
1. [ ] 實作 `AlertService` 類別
2. [ ] 實作 `_evaluate_condition` 與 `_evaluate_level` 邏輯
3. [ ] 實作 Redis 去重機制
4. [ ] 實作 `_batch_insert_alerts` 批量寫入
5. [ ] 建立 `/api/v1/alerts` API 端點
6. [ ] 實作 `AlertScannerWorker` 訂閱模式

### Phase 9.5.3：前端整合 (Day 6-8)
1. [ ] 建立 `frontend/types/alert.ts` 類型定義
2. [ ] 實作 `useAlerts` Hook (含 Realtime)
3. [ ] 實作 `AlertToast.tsx` 組件
4. [ ] 實作 `AlertPanel.tsx` 側邊欄面板
5. [ ] 整合至 Dashboard (右上角鈴鐺圖標)
6. [ ] 添加發光動畫與音效 (可選)

### Phase 9.5.4：測試與優化 (Day 9-10)
1. [ ] 單元測試：`AlertService` 條件評估邏輯
2. [ ] 整合測試：Realtime 推送端到端
3. [ ] 效能測試：1000+ 標的掃描延遲
4. [ ] UI 驗證：多螢幕尺寸響應式
5. [ ] 文件更新：API 端點文件

---

## 🎨 八、UI/UX 規範 (Rich Aesthetics)

### 8.1 視覺層級
| 等級 | 顏色 | 發光 | 音效 | 動畫 |
|:---|:---|:---|:---|:---|
| **Critical** | `#ef4444` (紅) | `shadow-red-500/50` pulse | 🔔 必要 | Shake + Scale |
| **Warning** | `#f59e0b` (黃) | `shadow-yellow-500/50` | 🔕 可選 | Slide In |
| **Info** | `#3b82f6` (藍) | `shadow-blue-500/30` | 🔕 可選 | Fade In |

### 8.2 Glassmorphism 樣式
```css
.glass-alert {
  @apply bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl;
}

.glow-critical {
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.5), 0 0 40px rgba(239, 68, 68, 0.3);
}

.glow-warning {
  box-shadow: 0 0 15px rgba(245, 158, 11, 0.4), 0 0 30px rgba(245, 158, 11, 0.2);
}
```

### 8.3 動畫過渡
```css
@keyframes alert-pop {
  0% { transform: scale(0.9); opacity: 0; }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}

.animate-alert-pop {
  animation: alert-pop 0.3s ease-out;
}
```

---

## ✅ 九、驗收標準 (Acceptance Criteria)

### 功能驗證
- [ ] 行情更新後 5 秒內產生對應警示
- [ ] 相同標的 5 分鐘內不重複警示
- [ ] Toast 彈出並帶有正確發光色
- [ ] 警示可標記為已讀/刪除
- [ ] 未讀數量即時更新

### 效能驗證
- [ ] 1000 標的掃描延遲 < 500ms
- [ ] Realtime 推送延遲 < 100ms
- [ ] API 回應時間 < 100ms
- [ ] Redis 記憶體 < 50MB

### 整合驗證
- [ ] 依循 `QuotaService` 模式
- [ ] 依循 `market.py` Router 風格
- [ ] 使用 `supabase.channel().on('postgres_changes', ...)`
- [ ] 前端使用 SWR + Realtime 混合模式

### UI/UX 驗證
- [ ] Glassmorphism 風格一致
- [ ] 動畫流暢無卡頓
- [ ] 響應式佈局正確
- [ ] 發光效果不影響效能

---

## 🔗 十、依賴與風險

### 10.1 外部依賴
| 依賴 | 版本 | 用途 |
|:---|:---|:---|
| Supabase Realtime | v1.0+ | 推送警示至前端 |
| Redis | v7.0+ | 去重與速率限制 |
| PostgreSQL | v15+ | 警示持久化 |

### 10.2 風險識別
| 風險 | 影響 | 緩解措施 |
|:---|:---|:---|
| 警示風暴 (Alert Storm) | 同時大量警示導致系統過載 | 速率限制、批次處理 |
| Redis 連線不穩 | 去重失效 | Fallback 至 PostgreSQL |
| Realtime 延遲 | 推送不及時 | 監控並調整 WAL 監聽 |

---

## 📎 十一、附錄

### A. 警示類型擴展指南
```python
# 新增自訂警示規則範例
CUSTOM_RULE = {
    "macd_crossover": {
        "description": "MACD 黃金交叉",
        "condition": {"field": "macd_signal", "operator": "cross_above", "value": "macd_line"},
        "levels": [{"min": 0, "level": "info", "title": "黃金交叉"}]
    }
}
```

### B. 監控指標
```yaml
# Prometheus Metrics
alert_engine_scans_total{provider="redis"}
alert_engine_alerts_generated_total{type="price_surge"}
alert_engine_processing_duration_seconds
alert_engine_dedup_hits_total
```

---

**文件結束**
*計畫編號：039 | 版本 2.0.0*
*建立日期：2026-02-03*
*最後更新：2026-02-03*
