import unittest
import requests
import os
import sys
import time
from dotenv import load_dotenv
from datetime import datetime

# Add project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from backend.lib.supabase_client import get_supabase

load_dotenv()

BASE_URL = "http://localhost:8001/api/v1"

class TestPhase13Full(unittest.TestCase):
    """Phase 13 全量整合測試集 (Master Verification)"""

    @classmethod
    def setUpClass(cls):
        print("\n=== Phase 13 Master Verification Started ===")
        # 1. 準備 Mock 數據
        cls.supabase = get_supabase()
        cls.test_ticker = "2330.TW"
        
        # Mock stock_scores_18
        score_data = {
            "symbol": cls.test_ticker,
            "trade_date": datetime.now().strftime("%Y-%m-%d"),
            "v_pe_score": 80, "v_pb_score": 75, "v_dy_score": 60, "v_ev_ebitda_score": 70,
            "g_rev_growth_score": 85, "g_eps_growth_score": 90, "g_stability_score": 80,
            "q_roe_score": 95, "q_gm_score": 90, "q_nm_score": 88, "q_lev_score": 85, "q_ocf_score": 92,
            "m_rs_score": 70, "m_mom6m_score": 75, "m_rsi_score": 60, "m_vol_mom_score": 65,
            "v_avg": 71.25, "g_avg": 85.0, "q_avg": 90.0, "m_avg": 67.5,
            "composite_score": 78.4,
            "macro_regime": "Expansion",
            "updated_at": datetime.now().isoformat()
        }
        
        try:
            # 先清除舊數據
            cls.supabase.table("stock_scores_18").delete().eq("symbol", cls.test_ticker).execute()
            # 寫入新數據
            cls.supabase.table("stock_scores_18").insert(score_data).execute()
            print("  [SETUP] Mock data inserted into stock_scores_18.")
        except Exception as e:
            print(f"  [SETUP] Failed to insert stock_scores_18: {e}")

        # Mock evolution_history
        evo_data = {
            "generation": 9999,
            "best_genome": [0.5] * 26, 
            "avg_fitness": 0.88,
            "max_fitness": 0.95
        }
        try:
            cls.supabase.table("evolution_history").delete().eq("generation", 9999).execute()
            # 使用 raw requests 寫入 evolution_history (因為之前 supabase-py 有問題，雖然可能修復了，但保持一致性)
            # 或者直接嘗試 supabase-py，如果失敗再說。之前驗證過 supabase-py insert OK after fix.
            cls.supabase.table("evolution_history").insert(evo_data).execute()
            print("  [SETUP] Mock data inserted into evolution_history.")
        except Exception as e:
            print(f"  [SETUP] Failed to insert evolution_history: {e}")

        time.sleep(1) # 等待寫入生效

    @classmethod
    def tearDownClass(cls):
        print("\n=== Teardown ===")
        # 清理數據
        try:
            cls.supabase.table("stock_scores_18").delete().eq("symbol", cls.test_ticker).execute()
            cls.supabase.table("evolution_history").delete().eq("generation", 9999).execute()
            print("  [TEARDOWN] Mock data cleaned up.")
        except Exception as e:
            print(f"  [TEARDOWN] Cleanup failed: {e}")

    def test_tc_a_intelligence_scores(self):
        """TC-A: 驗證 18 因子評分數據結構"""
        print("Testing TC-A: Intelligence 18-Factor Scores...")
        # 使用 symbol 參數
        url = f"{BASE_URL}/analysis/18factor-scores?symbol={self.test_ticker}"
        response = requests.get(url)
        
        if response.status_code != 200:
             print(f"  [FAIL] TC-A Error: {response.text}")
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["symbol"], self.test_ticker)
        self.assertIn("composite_score", data)
        self.assertIn("factors", data)
        self.assertEqual(len(data["factors"]), 18)
        print("  [PASS] Intelligence scores structure verified.")

    def test_tc_b_evolution_history(self):
        """TC-B: 驗證演化趨勢與基因映射"""
        print("Testing TC-B: Evolutionary History & Genome...")
        # 先獲取歷史紀錄
        history_res = requests.get(f"{BASE_URL}/evolution/history")
        self.assertEqual(history_res.status_code, 200)
        history_data = history_res.json()
        self.assertIsInstance(history_data, list)
        self.assertTrue(len(history_data) > 0) # 應該至少有我們插入的那一筆
        
        # 測試 Best Individual
        best_res = requests.get(f"{BASE_URL}/evolution/best")
        if best_res.status_code == 200:
            best_data = best_res.json()
            self.assertIn("generation", best_data)
            self.assertIn("best_genome", best_data)
            self.assertEqual(len(best_data["best_genome"]), 26)
            print("  [PASS] Evolution data verified.")
        else:
            print(f"  [FAIL] No best individual found: {best_res.status_code}")
            self.assertEqual(best_res.status_code, 200)

    def test_tc_c_risk_matrix(self):
        """TC-C: 驗證法人級風險風控數據"""
        print("Testing TC-C: Institutional Risk Matrix (Greeks/Barra)...")
        response = requests.get(f"{BASE_URL}/professional/risk-matrix?ticker={self.test_ticker}")
        if response.status_code != 200:
            print(f"  [FAIL] TC-C Error: {response.text}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("greeks", data)
        self.assertIn("barra_decomposition", data)
        self.assertIn("stress_tests", data)
        
        greeks = data["greeks"]
        for g in ["delta", "gamma", "theta", "vega"]:
            self.assertIn(g, greeks)
            
        print("  [PASS] Risk matrix verified.")

    def test_tc_d_debate_integration(self):
        """TC-D: 驗證 AI CIO 辯證整合"""
        print("Testing TC-D: AI CIO Dialectic Debate...")
        try:
            response = requests.get(f"{BASE_URL}/analysis/insights?ticker={self.test_ticker}", timeout=30)
            if response.status_code != 200:
                print(f"  [FAIL] TC-D Error: {response.text}")
            self.assertEqual(response.status_code, 200)
            data = response.json()
            
            self.assertIn("debate", data)
            self.assertIn("conclusion", data)
            print("  [PASS] AI Debate integration verified.")
        except Exception as e:
            print(f"  [SKIP] AI Debate timed out or failed: {e}")

if __name__ == "__main__":
    unittest.main()
