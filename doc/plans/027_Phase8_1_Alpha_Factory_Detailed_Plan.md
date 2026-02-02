# Phase 8.1：AI Alpha 特徵工廠詳細實作計畫

**計畫編號**：027
**版本**：1.0.0
**建立日期**：2026-01-30
**所屬階段**：Phase 8.1 (AI Alpha Factory)
**關聯任務**：T-AI-005
**狀態**：規劃中 (Planning)
**預估工時**：5 人天

---

## 一、計畫核心目標

本計畫旨在構建一個 **高性能、向量化、可擴展** 的 Alpha 特徵計算引擎 (`AlphaFactorEngine`)。該引擎將負責將原始的量價數據 (OHLCV)、籌碼數據 (Institutional/Margin) 與宏觀數據 (Macro) 轉化為機器學習模型可讀的「因子矩陣 (Factor Matrix)」。

### 核心原則 (First Principles)
1.  **Vectorization First**: 嚴禁使用 Python `for` 循環遍歷時間序列。所有計算必須基於 `pandas` 或 `numpy` 的矩陣運算。
2.  **Stateless Design**: 計算引擎不持有狀態，輸入為原始 DataFrame，輸出為特徵 DataFrame。
3.  **Deterministic**: 相同的輸入必須產生完全相同的輸出 (包含 NaN 處理)。

---

## 二、Alpha 因子庫定義 (Factor Universe)

我們將實作 5 大類、總計 50+ 個核心因子。

### 2.1 趨勢動能因子 (Momentum & Trend) - 向量化實作優先
| 因子代碼 | 名稱 | 計算邏輯 (Vectorized Logic) | 參數 (Default) |
|---|---|---|---|
| `MOM_RSI` | 相對強弱指標 | `talib.RSI(Close, 14)` 或 Pandas Rolling 計算 | N=14 |
| `MOM_MACD_DIFF` | MACD 柱狀體 | `MACD(12, 26, 9)[2]` (Hist) | 12, 26, 9 |
| `MOM_MACD_SLOPE` | MACD 斜率 | `MACD_Hist - MACD_Hist.shift(3)` | N=3 |
| `MOM_ROC` | 變動率 | `Close / Close.shift(N) - 1` | N=5, 10, 20 |
| `MOM_MA_BIAS` | 均線乖離率 | `Close / MA(N) - 1` | N=5, 20, 60 |
| `MOM_ADX` | 平均趨向指標 | `talib.ADX` (測量趨勢強度) | N=14 |
| `MOM_CCI` | 順勢指標 | `talib.CCI` | N=14 |
| `TRD_HIGHLOW_DIST` | 高低點距離 | `(Close - RollingMin(N)) / (RollingMax(N) - RollingMin(N))` (Stochastic %K 概念) | N=20 |

### 2.2 波動率因子 (Volatility)
| 因子代碼 | 名稱 | 計算邏輯 | 參數 |
|---|---|---|---|
| `VOL_ATR_RATIO` | ATR 波動率比 | `ATR(14) / Close` | N=14 |
| `VOL_BB_WIDTH` | 布林通道寬度 | `(Upper - Lower) / Middle` | N=20, Std=2 |
| `VOL_BB_PCT` | 布林 %B | `(Close - Lower) / (Upper - Lower)` | N=20, Std=2 |
| `VOL_STD_DEV` | 價格標準差 | `Close.rolling(N).std() / Close` | N=20 |
| `VOL_UI` | Ulcer Index | 下行風險指標 (需自定義向量化計算) | N=14 |

### 2.3 成交量因子 (Volume)
| 因子代碼 | 名稱 | 計算邏輯 | 參數 |
|---|---|---|---|
| `VLM_OBV_SLOPE` | OBV 斜率 | `LinRegSlope(OBV, 5)` | N=5 |
| `VLM_MA_RATIO` | 量能爆發度 | `Volume / Volume.rolling(N).mean()` | N=5, 20 |
| `VLM_FORCE` | 勁道指數 | `(Close - Close.shift(1)) * Volume` | N=13 (EMA) |
| `VLM_VWAP_DIST` | VWAP 乖離 | `(Close - VWAP) / VWAP` (VWAP 需自行計算) | Daily |

