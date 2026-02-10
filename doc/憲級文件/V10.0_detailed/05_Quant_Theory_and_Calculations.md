# 05. 量化因子引擎與數學演算 (Quant Theory & Calculations)

> **文件版本**：v1.0 (V10.0 完整規格書重構)
> **日期**：2026-02-10
> **核心使命：** 定義 18 因子 Z-Score 算法、Barra 風險因子、Brinson 績效歸因與演化策略遺傳演算法數學原理

---

## 1. V10.0 十八因子定義與計算

### 1.1 因子權重與計算公式

| 因子 | 符號 | V10.0 權重範圍 | 核心指標 | 計算公式 |
|------|------|----------------|----------|----------|
| **價值 (Value)** | V | 10-25% | P/E, P/B, EV/EBITDA | `zscore(1/PE) + zscore(1/PB) + zscore(DY)` |
| **品質 (Quality)** | Q | 15-30% | ROE, ROA, 負債比 | `zscore(ROE) + zscore(ROA) - zscore(D/E)` |
| **動能 (Momentum)** | M | 10-25% | RSI-14, 3/6/12月報酬 | `0.5×ret₆ₘ + 0.3×ret₃ₘ + 0.2×ret₁₂ₘ` |
| **規模 (Size)** | S | 5-15% | 總市值 | `zscore(-log(MarketCap))` |
| **波動率 (Volatility)** | Vol | 10-20% | 日報酬標準差, Beta | `zscore(-σ) + zscore(-β)` |
| **成長 (Growth)** | G | 10-25% | 營收 CAGR, EPS CAGR | `zscore(rev_cagr₃ᵧ) + zscore(eps_cagr₃ᵧ)` |
| **估值 (Valuation)** | Val | 5-15% | PE, PB, PCF, EV/EBITDA | 估值綜合評分 |
| **獲利能力 (Profitability)** | PF | 5-15% | Gross Margin, Net Margin | 獲利品質評分 |
| **槓桿 (Leverage)** | Lev | 5-10% | Debt/Equity, Interest Cover | 低槓桿加分 |
| **流動性 (Liquidity)** | Lq | 5-10% | Volume, Turnover Rate | 流動性評分 |
| **盈餘品質 (Earnings Quality)** | EQ | 5-10% | Accruals, CFO/Net Income | 盈餘品質評分 |
| **股东收益率 (Shareholder Yield)** | SY | 5-10% | Div Yield + Buyback | 股东回报評分 |
| **分析師情緒 (Analyst Sentiment)** | AS | 5-10% | EPS 修正, 評級變化 | 分析師共識評分 |
| **宏觀敏感度 (Macro Sensitivity)** | MS | 5-15% | Beta, Correlation | 宏觀因子曝險 |
| **產業動能 (Sector Momentum)** | SM | 5-10% | 相對產業報酬 | 產業相對強弱 |
| **波動率調整 (Vol Adjusted)** | VA | 5-10% | Risk-Adjusted Return | 夏普比率調整 |
| **風險調整 (Risk Adjusted)** | RA | 5-10% | VaR, CVaR | 風險調整評分 |
| **綜合評分 (Composite)** | C | - | 以上全部加權 | 18 維度加權平均 |

---

## 2. 演化策略遺傳演算法 (Evolution Strategy - V10.0 核心)

### 2.1 適應度函數

```python
# V10.0 演化策略適應度函數 (定義)

class EvolutionStrategyFitness:
    """V10.0 演化策略適應度函數"""
    
    def calculate_fitness(self, genome: dict, backtest_result: dict) -> float:
        """
        計算個體適應度
        
        適應度 = Sharpe_Ratio × 0.4 
               + Sortino_Ratio × 0.3 
               + Calmar_Ratio × 0.2 
               - Max_Drawdown_Penalty × 0.1
        """
        sharpe = backtest_result['sharpe_ratio']
        sortino = backtest_result['sortino_ratio']
        calmar = backtest_result['calmar_ratio']
        max_dd = backtest_result['max_drawdown']
        
        fitness = (
            sharpe * 0.4 +
            sortino * 0.3 +
            calmar * 0.2 -
            max_dd * 0.1
        )
        
        return fitness
```

### 2.2 演化操作算子

| 操作 | V10.0 定義 | 參數範圍 |
|------|------------|----------|
| **選擇 (Selection)** | 輪盤選擇 + 菁英策略 | 菁英比例 10-30% |
| **交叉 (Crossover)** | 模擬二元交叉 (SBX) | 交叉機率 60-90% |
| **突變 (Mutation)** | 高斯突變 | 突變機率 1-10% |
| **替換 (Replacement)** | (μ + λ) 策略 | 族群規模 50-200 |

---

## 3. Barra 風險因子模型 (V10.0 專業)

### 3.1 因子體系

| 因子類別 | 因子名稱 | 說明 |
|----------|----------|------|
| **市場因子** | Market Beta | 系統性風險曝險 |
| **規模因子** | Size | 小盤股溢價 |
| **價值因子** | Value | 價值股溢價 |
| **動能因子** | Momentum | 動能溢價 |
| **波動率因子** | Volatility | 低波動溢價 |
| **產業因子** | Industry | 產業配置效應 |

### 3.2 風險分解公式

```
Portfolio Risk = β² × σ²market + Σβf² × σf² + σidiosyncratic² + ε
```

---

## 4. Brinson 績效歸因模型 (V10.0 專業)

### 4.1 歸因公式

```
Total Excess Return = Allocation Effect + Selection Effect + Interaction Effect

Allocation Effect = Σ(Wp_i - Wb_i) × Rb_i
Selection Effect = ΣWp_i × (Rp_i - Rb_i)
Interaction Effect = Σ(Wp_i - Wb_i) × (Rp_i - Rb_i)
```

---

## 6. 邏輯拆解 (Logic Breakdown)

