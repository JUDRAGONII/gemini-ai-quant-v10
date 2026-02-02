"""
Phase 5.4: 鞎∪?豢????單
?瑁? DB Migration 銝血?鋆蜓閬??∟瓷?望??

Usage:
    cd backend
    python -m scripts.run_financials_backfill
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.lib.supabase_client import get_supabase
from backend.lib.config import Config
from backend.etl.financials_fetcher import FMPFetcher
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 銝餉?蝢璅?
TARGET_STOCKS = [
    "AAPL",   # Apple
    "MSFT",   # Microsoft
    "GOOGL",  # Alphabet
    "AMZN",   # Amazon
    "NVDA",   # NVIDIA
    "META",   # Meta
    "TSLA",   # Tesla
    "BRK-B",  # Berkshire Hathaway
    "V",      # Visa
    "JNJ",    # Johnson & Johnson
]

def run_migration(client):
    """?瑁? DB Migration (雿輻 Supabase RPC ???SQL)"""
    logger.info("? Executing DB Migration: stock_financials table...")
    
    migration_sql = """
    CREATE TABLE IF NOT EXISTS stock_financials (
        id BIGSERIAL PRIMARY KEY,
        stock_code VARCHAR(20) NOT NULL,
        report_date DATE NOT NULL,
        report_type VARCHAR(10) NOT NULL CHECK (report_type IN ('annual', 'quarterly')),
        revenue NUMERIC,
        gross_profit NUMERIC,
        operating_income NUMERIC,
        net_income NUMERIC,
        eps NUMERIC,
        total_assets NUMERIC,
        total_liabilities NUMERIC,
        total_equity NUMERIC,
        operating_cash_flow NUMERIC,
        free_cash_flow NUMERIC,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(stock_code, report_date, report_type)
    );
    
    CREATE INDEX IF NOT EXISTS idx_financials_stock_code ON stock_financials(stock_code);
    CREATE INDEX IF NOT EXISTS idx_financials_report_date ON stock_financials(report_date DESC);
    CREATE INDEX IF NOT EXISTS idx_financials_report_type ON stock_financials(report_type);
    """
    
    try:
        # Supabase 銝?交??DDL嚗蝙??postgrest ??rpc ??raw SQL
        # ?寧 SELECT 皜祈岫銵冽?血???
        result = client.table('stock_financials').select('id').limit(1).execute()
        logger.info("??Table 'stock_financials' already exists, skipping migration.")
        return True
    except Exception as e:
        if "does not exist" in str(e).lower() or "42P01" in str(e):
            logger.warning("?? Table does not exist. Please run migration manually in Supabase SQL Editor:")
            logger.warning("?? Copy content from: supabase/migrations/20260127_stock_financials.sql")
            return False
        else:
            logger.error(f"??Migration check failed: {e}")
            return False

def run_backfill(client):
    """?瑁?鞎∪?豢???"""
    fetcher = FMPFetcher(client)
    
    if not Config.FMP_API_KEY:
        logger.error("??FMP_API_KEY not found in environment!")
        return
    
    logger.info(f"?? Starting financials backfill for {len(TARGET_STOCKS)} stocks...")
    logger.info(f"?? Using FMP API Key: {Config.FMP_API_KEY[:8]}...")
    
    total_records = 0
    
    for symbol in TARGET_STOCKS:
        try:
            count = fetcher.run(symbol, limit=5)  # 5 撟湔風??(Free Tier ?)
            total_records += count
            logger.info(f"  ??{symbol}: {count} records")
        except Exception as e:
            logger.error(f"  ??{symbol}: {e}")
    
    logger.info(f"?? Backfill completed! Total records: {total_records}")

if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("Phase 5.4: 鞎∪?豢????單")
    logger.info("=" * 60)
    
    client = get_supabase()
    
    # Step 1: Check/Run Migration
    run_migration(client)
    
    # Step 2: Run Backfill
    run_backfill(client)
    
    logger.info("?? All tasks completed!")
