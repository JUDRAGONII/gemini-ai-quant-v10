import asyncio
import json
import logging
import random
from datetime import datetime
from backend.lib.redis_client import get_redis

# 設定日誌
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("SimulateAlert")

async def simulate_market_update():
    """
    模擬行情大漲，並發布更新至 Redis，觸發警示掃描鏈路。
    """
    redis = get_redis()
    if not redis:
        logger.error("Redis not available")
        return

    # 模擬 2330 (台積電) 價格突然大漲 5.5%
    # 這是為了觸發 'price_surge_5m' 規則中的 'critical' 等級
    mock_quotes = [
        {
            "stock_code": "2330",
            "stock_name": "台積電",
            "market_type": "TWSE",
            "price": 600.0,
            "change": 32.0,
            "change_percent": 5.5,  # 觸發 > 5% 的 critical 警示
            "volume": 45000,
            "volume_ratio": 2.5,    # 觸發 > 2.0 的量能警示
            "updated_at": datetime.utcnow().isoformat()
        },
        {
            "stock_code": "2317",
            "stock_name": "鴻海",
            "market_type": "TWSE",
            "price": 150.0,
            "change": -3.5,
            "change_percent": -2.2, # 觸發 < -2% 的 info/warning 下跌警示
            "volume": 12000,
            "volume_ratio": 1.1,
            "updated_at": datetime.utcnow().isoformat()
        }
    ]

    message = json.dumps({"quotes": mock_quotes})
    
    logger.info(f"Publishing mock market updates to 'market:quotes_updated'...")
    redis.publish("market:quotes_updated", message)
    logger.info("Simulation sent! Please check if AlertScannerWorker processed it.")

if __name__ == "__main__":
    asyncio.run(simulate_market_update())
