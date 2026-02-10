import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from .twse_historical import TwseHistoricalFetcher
from .yahoo_fetcher import YahooFetcher

logger = logging.getLogger(__name__)

class HybridMarketFetcher:
    """混合型行情擷取器 - 負責雙軌數據切換邏輯"""
    
    # 根據實測，TWSE 官方特定端點對於 2010 年 (民國99年) 以前的數據請求可能回傳錯誤
    # 將官方分界點調整至 2010-01-01，更早的數據交給 Yahoo Finance
    OFFICIAL_START_DATE = datetime(2010, 1, 1)
    
    def __init__(self, client):
        self.twse_fetcher = TwseHistoricalFetcher(client)
        self.yahoo_fetcher = YahooFetcher(client)

    def run_backfill(self, stock_code: str, market_type: str = "TW", start_year: int = 1990):
        """
        執行回補，根據日期切換數據源
        """
        total_count = 0
        start_date_obj = datetime(start_year, 1, 1)
        
        # 1. 處理 1990 ~ 2010-01-01 (Yahoo Finance)
        if start_date_obj < self.OFFICIAL_START_DATE:
            logger.info(f"[Hybrid] Phase 1: Legacy History (Yahoo) for {stock_code}")
            end_legacy = self.OFFICIAL_START_DATE.strftime('%Y-%m-%d')
            # 傳遞正確的 market_type 給 yahoo_fetcher
            count = self.yahoo_fetcher.run(
                stock_code, 
                start_date=start_date_obj.strftime('%Y-%m-%d'), 
                end_date=end_legacy,
                market_type=market_type
            )
            total_count += count
            logger.info(f"[Hybrid] Legacy Phase Finished: {count} records")

        # 2. 處理 Official / Modern Phase
        if market_type in ["TW", "TWO"]:
            logger.info(f"[Hybrid] Phase 2: Official History (TWSE/TPEx) for {stock_code}")
            if market_type == "TW":
                # 上市公司走官方 API (2010 之後)
                count = self.twse_fetcher.backfill(stock_code, start_year=max(2010, start_year))
            else:
                # 上櫃數據目前由 Yahoo 補全或 TPEx 専用 fetcher
                count = self.yahoo_fetcher.run(stock_code, start_date="2010-01-01", market_type=market_type)
            total_count += count
        elif market_type == "US":
            # 美股 2010 之後的數據優先走 Yahoo (確保與 Legacy 一致性) 或可對接 Tiingo
            modern_start = max(datetime(2010, 1, 1), start_date_obj).strftime('%Y-%m-%d')
            count = self.yahoo_fetcher.run(stock_code, start_date=modern_start, market_type="US")
            total_count += count
        
        logger.info(f"[Hybrid] Full Backfill Finished for {stock_code}: {total_count} records")
        return total_count
