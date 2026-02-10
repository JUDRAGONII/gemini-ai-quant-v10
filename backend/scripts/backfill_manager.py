"""
全市場標的全歷史回補管理器 (Backfill Manager)
- 支持台股與美股自 1990 年起的全歷史數據回補
- 具備斷點續傳 (Checkpointing)
- 實作 API 頻率限制 (Rate Limiting)
"""

import os
import json
import time
import logging
import argparse
import sys
from datetime import datetime
from typing import List, Dict, Any

# 設定 Python 路徑以便引用 backend 模組
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
backend_path = os.path.join(project_root, "backend")
for path in [project_root, backend_path]:
    if path not in sys.path:
        sys.path.append(path)

from backend.lib.supabase_client import get_supabase
from backend.etl.twse_historical import TwseHistoricalFetcher
from backend.etl.macro import MacroFetcher, MACRO_METADATA
from backend.etl.market import TiingoFetcher, FugleFetcher
from backend.etl.hybrid_fetcher import HybridMarketFetcher

# 設定日誌
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("backfill.log", encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# 初始化 Supabase
supabase = get_supabase()

CHECKPOINT_FILE = "backfill_checkpoint.json"

class BackfillManager:
    def __init__(self):
        self.checkpoint = self._load_checkpoint()
        self.twse_fetcher = TwseHistoricalFetcher(supabase)
        self.tiingo_fetcher = TiingoFetcher(supabase)
        self.fugle_fetcher = FugleFetcher(supabase)
        self.macro_fetcher = MacroFetcher(supabase)
        self.hybrid_fetcher = HybridMarketFetcher(supabase)

    def update_db_status(self, job_id: str, symbol: str, status: str = "running"):
        """更新狀態至 backfill_status 表"""
        try:
            supabase.table('backfill_status').upsert({
                "id": job_id,
                "current_symbol": symbol,
                "status": status,
                "updated_at": datetime.now().isoformat()
            }).execute()
        except Exception as e:
            logger.error(f"Failed to update DB status for {job_id}: {e}")

    def _load_checkpoint(self) -> Dict[str, Any]:
        """載入進度快照"""
        if os.path.exists(CHECKPOINT_FILE):
            try:
                with open(CHECKPOINT_FILE, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Failed to load checkpoint: {e}")
        return {"stocks": {}, "macro": {}}

    def _save_checkpoint(self):
        """儲存進度快照"""
        try:
            with open(CHECKPOINT_FILE, 'w', encoding='utf-8') as f:
                json.dump(self.checkpoint, f, indent=4, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Failed to save checkpoint: {e}")

    def backfill_macro(self, start_year: int = 1990):
        """回補宏觀指標數據"""
        logger.info("開始回補宏觀數據...")
        start_date = f"{start_year}-01-01"
        
        for code, meta in MACRO_METADATA.items():
            if self.checkpoint["macro"].get(code) == "completed":
                logger.info(f"指標 {code} 已完成，跳過。")
                continue
            
            logger.info(f"正在回補指標: {code} ({meta['id']})...")
            self.update_db_status("macro", code)
            try:
                df = self.macro_fetcher.fetch(meta['id'], start_date)
                records = self.macro_fetcher.transform(df, indicator_code=code, series_id=meta['id'])
                
                if records:
                    count = self.macro_fetcher.upsert(records, on_conflict='indicator_code,reference_date')
                    logger.info(f"指標 {code} 回補完成: {count} 筆。")
                
                self.checkpoint["macro"][code] = "completed"
                self._save_checkpoint()
                time.sleep(1)
                
            except Exception as e:
                logger.error(f"指標 {code} 回補失敗: {e}")
                self.update_db_status("macro", code, status="error")
                time.sleep(10)
        
        self.update_db_status("macro", "Completed", status="finished")

    def backfill_stocks(self, stock_list: List[Dict[str, Any]], start_year: int = 2005):
        """回補多個標的歷史數據 (支持 TW/US)"""
        logger.info(f"開始回補標的列表 (總計 {len(stock_list)} 標的)...")
        
        for stock in stock_list:
            symbol = stock['stock_code']
            market = stock.get('market_type', 'TW')
            
            if self.checkpoint["stocks"].get(symbol) == "completed":
                logger.info(f"標定 {symbol} 已完成，跳過。")
                continue
            
            logger.info(f"正在處理 [{market}] : {symbol}")
            self.update_db_status("stocks", symbol)
            
            try:
                count = 0
                if market == 'US':
                    count = self.hybrid_fetcher.run_backfill(symbol, market_type='US', start_year=start_year)
                else:
                    count = self.hybrid_fetcher.run_backfill(symbol, market_type=market, start_year=start_year)
                
                logger.info(f"成功: {symbol} 回補完成，入庫 {count} 筆。")
                self.checkpoint["stocks"][symbol] = "completed"
                self._save_checkpoint()
                
                sleep_time = 2 if market == 'TW' else 1
                time.sleep(sleep_time)
                
            except Exception as e:
                logger.error(f"標的 {symbol} 回補中斷: {e}")
                self.update_db_status("stocks", symbol, status="error")
                time.sleep(10)
        
        self.update_db_status("stocks", "Completed", status="finished")

    def get_stock_list_from_db(self, market: str = None) -> List[Dict[str, Any]]:
        """從資料庫獲取待回補標的清單"""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                query = supabase.table('stocks').select('*').eq('is_active', True)
                if market:
                    query = query.eq('market_type', market)
                
                result = query.order('priority', desc=False).execute()
                if result.data:
                    return result.data
                return []
            except Exception as e:
                logger.warning(f"嘗試第 {attempt + 1} 次獲取資料庫失敗: {e}")
                if attempt < max_retries - 1:
                    time.sleep(5)
                else:
                    return [{"stock_code": "2330", "market_type": "TW", "priority": 1}]
        return []

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AI 投資分析儀全歷史回補工具")
    parser.add_argument("--mode", choices=["all", "macro", "stocks"], default="all", help="執行模式")
    parser.add_argument("--stock", type=str, help="指定回補標的代號")
    parser.add_argument("--market", type=str, help="指定市場 (TW/US)")
    parser.add_argument("--years", type=int, default=2010, help="回補起始年份")
    
    args = parser.parse_args()
    manager = BackfillManager()
    
    if args.mode in ["all", "macro"]:
        manager.backfill_macro(start_year=1990)
        
    if args.mode in ["all", "stocks"]:
        if args.stock:
            manager.backfill_stocks([{"stock_code": args.stock, "market_type": args.market or "TW", "priority": 1}], start_year=args.years)
        else:
            stocks = manager.get_stock_list_from_db(market=args.market)
            manager.backfill_stocks(stocks, start_year=args.years)

    logger.info("所有程序執行完成。")
