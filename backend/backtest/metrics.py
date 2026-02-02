import pandas as pd
import numpy as np
from typing import Dict, Any

def calculate_cagr(equity_curve: pd.Series) -> float:
    """計算年化複合成長率 (CAGR)"""
    n_years = len(equity_curve) / 252 # 假設一年 252 個交易日
    if n_years == 0: return 0.0
    total_return = equity_curve.iloc[-1] / equity_curve.iloc[0]
    return (total_return ** (1 / n_years)) - 1

def calculate_max_drawdown(equity_curve: pd.Series) -> float:
    """計算最大回撤 (MDD)"""
    rolling_max = equity_curve.cummax()
    drawdown = (equity_curve - rolling_max) / rolling_max
    return drawdown.min()

def calculate_sharpe(returns: pd.Series, risk_free: float = 0.01) -> float:
    """計算夏普比率 (Sharpe Ratio)"""
    adj_returns = returns - (risk_free / 252)
    if adj_returns.std() == 0: return 0.0
    return (adj_returns.mean() / adj_returns.std()) * (252 ** 0.5)

def calculate_sortino(returns: pd.Series, risk_free: float = 0.01) -> float:
    """計算索提諾比率 (Sortino Ratio) - 僅考慮下行風險"""
    adj_returns = returns - (risk_free / 252)
    downside_returns = adj_returns[adj_returns < 0]
    if len(downside_returns) == 0 or downside_returns.std() == 0:
        return 0.0
    return (adj_returns.mean() / downside_returns.std()) * (252 ** 0.5)

def calculate_win_rate(returns: pd.Series) -> float:
    """計算勝率 (盈虧天數比)"""
    positive_days = returns[returns > 0]
    if len(returns) == 0: return 0.0
    return len(positive_days) / len(returns)

def get_performance_summary(equity_curve: pd.Series, returns: pd.Series) -> Dict[str, Any]:
    """產出完整績效摘要報告"""
    if equity_curve.empty or len(equity_curve) < 2:
        return {
            "total_return": 0.0, "cagr": 0.0, "max_drawdown": 0.0,
            "sharpe": 0.0, "sortino": 0.0, "win_rate": 0.0
        }
    
    start_val = equity_curve.iloc[0]
    end_val = equity_curve.iloc[-1]
    
    total_return = (end_val / start_val) - 1 if start_val != 0 else 0.0
    
    return {
        "total_return": float(total_return),
        "cagr": float(calculate_cagr(equity_curve)),
        "max_drawdown": float(calculate_max_drawdown(equity_curve)),
        "sharpe": float(calculate_sharpe(returns)),
        "sortino": float(calculate_sortino(returns)),
        "win_rate": float(calculate_win_rate(returns))
    }
