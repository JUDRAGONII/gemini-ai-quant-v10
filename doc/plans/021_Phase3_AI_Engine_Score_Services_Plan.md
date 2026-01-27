# 021_Phase3_AI_Engine_Score_Services_Plan (AI 引擎與評分服務計畫)

## 1. 目標描述
開發系統的智慧核心，包含基於基因演算法 (Genetic Algorithm) 的策略優化引擎，以及多因子量化評分服務，為投資決策提供量化依據。

## 2. 關鍵實作內容

### 2.1 演化策略引擎 (Phase 3.1)
- **基因組定義**: 包含 26 項量化參數（如 RSI 門檻、MA 週期均線、停損停利比等）。
- **種群管理**: 實作交叉 (Crossover)、突變 (Mutation) 與精英保留策略。
- **回測引擎**: 整合歷史 OHLCV 數據，計算適應度函數 (Fitness Function)，以風險調整後報酬 (Sharpe Ratio) 為優化目標。

### 2.2 多因子評分服務 (Phase 3.2)
- **因子庫**: 涵蓋價值 (PE, PB)、成長 (Revenue Growth)、動能 (Price Momentum) 與籌碼 (Institutional Flow)。
- **正規化邏輯**: 使用 Z-Score 或百分位序將不同維度數據轉化為 0-100 分。
- **權重配置**: 支援自定義權重配置，或使用 AI 自動調整權重。

## 3. 技術規格
- **Backend Service**: `evolution_engine.py`, `factor_service.py`。
- **Storage**: `evolution_genes` 與 `backtest_results` 資料表。
- **Computing**: 使用 Pandas 進行向量化運算以提升回測效率。

## 4. 驗證計畫
### 自動化測試
- `test_genetic_algorithm.py`: 驗證演化收斂性與隨機數穩定性。
- `test_factor_scoring.py`: 驗證各項指標分佈是否符合常態分佈。

### 手動驗證
- 透過 `Admin Monitor` 檢視演化基因趨勢。
- 比對手寫 SQL 計算結果與 AI 評分結果的一致性。
