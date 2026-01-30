# Phase 8.3：AI 模型訓練實驗室詳細實作計畫

**計畫編號**：029
**版本**：1.0.0
**建立日期**：2026-01-30
**所屬階段**：Phase 8.3 (Model Training Lab)
**關聯任務**：T-AI-006
**狀態**：已完成 (Completed)
**預估工時**：5 人天

---

## 一、計畫核心目標

本計畫旨在利用 Phase 8.1 產出的 Alpha 因子矩陣，訓練一個能夠準確預測個股未來 5 日超額回報 (Alpha) 的 **XGBoost Regressor** 模型，並將其封裝為實時推理 API。

### 核心任務
1.  **訓練集構建 (Dataset Building)**: 利用 `AlphaFactory` 產出的因子做為特徵 (X)，計算未來 5 日超額報酬做為標籤 (y)。
2.  **模型訓練 (Model Training)**: 實作 `ModelTrainer` 類別，封裝 XGBoost 訓練流程 (Train/Test Split, Training, Evaluation)。
3.  **模型持久化 (Serialization)**: 建立模型版本管理機制 (`.model` 或 `.pkl` 檔案)，存儲於 `backend/models/saved/`。
4.  **推理服務 (Inference API)**: 實作 `Predictor` 類別與 FastAPI 端點，提供即時預測能力。

---

## 二、數據集準備

### 2.1 標籤定義 (Target Label)
我們預測的目標是 **未來 5 日相對於大盤的超額報酬 (5-Day Alpha)**。

$$ \text{Alpha}_{5d} = \ln(\frac{P_{t+5}}{P_t}) - \ln(\frac{I_{t+5}}{I_t}) $$

*   $P_t$: 個股收盤價
*   $I_t$: 大盤指數 (TWII) 收盤價

### 2.2 特徵矩陣 (Feature Matrix)
使用 `stock_factors` 表中的 `factors_all` 欄位 (JSONB) 展開作為特徵。
*   **Momentum**: `MOM_RSI`, `MOM_MACD_DIFF`, `MOM_ROC_20`...
*   **Volatility**: `VOL_ATR_RATIO`, `VOL_BB_WIDTH`...
*   **Volume/Chips**: `VLM_MA_RATIO`, `CHP_INST_NET_RATIO`...

---

## 三、系統架構設計

### 3.1 訓練器 (`backend/models/trainer.py`)
```python
class ModelTrainer:
    def __init__(self, stock_codes: List[str]):
        self.stock_codes = stock_codes
        self.model = xgb.XGBRegressor(
            objective='reg:squarederror',
            n_estimators=1000,
            learning_rate=0.05,
            max_depth=6,
            early_stopping_rounds=50,
            tree_method='hist', # fast histogram optimized
            device='cuda' if torch.cuda.is_available() else 'cpu'
        )
        
    def prepare_data(self) -> Tuple[pd.DataFrame, pd.Series]:
        # 1. Fetch Price & Factors from DB
        # 2. Compute Label (Future 5d Return - Market Return)
        # 3. Align X and y (Drop NaNs)
        pass
        
    def train(self):
        # 1. Time-series Split (e.g., Train: 2020-2024, Valid: 2025)
        # 2. Fit Model
        # 3. Evaluate (RMSE, IC, RankIC)
        # 4. Save Model
        pass
```

### 3.2 預測器 (`backend/models/predictor.py`)
```python
class Predictor:
    def __init__(self, model_path: str = "latest.model"):
        self.model = xgb.XGBRegressor()
        self.model.load_model(model_path)
        
    def predict(self, stock_code: str) -> Dict:
        # 1. Fetch latest factors
        # 2. Inference
        # 3. Enhance result (Win Rate probability, etc.)
        pass
```

### 3.3 API 端點 (`backend/api/routers/ai.py`)
*   `GET /api/v1/ai/predict/{symbol}`: 獲取單一個股預測報告。
*   `GET /api/v1/ai/predict/top-ranking`: 獲取全市場預測 Alpha 最高的 Top 20 標的。

---

## 四、專案結構變更

```text
backend/
├── models/
│   ├── __init__.py
│   ├── trainer.py       # 訓練邏輯
│   ├── predictor.py     # 推理邏輯
│   └── saved/           # 模型存檔 (.json/.model)
├── api/
│   └── routers/
│       └── ai.py        # 新增 AI 路由
```

---

## 五、執行步驟 (Action Plan)

1.  **環境準備**: 建立目錄結構 `backend/models/saved`。
2.  **核心開發**: 實作 `ModelTrainer`，先用小規模數據 (TSMC, 0050) 跑通訓練流程。
3.  **模型評估**: 驗證模型是否具備預測能力 (IC > 0.02)。
4.  **API 實作**: 開發 Predictor 與 API 接口。

---

**文件結束**
*計畫編號：029*
*版本：1.0.0*
*建立日期：2026-01-30*
*文件狀態：正式發布*