### 6.1 十八因子 Z-Score 計算流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Z-Score 標準化流程                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐               │
│   │   原始數據   │     │   異常值檢測  │     │   Z-Score    │               │
│   │   輸入層     │ ──▶ │   處理層     │ ──▶ │   標準化層   │               │
│   │              │     │              │     │              │               │
│   │ • 股價       │     │ • IQR 法     │     │ • 均值計算   │               │
│   │ • 財報數據   │     │ • Z-Score 法  │     │ • 標準差計算 │               │
│   │ • 交易量     │     │ • 百分位截斷  │     │ • 標準化輸出 │               │
│   └──────────────┘     └──────────────┘     └──────────────┘               │
│                                      │                    │                  │
│                                      ▼                    ▼                  │
│                           ┌─────────────────┐    ┌─────────────────┐      │
│                           │  缺失值填補     │    │  邊界裁剪       │      │
│                           │  (Rolling Mean) │    │  (-3, +3)       │      │
│                           └─────────────────┘    └─────────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**步驟分解：**

| 步驟 | 操作 | 輸入 | 輸出 | 處理邏輯 |
|------|------|------|------|----------|
| 1 | 原始數據載入 | 多源數據 | DataFrame | 合併 Price/Financial/Volume |
| 2 | 異常值檢測 | Raw Data | Cleaned Data | IQR × 1.5 閾值 |
| 3 | Z-Score 標準化 | Cleaned Data | Z-Scores | (x - μ) / σ |
| 4 | 缺失值填補 | Partial Data | Complete Data | Rolling 60日均值 |
| 5 | 邊界裁剪 | Z-Scores | Clipped Z-Scores | np.clip(x, -3, 3) |
| 6 | 因子加權 | 18 Z-Scores | Composite Score | 權重向量 × Z-Scores |

### 6.2 演化策略遺傳演算法流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    演化策略遺傳演算法流程 (V10.0)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                         初始化族群                                    │   │
│   │                    (μ 個體, 每個 18 維度)                           │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                         適應度評估                                    │   │
│   │              (Sharpe × 0.4 + Sortino × 0.3 + Calmar × 0.2)         │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                           ┌──────────┴──────────┐                         │
│                           ▼                         ▼                         │
│              ┌─────────────────┐       ┌─────────────────┐                 │
│              │   選擇 (Selection)│       │   菁英保留      │                 │
│              │   輪盤選擇法     │       │   Top 10-30%    │                 │
│              └─────────────────┘       └─────────────────┘                 │
│                           │                         │                         │
│                           └──────────┬──────────┘                         │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    遺傳操作 (迭代 N 代)                              │   │
│   │                                                                      │   │
│   │   ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐│   │
│   │   │   交叉 (Crossover)│     │  突變 (Mutation) │     │  替換 (Replacement)││   │
│   │   │   SBX 模擬二元   │     │   高斯突變      │     │   (μ + λ) 策略   ││   │
│   │   │   Pc = 0.6-0.9  │     │   Pm = 0.01-0.1 │     │   世代更新      ││   │
│   │   └─────────────────┘     └─────────────────┘     └─────────────────┘│   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                         收斂判斷                                     │   │
│   │              (適應度變化 < ε OR 達到最大世代數)                       │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                           ┌──────────┴──────────┐                         │
│                           ▼                         ▼                         │
│              ┌─────────────────┐       ┌─────────────────┐                 │
│              │   輸出最佳個體  │       │   帕累托最優    │                 │
│              │   (權重配置)    │       │   前端集合      │                 │
│              └─────────────────┘       └─────────────────┘                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Barra 風險因子模型流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Barra 風險因子分解流程                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐               │
│   │   投資組合   │     │   因子曝險   │     │   殘差風險   │               │
│   │   曝險矩陣   │ ──▶ │   計算       │ ──▶ │   計算       │               │
│   │   W (NxK)    │     │   F (K)      │     │   E          │               │
│   └──────────────┘     └──────────────┘     └──────────────┘               │
│                                                                             │
│   風險分解公式：                                                             │
│   ─────────────────────────────────────────────────────                     │
│                                                                             │
│   σ²portfolio = β'M × β × σ²market + β'F × Σf × βF + σ²idiosyncratic       │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │                                                                 │       │
│   │   系統性風險         │   特異風險              │   總風險      │       │
│   │   (因子相關)         │   (個股特有)            │               │       │
│   │                                                                 │       │
│   │   60-80%            │   20-40%                │   Σ = 100%    │       │
│   │                                                                 │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.4 Brinson 績效歸因流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Brinson 績效歸因流程                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                         輸入資料                                     │   │
│   │                                                                      │   │
│   │   Wp_i : 投資組合中產業 i 的權重                                      │   │
│   │   Wb_i : 基準指數中產業 i 的權重                                      │   │
│   │   Rp_i : 投資組合中產業 i 的報酬                                      │   │
│   │   Rb_i : 基準指數中產業 i 的報酬                                      │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    Brinson 歸因分解                                  │   │
│   │                                                                      │   │
│   │   ┌─────────────────┐                                               │   │
│   │   │ 配置效應        │  Allocation Effect                            │   │
│   │   │ (超配/低配)     │  Σ(Wp_i - Wb_i) × Rb_i                        │   │
│   │   └─────────────────┘                                               │   │
│   │           │                                                         │   │
│   │           ▼                                                         │   │
│   │   ┌─────────────────┐                                               │   │
│   │   │ 選股效應        │  Selection Effect                             │   │
│   │   │ (產業內選股)    │  ΣWp_i × (Rp_i - Rb_i)                         │   │
│   │   └─────────────────┘                                               │   │
│   │           │                                                         │   │
│   │           ▼                                                         │   │
│   │   ┌─────────────────┐                                               │   │
│   │   │ 交互效應        │  Interaction Effect                           │   │
│   │   │ (配置×選股)     │  Σ(Wp_i - Wb_i) × (Rp_i - Rb_i)               │   │
│   │   └─────────────────┘                                               │   │
│   │           │                                                         │   │
│   │           └───────────┬─────────────────────────────────────────┘   │   │
│   │                       ▼                                               │   │
│   │   ┌─────────────────────────────────────────────────────────────────┐ │   │
│   │   │                                                                 │ │   │
│   │   │   Total Excess Return = Allocation + Selection + Interaction │ │   │
│   │   │                                                                 │ │   │
│   │   └─────────────────────────────────────────────────────────────────┘ │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. 邊界條件定義 (Edge Cases)

