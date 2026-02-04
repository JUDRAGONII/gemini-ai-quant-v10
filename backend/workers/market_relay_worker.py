import logging
import asyncio
import datetime
import requests
import json
from typing import List, Dict, Any
import math
from backend.etl.base_fetcher import BaseFetcher
from backend.lib.quota_manager import fugle_quota, tiingo_quota
from backend.lib.supabase_client import get_supabase
from backend.lib.redis_client import get_redis
from backend.lib.config import Config

logger = logging.getLogger(__name__)

class MarketRelayWorker(BaseFetcher):
    """
    行情中繼 Worker
    負責定時從外部 API 獲取行情快照並更新至 market_quotes 表格。
    支持配額管理與分段更新。
    """
    
    def __init__(self, client):
        super().__init__(client, "market_quotes")
        self.batch_size = 50 # 每次抓取的標的一組數量
        self.interval = 1800 # 預設 全市場 30 分鐘 (1800s)
        self.watchlist_interval = 900 # 自選股 15 分鐘 (900s)
        self.redis = get_redis()

    async def get_active_symbols(self, market: str = 'TW') -> List[str]:
        """
        獲取資料庫中活躍的標的代號。
        """
        try:
            response = self.client.table("stocks") \
                .select("stock_code") \
                .eq("is_active", True) \
                .eq("market_type", market) \
                .execute()
            return [item['stock_code'] for item in response.data]
        except Exception as e:
            logger.error(f"Error fetching active symbols: {e}")
            return []

    async def fetch(self, symbols: List[str] = None, **kwargs) -> List[Dict[str, Any]]:
        """
        透過 Fugle API 獲取多個標的的行情快照。
        """
        if symbols is None:
            symbols = kwargs.get("symbols", [])
            
        api_key = await fugle_quota.get_available_key()
        if not api_key:
            logger.error("No Fugle API key available.")
            return []
            
        results = []
        # Fugle 常用的是個別 symbol 查詢或 tickers 查詢
        # 這裡由於免費版可能不支援大批量 tickers 查詢，我們先採用循環/併發查詢
        
        async def fetch_one(symbol):
            url = f"https://api.fugle.tw/marketdata/v1.0/stock/intraday/quote/{symbol}"
            headers = {"X-API-KEY": api_key}
            try:
                # 使用 asyncio 的 run_in_executor 執行同步 requests (或改用 httpx)
                loop = asyncio.get_event_loop()
                response = await loop.run_in_executor(None, lambda: requests.get(url, headers=headers, timeout=10))
                if response.status_code == 200:
                    data = response.json()
                    await fugle_quota.log_usage(api_key)
                    return data
                elif response.status_code == 429:
                    logger.warning(f"Fugle Rate Limit reached for key {api_key[:5]}...")
                    return None
            except Exception as e:
                logger.error(f"Error fetching Fugle snapshot for {symbol}: {e}")
            return None

        # 併發限制：不要一次打太猛，每秒控制在合理範圍
        for i in range(0, len(symbols), 5): # 每批 5 檔
            batch = symbols[i:i+5]
            tasks = [fetch_one(s) for s in batch]
            batch_results = await asyncio.gather(*tasks)
            results.extend([r for r in batch_results if r])
            await asyncio.sleep(0.5) # 微秒級間隔
            
        return results

    def transform(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        將 Fugle 原始數據轉換為 market_quotes Schema。
        """
        records = []
        
        def sanitize_val(val):
            """防止 NaN/Infinity 導致 JSON 序列化失敗"""
            if val is None:
                return None
            try:
                f_val = float(val)
                if math.isnan(f_val) or math.isinf(f_val):
                    return None
                return f_val
            except (ValueError, TypeError):
                return val # 非數值則原樣返回 (如 name, symbol)

        for item in raw_data:
            # Fugle Quote Schema: 
            # { "symbol": "2330", "price": 600, "change": 5, "changePercent": 0.8, "volume": 12345, "name": "...", ... }
            records.append({
                "stock_code": item.get("symbol"),
                "name": item.get("name"),
                "price": sanitize_val(item.get("lastPrice")),
                "change": sanitize_val(item.get("change")),
                "change_percent": sanitize_val(item.get("changePercent")),
                "volume": sanitize_val(item.get("totalVolume")),
                "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "source": "Fugle"
            })
        return records

    async def run_relay(self):
        """
        執行行情中繼的主循環。
        """
        logger.info("MarketRelayWorker: Starting relay loop...")
        while True:
            try:
                # 1. 檢查是否在交易時間 (簡單版：9:00 - 14:30)
                now = datetime.datetime.now()
                if 9 <= now.hour < 15: # 稍微放寬
                     symbols = await self.get_active_symbols()
                     logger.info(f"MarketRelayWorker: Refreshing {len(symbols)} symbols...")
                     
                     # 2. 分段抓取 (避免單次過大)
                     for i in range(0, len(symbols), self.batch_size):
                         batch = symbols[i:i+self.batch_size]
                         raw = await self.fetch(symbols=batch)
                         records = self.transform(raw)
                         self.upsert(records, on_conflict="stock_code")
                        
                         # 發布更新至 Redis Channel，觸發警示掃描
                         if self.redis:
                             self.redis.publish("market:quotes_updated", json.dumps({"quotes": records}))
                        
                         # 每批次間隔，保護 API
                         await asyncio.sleep(2)
                else:
                    logger.debug("MarketRelayWorker: Outside market hours, skipping...")
                    
                # 3. 休眠，等待下一次全市場更新
                await asyncio.sleep(self.interval)
                
            except Exception as e:
                logger.error(f"MarketRelayWorker error in loop: {e}")
                await asyncio.sleep(60)

    async def run_once(self):
        """
        執行單次行情重新整理 (受限於 Quota)。
        """
        try:
            symbols = await self.get_active_symbols()
            logger.info(f"MarketRelayWorker: Single refresh for {len(symbols)} symbols...")
            for i in range(0, len(symbols), self.batch_size):
                batch = symbols[i:i+self.batch_size]
                raw = await self.fetch(symbols=batch)
                records = self.transform(raw)
                self.upsert(records, on_conflict="stock_code")
                
                # 發布更新至 Redis Channel，觸發警示掃描
                if self.redis:
                    self.redis.publish("market:quotes_updated", json.dumps({"quotes": records}))
                
                await asyncio.sleep(1)
            logger.info("MarketRelayWorker: Single refresh completed.")
        except Exception as e:
            logger.error(f"MarketRelayWorker: Single refresh failed: {e}")

# Entry point for stand-alone running
async def main():
    logging.basicConfig(level=logging.INFO)
    client = get_supabase()
    worker = MarketRelayWorker(client)
    await worker.run_relay()

if __name__ == "__main__":
    asyncio.run(main())
