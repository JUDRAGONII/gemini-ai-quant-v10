import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)
import asyncio
import logging
import schedule
import time
import sys
from backend.flows import setup_scheduler
from backend.workers.alert_scanner_worker import AlertScannerWorker

# 設定 Logging
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("/app/worker.log")
    ],
    force=True
)
logger = logging.getLogger(__name__)

async def run_scheduler_loop():
    """
    非阻塞的排程迴圈
    """
    logger.info("Scheduler Loop: Started")
    setup_scheduler()
    
    while True:
        try:
            # 執行所有到期的任務
            schedule.run_pending()
        except Exception as e:
            logger.error(f"Scheduler Loop Error: {e}")
        
        # 使用 asyncio.sleep 釋放控制權，讓其他 async 任務運行
        await asyncio.sleep(1)

async def main():
    logger.info(">>> AI Worker Unified Entry Point Starting <<<")
    
    # 1. 建立 Alert Scanner 實例
    scanner = AlertScannerWorker()
    
    # 2. 併發執行 Scheduler 與 Scanner
    # gather 會等待所有 task 完成 (因為它們都是 infinite loop，所以會一直跑)
    await asyncio.gather(
        run_scheduler_loop(),
        scanner.start()
    )

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("AI Worker Stopped by User")