### 7.1 Z-Score 標準化邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-Q01** | 單一期貨合約數據不足 30 日 | 跳過該期貨因子計算 | 標記 `factor_status = 'insufficient_data'` |
| **EC-Q02** | 標準差 σ = 0 (恆定價格) | Z-Score 無法計算 | 返回 0，使用最近有效值填充 |
| **EC-Q03** | 異常值數量 > 30% | 異常值檢測敏感度過高 | 放寬 IQR 閾值至 3.0 × IQR |
| **EC-Q04** | 缺失值比例 > 20% | 因子品質不合格 | 該因子權重暫時歸零 |
| **EC-Q05** | Z-Score 超出 (-10, +10) | 數據異常或計算錯誤 | 重新驗證原始數據 |
| **EC-Q06** | 多個產業缺少數據 | 跨產業比較失效 | 切換至備用數據源 |

### 7.2 演化策略邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-Q07** | 適應度連續 20 代無改善 | 演算法可能陷入局部最優 | 重新隨機初始化族群 |
| **EC-Q08** | 適應度值為負數 | 策略為虧損策略 | 標記為不可投資 |
| **EC-Q09** | 族群多樣性 < 5% | 遺傳演算法退化 | 增強突變率或重置部分個體 |
| **EC-Q10** | 個體權重超出 [0, 1] 範圍 | 非法基因型 | 投影至合法區間 |
| **EC-Q11** | 執行時間超過 Timeout | 計算資源耗盡 | 終止並返回當前最優 |
| **EC-Q12** | 回測樣本數 < 252 日 | 統計顯著性不足 | 擴展回測期間或降低置信度 |

### 7.3 Barra 模型邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-Q13** | 因子相關矩陣非正定 | Cholesky 分解失敗 | 使用伪逆矩陣替代 |
| **EC-Q14** | 個股 Beta 估計不穩定 | R² < 0.05 | 使用市場 Beta = 1.0 |
| **EC-Q15** | 產業權重之和 ≠ 100% | 數據錯誤 | 重新歸一化權重 |
| **EC-Q16** | 投資組合包含 > 200 檔股票 | 計算複雜度過高 | 採用分塊計算優化 |

### 7.4 Brinson 歸因邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-Q17** | 基準產業分類缺失 | 歸因比較失效 | 使用 MSCI Taiwan 作為基準 |
| **EC-Q18** | 產業報酬計算期間不匹配 | 時間序列對齊失敗 | 重新對齊至交易日 |
| **EC-Q19** | 投資組合產業覆蓋 < 80% | 歸因結果不完整 | 標記為部分覆蓋 |
| **EC-Q20** | 選股效應為極端值 | 數據異常或策略有效 | 分離正常/異常訊號 |

---

## 8. Schema 完整化

### 8.1 因子評分資料表 `factor_scores`

```sql
-- ============================================================================
-- V10.0 因子評分資料表
-- 用途：存儲 18 維度 Z-Score 標準化因子值
-- 頻率：每日更新
-- ============================================================================

CREATE TABLE IF NOT EXISTS factor_scores (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol              VARCHAR(20) NOT NULL,           -- 股票代碼
    trade_date          DATE NOT NULL,                   -- 交易日期
    
    -- 價值因子 (Value) - 權重 10-25%
    zscore_pe           DECIMAL(8,4),                    -- P/E Z-Score
    zscore_pb           DECIMAL(8,4),                    -- P/B Z-Score
    zscore_ev_ebitda    DECIMAL(8,4),                    -- EV/EBITDA Z-Score
    value_score         DECIMAL(8,4),                   -- 價值因子綜合
    
    -- 品質因子 (Quality) - 權重 15-30%
    zscore_roe          DECIMAL(8,4),                    -- ROE Z-Score
    zscore_roa          DECIMAL(8,4),                    -- ROA Z-Score
    zscore_de           DECIMAL(8,4),                    -- Debt/Equity Z-Score (反向)
    quality_score       DECIMAL(8,4),                   -- 品質因子綜合
    
    -- 動能因子 (Momentum) - 權重 10-25%
    ret_1m              DECIMAL(8,4),                    -- 1月報酬
    ret_3m              DECIMAL(8,4),                    -- 3月報酬
    ret_6m              DECIMAL(8,4),                    -- 6月報酬
    ret_12m             DECIMAL(8,4),                    -- 12月報酬
    momentum_score      DECIMAL(8,4),                   -- 動能因子綜合
    
    -- 成長因子 (Growth) - 權重 10-25%
    zscore_rev_cagr     DECIMAL(8,4),                    -- 營收 CAGR Z-Score
    zscore_eps_cagr     DECIMAL(8,4),                    -- EPS CAGR Z-Score
    growth_score        DECIMAL(8,4),                   -- 成長因子綜合
    
    -- 波動率因子 (Volatility) - 權重 10-20%
    volatility_daily    DECIMAL(8,4),                   -- 日波動率
    zscore_volatility   DECIMAL(8,4),                    -- 波動率 Z-Score (反向)
    beta_1y             DECIMAL(8,4),                    -- 1年 Beta
    volatility_score    DECIMAL(8,4),                   -- 波動率因子綜合
    
    -- 規模因子 (Size) - 權重 5-15%
    market_cap          BIGINT,                          -- 總市值
    zscore_market_cap   DECIMAL(8,4),                    -- 規模 Z-Score (反向)
    size_score          DECIMAL(8,4),                   -- 規模因子綜合
    
    -- 槓桿因子 (Leverage) - 權重 5-10%
    debt_equity_ratio   DECIMAL(8,4),                    -- 負債比
    interest_coverage   DECIMAL(8,4),                   -- 利息保障倍數
    leverage_score      DECIMAL(8,4),                   -- 槓桿因子綜合
    
    -- 流動性因子 (Liquidity) - 權重 5-10%
    avg_daily_volume    BIGINT,                          -- 日均成交量
    turnover_rate       DECIMAL(8,4),                    -- 換手率
    liquidity_score     DECIMAL(8,4),                   -- 流動性因子綜合
    
    -- 盈餘品質因子 (Earnings Quality) - 權重 5-10%
    accruals_ratio      DECIMAL(8,4),                    -- 應計項目比率
    cfo_to_ni           DECIMAL(8,4),                    -- 經營現金流/淨利
    earnings_quality_score DECIMAL(8,4),               -- 盈餘品質因子綜合
    
    -- 股东收益率因子 (Shareholder Yield) - 權重 5-10%
    dividend_yield      DECIMAL(8,4),                    -- 股息率
    buyback_yield       DECIMAL(8,4),                    -- 回購收益率
    shareholder_yield_score DECIMAL(8,4),              -- 股东收益率因子綜合
    
    -- 分析師情緒因子 (Analyst Sentiment) - 權重 5-10%
    eps_revision_1m     DECIMAL(8,4),                    -- EPS 1月修正
    rating_change       INTEGER,                        -- 評級變化
    analyst_sentiment_score DECIMAL(8,4),              -- 分析師情緒因子綜合
    
    -- 宏觀敏感度因子 (Macro Sensitivity) - 權重 5-15%
    macro_beta          DECIMAL(8,4),                   -- 宏觀 Beta
    macro_correlation   DECIMAL(8,4),                   -- 宏觀相關係數
    macro_sensitivity_score DECIMAL(8,4),              -- 宏觀敏感度因子綜合
    
    -- 產業動能因子 (Sector Momentum) - 權重 5-10%
    sector_ret_1m       DECIMAL(8,4),                    -- 產業 1月報酬
    sector_momentum_score DECIMAL(8,4),                -- 產業動能因子綜合
    
    -- 風險調整因子 (Risk Adjusted) - 權重 5-10%
    sharpe_ratio_1y     DECIMAL(8,4),                    -- 1年夏普比率
    sortino_ratio_1y    DECIMAL(8,4),                   -- 1年索提諾比率
    risk_adjusted_score DECIMAL(8,4),                   -- 風險調整因子綜合
    
    -- 綜合評分
    composite_score     DECIMAL(8,4),                   -- 18 維度加權平均
    factor_status       VARCHAR(20) DEFAULT 'valid',   -- valid/insufficient/warning
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fs_symbol_date_uniq UNIQUE (symbol, trade_date),
    CONSTRAINT fs_composite_range CHECK (composite_score BETWEEN -3 AND 3),
    CONSTRAINT fs_status_check CHECK (factor_status IN ('valid', 'insufficient', 'warning', 'error'))
);

-- ============================================================================
-- 索引定義
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_factor_scores_date ON factor_scores(trade_date);
CREATE INDEX IF NOT EXISTS idx_factor_scores_symbol ON factor_scores(symbol);
CREATE INDEX IF NOT EXISTS idx_factor_scores_composite ON factor_scores(trade_date, composite_score DESC);
CREATE INDEX IF NOT EXISTS idx_factor_scores_status ON factor_scores(trade_date, factor_status);

-- COMMENT 註解
COMMENT ON TABLE factor_scores IS 'V10.0 18 維度因子評分表 - 每日更新';
COMMENT ON COLUMN factor_scores.symbol IS '股票/期貨代碼 (如: 2330.TW)';
COMMENT ON COLUMN factor_scores.composite_score IS '18 維度加權平均 Z-Score (-3 to +3)';
COMMENT ON COLUMN factor_scores.factor_status IS '數據狀態: valid=有效, insufficient=數據不足, warning=警告, error=錯誤';
```

