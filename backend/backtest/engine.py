import pandas as pd
import numpy as np
import logging
from typing import Dict, Any, Optional

from backend.backtest.metrics import get_performance_summary

logger = logging.getLogger(__name__)

class VectorBacktester:
    """
    向量化回測引擎 (Vectorized Backtester)
    特點: 高性能、低延遲、支持精確成本計算
    """
    
    def __init__(self, data: pd.DataFrame):
        """
        :param data: 必須包含 Datetime Index 與 'close_price' 欄位
        """
        if not isinstance(data.index, pd.DatetimeIndex):
            data.index = pd.to_datetime(data.index)
        
        self.data = data.sort_index()
        self.results = None

    def run(self, 
            signals: pd.Series, 
            fee_rate: float = 0.001425 * 0.6, 
            tax_rate: float = 0.003, 
            slippage: float = 0.0005) -> Dict[str, Any]:
        """
        執行回測
        :param signals: 信號序列 (1: 做多, 0: 平倉, -1: 做空)
        :param fee_rate: 手續費 (預設 0.1425% 打 6 折)
        :param tax_rate: 證交稅 (預設 0.3%)
        :param slippage: 滑價 (預設 0.05%)
        """
        # 1. 數據對齊
        df = self.data[['close_price']].copy()
        df['signal'] = signals.reindex(df.index).fillna(0)
        
        # 2. 避免預知未來 (Look-ahead Bias)
        # 今日生成的信號，明天才能執行交易
        df['signal_exec'] = df['signal'].shift(1).fillna(0)
        
        # 3. 計算股價每日回報 (Log Return)
        df['market_return'] = np.log(df['close_price'] / df['close_price'].shift(1))
        
        # 4. 策略毛收益
        df['strategy_return'] = df['signal_exec'] * df['market_return']
        
        # 5. 計算成本 (Transaction Costs)
        # 換手 (Turnover) 發生於信號變動時
        df['turnover'] = (df['signal_exec'] - df['signal_exec'].shift(1)).abs().fillna(0)
        
        # 買入/賣出成本估算:
        # 手續費 (買賣皆收) + 滑價 (買賣皆收) + 證交稅 (僅賣出收)
        # 向量化簡化: 單邊平均成本 = Fee + Slippage + (Tax / 2)
        one_way_cost = fee_rate + slippage + (tax_rate / 2)
        df['costs'] = df['turnover'] * one_way_cost
        
        # 6. 計算策略淨收益
        df['net_return'] = (df['strategy_return'] - df['costs']).fillna(0)
        
        # 7. 計算累計淨值 (Equity Curve)
        df['equity_curve'] = np.exp(df['net_return'].cumsum())
        
        # 8. 計算績效摘要
        self.results = df
        summary = get_performance_summary(df['equity_curve'], df['net_return'])
        
        return {
            "summary": summary,
            "data": df[['signal', 'equity_curve', 'net_return']]
        }

if __name__ == "__main__":
    # 測試腳本
    import matplotlib.pyplot as plt
    
    # 1. 模擬數據
    dates = pd.date_range('2024-01-01', periods=100)
    prices = 100 + np.cumsum(np.random.normal(0, 1, 100))
    df_test = pd.DataFrame({'close_price': prices}, index=dates)
    
    # 2. 模擬信號 (簡單均線或隨機)
    signals_test = pd.Series(np.random.choice([0, 1], 100), index=dates)
    
    # 3. 執行回測
    vbt = VectorBacktester(df_test)
    res = vbt.run(signals_test)
    
    print("Performance Summary:")
    for k, v in res['summary'].items():
        print(f"{k}: {v:.4f}")
    
    # 繪圖驗證 (若環境支援)
    # res['data']['equity_curve'].plot()
    # plt.show()
