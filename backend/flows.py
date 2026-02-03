from prefect import flow, task
from prefect.settings import PREFECT_API_DATABASE_CONNECTION_TIMEOUT
import time
import logging
import os
from backend.lib.supabase_client import get_supabase

# 強制設定 Prefect Ephemeral API 超時 (解決容器資源競爭)
os.environ["PREFECT_API_DATABASE_CONNECTION_TIMEOUT"] = "60"
from backend.etl import MacroFetcher, TiingoFetcher, FugleFetcher, TwseFetcher, TaifexFetcher
from backend.agents.evolution import EvolutionEngine
from backend.agents.backtest import BacktestEngine
from backend.agents.dialectic import DialecticAgent
from backend.workers.market_relay_worker import MarketRelayWorker
import schedule
import asyncio

logger = logging.getLogger(__name__)

@task(name="Sync All Macro Data", retries=3)
def sync_macro():
    logger.info("--- [Task] Sync Macro Data ---")
    client = get_supabase()
    fetcher = MacroFetcher(client)
    fetcher.run_all(lookback_days=365) # 預設同步一年

@task(name="Sync Market Prices", retries=2)
def sync_market():
    logger.info("--- [Task] Sync Market Prices ---")
    client = get_supabase()
    # 範例標的 (未來可從資料庫讀取列表)
    us_tickers = ["AAPL", "TSLA", "MSFT"]
    tw_tickers = ["2330", "2454", "2317"]
    
    tiingo = TiingoFetcher(client)
    for t in us_tickers:
        tiingo.run(ticker=t)
        
    fugle = FugleFetcher(client)
    for t in tw_tickers:
        fugle.run(ticker=t)
        
    # 加入期貨同步
    taifex = TaifexFetcher(client)
    taifex.run()

@task(name="Evolve Strategy Weights")
def run_evolution():
    logger.info("--- [Task] Evolve Strategy Weights ---")
    # TODO: 真正實作時需先從 DB 載入行情 DataFrame
    # engine = EvolutionEngine(generations=5)
    # engine.run(backtest_engine)
    pass

@task(name="Run Quota-Balanced Market Relay", retries=1)
def sync_relay():
    logger.info("--- [Task] Sync Market Relay (Quota-Balanced) ---")
    client = get_supabase()
    worker = MarketRelayWorker(client)
    # 執行單次刷新，週期由 Scheduler 控制
    asyncio.run(worker.run_once())

@flow(name="Daily V10 Quantitative Pipeline")
def daily_pipeline():
    sync_macro()
    sync_market()
    sync_relay()
    run_evolution()

def run_scheduler():
    logger.info("Starting V10.0 Orchestration Scheduler...")
    # 每天早上八點執行
    schedule.every().day.at("08:00").do(daily_pipeline)
    
    # 每 30 分鐘執行一次行情中繼 (對齊 Phase 9 計畫)
    schedule.every(30).minutes.do(sync_relay)
    
    # 啟動時執行一次驗證
    daily_pipeline()

    while True:
        schedule.run_pending()
        time.sleep(60)

if __name__ == "__main__":
    run_scheduler()