### 8.2 演化策略個體資料表 `evolution_individuals`

```sql
-- ============================================================================
-- V10.0 演化策略個體資料表
-- 用途：存儲遺傳演算法演化的基因組配置
-- 頻率：每次演化任務生成
-- ============================================================================

CREATE TABLE IF NOT EXISTS evolution_individuals (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evolution_run_id    UUID NOT NULL,                  -- 演化任務 ID
    generation          INTEGER NOT NULL,               -- 世代編號
    individual_index    INTEGER NOT NULL,               -- 個體索引
    
    -- 基因組配置 (18 維度權重)
    weight_value        DECIMAL(5,3) NOT NULL,         -- 價值因子權重
    weight_quality      DECIMAL(5,3) NOT NULL,         -- 品質因子權重
    weight_momentum     DECIMAL(5,3) NOT NULL,         -- 動能因子權重
    weight_growth       DECIMAL(5,3) NOT NULL,         -- 成長因子權重
    weight_volatility   DECIMAL(5,3) NOT NULL,         -- 波動率因子權重
    weight_size         DECIMAL(5,3) NOT NULL,         -- 規模因子權重
    weight_leverage     DECIMAL(5,3) NOT NULL,         -- 槓桿因子權重
    weight_liquidity    DECIMAL(5,3) NOT NULL,         -- 流動性因子權重
    weight_earnings_quality DECIMAL(5,3) NOT NULL,     -- 盈餘品質因子權重
    weight_shareholder_yield DECIMAL(5,3) NOT NULL,    -- 股东收益率因子權重
    weight_analyst_sentiment DECIMAL(5,3) NOT NULL,    -- 分析師情緒因子權重
    weight_macro_sensitivity DECIMAL(5,3) NOT NULL,    -- 宏觀敏感度因子權重
    weight_sector_momentum DECIMAL(5,3) NOT NULL,      -- 產業動能因子權重
    weight_risk_adjusted DECIMAL(5,3) NOT NULL,         -- 風險調整因子權重
    
    -- 演化參數
    fitness_value       DECIMAL(12,6),                 -- 適應度值
    sharpe_ratio        DECIMAL(8,4),                   -- 夏普比率
    sortino_ratio       DECIMAL(8,4),                   -- 索提諾比率
    calmar_ratio        DECIMAL(8,4),                   -- 卡瑪比率
    max_drawdown        DECIMAL(8,4),                   -- 最大回撤
    total_return        DECIMAL(8,4),                   -- 總報酬率
    
    -- 回測結果摘要
    backtest_start_date DATE,                           -- 回測開始日期
    backtest_end_date   DATE,                           -- 回測結束日期
    backtest_days       INTEGER,                        -- 回測天數
    trade_count         INTEGER,                        -- 交易次數
    win_rate            DECIMAL(5,4),                   -- 勝率
    
    -- 演化元數據
    parent_1_id         UUID,                            -- 父代 1 ID
    parent_2_id         UUID,                            -- 父代 2 ID
    crossover_applied   BOOLEAN DEFAULT FALSE,           -- 是否執行交叉
    mutation_type       VARCHAR(20),                     -- 突變類型
    is_elite            BOOLEAN DEFAULT FALSE,           -- 是否為菁英個體
    is_pareto_optimal   BOOLEAN DEFAULT FALSE,           -- 是否為帕累托最優
    
    -- 狀態管理
    status              VARCHAR(20) DEFAULT 'active',   -- active/inactive/selected
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT ei_run_gen_ind_uniq UNIQUE (evolution_run_id, generation, individual_index),
    CONSTRAINT ei_weights_sum CHECK (
        weight_value + weight_quality + weight_momentum + weight_growth +
        weight_volatility + weight_size + weight_leverage + weight_liquidity +
        weight_earnings_quality + weight_shareholder_yield + weight_analyst_sentiment +
        weight_macro_sensitivity + weight_sector_momentum + weight_risk_adjusted
        BETWEEN 0.99 AND 1.01
    )
);

-- ============================================================================
-- 演化任務資料表 `evolution_runs`
-- ============================================================================

CREATE TABLE IF NOT EXISTS evolution_runs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_name            VARCHAR(100) NOT NULL,          -- 任務名稱
    description         TEXT,                            -- 任務描述
    
    -- 演化參數配置
    population_size     INTEGER NOT NULL DEFAULT 100,   -- 族群大小 (μ)
    offspring_size      INTEGER NOT NULL DEFAULT 200,   -- 產生個體數 (λ)
    max_generations     INTEGER NOT NULL DEFAULT 100,   -- 最大世代數
    elite_ratio         DECIMAL(5,4) DEFAULT 0.2,       -- 菁英比例
    crossover_rate      DECIMAL(5,4) DEFAULT 0.8,       -- 交叉機率
    mutation_rate       DECIMAL(5,4) DEFAULT 0.05,      -- 突變機率
    mutation_sigma      DECIMAL(8,6) DEFAULT 0.1,       -- 高斯突變標準差
    
    -- 適應度函數權重
    fitness_sharpe_weight DECIMAL(5,3) DEFAULT 0.4,     -- 夏普比率權重
    fitness_sortino_weight DECIMAL(5,3) DEFAULT 0.3,    -- 索提諾比率權重
    fitness_calmar_weight DECIMAL(5,3) DEFAULT 0.2,    -- 卡瑪比率權重
    fitness_dd_penalty_weight DECIMAL(5,3) DEFAULT 0.1, -- 最大回撤懲罰
    
    -- 回測配置
    backtest_start_date DATE NOT NULL,                  -- 回測開始日期
    backtest_end_date   DATE NOT NULL,                  -- 回測結束日期
    benchmark_symbol    VARCHAR(20) DEFAULT '0050.TW',  -- 基準代碼
    
    -- 執行狀態
    status              VARCHAR(20) DEFAULT 'pending',  -- pending/running/completed/failed
    current_generation  INTEGER DEFAULT 0,              -- 目前世代
    best_fitness        DECIMAL(12,6),                  -- 最佳適應度
    best_individual_id  UUID,                            -- 最佳個體 ID
    start_time          TIMESTAMP WITH TIME ZONE,       -- 開始時間
    end_time            TIMESTAMP WITH TIME ZONE,       -- 結束時間
    error_message       TEXT,                            -- 錯誤訊息
    
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 索引定義
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_evolution_individuals_run ON evolution_individuals(evolution_run_id);
CREATE INDEX IF NOT EXISTS idx_evolution_individuals_fitness ON evolution_individuals(evolution_run_id, fitness_value DESC);
CREATE INDEX IF NOT EXISTS idx_evolution_individuals_generation ON evolution_individuals(evolution_run_id, generation);
CREATE INDEX IF NOT EXISTS idx_evolution_runs_status ON evolution_runs(status);
CREATE INDEX IF NOT EXISTS idx_evolution_runs_dates ON evolution_runs(backtest_start_date, backtest_end_date);

-- COMMENT 註解
COMMENT ON TABLE evolution_individuals IS 'V10.0 演化策略個體資料表 - 存儲基因組配置與適應度';
COMMENT ON TABLE evolution_runs IS 'V10.0 演化任務資料表 - 追蹤每次演化執行';
COMMENT ON COLUMN evolution_individuals.fitness_value IS '適應度 = Sharpe×0.4 + Sortino×0.3 + Calmar×0.2 - MaxDD×0.1';
COMMENT ON COLUMN evolution_individuals.is_elite IS '菁英策略保留 Top 10-30% 最優個體';
```

