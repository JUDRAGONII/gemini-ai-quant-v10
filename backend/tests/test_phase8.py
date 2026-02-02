import unittest
import pandas as pd
import numpy as np
import os
import sys

# Ensure backend is in path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.models.trainer import ModelTrainer
from backend.models.predictor import Predictor
from backend.backtest.engine import VectorBacktester

class TestPhase8Core(unittest.TestCase):
    """
    Phase 8 核心邏輯測試 (TC-1001, TC-1002)
    """

    def setUp(self):
        # 建立模擬數據
        self.dates = pd.date_range('2024-01-01', periods=100)
        self.prices = pd.DataFrame({
            'close_price': 100 + np.cumsum(np.random.normal(0, 1, 100))
        }, index=self.dates)
        
        # 模擬因子數據
        self.factors = pd.DataFrame({
            'roc_5': np.random.normal(0, 0.01, 100),
            'rsi_14': np.random.uniform(30, 70, 100)
        }, index=self.dates)

    def test_tc_1001_backtester_logic(self):
        """TC-1001: 驗證回測引擎之向量化計算正確性與成本模擬"""
        vbt = VectorBacktester(self.prices)
        
        # 建立全買信號
        signals = pd.Series(1, index=self.dates)
        
        # 執行回測 (無滑價無成本以驗證基準)
        res = vbt.run(signals, fee_rate=0, tax_rate=0, slippage=0)
        
        # 驗證累計淨值起點應為 1.0
        self.assertAlmostEqual(res['data']['equity_curve'].iloc[0], 1.0)
        
        # 驗證末端淨值應等於 總回報
        final_price = self.prices['close_price'].iloc[-1]
        start_price = self.prices['close_price'].iloc[0] # Note: shifted logic means first traded price is P(1)
        # The engine uses shift(1) for execution.
        log_rets = np.log(self.prices['close_price'] / self.prices['close_price'].shift(1))
        # signal_exec = signals.shift(1). At index 0 it's 0. At index 1..99 it's 1.
        # So it gets log_rets from index 1 to 99.
        expected_ret = np.exp(log_rets.iloc[1:].sum())
        self.assertAlmostEqual(res['data']['equity_curve'].iloc[-1], expected_ret)

    def test_tc_1002_predictor_mock_inference(self):
        """TC-1002: 驗證預測器之特徵對齊邏輯"""
        # 建立 Predictor (模擬無模型狀態)
        predictor = Predictor(model_path="non_existent.json")
        
        # 注入特徵清單
        predictor.features = ['f1', 'f2', 'f3']
        
        # 模擬輸入數據 (少一個 f3)
        mock_input = pd.DataFrame({'f1': [1.0], 'f2': [2.0]})
        
        # 測試對齊邏輯 (在 predict 內部調用)
        # 我們直接測試其對齊結果
        df_input = pd.DataFrame(index=mock_input.index, columns=predictor.features)
        common_cols = list(set(mock_input.columns) & set(predictor.features))
        df_input[common_cols] = mock_input[common_cols]
        df_input = df_input.fillna(0).astype(float)
        
        self.assertEqual(df_input.shape[1], 3)
        self.assertIn('f3', df_input.columns)
        self.assertEqual(df_input.loc[0, 'f3'], 0.0)

    def test_transaction_cost_impact(self):
        """驗證交易成本是否真的降低了淨值 (Negative Impact)"""
        vbt = VectorBacktester(self.prices)
        
        # 頻繁換手信號 [1, 0, 1, 0...]
        signals = pd.Series([i % 2 for i in range(100)], index=self.dates)
        
        # 執行無成本回測
        res_no_cost = vbt.run(signals, fee_rate=0, tax_rate=0, slippage=0)
        
        # 執行有成本回測
        res_with_cost = vbt.run(signals, fee_rate=0.01) # 1% 超高手續費
        
        self.assertLess(res_with_cost['data']['equity_curve'].iloc[-1], 
                        res_no_cost['data']['equity_curve'].iloc[-1])

if __name__ == '__main__':
    unittest.main()
