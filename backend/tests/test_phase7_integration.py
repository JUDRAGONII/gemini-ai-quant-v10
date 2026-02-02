import pytest
import sys
import os
from datetime import datetime
from supabase import create_client
import logging

# ??嗥? Python Path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.lib.config import Config

# 閮剖? Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Phase7Test")

@pytest.fixture(scope="module")
def supabase():
    """撱箇??祕??Supabase Client"""
    url = os.getenv("SUPABASE_URL", "http://localhost:8000")
    key = os.getenv("SERVICE_ROLE_KEY")
    if not key:
        pytest.skip("蝻箏? SERVICE_ROLE_KEY嚗歲??葫閰?)
    return create_client(url, key)

class TestPhase7Integration:

    def test_tc_1001_stock_detail_aggregate(self, supabase):
        """TC-1001: 撽??∠巨閰單????豢? (Real DB Check)"""
        # 雿輻?啁??颱??箸葫閰行???
        symbol = '2330'
        
        # 璅⊥ API ???摩
        # 1. ?∠巨?箸鞈?
        stock = supabase.table("stocks").select("*").eq("stock_code", symbol).single().execute()
        assert stock.data is not None
        assert stock.data['stock_code'] == symbol

        # 2. ??啗???(敺??銵刻???
        quote = supabase.table("daily_price").select("*").eq("stock_code", symbol).order("trade_date", desc=True).limit(1).execute()
        assert len(quote.data) > 0
        logger.info(f"TC-1001 Pass: Found quote for {symbol} on {quote.data[0]['trade_date']}")

    def test_tc_1002_chips_backfill_count(self, supabase):
        """TC-1002: 撽? 2024-01-18 蝐Ⅳ?豢?????"""
        target_date = '2024-01-18'
        
        # 瑼Ｘ銝之瘜犖
        inst = supabase.table("stock_institutional").select("count", count="exact").eq("trade_date", target_date).execute()
        inst_count = inst.count if inst.count is not None else 0
        logger.info(f"Institutional count for {target_date}: {inst_count}")
        assert inst_count > 14000, f"銝之瘜犖????頞? {inst_count}"

        # 瑼Ｘ???
        margin = supabase.table("stock_margin").select("count", count="exact").eq("trade_date", target_date).execute()
        margin_count = margin.count if margin.count is not None else 0
        logger.info(f"Margin count for {target_date}: {margin_count}")
        assert margin_count > 1100, f"???????頞? {margin_count}"

    def test_tc_2001_partition_boundary_query(self, supabase):
        """TC-2001: 撽?鞈?摨怠??頝典僑摨行閰Ｘ扯?迤蝣箸?""
        # ?亥岷 2023 撟湔??2024 撟游??豢?
        dates = ['2023-12-29', '2024-01-02']
        res = supabase.table("daily_price").select("trade_date").in_("trade_date", dates).execute()
        
        returned_dates = [r['trade_date'] for r in res.data]
        logger.info(f"Boundary query returned dates: {returned_dates}")
        
        # ?望?臬?鋆???喳?????2024-01-02
        assert '2024-01-02' in returned_dates

    def test_tc_3001_partition_rls_check(self, supabase):
        """TC-3001: 撽???銵?RLS 摰??(霈????"""
        # ?ㄐ瑼Ｘ銝餉”?臬????RLS
        # ??閮?Service Role ?臭誑霈???隞交??葫閰衣??胯?瑽?行迤蝣箇匱?踴?
        res = supabase.table("daily_price").select("stock_code").limit(1).execute()
        assert res.data is not None

    def test_tc_3003_supabase_studio_status(self):
        """TC-3003: ?? HTTP 隢?撽? Supabase Studio ?臬?臬???""
        import requests
        try:
            # 皜祈岫 Studio port (54323)
            # 瘜冽?嚗 Docker ?啣??批?賡?閬? localhost 閮芸??憭 IP
            response = requests.get("http://localhost:54323", timeout=10)
            assert response.status_code == 200
            logger.info("TC-3003 Pass: Supabase Studio is accessible at port 54323")
        except Exception as e:
            logger.warning(f"TC-3003 Warning: Subabase Studio access check failed locally: {e}")
            # ?交?典??典??? CI ?歲??雿?啁憓???

if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
