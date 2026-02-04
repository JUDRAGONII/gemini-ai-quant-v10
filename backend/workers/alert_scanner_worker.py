import logging
import asyncio
import json
from backend.services.alert_service import AlertService
from backend.lib.redis_client import get_redis
from backend.lib.supabase_client import get_supabase

logger = logging.getLogger(__name__)

class AlertScannerWorker:
    """訂閱行情更新並執行警示掃描的 Worker"""
    
    def __init__(self, alert_service: AlertService = None):
        self.redis = get_redis()
        self.alert_service = alert_service or AlertService()
        self.running = False

    async def start(self):
        """啟動 Worker，開始監聽 Redis Channel"""
        if not self.redis:
            logger.error("AlertScannerWorker: Redis client not available")
            return

        self.running = True
        logger.info("AlertScannerWorker: Started and listening to 'market:quotes_updated'")

        pubsub = self.redis.pubsub()
        pubsub.subscribe("market:quotes_updated")

        try:
            while self.running:
                # 使用 get_message 配合 sleep 避免阻塞，且能響應 self.running = False
                message = pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message:
                    try:
                        data = json.loads(message["data"])
                        quotes = data.get("quotes", [])
                        if quotes:
                            count = self.alert_service.scan_and_alert(quotes)
                            if count > 0:
                                logger.info(f"AlertScannerWorker: Processed {len(quotes)} quotes, generated {count} alerts")
                    except Exception as e:
                        logger.error(f"AlertScannerWorker: Error processing message: {e}")
                
                await asyncio.sleep(0.1)
        except Exception as e:
            logger.error(f"AlertScannerWorker: Error in main loop: {e}")
        finally:
            await pubsub.unsubscribe("market:quotes_updated")
            self.running = False
            logger.info("AlertScannerWorker: Stopped")

    def stop(self):
        """停止 Worker"""
        self.running = False

# 獨立啟動 Entry Point
async def main():
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    worker = AlertScannerWorker()
    try:
        await worker.start()
    except KeyboardInterrupt:
        worker.stop()

if __name__ == "__main__":
    asyncio.run(main())