### 8.3 回測結果資料表 `backtest_results`

```sql
-- ============================================================================
-- V10.0 回測結果資料表
-- 用途：存儲回測績效與風險指標
-- 頻率：每次回測執行
-- ============================================================================

CREATE TABLE IF NOT EXISTS backtest_results (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id         UUID NOT NULL,                   -- 策略 ID
    evolution_individual_id UUID,                       -- 演化個體 ID (可選)
    
    -- 回測期間
    start_date          DATE NOT NULL,                  -- 開始日期
    end_date            DATE NOT NULL,                  -- 結束日期
    trading_days        INTEGER NOT NULL,               -- 交易日數
    
    -- 報酬指標
    total_return        DECIMAL(10,6) NOT NULL,         -- 總報酬率
    annualized_return   DECIMAL(10,6) NOT NULL,         -- 年化報酬率
    monthly_returns     JSONB,                          -- 月報酬陣列
    daily_returns       JSONB,                          -- 日報酬陣列
    
    -- 風險指標
    volatility_daily   DECIMAL(10,6) NOT NULL,         -- 日波動率
    volatility_annualized DECIMAL(10,6) NOT NULL,     -- 年化波動率
    max_drawdown       DECIMAL(10,6) NOT NULL,         -- 最大回撤
    max_drawdown_date  DATE,                            -- 最大回撤日期
    max_drawdown_recovery_days INTEGER,                -- 回撤恢復天數
    
    -- 風險調整報酬
    sharpe_ratio       DECIMAL(10,6) NOT NULL,         -- 夏普比率
    sortino_ratio      DECIMAL(10,6) NOT NULL,          -- 索提諾比率
    calmar_ratio       DECIMAL(10,6) NOT NULL,          -- 卡瑪比率
    information_ratio  DECIMAL(10,6),                   -- 資訊比率
    treynor_ratio      DECIMAL(10,6),                   -- 特雷諾比率
    
    -- 報酬分布
    skewness           DECIMAL(10,6),                   -- 偏度
    kurtosis           DECIMAL(10,6),                   -- 峰度
    var_daily_95       DECIMAL(10,6),                   -- 95% VaR (日)
    cvar_daily_95      DECIMAL(10,6),                   -- 95% CVaR (日)
    
    -- 交易統計
    total_trades       INTEGER NOT NULL,                -- 總交易次數
    winning_trades      INTEGER,                        -- 獲勝交易次數
    losing_trades       INTEGER,                        -- 虧損交易次數
    win_rate           DECIMAL(8,6),                   -- 勝率
    avg_trade_return   DECIMAL(10,6),                  -- 平均交易報酬
    avg_winning_return DECIMAL(10,6),                  -- 平均獲勝報酬
    avg_losing_return  DECIMAL(10,6),                  -- 平均虧損報酬
    profit_factor      DECIMAL(10,6),                  -- 獲利因子
    expectancy         DECIMAL(10,6),                  -- 期望值
    
    -- 持期間統計
    avg_holding_days   DECIMAL(8,2),                    -- 平均持有天數
    max_holding_days   INTEGER,                         -- 最大持有天數
    min_holding_days   INTEGER,                         -- 最小持有天數
    
    -- 基準比較
    benchmark_return   DECIMAL(10,6),                   -- 基準報酬
    benchmark_volatility DECIMAL(10,6),                -- 基準波動率
    excess_return      DECIMAL(10,6),                  -- 超額報酬
    tracking_error     DECIMAL(10,6),                   -- 追蹤誤差
    
    -- 進階歸因
    barra_risk_attribution JSONB,                      -- Barra 風險歸因
    brinson_attribution JSONB,                         -- Brinson 歸因
    factor_exposures   JSONB,                           -- 因子曝險
    
    -- 樣本外測試標記
    is_oos_test        BOOLEAN DEFAULT FALSE,           -- 是否為樣本外測試
    oos_start_date     DATE,                            -- 樣本外開始日期
    ic_series          JSONB,                           -- IC 序列 (樣本外)
    ic_mean            DECIMAL(8,6),                    -- IC 均值
    ic_std             DECIMAL(8,6),                    -- IC 標準差
    ic_ir              DECIMAL(8,6),                    -- IC 資訊比率
    
    -- 狀態與版本
    status             VARCHAR(20) DEFAULT 'completed',-- completed/failed/running
    version            VARCHAR(20) DEFAULT '1.0',       -- 回測版本
    notes              TEXT,                            -- 備註
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 索引定義
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_backtest_results_strategy ON backtest_results(strategy_id);
CREATE INDEX IF NOT EXISTS idx_backtest_results_dates ON backtest_results(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_backtest_results_sharpe ON backtest_results(sharpe_ratio DESC);
CREATE INDEX IF NOT EXISTS idx_backtest_results_oos ON backtest_results(is_oos_test, ic_mean DESC);

-- COMMENT 註解
COMMENT ON TABLE backtest_results IS 'V10.0 回測結果資料表 - 存儲完整回測績效與風險指標';
COMMENT ON COLUMN backtest_results.sharpe_ratio IS '夏普比率 = (Rp - Rf) / σp，年化計算';
COMMENT ON COLUMN backtest_results.sortino_ratio IS '索提諾比率 = (Rp - Rf) / σdown，年化計算';
COMMENT ON COLUMN backtest_results.calmar_ratio IS '卡瑪比率 = 年化報酬 / |最大回撤|';
COMMENT ON COLUMN backtest_results.profit_factor IS '獲利因子 = 總獲利 / 總虧損';
COMMENT ON COLUMN backtest_results.ic_series IS '樣本外 IC (Rank IC) 時間序列，用於檢驗策略穩定性';
```

