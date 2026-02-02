# Phase 8.4：高效回測引擎詳細實作計畫

**計畫編號**：030
**版本**：1.0.0
**建立日期**：2026-01-30
**所屬階段**：Phase 8.4 (Backtest Engine)
**關聯任務**：T-AI-007
**狀態**：已完成 (Completed)
**預估工時**：5 人天

---

## 一、計畫核心目標

本計畫旨在構建一個高性能的 **向量化回測引擎 (Vectorized Backtester)**，取代傳統的事件驅動 (Event-driven) 循環回測，以滿足 AI 模型大規模參數搜索的效能需求。

### 核心任務
1.  **向量化運算 (Vectorization)**: 利用 Pandas/NumPy 矩陣運算，將回測速度提升 100 倍以上。
2.  **成本模擬 (Cost Simulation)**: 精確模擬交易手續費 (Fee) 與滑價 (Slippage)，確保回測結果貼近真實。
3.  **績效指標 (Performance Metrics)**: 自動計算 Sharpe Ratio, Sortino Ratio, Max Drawdown (MDD), CAGR, Win Rate。
4.  **視覺化 API (Visualization API)**: 提供前端繪製權益曲線 (Equity Curve) 與回撤圖所需的標準化 JSON 數據。

---

## 二、數學模型與邏輯

### 2.1 權益計算 (Equity Calculation)
假設 $P_t$ 為 $t$ 日股價，$S_t$ 為 $t$ 日持倉信號 (1: 做多, 0: 空手, -1: 做空)。

*   **信號延遲 (Signal Lag)**: $S_{exec} = S_{t-1}$ (今日信號決定明日倉位)。
*   **每日報酬 (Daily Return)**: $R_t = \frac{P_t - P_{t-1}}{P_{t-1}}$
*   **策略毛報酬 (Gross Strategy Return)**: $R_{strat, t} = S_{exec, t} \times R_t$

### 2.2 成本模型 (Transaction Cost Model)
*   **換手率 (Turnover)**: $TO_t = |S_{exec, t} - S_{exec, t-1}|$
*   **總成本 (Cost)**: $C_t = TO_t \times (Fee + Slippage)$
    *   台股手續費: 0.1425% * 0.6 (電子下單折讓) $\approx$ 0.0855%
    *   證交稅: 0.3% (僅賣出時收，向量化簡化為單邊 0.15% 或依方向判定)
    *   滑價模擬: 預設單邊 0.05%

*   **策略淨報酬 (Net Strategy Return)**: $R_{net, t} = R_{strat, t} - C_t$
*   **累計淨值 (Equity Curve)**: $E_t = E_0 \times \prod_{i=1}^{t} (1 + R_{net, i})$

---

## 三、系統架構設計

### 3.1 目錄結構
```text
backend/
├── backtest/
│   ├── __init__.py
│   ├── engine.py       # VectorBacktester 核心類別
│   ├── metrics.py      # 績效指標計算庫
│   └── strategies/     # 策略定義 (BaseStrategy, AIStrategy)
```

### 3.2 類別設計 (`backend/backtest/engine.py`)

```python
class VectorBacktester:
    def __init__(self, data: pd.DataFrame):
        """
        data: 含 'close', 'open' 等欄位的 DataFrame (Datetime Index)
        """
        self.data = data
        self.results = {}
        
    def run(self, signals: pd.Series, fee_rate: float = 0.001425*0.6, tax_rate: float = 0.003, slippage: float = 0.0005):
        """
        輸入信號序列，計算回測結果
        signals: 時間序列信號 (1, 0, -1)
        """
        # 1. Align Signal
        # 2. Vectorized Calculation (Returns, Costs)
        # 3. Compute Metrics
        pass
```

### 3.3 績效指標 (`backend/backtest/metrics.py`)
*   `calculate_sharpe(returns, risk_free=0.01)`
*   `calculate_sortino(returns, risk_free=0.01)`
*   `calculate_max_drawdown(equity_curve)`
*   `calculate_win_rate(returns)`

---

## 四、API 設計

### 4.1 執行回測 (`POST /api/v1/backtest/run`)
*   **Request**:
    ```json
    {
      "stock_code": "2330",
      "strategy_config": {
        "name": "AI_XGBoost",
        "threshold": 0.02
      },
      "start_date": "2024-01-01",
      "end_date": "2024-12-31"
    }
    ```
*   **Response**:
    ```json
    {
      "metrics": {
        "sharpe": 1.5,
        "mdd": -0.12,
        "total_return": 0.25,
        "win_rate": 0.55
      },
      "charts": {
        "equity": [{"date": "...", "value": 1.0}, ...],
        "drawdown": [{"date": "...", "value": -0.01}, ...]
      }
    }
    ```

---

## 五、執行步驟 (Action Plan)

1.  **模組建立**: 初始化 `backend/backtest` 目錄與必要的 `__init__.py`。
2.  **核心開發**:
    *   實作 `metrics.py`: 實現 Sharpe, MDD 等數學函數。
    *   實作 `engine.py`: 實現向量化回測邏輯。
3.  **整合測試**: 使用已知策略 (如 MA Crossover) 對 2330 進行測試，驗證邏輯正確性。
4.  **AI 策略整合**: 將 `Predictor` 的預測結果轉換為 `VectorBacktester` 的信號輸入，完成 AI 回測。

---

**文件結束**
*計畫編號：030*
*版本：1.0.0*
*建立日期：2026-01-30*
*文件狀態：正式發布*
