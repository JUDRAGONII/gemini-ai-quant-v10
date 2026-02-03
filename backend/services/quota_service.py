"""
QuotaService - API 配額管理服務 (Redis + PostgreSQL 混合架構)
- Redis: 高頻計數 (requests_today, error_count)
- PostgreSQL: 金鑰元資料與歷史追蹤
"""
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from backend.lib.supabase_client import get_supabase
from backend.lib.redis_client import get_redis

logger = logging.getLogger(__name__)

# Redis Key 命名規範
REDIS_KEY_PREFIX = "quota"
REDIS_REQUESTS_KEY = f"{REDIS_KEY_PREFIX}:requests"      # Hash: provider -> count
REDIS_ERRORS_KEY = f"{REDIS_KEY_PREFIX}:errors"          # Hash: provider -> count
REDIS_COOLDOWN_KEY = f"{REDIS_KEY_PREFIX}:cooldown"      # Set: cooling providers


class QuotaService:
    """
    API 配額管理服務 (Redis + PostgreSQL 混合架構)。
    - Redis 負責高頻讀寫 (計數器、冷卻狀態)
    - PostgreSQL 負責持久化 (金鑰元資料、歷史記錄)
    """
    
    def __init__(self, supabase_client=None, redis_client=None):
        self.supabase = supabase_client or get_supabase()
        try:
            self.redis = redis_client or get_redis()
        except Exception:
            self.redis = None
            logger.warning("Redis unavailable, falling back to PostgreSQL only")
    
    def get_all_keys(self) -> List[Dict[str, Any]]:
        """
        獲取所有 API 金鑰狀態。
        合併 PostgreSQL 元資料與 Redis 即時計數。
        """
        try:
            # 先執行每日重置檢查
            self.supabase.rpc("fn_reset_daily_quota", {}).execute()
            
            # 從 PostgreSQL 獲取金鑰元資料
            response = self.supabase.table("api_keys") \
                .select("id, provider, key_name, daily_limit, status, cooldown_until, last_reset_date, updated_at") \
                .order("provider") \
                .execute()
            
            keys = []
            for key in response.data:
                provider = key["provider"]
                
                # 從 Redis 獲取即時計數 (若可用)
                if self.redis:
                    requests_today = int(self.redis.hget(REDIS_REQUESTS_KEY, provider) or 0)
                    error_count = int(self.redis.hget(REDIS_ERRORS_KEY, provider) or 0)
                    is_cooling = self.redis.sismember(REDIS_COOLDOWN_KEY, provider)
                else:
                    requests_today = 0
                    error_count = 0
                    is_cooling = False
                
                # 計算健康百分比
                limit = key.get("daily_limit", 1)
                remaining_percent = max(0, (limit - requests_today) / limit * 100)
                
                # 判斷健康狀態
                if is_cooling or key.get("status") == "cooling":
                    health = "critical"
                elif key.get("status") == "disabled":
                    health = "disabled"
                elif remaining_percent > 50:
                    health = "healthy"
                elif remaining_percent > 20:
                    health = "warning"
                else:
                    health = "critical"
                
                keys.append({
                    **key,
                    "requests_today": requests_today,
                    "error_count": error_count,
                    "remaining_percent": round(remaining_percent, 1),
                    "health": health
                })
            
            return keys
        except Exception as e:
            logger.error(f"QuotaService.get_all_keys error: {e}")
            return []
    
    def increment_usage(self, provider: str) -> bool:
        """
        遞增指定提供者的使用次數 (Redis 高頻計數)。
        若超過限制則觸發冷卻。
        """
        try:
            # 從 PostgreSQL 獲取限制
            response = self.supabase.table("api_keys") \
                .select("id, daily_limit") \
                .eq("provider", provider) \
                .eq("status", "active") \
                .limit(1) \
                .execute()
            
            if not response.data:
                logger.warning(f"No active key found for provider: {provider}")
                return False
            
            key = response.data[0]
            daily_limit = key["daily_limit"]
            
            if self.redis:
                # Redis 原子遞增
                new_count = self.redis.hincrby(REDIS_REQUESTS_KEY, provider, 1)
                
                # 檢查是否超過限制
                if new_count >= daily_limit:
                    self._trigger_cooldown(provider, key["id"])
                    logger.warning(f"API key {provider} reached limit ({new_count}/{daily_limit}), cooling activated")
            else:
                # Fallback: PostgreSQL 計數
                self.supabase.table("api_keys") \
                    .update({
                        "requests_today": self.supabase.rpc("fn_increment_counter", {"p_provider": provider}),
                        "updated_at": datetime.utcnow().isoformat()
                    }) \
                    .eq("id", key["id"]) \
                    .execute()
            
            return True
        except Exception as e:
            logger.error(f"QuotaService.increment_usage error: {e}")
            return False
    
    def record_error(self, provider: str, error_message: str) -> None:
        """
        記錄 API 錯誤。連續 5 次錯誤觸發冷卻。
        """
        try:
            if self.redis:
                # Redis 原子遞增錯誤計數
                new_error_count = self.redis.hincrby(REDIS_ERRORS_KEY, provider, 1)
                
                # 連續 5 次錯誤觸發冷卻
                if new_error_count >= 5:
                    # 獲取 key_id
                    response = self.supabase.table("api_keys") \
                        .select("id") \
                        .eq("provider", provider) \
                        .limit(1) \
                        .execute()
                    if response.data:
                        self._trigger_cooldown(provider, response.data[0]["id"], cooldown_hours=1)
                        logger.warning(f"API key {provider} triggered cooling due to {new_error_count} errors")
            
            # 記錄到 PostgreSQL
            self.supabase.table("api_keys") \
                .update({
                    "last_error_message": error_message[:500],
                    "updated_at": datetime.utcnow().isoformat()
                }) \
                .eq("provider", provider) \
                .execute()
                
        except Exception as e:
            logger.error(f"QuotaService.record_error error: {e}")
    
    def _trigger_cooldown(self, provider: str, key_id: str, cooldown_hours: int = 24):
        """觸發冷卻機制。"""
        cooldown_until = datetime.utcnow() + timedelta(hours=cooldown_hours)
        
        # Redis: 標記冷卻狀態 (帶過期時間)
        if self.redis:
            self.redis.sadd(REDIS_COOLDOWN_KEY, provider)
            self.redis.expire(REDIS_COOLDOWN_KEY, cooldown_hours * 3600)
        
        # PostgreSQL: 持久化冷卻狀態
        self.supabase.table("api_keys") \
            .update({
                "status": "cooling",
                "cooldown_until": cooldown_until.isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }) \
            .eq("id", key_id) \
            .execute()
    
    def reset_cooldown(self, key_id: str) -> bool:
        """手動重置指定金鑰的冷卻狀態。"""
        try:
            # 獲取 provider
            response = self.supabase.table("api_keys") \
                .select("provider") \
                .eq("id", key_id) \
                .limit(1) \
                .execute()
            
            if not response.data:
                return False
            
            provider = response.data[0]["provider"]
            
            # Redis: 清除冷卻標記與計數
            if self.redis:
                self.redis.srem(REDIS_COOLDOWN_KEY, provider)
                self.redis.hdel(REDIS_REQUESTS_KEY, provider)
                self.redis.hdel(REDIS_ERRORS_KEY, provider)
            
            # PostgreSQL: 更新狀態
            self.supabase.table("api_keys") \
                .update({
                    "status": "active",
                    "cooldown_until": None,
                    "updated_at": datetime.utcnow().isoformat()
                }) \
                .eq("id", key_id) \
                .execute()
            
            logger.info(f"Cooldown reset for key: {key_id} (provider: {provider})")
            return True
        except Exception as e:
            logger.error(f"QuotaService.reset_cooldown error: {e}")
            return False
    
    def reset_daily_counters(self) -> None:
        """
        每日重置所有計數器 (應由 Cron/Scheduler 呼叫)。
        """
        try:
            if self.redis:
                # 清空 Redis 計數 Hash
                self.redis.delete(REDIS_REQUESTS_KEY)
                self.redis.delete(REDIS_ERRORS_KEY)
                logger.info("Daily quota counters reset (Redis)")
            
            # 同時更新 PostgreSQL reset 日期
            self.supabase.rpc("fn_reset_daily_quota", {}).execute()
            
        except Exception as e:
            logger.error(f"QuotaService.reset_daily_counters error: {e}")
    
    def get_available_key(self, provider: str) -> Optional[str]:
        """
        獲取指定提供者的可用金鑰。
        """
        try:
            # 檢查是否在冷卻中
            if self.redis and self.redis.sismember(REDIS_COOLDOWN_KEY, provider):
                logger.warning(f"Provider {provider} is in cooldown")
                return None
            
            response = self.supabase.table("api_keys") \
                .select("api_key") \
                .eq("provider", provider) \
                .eq("status", "active") \
                .limit(1) \
                .execute()
            
            if response.data:
                return response.data[0]["api_key"]
            return None
        except Exception as e:
            logger.error(f"QuotaService.get_available_key error: {e}")
            return None