---

## 9. 硬體/環境關聯 (QNAP TS-h973AX)

### 9.1 資源需求對照表

| 運算類型 | CPU | RAM | Storage | 網路 | QNAP 配置 |
|----------|-----|-----|---------|------|-----------|
| **Z-Score 標準化** | 4 核心 | 8 GB | NVMe 暫存 50 GB | 1 Gbps | Docker 容器 × 2 |
| **演化策略 GA** | 16 核心 (平行) | 32 GB | NVMe 暫存 200 GB | 1 Gbps | Python multiprocessing |
| **Barra 風險計算** | 8 核心 | 16 GB | SSD 100 GB | 1 Gbps | NumPy/SciPy 優化 |
| **Brinson 歸因** | 4 核心 | 8 GB | SSD 50 GB | 1 Gbps | Pandas 運算 |
| **Monte Carlo 模擬** | 16 核心 | 64 GB | NVMe 500 GB | 1 Gbps | GPU 加速 (可選) |

### 9.2 ZFS 儲存池配置

```bash
#!/bin/bash
# ============================================================================
# QNAP ZFS 儲存池配置 - 量化計算暫存空間
# ============================================================================

# 創建量化計算專用 Dataset
zfs create quant_pool/calc_cache
zfs set compression=lz4 quant_pool/calc_cache
zfs set atime=off quant_pool/calc_cache
zfs set logbias=throughput quant_pool/calc_cache
zfs set primarycache=metadata quant_pool/calc_cache

# 設定配額與預留空間
zfs set quota=500G quant_pool/calc_cache
zfs set reservation=50G quant_pool/calc_cache

# 創建回測結果 Dataset
zfs create quant_pool/backtest_results
zfs set compression=zstd quant_pool/backtest_results
zfs set atime=off quant_pool/backtest_results
zfs set secondarycache=all quant_pool/backtest_results

# 創建因子評分 Dataset
zfs create quant_pool/factor_scores
zfs set compression=lz4 quant_pool/factor_scores
zfs set atime=off quant_pool/factor_scores
zfs set primarycache=all quant_pool/factor_scores

# 創建演化策略 Dataset
zfs create quant_pool/evolution_runs
zfs set compression=zstd quant_pool/evolution_runs
zfs set dedup=off quant_pool/evolution_runs

# 驗證配置
zfs get all quant_pool/calc_cache | grep -E "compression|atime|logbias|quota|reservation"
```

### 9.3 Docker Compose 配置

