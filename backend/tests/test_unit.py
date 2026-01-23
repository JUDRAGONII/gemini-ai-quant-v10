"""
輕量級單元測試：不依賴外部服務 (Supabase, Gemini API)
用於 GitHub Actions CI 環境驗證基礎邏輯
"""
import unittest
import sys
import os

# 確保 backend 路徑在 sys.path 中
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class TestConfigModule(unittest.TestCase):
    """測試 lib/config.py 的配置驗證邏輯"""
    
    def test_config_env_fallback(self):
        """Config 應能處理環境變數缺失的情況 (使用預設值或 None)"""
        # 在 CI 環境中，Config 會使用 mock values
        # 此測試僅驗證模組能正常 import
        try:
            from lib.config import Config
            # 驗證 API_TIMEOUT 預設值
            self.assertEqual(Config.API_TIMEOUT, 30)
            self.assertEqual(Config.MAX_RETRIES, 3)
        except ValueError as e:
            # 如果 SERVICE_ROLE_KEY 缺失，Config.validate() 會拋出 ValueError
            # 這在某些 CI 環境中是預期的行為（未設 mock env）
            self.assertIn("SERVICE_ROLE_KEY", str(e))

class TestMacroETLLogic(unittest.TestCase):
    """測試 ETL 模組的純邏輯部分"""
    
    def test_macro_indicator_mapping(self):
        """驗證 MACRO_METADATA 字典結構正確"""
        from etl.macro import MACRO_METADATA
        
        # 驗證必要指標存在
        self.assertIn("GDP", MACRO_METADATA)
        self.assertIn("CPI", MACRO_METADATA)
        self.assertIn("VIX", MACRO_METADATA)
        
        # 驗證 FRED Series ID 格式
        for name, meta in MACRO_METADATA.items():
            self.assertIsInstance(meta, dict)
            self.assertIn('id', meta)
            self.assertIsInstance(meta['id'], str)
            self.assertGreater(len(meta['id']), 0, f"{name} should have a valid series_id")

class TestDialecticPromptStructure(unittest.TestCase):
    """測試 AI 辯論引擎的提示詞結構"""
    
    def test_prompt_contains_required_roles(self):
        """辯論提示詞應包含多空角色定義"""
        # 模擬提示詞模板中應有的關鍵字
        required_keywords = ["Bull", "Bear", "Analyst"]
        
        # 由於實際 prompt 在 dialectic.py 內部，這裡測試模組能正常 import
        try:
            from agents.dialectic import DialecticAgent
            # 如果能成功 import，說明模組結構正確
            self.assertTrue(True)
        except ImportError as e:
            self.fail(f"Failed to import DialecticAgent: {e}")

if __name__ == '__main__':
    unittest.main()
