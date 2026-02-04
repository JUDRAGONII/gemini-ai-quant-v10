"""
Redis Client - Redis 連線管理
提供 Redis 連線池單例與便捷操作方法。
"""
import os
import logging
from typing import Optional
import redis

logger = logging.getLogger(__name__)

# Redis 連線實例 (Singleton)
_redis_client: Optional[redis.Redis] = None

def get_redis() -> redis.Redis:
    """
    獲取 Redis 連線實例 (單例模式)。
    
    Returns:
        redis.Redis: Redis 連線實例
    """
    global _redis_client
    
    if _redis_client is None:
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        try:
            _redis_client = redis.from_url(
                redis_url,
                encoding="utf-8",
                decode_responses=True,
                socket_timeout=5,
                socket_connect_timeout=5
            )
            # 測試連線
            _redis_client.ping()
            logger.info(f"Redis connected: {redis_url}")
        except Exception as e:
            logger.error(f"Redis connection failed: {e}")
            # 返回 Mock 或繼續拋出異常
            raise
    
    return _redis_client

def close_redis():
    """關閉 Redis 連線"""
    global _redis_client
    if _redis_client:
        _redis_client.close()
        _redis_client = None
        logger.info("Redis connection closed")