```yaml
# ============================================================================
# 量化計算服務 Docker Compose
# ============================================================================

services:
  quant-engine:
    image: quant-engine:v10.0
    container_name: quant-engine
    runtime: nvidia  # 如果使用 GPU
    environment:
      - NUMEXPR_MAX_THREADS=16
      - NUMEXPR_NUM_THREADS=8
      - OMP_NUM_THREADS=8
      - OPENBLAS_NUM_THREADS=8
      - MKL_NUM_THREADS=8
    volumes:
      - /share/quant_pool/calc_cache:/app/cache:rw
      - /share/quant_pool/backtest_results:/app/results:rw
      - /share/quant_pool/factor_scores:/app/factors:rw
    deploy:
      resources:
        limits:
          cpus: '16'
          memory: 64G
        reservations:
          cpus: '4'
          memory: 8G
    command: >
      python -m quant_engine.main
      --mode evolution
      --population 200
      --generations 100
      --elite-ratio 0.2
    restart: unless-stopped
    
  factor-calculator:
    image: quant-engine:v10.0
    container_name: factor-calculator
    environment:
      - NUMEXPR_MAX_THREADS=8
      - OMP_NUM_THREADS=4
    volumes:
      - /share/quant_pool/calc_cache:/app/cache:rw
      - /share/quant_pool/factor_scores:/app/factors:rw
    deploy:
      resources:
        limits:
          cpus: '8'
          memory: 16G
    command: >
      python -m quant_engine.factors
      --update-all
      --zscore-clip -3 3
    restart: unless-stopped

volumes:
  calc_cache:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /share/quant_pool/calc_cache
```

---

## 10. 開發者備註 (Developer Notes)

### ⚠️ 技術陷阱警示

#### TT-Q01: pandas/numpy 數值精度問題
```python
# 問題：浮點數運算精度誤差
>>> 0.1 + 0.2
0.30000000000000004

# 解決方案：使用 Decimal 或 numpy.float64
from decimal import Decimal, getcontext
getcontext().prec = 10

# 或使用 numpy 的 float128
np.float128(0.1) + np.float128(0.2)
# 0.3
```

#### TT-Q02: 回測生存偏差 (Survivorship Bias)
```python
# 問題：歷史回測只包含存活股票，忽略已下市股票
# 導致報酬率被高估 2-5%

# 解決方案：
# 1. 使用含生存偏差調整的數據源 (e.g., CRSP Survivorship-Bias-Free)
# 2. 在回測時主動包含已知退市股票
# 3. 標記回測結果的生存偏差調整係數
survivorship_bias_factor = 0.95  # 假設下調 5%
adjusted_return = raw_return * survivorship_bias_factor
```

#### TT-Q03: 遺傳演算法過擬合
```python
# 問題：演化策略可能過度擬合歷史數據

# 解決方案：
# 1. 使用 Walk-Forward 交叉驗證
# 2. 限制權重變化範圍
# 3. 加入正則化懲罰項
# 4. 樣本外 IC 檢驗

# 正則化適應度函數
def regularized_fitness(genome, backtest_result, lambda_reg=0.01):
    base_fitness = calculate_fitness(backtest_result)
    weight_changes = np.sum(np.abs(np.diff(genome.weights)))
    penalty = lambda_reg * weight_changes
    return base_fitness - penalty
```

#### TT-Q04: Z-Score 數據不足處理
```python
# 問題：期貨/小型股數據點不足導致 Z-Score 不準確

# 解決方案：使用 Winsorized Z-Score
import scipy.stats as stats

def robust_zscore(data, min_periods=30):
    if len(data) < min_periods:
        return 0.0  # 返回中性值
    
    # 使用截斷均值和 MAD
    median = np.nanmedian(data)
    mad = np.nanmedian(np.abs(data - median))
    
    # MAD 轉換為標準差估計
    sigma = 1.4826 * mad
    
    if sigma == 0:
        return 0.0
    
    zscore = (data - median) / sigma
    return np.clip(zscore, -3, 3)
```

#### TT-Q05: Barra 模型矩陣奇異性
```python
# 問題：因子相關矩陣接近奇異導致逆矩陣不穩定

# 解決方案：使用伪逆矩陣或主成分分析降維
from numpy.linalg import pinv, svd

def stable_factor_cov(factor_returns):
    # 添加 Ridge 正則化
    lambda_ridge = 0.01
    cov = np.cov(factor_returns.T)
    cov_regularized = cov + lambda_ridge * np.eye(cov.shape[0])
    
    # 使用 SVD 檢查奇異性
    u, s, vh = svd(cov_regularized)
    condition_number = s.max() / s.min()
    
    if condition_number > 1e10:
        print(f"警告：矩陣條件數 {condition_number:.2e} 過高")
    
    return cov_regularized
```

#### TT-Q06: Monte Carlo 模擬收斂
```python
# 問題：模擬結果未收斂導致估計不穩定

# 解決方案：動態增加模擬次數直至收斂
def adaptive_monte_carlo_sim(
    returns,
    target_ci_width=0.001,
    max_samples=100000
):
    n = len(returns)
    samples = []
    cumulative_sum = 0
    
    while len(samples) < max_samples:
        # 隨機抽樣
        sample = np.random.choice(returns, size=min(1000, n - len(samples)), replace=True)
        samples.extend(sample)
        cumulative_sum += np.sum(sample)
        
        # 檢查收斂 (置信區間寬度)
        if len(samples) >= 30:
            mean = np.mean(samples)
            std = np.std(samples)
            ci_width = 1.96 * std / np.sqrt(len(samples))
            
            if ci_width < target_ci_width:
                break
    
    return {
        'mean': np.mean(samples),
        'std': np.std(samples),
        'n_samples': len(samples),
        'ci_95': (mean - 1.96 * std / np.sqrt(len(samples)),
                  mean + 1.96 * std / np.sqrt(len(samples)))
    }
```

### 📝 開發建議

