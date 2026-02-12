import unittest
from unittest.mock import MagicMock, patch
import json
import sys
import os
from datetime import date

# 確保 backend 可被 import
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

class TestAnalysisService(unittest.IsolatedAsyncioTestCase):
    """測試 Phase 13.1 AnalysisService (18 因子評分)"""

    async def asyncSetUp(self):
        # Mock 依賴
        self.mock_supabase = MagicMock()
        self.mock_redis = MagicMock()
        
        # Patch get_supabase & redis.from_url
        self.supabase_patcher = patch('backend.services.analysis_service.get_supabase', return_value=self.mock_supabase)
        self.redis_patcher = patch('redis.from_url', return_value=self.mock_redis)
        
        self.supabase_patcher.start()
        self.redis_patcher.start()

        from backend.services.analysis_service import AnalysisService
        self.service = AnalysisService()

    async def asyncTearDown(self):
        self.supabase_patcher.stop()
        self.redis_patcher.stop()

    async def test_get_18factor_scores_success(self):
        """TC-1001: 正常查詢 18 因子評分"""
        # Mock Redis miss
        self.mock_redis.get.return_value = None
        
        # Mock Supabase response
        mock_data = [{
            "symbol": "2330",
            "trade_date": "2024-02-11",
            "composite_score": 85.5,
            "v_avg": 70, "g_avg": 80, "q_avg": 90, "m_avg": 95,
            # 因子細項...
            "v_pe_score": 60, "v_pb_score": 80
        }]
        
        # Mock query chain
        (self.mock_supabase.table.return_value
         .select.return_value
         .eq.return_value
         .order.return_value
         .limit.return_value
         .execute.return_value) = MagicMock(data=mock_data)

        result = await self.service.get_18factor_scores("2330")
        
        # 成功時直接回傳數據字典 (不含 status 欄位)
        self.assertEqual(result["composite_score"], 85.5)
        self.assertEqual(len(result["dimensions"]), 4) # VQGM
        # 驗證 Value 維度分數 (v_avg=70)
        self.assertEqual(result["dimensions"][0]["score"], 70)
        self.assertFalse(result["cached"])

    async def test_get_18factor_scores_no_data(self):
        """TC-1002: 查詢無資料標的"""
        self.mock_redis.get.return_value = None
        
        (self.mock_supabase.table.return_value
         .select.return_value
         .eq.return_value
         .order.return_value
         .limit.return_value
         .execute.return_value) = MagicMock(data=[])

        result = await self.service.get_18factor_scores("9999")
        
        self.assertEqual(result["status"], "no_data")
        self.assertIn("尚無", result["message"])

    async def test_trigger_calculation(self):
        """TC-1003: 觸發計算 RPC"""
        (self.mock_supabase.rpc.return_value
         .execute.return_value) = MagicMock(data={"status": "ok"})

        result = await self.service.trigger_calculation()
        self.assertEqual(result["status"], "ok")


class TestInsightsService(unittest.IsolatedAsyncioTestCase):
    """測試 Phase 13.2 InsightsService (AI 辯證)"""

    async def asyncSetUp(self):
        self.mock_supabase = MagicMock()
        self.mock_redis = MagicMock()
        
        self.supabase_patcher = patch('backend.services.insights_service.get_supabase', return_value=self.mock_supabase)
        self.redis_patcher = patch('redis.from_url', return_value=self.mock_redis)
        
        self.supabase_patcher.start()
        self.redis_patcher.start()

        from backend.services.insights_service import InsightsService
        self.service = InsightsService()

    async def asyncTearDown(self):
        self.supabase_patcher.stop()
        self.redis_patcher.stop()

    def test_safe_parse_json(self):
        """TC-2101: 異常 JSON 解析容錯"""
        # Case 1: 正常 JSON
        valid_json = '{"key": "value"}'
        res1 = self.service._safe_parse_json(valid_json, {})
        self.assertEqual(res1["key"], "value")

        # Case 2: Markdown block
        md_json = '```json\n{"key": "value"}\n```'
        res2 = self.service._safe_parse_json(md_json, {})
        self.assertEqual(res2["key"], "value")

        # Case 3: Broken JSON
        broken_json = '{key: value}' # Invalid strict JSON
        fallback = {"status": "error"}
        res3 = self.service._safe_parse_json(broken_json, fallback)
        self.assertEqual(res3, fallback)

    async def test_get_dialectic_consensus_cached(self):
        """TC-3001: Redis 快取機制驗證"""
        cached_data = {
            "ticker": "2330",
            "consensus": "看多",
            "agents": []
        }
        self.mock_redis.get.return_value = json.dumps(cached_data)
        
        result = await self.service.get_dialectic_consensus("2330")
        
        self.assertTrue(result["cached"])
        self.assertEqual(result["consensus"], "看多")
        # 確認沒有呼叫 Supabase 或 LLM
        self.mock_supabase.table.assert_not_called()

if __name__ == '__main__':
    unittest.main()
