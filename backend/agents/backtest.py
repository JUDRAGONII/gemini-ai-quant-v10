import pandas as pd
import numpy as np
import logging
from typing import List, Dict, Any, Tuple
from datetime import datetime

logger = logging.getLogger(__name__)

class BacktestEngine:
    """
    量化回測引擎
    用於計算策略基因組的適應度 (Sharpe Ratio)。
    """

    def __init__(self, data: pd.DataFrame, initial_capital: float = 1000000.0):
        self.data = data
        self.initial_capital = initial_capital

    def evaluate(self, weights: Dict[str, float]) -> Tuple[float, float, float]:
        """
        評估特定權重下的策略表現。
        回傳: (Sharpe Ratio, Annual Return, Max Drawdown)
        """
        # 由於目前實體資料庫尚未填滿，此處實作一個模擬計算邏輯
        # 未來應串接真實的因子權重與價格聯播
        
        if self.data.empty:
            return 0.0, 0.0, 0.0
            
        # 模擬收益率 (基於隨機權重與價格波動)
        # TODO: 實作基於 stock_factors 的權重模擬
        returns = self.data['close_price'].pct_change().dropna()
        
        if len(returns) < 2:
            return 0.0, 0.0, 0.0
            
        # 簡單夏普比率計算 (假設無風險利率 1%)
        risk_free = 0.01 / 252
        excess_returns = returns - risk_free
        
        sharpe = np.sqrt(252) * excess_returns.mean() / excess_returns.std() if excess_returns.std() != 0 else 0
        annual_return = returns.mean() * 252
        
        # 最大回撤
        cum_returns = (1 + returns).cumprod()
        peak = cum_returns.expanding(min_periods=1).max()
        drawdown = (cum_returns / peak) - 1
        max_dd = drawdown.min()
        
        return float(sharpe), float(annual_return), float(max_dd)

    @staticmethod
    def calculate_fitness(sharpe: float, max_dd: float) -> float:
        """計算綜合適應度分數"""
        # 若最大回撤超過 20%，則大幅懲罰適應度
        penalty = 1.0
        if max_dd < -0.20:
            penalty = 0.5
            
        return sharpe * penalty