#### DEV-Q01: 因子權重版本管理
```python
# 建議：使用 Git 或資料庫追蹤因子權重變更
# 
# 權重變更流程：
# 1. 建立新權重版本分支
# 2. 執行回測驗證
# 3. 經 AI 辯論審核
# 4. 審批後合併至主版本
# 5. 記錄變更原因與影響評估

WEIGHT_VERSION_SCHEMA = {
    "version": "v2026.02.10",
    "effective_date": "2026-02-15",
    "weights": {
        "value": 0.18,
        "quality": 0.22,
        "momentum": 0.18,
        "growth": 0.15,
        "volatility": 0.12,
        "size": 0.08,
        "leverage": 0.05,
        "liquidity": 0.05,
        "earnings_quality": 0.05,
        "shareholder_yield": 0.04,
        "analyst_sentiment": 0.04,
        "macro_sensitivity": 0.05,
        "sector_momentum": 0.04,
        "risk_adjusted": 0.05
    },
    "change_log": {
        "previous_version": "v2026.01.01",
        "changes": {
            "value": -0.02,
            "quality": +0.02
        },
        "reason": "根據 Q4 2025 回測調整"
    }
}
```

#### DEV-Q02: 演化策略斷點續傳
```python
# 建議：實現演化任務的斷點續傳功能
# 
# 斷點資料結構：
# {
#     "run_id": "uuid",
#     "generation": 75,
#     "population": [...],  # 當前族群
#     "best_individual": {...},
#     "timestamp": "2026-02-10T10:30:00Z"
# }

class EvolutionCheckpoint:
    def save(self, run_id: str, state: EvolutionState):
        checkpoint_path = f"/share/quant_pool/evolution_runs/{run_id}/checkpoint.json"
        with open(checkpoint_path, 'w') as f:
            json.dump({
                'generation': state.generation,
                'population': [ind.to_dict() for ind in state.population],
                'best_fitness': state.best_fitness,
                'timestamp': datetime.utcnow().isoformat()
            }, f, indent=2)
    
    def load(self, run_id: str) -> Optional[EvolutionState]:
        checkpoint_path = f"/share/quant_pool/evolution_runs/{run_id}/checkpoint.json"
        if not os.path.exists(checkpoint_path):
            return None
        with open(checkpoint_path, 'r') as f:
            data = json.load(f)
        return EvolutionState.from_dict(data)
```

#### DEV-Q03: 平行化計算優化
```python
# 建議：針對 QNAP 多核心優化平行化策略
# 
# 建議配置：
# - 演化策略：multiprocessing.Pool (10-12 程序)
# - Monte Carlo：numpy.random.multivariate_normal (向量化)
# - Barra 計算：numpy.linalg (已優化 BLAS)

from concurrent.futures import ProcessPoolExecutor
import multiprocessing

def parallel_fitness_evaluation(population: List[Genome], n_workers=None):
    """平行評估族群適應度"""
    if n_workers is None:
        n_workers = max(multiprocessing.cpu_count() - 2, 1)
    
    with ProcessPoolExecutor(max_workers=n_workers) as executor:
        results = list(executor.map(evaluate_genome, population))
    
    return results

# 注意：避免 multiprocessing 與 Docker 容器衝突
# 建議使用 ThreadPoolExecutor 或 joblib
```

#### DEV-Q04: 數據品質監控
```python
# 建議：實施因子計算的即時品質監控
# 
# 監控指標：
# 1. 數據完整性比率
# 2. Z-Score 分布檢驗
# 3. 因子相關性異常警報
# 4. 計算延遲追蹤

class FactorQualityMonitor:
    def check_zscore_distribution(self, factor_scores: pd.DataFrame):
        """檢驗 Z-Score 是否為標準常態分布"""
        zscores = factor_scores.dropna()
        
        # Kolmogorov-Smirnov 檢定
        ks_stat, p_value = stats.kstest(zscores, 'norm')
        
        if p_value < 0.05:
            return {
                'status': 'warning',
                'message': f"Z-Score 分布異常 (KS p={p_value:.4f})",
                'action': '檢查數據源品質'
            }
        
        return {'status': 'ok', 'message': 'Z-Score 分布正常'}
    
    def check_factor_correlations(self, factor_df: pd.DataFrame):
        """檢測因子相關性異常"""
        corr_matrix = factor_df.corr()
        high_corr_pairs = []
        
        for i in range(len(corr_matrix.columns)):
            for j in range(i+1, len(corr_matrix.columns)):
                if abs(corr_matrix.iloc[i, j]) > 0.9:
                    high_corr_pairs.append({
                        'factor_1': corr_matrix.columns[i],
                        'factor_2': corr_matrix.columns[j],
                        'correlation': corr_matrix.iloc[i, j]
                    })
        
        if high_corr_pairs:
            return {
                'status': 'warning',
                'message': f"發現 {len(high_corr_pairs)} 組高相關因子",
                'pairs': high_corr_pairs
            }
        
        return {'status': 'ok', 'message': '因子相關性正常'}
```

---

## 11. 關聯文件索引

| 文件 | 說明 | 交互關係 |
|------|------|----------|
| [00_Full_Reconstruction_TOC.md](00_Full_Reconstruction_TOC.md) | 完整檔案結構索引 | 量化模組位置參考 |
| [01_Vision_and_Philosophy.md](01_Vision_and_Philosophy.md) | 願景與哲學 | 演化策略目標對齊 |
| [02_Technical_Architecture.md](02_Technical_Architecture.md) | 技術架構 | 計算資源配置 |
| [03_Data_Management_and_Database.md](03_Data_Management_and_Database.md) | 資料庫設計 | Schema 對應 |
| [04_Data_Sources_and_API_Governance.md](04_Data_Sources_and_API_Governance.md) | 數據源治理 | 原始數據品質 |
| [06_Automation_and_Prefect_Workflow.md](06_Automation_and_Prefect_Workflow.md) | 工作流自動化 | 每日因子更新排程 |
| [09_Core_Module_Level_3_Decision.md](09_Core_Module_Level_3_Decision.md) | AI 決策輔助 | 演化策略視覺化 |
| [11_Decision_Templates_Spec.md](11_Decision_Templates_Spec.md) | 決策模板 | AI 辯論 Prompt |
| [14_Security_and_Reliability.md](14_Security_and_Reliability.md) | 安全與可靠性 | 計算節點監控 |

---

> **文件版本**：v1.0.1 (細節顯性化擴張)
> **關聯文件**：[00_Full_Reconstruction_TOC](00_Full_Reconstruction_TOC.md)
> **維護責任**：系統架構師 / 量化工程師
> **最後更新**：2026-02-10

