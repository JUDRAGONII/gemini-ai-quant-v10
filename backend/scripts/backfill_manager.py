"""
憭扯?璅⊥??鋆恣? (Backfill Manager)
- 鞎痊?瑁??啗??閫????風?脫??鋆?
- ?舀?琿?蝥 (Checkpointing)
- 撖虫??箸??? (Rate Limiting)
"""

import os
import json
import time
import logging
import argparse
from datetime import datetime
from typing import List, Dict, Any

# 閮剖? Python 頝臬?隞亙??backend 璅∠?
import sys
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
backend_path = os.path.join(project_root, "backend")
for path in [project_root, backend_path]:
    if path not in sys.path:
        sys.path.append(path)

from backend.lib.supabase_client import get_supabase
from backend.etl.twse_historical import TwseHistoricalFetcher
from backend.etl.macro import MacroFetcher, MACRO_METADATA
from backend.etl.market import TiingoFetcher, FugleFetcher

# 閮剖??亥?
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("backfill.log", encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# ????Supabase
supabase = get_supabase()
if not supabase:
    # ?岫??????(???啁垢??啣?)
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
        """?郊?脣漲?唾??澈 backfill_status 銵?""
        try:
            supabase.table('backfill_status').upsert({
                "id": job_id,
                "current_symbol": symbol, # ??雿 backfill_status 銵其葉?急?靽? current_symbol ?迂??甇交??
                "status": status,
                "updated_at": datetime.now().isoformat()
            }).execute()
        except Exception as e:
            logger.error(f"Failed to update DB status for {job_id}: {e}")

    def _load_checkpoint(self) -> Dict[str, Any]:
        """頛?脣漲摮?"""
        if os.path.exists(CHECKPOINT_FILE):
            try:
                with open(CHECKPOINT_FILE, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Failed to load checkpoint: {e}")
        return {"stocks": {}, "macro": {}}

    def _save_checkpoint(self):
        """?脣??脣漲摮?"""
        try:
            with open(CHECKPOINT_FILE, 'w', encoding='utf-8') as f:
                json.dump(self.checkpoint, f, indent=4, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Failed to save checkpoint: {e}")

    def backfill_macro(self, start_year: int = 1990):
        """??摰???"""
        logger.info("? ????摰???...")
        start_date = f"{start_year}-01-01"
        
        for code, meta in MACRO_METADATA.items():
            if self.checkpoint["macro"].get(code) == "completed":
                logger.info(f"???? {code} 撌脣???頝喲???)
                continue
            
            logger.info(f"?? 甇?????: {code} ({meta['id']})...")
            self.update_db_status("macro", code)
            try:
                # ???豢?
                df = self.macro_fetcher.fetch(meta['id'], start_date)
                records = self.macro_fetcher.transform(df, indicator_code=code, series_id=meta['id'])
                
                if records:
                    count = self.macro_fetcher.upsert(records, on_conflict='indicator_code,reference_date')
                    logger.info(f"??{code} ??摰?: {count} 蝑???)
                
                self.checkpoint["macro"][code] = "completed"
                self._save_checkpoint()
                
                # ?踹?隢??翰
                time.sleep(1)
                
            except Exception as e:
                logger.error(f"???? {code} ??憭望?: {e}")
                self.update_db_status("macro", code, status="error")
                # ? 429 ?雯頝臬?憿?憓?隡???
                time.sleep(10)
        
        self.update_db_status("macro", "Completed", status="finished")

    def backfill_stocks(self, stock_list: List[Dict[str, Any]], start_year: int = 2005):
        """??憭??湔風?脰???(?舀 TW/US)"""
        logger.info(f"? ????璅?銵? (蝮質? {len(stock_list)} 瑼???...")
        
        for stock in stock_list:
            symbol = stock['stock_code']
            market = stock.get('market_type', 'TW')
            
            if self.checkpoint["stocks"].get(symbol) == "completed":
                logger.info(f"??璅? {symbol} 撌脣???頝喲???)
                continue
            
            logger.info(f"?? 甇??? [{market}] : {symbol}")
            self.update_db_status("stocks", symbol)
            
            try:
                count = 0
                if market == 'US':
                    # 雿輻 Tiingo ??蝢
                    start_date = f"{start_year}-01-01"
                    raw = self.tiingo_fetcher.fetch(symbol, start_date=start_date)
                    records = self.tiingo_fetcher.transform(raw)
                    count = self.tiingo_fetcher.upsert(records, on_conflict='stock_code,trade_date')
                else:
                    # 雿輻 Fugle ??TWSE ???啗
                    # ?芸??岫 Fugle (?舀銝?瑹???頛?)
                    try:
                        # Fugle backfill
                        start_date = f"{start_year}-01-01"
                        count = self.fugle_fetcher.run(symbol, timeframe='D1', start_date=start_date)
                    except Exception as e:
                        logger.warning(f"Fugle fallback to TWSE for {symbol}: {e}")
                        # Fallback to TWSE (??港?撣?
                        count = self.twse_fetcher.backfill(symbol, start_year)
                
                logger.info(f"??{symbol} ?郊摰?嚗摨?{count} 蝑?)
                self.checkpoint["stocks"][symbol] = "completed"
                self._save_checkpoint()
                
                # ?箸撣?亥矽?港???靽風 API
                sleep_time = 3 if market == 'TW' else 1
                time.sleep(sleep_time)
                
            except Exception as e:
                logger.error(f"??璅? {symbol} ??銝剜: {e}")
                self.update_db_status("stocks", symbol, status="error")
                time.sleep(10)
        
        self.update_db_status("stocks", "Completed", status="finished")

    def is_taiwan_stock(self, symbol: str) -> bool:
        """
        ?斗?臬?箏?∩誨??
        ?啗閬?嚗?
        - 4 雿??詨? (銝?祈蟡?
        - 5 雿?(?摮?嚗?甈?/?萄 ETF嚗? 00937B)
        - 6 雿?(?摮?嚗?甈?)
        - ?蝢嚗虜?箏憭批神摮? (TSLA, NVDA) 銝摨西??剜?銝泵?詨???孵噩
        """
        if not symbol:
            return False
            
        # ?啗?孵噩嚗摨?4-6 雿?銝虜隞交摮???(靘? 2330, 0050, 00937B)
        # 蝢?嗾銋?舐??望?摮??
        if len(symbol) >= 4 and len(symbol) <= 6:
            # 憒??雿?詨?嚗扔憭扳???啗??∟?????
            if symbol[:2].isdigit():
                return True
        return False

    def get_stock_list_from_db(self, market: str = None) -> List[Dict[str, Any]]:
        """敺??澈?脣?敺?鋆蟡冽??殷?靘???? (?瑕??岫璈)"""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # ?脣????????銝虫? priority ?? (1 ?擃?
                query = supabase.table('stocks').select('*').eq('is_active', True)
                if market:
                    query = query.eq('market_type', market)
                
                result = query.order('priority', desc=False).execute()
                if result.data:
                    logger.info(f"?? 敺??澈?? {len(result.data)} 瑼??' (撣: ' + market + ')' if market else ''}??)
                    return result.data
                return []
            except Exception as e:
                logger.warning(f"?? 蝚?{attempt + 1} 甈∟????澈憭望?: {e}")
                if attempt < max_retries - 1:
                    time.sleep(5)
                else:
                    logger.error("??霈???澈憭望?銝歇??憭折?閰行活?詻?)
                    return [{"stock_code": "2330", "market_type": "TW", "priority": 1}]
        return []

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AI ??????豢???撌亙")
    parser.add_argument("--mode", choices=["all", "macro", "stocks"], default="all", help="?瑁?璅∪?")
    parser.add_argument("--stock", type=str, help="?孵????蟡其誨蝣?)
    parser.add_argument("--market", type=str, help="?蕪?孵?撣 (TW/US)")
    parser.add_argument("--years", type=int, default=2010, help="??韏瑕?撟港遢 (?身 2010)")
    
    args = parser.parse_args()
    manager = BackfillManager()
    
    if args.mode in ["all", "macro"]:
        manager.backfill_macro(start_year=1990)
        
    if args.mode in ["all", "stocks"]:
        if args.stock:
            # 皜祈岫?孵?璅?
            manager.backfill_stocks([{"stock_code": args.stock, "market_type": args.market or "TW", "priority": 1}], start_year=args.years)
        else:
            stocks = manager.get_stock_list_from_db(market=args.market)
            manager.backfill_stocks(stocks, start_year=args.years)

    logger.info("??????鋆遙?歇靘???摰??)
