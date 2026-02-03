import logging
import datetime
from typing import Optional, List, Dict
from backend.lib.config import Config
from backend.lib.supabase_client import get_supabase

logger = logging.getLogger(__name__)

class QuotaManager:
    """
    API 配額管理器 (Quota Manager)
    負責金鑰池的輪詢、使用量監控與冷卻保護。
    """
    
    def __init__(self, service: str):
        self.service = service
        self.supabase = get_supabase()
        self.keys = []
        
        if service.upper() == "TIINGO":
            self.keys = Config.TIINGO_KEYS
        elif service.upper() == "FMP":
            self.keys = Config.FMP_KEYS
        elif service.upper() == "FUGLE":
            # Fugle 暫時假設只有一組 Key，但也支援擴充
            key = Config.FUGLE_API_KEY
            if key:
                self.keys = [key]
        
        if not self.keys:
            logger.warning(f"QuotaManager: No keys found for service {service}")

    async def get_available_key(self) -> Optional[str]:
        """
        獲取負載最低或尚未冷卻的金鑰。
        """
        if not self.keys:
            return None
            
        try:
            # 1. 查詢該服務下所有 Key 的使用量
            # 注意：這裡使用 execute() 返回的 data 是一個 list
            response = self.supabase.table("api_key_usage") \
                .select("key_id, request_count") \
                .eq("service", self.service) \
                .execute()
            
            usage_map = {item['key_id']: item.get('request_count', 0) for item in response.data}
            
            # 2. 排序：優先選擇沒在 DB 紀錄中或流量最少的
            sorted_keys = sorted(self.keys, key=lambda k: usage_map.get(k, 0))
            
            best_key = sorted_keys[0] if sorted_keys else None
            if best_key:
                logger.debug(f"QuotaManager ({self.service}): Selecting key {best_key[:5]}... with usage {usage_map.get(best_key, 0)}")
            return best_key
            
        except Exception as e:
            logger.error(f"QuotaManager error getting available key: {e}")
            # Fallback to the first key if DB query fails
            return self.keys[0]

    async def log_usage(self, key: str, count: int = 1):
        """
        記錄金鑰使用量到資料庫。
        """
        if not key:
            return
            
        try:
            # 1. 獲取現有使用量
            response = self.supabase.table("api_key_usage") \
                .select("request_count") \
                .eq("key_id", key) \
                .execute()
            
            current_count = response.data[0]['request_count'] if response.data else 0
            new_count = current_count + count
            
            # 2. 準備更新資料
            payload = {
                "key_id": key,
                "service": self.service,
                "request_count": new_count,
                "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
            }
            
            # 3. 執行 Upsert (Supabase V2 upsert 預設不返回資料，除非指定為 select)
            res = self.supabase.table("api_key_usage").upsert(payload).execute()
            logger.info(f"QuotaManager ({self.service}): Logged usage for {key}. New Count: {new_count}")
            return res.data
            
        except Exception as e:
            logger.error(f"QuotaManager error logging usage for {key}: {e}")
            return None

# 單例模式實作
tiingo_quota = QuotaManager("TIINGO")
fmp_quota = QuotaManager("FMP")
fugle_quota = QuotaManager("FUGLE")
