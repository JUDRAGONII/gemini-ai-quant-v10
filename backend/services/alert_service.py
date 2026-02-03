import logging
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from backend.lib.supabase_client import get_supabase
from backend.lib.redis_client import get_redis

logger = logging.getLogger(__name__)

# Redis Key 定義 (對齊憲級文件)
REDIS_KEY_PREFIX = "alert"
ALERT_DEDUP_KEY = f"{REDIS_KEY_PREFIX}:dedup"  # Set: stock_code:alert_type
DEBOUNCE_WINDOW = 5  # 防抖窗口 (分鐘)

# 內建警示規則 (對齊憲級文件)
BUILTIN_ALERTS = {
    "price_surge_5m": {
        "description": "5 分鐘內價格急拉",
        "condition": {"field": "change_percent", "operator": "gt", "value": 2.0},
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
    "price_drop_5m": {
        "description": "5 分鐘內價格急跌",
        "condition": {"field": "change_percent", "operator": "lt", "value": -2.0},
        "levels": [
            {"min": -5.0, "level": "critical", "title": "價格暴跌"},
            {"min": -3.0, "level": "warning", "title": "價格重挫"},
            {"min": -2.0, "level": "info", "title": "價格下跌"}
        ]
    }
}

class AlertService:
    """市場異動警示服務 (Hybrid Architecture: Redis + PostgreSQL)"""

    def __init__(self, supabase=None, redis=None):
        self.supabase = supabase or get_supabase()
        self.redis = redis or get_redis()
        self.rules = BUILTIN_ALERTS

    def scan_and_alert(self, quotes: List[Dict[str, Any]]) -> int:
        """
        掃描行情快照並產生警示
        :param quotes: List of market quotes
        :return: Number of alerts generated
        """
        if not quotes:
            return 0

        alerts_to_insert = []
        now = datetime.utcnow()

        for quote in quotes:
            stock_code = quote.get("stock_code")
            if not stock_code:
                continue

            for rule_key, config in self.rules.items():
                # 1. 防抖檢查 (Redis)
                dedup_id = f"{stock_code}:{rule_key}"
                if self.redis and self.redis.sismember(ALERT_DEDUP_KEY, dedup_id):
                    continue

                # 2. 條件檢測
                condition = config["condition"]
                if self._evaluate(quote, condition):
                    # 3. 等級判定
                    level_info = self._get_level(quote, config.get("levels", []))
                    
                    # 4. 構建警示物件
                    alert = {
                        "stock_code": stock_code,
                        "stock_name": quote.get("stock_name") or quote.get("name"),
                        "market_type": quote.get("market_type", "TWSE"),
                        "alert_type": rule_key,
                        "alert_level": level_info["level"],
                        "alert_title": f"{level_info['title']}: {stock_code}",
                        "alert_description": f"{quote.get('stock_name', stock_code)} {config['description']} 達 {quote.get(condition['field'])}%",
                        "trigger_value": float(quote.get(condition["field"], 0)),
                        "threshold_value": float(condition["value"]),
                        "change_percent": float(quote.get("change_percent", 0)),
                        "triggered_at": now.isoformat(),
                        "expires_at": (now + timedelta(minutes=DEBOUNCE_WINDOW)).isoformat(),
                        "metadata": {"quote": quote}
                    }
                    alerts_to_insert.append(alert)

                    # 5. 標記防抖
                    if self.redis:
                        self.redis.sadd(ALERT_DEDUP_KEY, dedup_id)
                        # 我們設定與 expires_at 相同的過期時間供 Redis 自動清理
                        self.redis.expire(ALERT_DEDUP_KEY, DEBOUNCE_WINDOW * 60)

        if alerts_to_insert:
            try:
                self.supabase.table("market_alerts").insert(alerts_to_insert).execute()
                logger.info(f"Generated {len(alerts_to_insert)} market alerts")
                return len(alerts_to_insert)
            except Exception as e:
                logger.error(f"Failed to insert market alerts: {e}")
                return 0
        
        return 0

    def _evaluate(self, quote: Dict[str, Any], condition: Dict[str, Any]) -> bool:
        """評估條件是否成立"""
        field = condition["field"]
        op = condition["operator"]
        target = condition["value"]
        
        val = quote.get(field)
        if val is None:
            return False
            
        try:
            val = float(val)
            target = float(target)
            if op == "gt": return val > target
            if op == "lt": return val < target
            if op == "gte": return val >= target
            if op == "lte": return val <= target
            if op == "abs_gt": return abs(val) > target
        except (ValueError, TypeError):
            return False
            
        return False

    def _get_level(self, quote: Dict[str, Any], levels: List[Dict[str, Any]]) -> Dict[str, Any]:
        """判定警示等級，回傳最高匹配級別"""
        # 注意：假設 levels 已按閾值絕對值由大到小排序，或者我們在此排序
        sorted_levels = sorted(levels, key=lambda x: abs(x["min"]), reverse=True)
        
        for level in sorted_levels:
            val = abs(float(quote.get("change_percent", 0)))
            if val >= abs(level["min"]):
                return level
                
        return {"level": "info", "title": "一般異動"}

    def get_recent_alerts(self, limit: int = 20):
        """獲取最近警示"""
        try:
            res = self.supabase.table("market_alerts").select("*").order("triggered_at", desc=True).limit(limit).execute()
            return res.data
        except Exception as e:
            logger.error(f"Failed to fetch alerts: {e}")
            return []
