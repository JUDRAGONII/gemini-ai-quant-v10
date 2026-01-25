"""
大規模數據回補管理器 (Backfill Manager)
- 負責執行台股與宏觀指標的全量歷史數據回補
- 支援斷點續傳 (Checkpointing)
- 實作智慧速率限制 (Rate Limiting)
"""

import os
import json
import time
import logging
import argparse
from datetime import datetime
from typing import List, Dict, Any

# 設定 Python 路徑以匯入 backend 模組
import sys
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if project_root not in sys.path:
    sys.path.append(project_root)

from backend.lib.supabase_client import get_supabase
from backend.etl.twse_historical import TwseHistoricalFetcher
from backend.etl.macro import MacroFetcher, MACRO_METADATA
from backend.etl.market import TiingoFetcher, FugleFetcher

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
if not supabase:
    # 嘗試手動初始化 (針對地端開發環境)
    from supabase import create_client
    url = os.getenv("SUPABASE_URL", "http://localhost:8000")
    key = os.getenv("SERVICE_ROLE_KEY")
    if url and key:
        supabase = create_client(url, key)

CHECKPOINT_FILE = "backfill_checkpoint.json"

class BackfillManager:
    def __init__(self):
        self.checkpoint = self._load_checkpoint()
        self.twse_fetcher = TwseHistoricalFetcher(supabase)
        self.tiingo_fetcher = TiingoFetcher(supabase)
        self.fugle_fetcher = FugleFetcher(supabase)
        self.macro_fetcher = MacroFetcher(supabase)

    def update_db_status(self, job_id: str, symbol: str, status: str = "running"):
        """同步進度至資料庫 backfill_status 表"""
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
        """載入進度存檔"""
        if os.path.exists(CHECKPOINT_FILE):
            try:
                with open(CHECKPOINT_FILE, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Failed to load checkpoint: {e}")
        return {"stocks": {}, "macro": {}}

    def _save_checkpoint(self):
        """儲存進度存檔"""
        try:
            with open(CHECKPOINT_FILE, 'w', encoding='utf-8') as f:
                json.dump(self.checkpoint, f, indent=4, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Failed to save checkpoint: {e}")

    def backfill_macro(self, start_year: int = 1990):
        """回補宏觀指標"""
        logger.info("🎬 開始回補宏觀指標...")
        start_date = f"{start_year}-01-01"
        
        for code, meta in MACRO_METADATA.items():
            if self.checkpoint["macro"].get(code) == "completed":
                logger.info(f"⏩ 指標 {code} 已完成，跳過。")
                continue
            
            logger.info(f"🔄 正在回補指標: {code} ({meta['id']})...")
            self.update_db_status("macro", code)
            try:
                # 取得數據
                df = self.macro_fetcher.fetch(meta['id'], start_date)
                records = self.macro_fetcher.transform(df, indicator_code=code, series_id=meta['id'])
                
                if records:
                    count = self.macro_fetcher.upsert(records, on_conflict='indicator_code,reference_date')
                    logger.info(f"✅ {code} 回補完成: {count} 筆紀錄")
                
                self.checkpoint["macro"][code] = "completed"
                self._save_checkpoint()
                
                # 避免請求過快
                time.sleep(1)
                
            except Exception as e:
                logger.error(f"❌ 指標 {code} 回補失敗: {e}")
                self.update_db_status("macro", code, status="error")
                # 遇到 429 或網路問題時增加休眠時間
                time.sleep(10)
        
        self.update_db_status("macro", "Completed", status="finished")

    def backfill_stocks(self, stock_list: List[Dict[str, Any]], start_year: int = 2005):
        """回補多市場歷史行情 (支援 TW/US)"""
        logger.info(f"🎬 開始回補標的行情 (總計 {len(stock_list)} 檔標的)...")
        
        for stock in stock_list:
            symbol = stock['symbol']
            market = stock.get('market', 'TW')
            
            if self.checkpoint["stocks"].get(symbol) == "completed":
                logger.info(f"⏩ 標的 {symbol} 已完成，跳過。")
                continue
            
            logger.info(f"🚀 正在處理 [{market}] : {symbol}")
            self.update_db_status("stocks", symbol)
            
            try:
                count = 0
                if market == 'US':
                    # 使用 Tiingo 回補美股
                    start_date = f"{start_year}-01-01"
                    raw = self.tiingo_fetcher.fetch(symbol, start_date=start_date)
                    records = self.tiingo_fetcher.transform(raw)
                    count = self.tiingo_fetcher.upsert(records, on_conflict='stock_code,trade_date')
                else:
                    # 使用 Fugle 或 TWSE 回補台股
                    # 優先嘗試 Fugle (支援上市櫃且效率較高)
                    try:
                        # Fugle backfill
                        start_date = f"{start_year}-01-01"
                        count = self.fugle_fetcher.run(symbol, timeframe='D1', start_date=start_date)
                    except Exception as e:
                        logger.warning(f"Fugle fallback to TWSE for {symbol}: {e}")
                        # Fallback to TWSE (僅支援上市)
                        count = self.twse_fetcher.backfill(symbol, start_year)
                
                logger.info(f"✅ {symbol} 同步完成，入庫 {count} 筆。")
                self.checkpoint["stocks"][symbol] = "completed"
                self._save_checkpoint()
                
                # 基於市場別調整休眠，保護 API
                sleep_time = 3 if market == 'TW' else 1
                time.sleep(sleep_time)
                
            except Exception as e:
                logger.error(f"❌ 標的 {symbol} 回補中斷: {e}")
                self.update_db_status("stocks", symbol, status="error")
                time.sleep(10)
        
        self.update_db_status("stocks", "Completed", status="finished")

    def is_taiwan_stock(self, symbol: str) -> bool:
        """
        判斷是否為台股代號
        台股規則：
        - 4 位純數字 (一般股票)
        - 5 位 (包含字母，如權證/債券 ETF，如 00937B)
        - 6 位 (包含字母，如權證)
        - 排除美股：通常為全大寫字母 (TSLA, NVDA) 且長度較短或不符數字開頭特徵
        """
        if not symbol:
            return False
            
        # 台股特徵：長度 4-6 位，且通常以數字開頭 (例如 2330, 0050, 00937B)
        # 美股則幾乎都是純英文字母開頭
        if len(symbol) >= 4 and len(symbol) <= 6:
            # 如果前兩位是數字，極大概率是台股或台股衍生標的
            if symbol[:2].isdigit():
                return True
        return False

    def get_stock_list_from_db(self, market: str = None) -> List[Dict[str, Any]]:
        """從資料庫獲取待回補股票清單，依優先序排序 (具備重試機制)"""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # 獲取所有有效標的，並依 priority 排序 (1 最高)
                query = supabase.table('stocks').select('*').eq('is_active', True)
                if market:
                    query = query.eq('market', market)
                
                result = query.order('priority', desc=False).execute()
                if result.data:
                    logger.info(f"🔍 從資料庫加載 {len(result.data)} 檔標的{' (市場: ' + market + ')' if market else ''}。")
                    return result.data
                return []
            except Exception as e:
                logger.warning(f"⚠️ 第 {attempt + 1} 次讀取資料庫失敗: {e}")
                if attempt < max_retries - 1:
                    time.sleep(5)
                else:
                    logger.error("❌ 讀取資料庫失敗且已達最大重試次數。")
                    return [{"symbol": "2330", "market": "TW", "priority": 1}]
        return []

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AI 投資分析儀數據回補工具")
    parser.add_argument("--mode", choices=["all", "macro", "stocks"], default="all", help="執行模式")
    parser.add_argument("--stock", type=str, help="特定回補的股票代碼")
    parser.add_argument("--market", type=str, help="過濾特定市場 (TW/US)")
    parser.add_argument("--years", type=int, default=2010, help="回補起始年份 (預設 2010)")
    
    args = parser.parse_args()
    manager = BackfillManager()
    
    if args.mode in ["all", "macro"]:
        manager.backfill_macro(start_year=1990)
        
    if args.mode in ["all", "stocks"]:
        if args.stock:
            # 測試特定標的
            manager.backfill_stocks([{"symbol": args.stock, "market": args.market or "TW", "priority": 1}], start_year=args.years)
        else:
            stocks = manager.get_stock_list_from_db(market=args.market)
            manager.backfill_stocks(stocks, start_year=args.years)

    logger.info("✨ 所有數據回補任務已依序處理完畢。")