### 2.4 籌碼面因子 (Chips / Institutional)
*需 Join `stock_institutional` 與 `stock_margin` 表*
| 因子代碼 | 名稱 | 計算邏輯 | 說明 |
|---|---|---|---|
| `CHP_INST_NET_RATIO` | 三大法人淨買比 | `(Foreign+Trust+Dealer_Net) / Volume` | 當日法人介入程度 |
| `CHP_INST_ACC_5D` | 法人 5 日累積 | `RollingSum(Inst_Net, 5) / Capital` | 短線法人動向 |
| `CHP_FOREIGN_RATIO` | 外資持股比 | `Foreign_Holdings / Capital` (需有持股數據) | 長線外資水位 |
| `CHP_MARGIN_USE_CHG` | 融資使用率變動 | `Margin_Util - Margin_Util.shift(1)` | 散戶情緒變動 |
| `CHP_SHORT_COVER` | 券資比 | `Short_Balance / Margin_Balance` | 軋空潛力 |

### 2.5 宏觀與相關性因子 (Macro & Correlation)
*需 Join 大盤指數與 VIX*
| 因子代碼 | 名稱 | 計算邏輯 | 說明 |
|---|---|---|---|
| `MCR_BETA_20` | Beta 系數 | `Cov(Stock, Market, 20) / Var(Market, 20)` | 市場敏感度 |
| `MCR_RS_MARKET` | 大盤相對強弱 | `Stock_Ret - Market_Ret` | 超額回報能力 |
| `MCR_CORR_VIX` | VIX 相關性 | `Corr(Stock_Ret, VIX_Chg, 20)` | 恐慌抗性 |
| `MCR_SECTOR_RS` | 板塊相對強弱 | `Stock_Ret - Sector_Ret` (若有板塊指數) | 行業地位 |

---

## 三、系統架構設計

### 3.1 類別結構
```python
class AlphaFactory:
    def __init__(self, stock_df: pd.DataFrame, benchmark_df: pd.DataFrame = None):
        self.df = stock_df.sort_index() # Index MUST be Datetime
        self.bench = benchmark_df
        
    def add_technical_factors(self) -> pd.DataFrame:
        # returns df with MOM_*, VOL_*, VLM_* columns
        pass
        
    def add_chip_factors(self, chip_df: pd.DataFrame) -> pd.DataFrame:
        # Merges chip_df and calculates CHP_*
        pass
        
    def add_macro_factors(self, macro_df: pd.DataFrame) -> pd.DataFrame:
        # Merges macro data and calculates MCR_*
        pass
        
    def get_factors(self, normalize=True) -> pd.DataFrame:
        # Returns final cleaned, (optional) normalized factor matrix
        pass
```

### 3.2 數據流 (Data Flow)
1.  **Fetcher**: 從資料庫讀取原始數據 (`daily_price`, `stock_institutional`...)。
2.  **Preprocessing**: 時間對齊 (Reindexing)，填補缺失值 (Forward Fill)。
3.  **Calculation**: 呼叫 `AlphaFactory` 執行向量化計算。
4.  **Cleaning**: 處理 `inf` (除零錯誤)，去除極端值 (Winsorize)。
5.  **Normalization**: Z-Score 標準化 (讓特徵分佈在 N(0,1))。
6.  **Storage**: 寫入 `stock_factors` 資料表。

---

## 四、資料庫 Schema 擴充

現有 `stock_factors` 表結構可能不足以支撐動態因子。建議採用 **JSONB** 存儲因子集合，或針對核心因子建立明確欄位 (Performance 較佳)。

**方案 A (Hybrid)**: 核心因子 (Top 20) 獨立欄位，長尾因子存入 `factors_extra` (JSONB)。

```sql
ALTER TABLE stock_factors 
ADD COLUMN IF NOT EXISTS mom_rsi_14 DECIMAL(10, 4),
ADD COLUMN IF NOT EXISTS mom_macd_diff DECIMAL(10, 4),
ADD COLUMN IF NOT EXISTS vol_atr_ratio DECIMAL(10, 4),
ADD COLUMN IF NOT EXISTS chp_inst_net_ratio DECIMAL(10, 4),
-- ... 其他核心因子
ADD COLUMN IF NOT EXISTS factors_all JSONB; -- 完整因子 dump
```

---

## 五、執行步驟 (Action Plan)

1.  **環境準備**: 安裝 `ta-lib` (若環境允許) 或確保 `pandas` 版本支援所需 rolling 操作。
2.  **核心開發**: 實作 `backend/research/alpha_factors.py`。
3.  **ETL 整合**: 更新 `backend/etl/factor_service.py` 調用新工廠類。
4.  **驗證**: 使用 `0050` 與 `2330` 進行數據驗證，比較計算結果與看盤軟體數值。

---

**文件結束**
*計畫編號：027*
*版本：1.0.0*
*建立日期：2026-01-30*
*文件狀態：正式發布*
