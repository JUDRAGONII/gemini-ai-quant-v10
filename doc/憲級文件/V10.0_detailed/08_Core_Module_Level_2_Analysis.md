# 08. 核心模組 2：深度分析與洞察偵測 (Analysis & Insight)

> **文件版本**：v1.0 (V10.0 完整規格書重構)
> **日期**：2026-02-10
> **核心使命：** 定義 MOD-T/M/S/R 模組的完整 UI 規格，涵蓋 House View、18 維度評分、13F 機構追蹤與技術分析

---

## 1. [T] AI 統一觀點 (House View - V10.0 強化)

### 1.1 頁面結構

| 元件 | 用途 | V10.0 強化 |
|------|------|------------|
| **HouseViewSummary** | 核心觀點摘要 | 支援演化策略顯示 |
| **MacroSituationAnalysis** | 宏觀情勢總論 | 130+ 指標整合 |
| **FactorPerformanceChart** | 因子表現分析 | 18 維度雷達圖 |
| **SentimentMonitor** | 重大輿情監控 | PTT/社群情緒 |
| **TacticalStrategy** | 綜合操作策略 | 多代理人辯論結果 |

---

## 2. [M] 個股深度透視 (Deep Dive - V10.0 強化)

### 2.1 一頁式分析結構

| 元件 | V10.0 強化內容 |
|------|----------------|
| **StockHeader** | 支援 18 維度評分顯示 |
| **QuantDNARadarChart** | 18 維度雷達圖 (擴充自 6 因子) |
| **FundamentalTrends** | 財報趨勢、估值區間 |
| **ChipStructure** | 11 家 13F 機構持倉 |
| **AISWOTAnalysis** | SWOT + 多代理人辯論 |

---

## 3. [S] 籌碼戰情室 (Smart Money - V10.0 強化)

### 3.1 法人流向監控

| 元件 | V10.0 強化內容 |
|------|----------------|
| **HolderSyncRate** | 大戶同步率 |
| **Institution13FTracker** | 11 家 13F 機構追蹤 (擴充) |
| **MarginShortAnalysis** | 融資融券分析 |

---

## 4. [R] 技術分析中心 (Technical Analysis)

### 4.1 技術指標儀表板

| 指標 | 說明 |
|------|------|
| **MA 排列** | MA5, MA20, MA60 |
| **RSI (14)** | 震盪指標 |
| **MACD** | 趨勢指標 |
| **ADX (14)** | 趨勢強度 |

---

## 6. 邏輯拆解 (Logic Breakdown)

### 6.1 [T] House View 統一觀點生成流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    [T] House View 統一觀點生成流程                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    資料聚合層                                         │   │
│   │                                                                      │   │
│   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │   │
│   │   │   宏觀數據   │  │   因子評分   │  │   市場情緒   │             │   │
│   │   │   130+指標  │  │   18 維度    │  │   PTT/社群   │             │   │
│   │   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │   │
│   │          │                 │                 │                       │   │
│   │          └─────────────────┼─────────────────┘                       │   │
│   │                            │                                         │   │
│   │                            ▼                                         │   │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              Regime Detection Engine                   │      │   │
│   │   │   • 宏觀 Regime 分類 (Bull/Bear/Transition)            │      │   │
│   │   │   • 市場 Regime 判斷                                    │      │   │
│   │   │   • 因子動能評估                                         │      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                            │                                         │   │
│   │                            ▼                                         │   │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              AI Multi-Agent Debate                      │      │   │
│   │   │                                                          │      │   │
│   │   │   ┌─────────┐   ┌─────────┐   ┌─────────┐               │      │   │
│   │   │   │ GPT-4o │   │Claude 3.5│   │Gemini 2.0│               │      │   │
│   │   │   │ Bullish │   │ Cautious │   │ Bullish │               │      │   │
│   │   │   └────┬────┘   └────┬────┘   └────┬────┘               │      │   │
│   │   │        │             │             │                      │      │   │
│   │   │        └─────────────┼─────────────┘                      │      │   │
│   │   │                      ▼                                    │      │   │
│   │   │          ┌─────────────────────┐                        │      │   │
│   │   │          │   Conflict          │                        │      │   │
│   │   │          │   Resolution        │                        │      │   │
│   │   │          │   • 3:1 Bullish    │                        │      │   │
│   │   │          │   • Consensus: 67% │                        │      │   │
│   │   │          └─────────────────────┘                        │      │   │
│   │   │                                                          │      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                            │                                         │   │
│   │                            ▼                                         │   │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              House View Generation                      │      │   │
│   │   │                                                          │      │   │
│   │   │   • Outlook: Moderate Bullish                          │      │   │
│   │   │   • Confidence: 4/5 ★★★★☆                              │      │   │
│   │   │   • Key Drivers: Value + Momentum                     │      │   │
│   │   │   • Risk Factors: Volatility + Geopolitical           │      │   │
│   │   │                                                          │      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 [M] 個股深度透視分析流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    [M] 個股深度透視分析流程                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Level 1: 基本面 ──▶ Level 2: 量化 ──▶ Level 3: 籌碼 ──▶ Level 4: AI 分析 │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │   Level 1: 基本面分析                                               │   │
│   │   ├─ 財報數據 (ROE/ROA/營收/獲利)                                   │   │
│   │   ├─ 估值指標 (PE/PB/EV/EBITDA)                                     │   │
│   │   └─ 成長趨勢 (CAGR 3年/5年)                                        │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │   Level 2: 量化 DNA (18 維度雷達圖)                                 │   │
│   │   ├─ Value (10-25%) 價值維度                                        │   │
│   │   ├─ Quality (15-30%) 品質維度                                     │   │
│   │   ├─ Momentum (10-25%) 動能維度                                    │   │
│   │   ├─ Growth (10-25%) 成長維度                                      │   │
│   │   ├─ Volatility (10-20%) 波動維度                                  │   │
│   │   └─ ... 共 18 維度                                                  │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │   Level 3: 籌碼結構                                                │   │
│   │   ├─ 11 家 13F 機構持倉變化                                         │   │
│   │   ├─ 內部人持股變動                                                 │   │
│   │   └─ 融資融券變化                                                   │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │   Level 4: AI SWOT 分析                                           │   │
│   │   ├─ Strengths (優勢)                                              │   │
│   │   ├─ Weaknesses (劣勢)                                             │   │
│   │   ├─ Opportunities (機會)                                          │   │
│   │   └─ Threats (威脅)                                               │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │              Multi-Agent Debate                              │  │   │
│   │   │   • Pro: Bullish on Growth                                  │  │   │
│   │   │   • Con: Cautious on Valuation                              │  │   │
│   │   │   • Final: Moderate Buy (Conviction: 7/10)                 │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.3 [S] 籌碼戰情室監控流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    [S] 籌碼戰情室監控流程                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    籌碼數據源                                         │   │
│   │                                                                      │   │
│   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │   │
│   │   │   13F 持倉   │  │   融資融券   │  │   法人買賣   │             │   │
│   │   │   11 家機構  │  │   Margin    │  │   Foreign   │             │   │
│   │   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │   │
│   │          │                 │                 │                       │   │
│   │          └─────────────────┼─────────────────┘                       │   │
│   │                            │                                         │   │
│   │                            ▼                                         │   │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              籌碼分析引擎                                 │      │   │
│   │   │                                                          │      │   │
│   │   │   ┌──────────────────────────────────────────────────┐  │      │   │
│   │   │   │           Holder Sync Rate (大戶同步率)         │  │      │   │
│   │   │   │                                                  │  │      │   │
│   │   │   │   大戶持有率 = 持 > 100張 戶數 / 總戶數           │  │      │   │
│   │   │   │   同漲率 = 大戶持股上漲 / 大戶持股下跌            │  │      │   │
│   │   │   │   紅綠燈: >70% Green, 40-70% Yellow, <40% Red   │  │      │   │
│   │   │   └──────────────────────────────────────────────────┘  │      │   │
│   │   │                                                          │      │   │
│   │   │   ┌──────────────────────────────────────────────────┐  │      │   │
│   │   │   │           Institution 13F Tracker              │  │      │   │
│   │   │   │                                                  │  │      │   │
│   │   │   │   Berkshire, Fidelity, Vanguard, BlackRock...  │  │      │   │
│   │   │   │   持倉變化、買入成本、評論意見                   │  │      │   │
│   │   │   └──────────────────────────────────────────────────┘  │      │   │
│   │   │                                                          │      │   │
│   │   │   ┌──────────────────────────────────────────────────┐  │      │   │
│   │   │   │           Margin Short Analysis                 │  │      │   │
│   │   │   │                                                  │  │      │   │
│   │   │   │   融資餘額 / 融券餘額 / 券資比 / 斷頭率          │  │      │   │
│   │   │   └──────────────────────────────────────────────────┘  │      │   │
│   │   │                                                          │      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                            │                                         │   │
│   │                            ▼                                         │   │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              籌碼紅綠燈矩陣                             │      │   │
│   │   │                                                          │      │   │
│   │   │   ┌───────────────────────────────────────────────────┐│      │   │
│   │   │   │  Symbol  │ 13F Flow │ Margin │ Foreign │ Light ││      │   │
│   │   │   ├─────────┼──────────┼────────┼─────────┼────────┤│      │   │
│   │   │   │ 2330.TW │  🟢 Buy  │ 🟢 Low │ 🟢 Net+ │  Green ││      │   │
│   │   │   │ 2454.TW │  🟡 Hold │ 🟡 Norm│ 🟡 Net+ │  Yellow││      │   │
│   │   │   │ 2303.TW │  🔴 Sell │ 🔴 High│ 🔴 Net- │   Red  ││      │   │
│   │   │   └───────────────────────────────────────────────────┘│      │   │
│   │   │                                                          │      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.4 [R] 技術分析計算流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    [R] 技術分析計算流程                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐               │
│   │   OHLCV     │     │   技術指標   │     │   訊號生成   │               │
│   │   數據      │ ──▶ │   計算引擎   │ ──▶ │   整合層     │               │
│   │              │     │              │     │              │               │
│   │ • Price      │     │ • MA        │     │ • Buy        │               │
│   │ • Volume     │     │ • RSI       │     │ • Sell       │               │
│   │              │     │ • MACD      │     │ • Hold       │               │
│   │              │     │ • ADX       │     │              │               │
│   │              │     │ • Bollinger │     │              │               │
│   └──────────────┘     └──────────────┘     └──────────────┘               │
│                                      │                                      │
│                                      ▼                                      │
│   ┌───────────────────────────────────────────────────────────────────┐   │
│   │                      技術指標計算邏輯                              │   │
│   │                                                                    │   │
│   │   ┌─────────────────────────────────────────────────────────────┐ │   │
│   │   │   MA 排列 (Moving Average Alignment)                        │ │   │
│   │   │   • MA5 > MA20 > MA60 = 強多頭                               │ │   │
│   │   │   • MA5 > MA20 > MA60 = 弱多頭                               │ │   │
│   │   │   • MA5 < MA20 < MA60 = 弱空頭                               │ │   │
│   │   │   • MA20 > MA60 > MA120 = 糾結觀望                           │ │   │
│   │   └─────────────────────────────────────────────────────────────┘ │   │
│   │                                                                    │   │
│   │   ┌─────────────────────────────────────────────────────────────┐ │   │
│   │   │   RSI (Relative Strength Index)                            │ │   │
│   │   │   • RSI > 70 = Overbought (Bearish)                        │ │   │
│   │   │   • RSI < 30 = Oversold (Bullish)                          │ │   │
│   │   │   • RSI 50 = 中性                                           │ │   │
│   │   └─────────────────────────────────────────────────────────────┘ │   │
│   │                                                                    │   │
│   │   ┌─────────────────────────────────────────────────────────────┐ │   │
│   │   │   MACD (Moving Average Convergence Divergence)             │ │   │
│   │   │   • MACD > Signal = Bullish                                │ │   │
│   │   │   • MACD < Signal = Bearish                                │ │   │
│   │   │   • Zero Line Cross = 趨勢轉變                              │ │   │
│   │   └─────────────────────────────────────────────────────────────┘ │   │
│   │                                                                    │   │
│   │   ┌─────────────────────────────────────────────────────────────┐ │   │
│   │   │   ADX (Average Directional Index)                         │ │   │
│   │   │   • ADX > 25 = 有趨勢                                      │ │   │
│   │   │   • ADX < 20 = 無趨勢/盤整                                 │ │   │
│   │   │   • +DI > -DI = 多頭趨勢                                    │ │   │
│   │   └─────────────────────────────────────────────────────────────┘ │   │
│   │                                                                    │   │
│   └───────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. 邊界條件定義 (Edge Cases)

### 7.1 [T] House View 邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-A01** | AI 全部三個模型預測衝突 | 顯示三方觀點，不做統一 | 標記 "Consensus Pending" |
| **EC-A02** | 宏觀數據缺少 > 20% | Regime 判斷不可靠 | 降級至 "Uncertain" Regime |
| **EC-A03** | 情緒數據異常飆升 | 標記為噪聲過濾 | 驗證數據來源 |
| **EC-A04** | Regime 切換頻繁 | 延遲 Regime 確認 | 等待 3 日確認 |
| **EC-A05** | 信心評分 < 2 星 | 增加風險提示 | 顯示 "Low Confidence" |
| **EC-A06** | 歷史數據不足 1 年 | 降低信心評分 | 標記 "Short History" |

### 7.2 [M] 個股深度透視邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-A07** | 個股缺少 18 因子任一維度 | 雷達圖顯示灰色區域 | 標記 "Partial Data" |
| **EC-A08** | 財報數據延遲 (> 3 個月) | 使用預估數據 | 標記 "Estimate" |
| **EC-A09** | 產業分類缺失 | 使用 "Unknown" | 稍後人工分類 |
| **EC-A10** | AI 分析超時 ( > 60 秒) | 返回基本分析 | 提示 "Full Analysis Later" |
| **EC-A11** | 個股流動性極低 | 警告流動性風險 | 標記 "Low Liquidity" |
| **EC-A12** | 股價 < 10 元 | 顯示低價股警告 | 標記 "Penny Stock Risk" |

### 7.3 [S] 籌碼戰情室邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-A13** | 13F 資料延遲 (> 45 天) | 顯示數據過期 | 標記 "Stale Data" |
| **EC-A14** | 機構持倉變化 > 50% | 觸發特別追蹤 | 標記 "Significant Change" |
| **EC-A15** | 券資比 > 40% | 顯示警示燈 | 標記 "Short Squeeze Risk" |
| **EC-A16** | 斷頭率 > 20% | 顯示警告 | 標記 "Margin Call Risk" |
| **EC-A17** | 內部人大量賣出 | 紅色警示 | 標記 "Insider Selling" |
| **EC-A18** | 主力連續買超 > 5 日 | 追蹤買超天數 | 標記 "Accumulation" |

### 7.4 [R] 技術分析邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-A19** | 價格 < 1 元 | MA 計算失真 | 顯示警告 |
| **EC-A20** | 成交量為零 | 技術指標失效 | 標記 "No Volume" |
| **EC-A21** | RSI 持續 > 80 超過 10 日 | 視為 "Overbought Stable" | 不做賣出建議 |
| **EC-A22** | MACD 零軸附近震盪 | 顯示觀望訊號 | 標記 "Choppy" |
| **EC-A23** | ADX < 15 超過 20 日 | 判定無趨勢 | 建議區間操作 |
| **EC-A24** | 多指標訊號衝突 | 顯示訊號權重 | 計算最終訊號 |

---

## 8. Schema 完整化

### 8.1 House View 資料表 `house_view`

```sql
-- ============================================================================
-- House View 統一觀點資料表
-- 用途：存儲每日 AI 生成的市場統一觀點
-- ============================================================================

CREATE TABLE IF NOT EXISTS house_view (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    view_date           DATE NOT NULL,                   -- 觀點日期
    
    -- 宏觀 Regime
    macro_regime        VARCHAR(20) NOT NULL,            -- Bull/Bear/Transition/Uncertain
    market_regime       VARCHAR(20) NOT NULL,            -- Trend/Range/Volatile
    regime_confidence   DECIMAL(5,4) NOT NULL,           -- Regime 判斷信心度
    
    -- AI 觀點整合
    outlook             VARCHAR(20) NOT NULL,            -- Strong Bull/Bull/Neutral/Bear/Strong Bear
    outlook_confidence  INTEGER CHECK (outlook_confidence BETWEEN 1 AND 5), -- 1-5 星
    confidence_label    VARCHAR(20),                     -- Low/Medium/High/Very High
    
    -- 詳細分析
    summary             TEXT NOT NULL,                   -- 觀點摘要
    key_drivers         TEXT[],                          -- 關鍵驅動因素
    risk_factors        TEXT[],                          -- 風險因素
    
    -- 因子觀點
    factor_view         JSONB,                           -- 各因子觀點
    best_factors       VARCHAR(50)[],                    -- 表現最佳因子
    worst_factors      VARCHAR(50)[],                    -- 表現最差因子
    
    -- AI 辯論結果
    agent_views         JSONB,                           -- 各 AI 觀點
    consensus_score    DECIMAL(5,4),                    -- 共識程度
    conflict_points     TEXT[],                          -- 衝突點
    
    -- 操作建議
    tactical_strategy   TEXT,                             -- 操作策略
    recommended_allocation JSONB,                       -- 建議配置
    sector_rotation     JSONB,                           -- 產業輪動
    
    -- 版本追蹤
    version            INTEGER DEFAULT 1,                -- 版本號
    is_latest          BOOLEAN DEFAULT TRUE,             -- 是否最新
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT hv_date_uniq UNIQUE (view_date)
);

-- ============================================================================
-- AI 代理人觀點資料表
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_opinions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    house_view_id       UUID NOT NULL REFERENCES house_view(id),
    agent_name          VARCHAR(50) NOT NULL,            -- gpt-4o/claude-3.5-sonnet/gemini-2.0
    agent_role          VARCHAR(100),                     -- 代理人角色
    
    -- 觀點內容
    outlook             VARCHAR(20) NOT NULL,            -- Bullish/Bearish/Neutral
    confidence         INTEGER CHECK (confidence BETWEEN 1 AND 5), -- 信心度
    summary            TEXT NOT NULL,                    -- 觀點摘要
    
    -- 分析詳情
    analysis           TEXT,                             -- 詳細分析
    key_points         TEXT[],                           -- 關鍵論點
    concerns           TEXT[],                           -- 憂慮因素
    
    -- 評分
    technical_score    DECIMAL(8,4),                     -- 技術面評分
    fundamental_score DECIMAL(8,4),                      -- 基本面評分
    sentiment_score   DECIMAL(8,4),                     -- 情緒面評分
    
    -- 執行資料
    tokens_used        INTEGER,                          -- 使用 Token 數
    processing_time_ms INTEGER,                          -- 處理時間
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT ao_hv_agent_uniq UNIQUE (house_view_id, agent_name)
);

-- COMMENT 註解
COMMENT ON TABLE house_view IS 'House View 統一觀點表 - 每日 AI 生成的市場觀點';
COMMENT ON TABLE agent_opinions IS 'AI 代理人觀點表 - 各 AI 模型的分析觀點';
COMMENT ON COLUMN house_view.outlook IS '市場展望: Strong Bull/Bull/Neutral/Bear/Strong Bear';
COMMENT ON COLUMN house_view.outlook_confidence IS '信心評分 1-5 星，5 星最高';
COMMENT ON COLUMN house_view.consensus_score IS '共識程度 0-1，越接近 1 表示共識越高';
```

### 8.2 個股深度分析資料表 `stock_analysis`

```sql
-- ============================================================================
-- 個股深度分析資料表
-- 用途：存儲個股的深度分析結果
-- ============================================================================

CREATE TABLE IF NOT EXISTS stock_analysis (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol              VARCHAR(20) NOT NULL,             -- 標的代碼
    analysis_date       DATE NOT NULL,                    -- 分析日期
    
    -- 基本面分析
    fundamental_summary  TEXT,                             -- 基本面摘要
    roe                 DECIMAL(8,4),                    -- ROE
    roa                 DECIMAL(8,4),                    -- ROA
    gross_margin        DECIMAL(8,4),                   -- 毛利率
    net_margin          DECIMAL(8,4),                   -- 淨利率
    debt_to_equity      DECIMAL(8,4),                    -- 負債比
    
    -- 估值指標
    pe_ratio            DECIMAL(10,4),                   -- PE
    pb_ratio            DECIMAL(10,4),                   -- PB
    ev_ebitda          DECIMAL(10,4),                   -- EV/EBITDA
    dividend_yield     DECIMAL(8,4),                    -- 股息率
    
    -- 成長指標
    revenue_cagr_3y     DECIMAL(8,4),                    -- 營收 3 年 CAGR
    earnings_cagr_3y   DECIMAL(8,4),                    -- 獲利 3 年 CAGR
    
    -- V10.0 18 維度評分
    factor_composite_score DECIMAL(8,4),               -- 綜合評分
    factor_value_score   DECIMAL(8,4),                 -- 價值評分
    factor_quality_score DECIMAL(8,4),                 -- 品質評分
    factor_momentum_score DECIMAL(8,4),                -- 動能評分
    factor_growth_score DECIMAL(8,4),                  -- 成長評分
    factor_volatility_score DECIMAL(8,4),              -- 波動評分
    factor_size_score   DECIMAL(8,4),                  -- 規模評分
    factor_leverage_score DECIMAL(8,4),                -- 槓桿評分
    factor_liquidity_score DECIMAL(8,4),               -- 流動性評分
    factor_earnings_quality_score DECIMAL(8,4),       -- 盈餘品質評分
    factor_shareholder_yield_score DECIMAL(8,4),       -- 股东收益率評分
    factor_analyst_sentiment_score DECIMAL(8,4),      -- 分析師情緒評分
    factor_macro_sensitivity_score DECIMAL(8,4),      -- 宏觀敏感度評分
    factor_sector_momentum_score DECIMAL(8,4),        -- 產業動能評分
    factor_risk_adjusted_score DECIMAL(8,4),          -- 風險調整評分
    
    -- AI SWOT 分析
    swot_strengths      TEXT[],                          -- 優勢
    swot_weaknesses     TEXT[],                          -- 劣勢
    swot_opportunities  TEXT[],                          -- 機會
    swot_threats        TEXT[],                          -- 威脅
    
    -- AI 建議
    ai_recommendation   VARCHAR(20),                     -- Buy/Hold/Sell
    conviction_score    INTEGER CHECK (conviction_score BETWEEN 1 AND 10), -- 信心度 1-10
    target_price        DECIMAL(18,4),                  -- 目標價
    stop_loss_price     DECIMAL(18,4),                   -- 停損價
    
    -- 產業分類
    sector              VARCHAR(50),                      -- 產業
    industry_group      VARCHAR(100),                     -- 產業群組
    
    -- 更新狀態
    is_generated        BOOLEAN DEFAULT FALSE,           -- 是否已生成 AI 分析
    last_ai_update     TIMESTAMP WITH TIME ZONE,        -- 最後 AI 更新時間
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT sa_symbol_date_uniq UNIQUE (symbol, analysis_date)
);

-- COMMENT 註解
COMMENT ON TABLE stock_analysis IS '個股深度分析表 - 完整基本面與 18 維度評分';
COMMENT ON COLUMN stock_analysis.factor_composite_score IS '18 維度 Z-Score 加權平均 (-3 to +3)';
COMMENT ON COLUMN stock_analysis.conviction_score IS 'AI 信心評分 1-10，10 為最高';
```

### 8.3 籌碼分析資料表 `chip_analysis`

```sql
-- ============================================================================
-- 籌碼分析資料表
-- 用途：存儲個股籌碼結構分析
-- ============================================================================

CREATE TABLE IF NOT EXISTS chip_analysis (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol              VARCHAR(20) NOT NULL,             -- 標的代碼
    analysis_date       DATE NOT NULL,                    -- 分析日期
    
    -- 大戶同步率
    holder_sync_rate    DECIMAL(8,4),                    -- 大戶同步率 %
    holder_increase_rate DECIMAL(8,4),                  -- 大戶持股增加率 %
    holder_decrease_rate DECIMAL(8,4),                  -- 大戶持股減少率 %
    holder_count        INTEGER,                         -- 大戶戶數
    total_shareholders  INTEGER,                         -- 總戶數
    
    -- 紅綠燈狀態
    sync_light          VARCHAR(10),                     -- Green/Yellow/Red
    
    -- 13F 機構持倉
    institution_ownership JSONB,                         -- 機構持倉 JSON
    top_holders         JSONB,                           -- 主要持有人
    institutional_flow   VARCHAR(20),                    -- Net Buy/Net Sell/Hold
    
    -- 融資融券
    margin_balance      BIGINT,                          -- 融資餘額
    short_balance       BIGINT,                          -- 融券餘額
    margin_short_ratio  DECIMAL(8,4),                    -- 券資比
    margin_utilization  DECIMAL(8,4),                   -- 融資使用率
    
    -- 法人買賣
    foreign_buy         BIGINT,                          -- 外資買超
    foreign_sell        BIGINT,                          -- 外資賣超
    foreign_net         BIGINT,                          -- 外資淨買超
    trust_buy           BIGINT,                          -- 投信買超
    trust_sell          BIGINT,                          -- 投信賣超
    trust_net           BIGINT,                          -- 投信淨買超
    
    -- 主力買賣
    main_force_buy      BIGINT,                          -- 主力買超
    main_force_sell     BIGINT,                          -- 主力賣超
    main_force_net      BIGINT,                          -- 主力淨買超
    main_force_days     INTEGER,                         -- 連續買超天數
    
    -- 綜合評估
    chip_overall_light  VARCHAR(10),                    -- 綜合紅綠燈
    chip_score         INTEGER CHECK (chip_score BETWEEN 1 AND 100), -- 綜合評分 1-100
    
    -- 更新狀態
    data_sources_ok    INTEGER,                          -- 正常數據源數
    data_sources_total INTEGER,                          -- 總數據源數
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT ca_symbol_date_uniq UNIQUE (symbol, analysis_date)
);

-- COMMENT 註解
COMMENT ON TABLE chip_analysis IS '籌碼分析表 - 大戶同步率、13F 機構、融資融券、法人買賣';
COMMENT ON COLUMN chip_analysis.holder_sync_rate IS '大戶同步率 = 大戶上漲戶數 / 大戶總戶數';
COMMENT ON COLUMN chip_analysis.chip_overall_light IS '綜合紅綠燈: Green/Yellow/Red';
```

### 8.4 技術指標資料表 `technical_indicators`

```sql
-- ============================================================================
-- 技術指標資料表
-- 用途：存儲個股技術分析指標
-- ============================================================================

CREATE TABLE IF NOT EXISTS technical_indicators (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol              VARCHAR(20) NOT NULL,             -- 標的代碼
    calc_date           DATE NOT NULL,                    -- 計算日期
    
    -- 價格數據
    open_price          DECIMAL(18,4),                   -- 開盤價
    high_price          DECIMAL(18,4),                   -- 最高價
    low_price           DECIMAL(18,4),                   -- 最低價
    close_price         DECIMAL(18,4) NOT NULL,          -- 收盤價
    volume              BIGINT NOT NULL,                 -- 成交量
    
    -- MA 指標
    ma5                 DECIMAL(18,4),                   -- 5 日均線
    ma20                DECIMAL(18,4),                   -- 20 日均線
    ma60                DECIMAL(18,4),                   -- 60 日均線
    ma120               DECIMAL(18,4),                   -- 120 日均線
    
    -- MA 排列狀態
    ma_alignment        VARCHAR(20),                     -- Strong Bull/Bull/Neutral/Bear/Strong Bear
    
    -- RSI 指標
    rsi_14              DECIMAL(8,4),                    -- 14 日 RSI
    rsi_status          VARCHAR(20),                     -- Overbought/Oversold/Neutral
    
    -- MACD 指標
    macd_line           DECIMAL(18,6),                  -- MACD 線
    signal_line         DECIMAL(18,6),                  -- Signal 線
    macd_histogram      DECIMAL(18,6),                  -- MACD 柱狀圖
    macd_status        VARCHAR(20),                     -- Bullish/Bearish/Neutral
    
    -- ADX 指標
    adx_14              DECIMAL(8,4),                    -- 14 日 ADX
    plus_di             DECIMAL(8,4),                    -- +DI
    minus_di            DECIMAL(8,4),                    -- -DI
    adx_status         VARCHAR(20),                     -- Strong Trend/Weak Trend/Ranging
    
    -- 布林通道
    bollinger_upper     DECIMAL(18,4),                   -- 上軌
    bollinger_middle    DECIMAL(18,4),                   -- 中軌
    bollinger_lower     DECIMAL(18,4),                   -- 下軌
    bollinger_position  VARCHAR(20),                     -- Above/Within/Below
    
    -- 綜合訊號
    overall_signal      VARCHAR(20),                     -- Buy/Sell/Hold
    signal_strength     INTEGER CHECK (signal_strength BETWEEN 1 AND 5), -- 訊號強度 1-5
    
    -- 交易建議
    support_level       DECIMAL(18,4),                   -- 支撐位
    resistance_level   DECIMAL(18,4),                   -- 壓力位
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT ti_symbol_date_uniq UNIQUE (symbol, calc_date)
);

-- COMMENT 註解
COMMENT ON TABLE technical_indicators IS '技術指標表 - MA/RSI/MACD/ADX/布林通道';
COMMENT ON COLUMN technical_indicators.ma_alignment IS 'MA 排列狀態';
COMMENT ON COLUMN technical_indicators.overall_signal IS '綜合訊號: Strong Buy/Buy/Hold/Sell/Strong Sell';
```

---

## 9. 硬體/環境關聯 (QNAP TS-h973AX)

### 9.1 資源需求對照表

| 模組 | CPU | RAM | Storage | 配置重點 |
|------|-----|-----|---------|----------|
| **[T] House View** | 8 核心 | 16 GB | SSD 100 GB | LLM API, 文本處理 |
| **[M] 個股分析** | 4 核心 | 8 GB | SSD 50 GB | 數據庫查詢 |
| **[S] 籌碼戰情室** | 4 核心 | 8 GB | SSD 50 GB | 即時數據處理 |
| **[R] 技術分析** | 4 核心 | 8 GB | SSD 50 GB | 數值計算 |

### 9.2 Redis Cache 配置

```bash
# ============================================================================
# 分析模組 Redis Cache 配置
# ============================================================================

# House View Cache
SETEX "houseview:daily" 3600 $data

# 個股分析 Cache
SETEX "stock:analysis:{symbol}" 1800 $data
SETEX "stock:swot:{symbol}" 3600 $data

# 籌碼分析 Cache
SETEX "chip:holder:{symbol}" 900 $data
SETEX "chip:institution:{symbol}" 3600 $data

# 技術指標 Cache
SETEX "technical:{symbol}" 300 $data
```

### 9.3 ZFS 儲存配置

```bash
#!/bin/bash
# ============================================================================
# 分析模組 ZFS 配置
# ============================================================================

# 創建分析結果 Dataset
zfs create quant_pool/analysis
zfs set compression=zstd quant_pool/analysis
zfs set atime=off quant_pool/analysis
zfs set quota=200G quant_pool/analysis

# House View 結果
zfs create quant_pool/analysis/house_view
zfs set compression=lz4 quant_pool/analysis/house_view

# 個股深度分析
zfs create quant_pool/analysis/stock_analysis
zfs set compression=lz4 quant_pool/analysis/stock_analysis

# 技術指標歷史
zfs create quant_pool/analysis/technical
zfs set compression=lz4 quant_pool/analysis/technical
```

---

## 10. 開發者備註 (Developer Notes)

### ⚠️ 技術陷阱警示

#### TT-A01: LLM API 成本控制
```python
# 問題：大量生成 House View 導致 API 成本過高
# 
# 解決方案：
# 1. 實施 Prompt 優化
# 2. 使用快取避免重複呼叫
# 3. 實施 Rate Limiting

from functools import lru_cache
import time

class HouseViewGenerator:
    def __init__(self):
        self.last_prompt_time = 0
        self.min_interval = 60  # 最小間隔 60 秒
    
    @lru_cache(maxsize=1)
    def generate_view(self, market_data_hash: str):
        # 確保最小間隔
        current = time.time()
        if current - self.last_prompt_time < self.min_interval:
            time.sleep(self.min_interval - (current - self.last_prompt_time))
        
        result = self.call_llm_api()
        self.last_prompt_time = time.time()
        return result
```

#### TT-A02: 18 維度雷達圖渲染
```typescript
// 問題：18 維度雷達圖數據量大導致渲染卡頓
// 
// 解決方案：
// 1. 使用 Canvas 而非 SVG
// 2. 實現漸進式載入
// 3. WebGL 加速

function QuantDNARadarChart({ factors }: { factors: Factor[] }) {
    // 使用 react-chartjs-2 或 echarts
    const chartData = {
        labels: factors.map(f => f.name),
        datasets: [{
            data: factors.map(f => f.score),
            backgroundColor: 'rgba(0, 200, 150, 0.2)',
            borderColor: 'rgba(0, 200, 150, 1)',
        }]
    };
    
    return <Radar data={chartData} options={radarOptions} />;
}
```

#### TT-A03: 即時籌碼數據同步
```python
# 問題：多個數據源的籌碼數據時間不一致
# 
# 解決方案：
# 1. 標準化時間戳
# 2. 標記數據延遲
# 3. 顯示數據來源時間

class ChipDataSynchronizer:
    def sync_and_normalize(self, data_sources: List[ChipData]) -> NormalizedChipData:
        # 取得最晚更新時間
        latest_update = max(ds.updated_at for ds in data_sources)
        
        # 標準化時間戳
        normalized = {
            'symbol': data_sources[0].symbol,
            'analysis_date': latest_update.date(),
            'data_sources': [{
                'source': ds.source_name,
                'updated_at': ds.updated_at.isoformat(),
                'delay_hours': (latest_update - ds.updated_at).total_seconds() / 3600
            } for ds in data_sources]
        }
        
        return normalized
```

#### TT-A04: 技術指標漂移
```python
# 問題：不同數據源計算的技術指標有差異
# 
# 解決方案：
# 1. 統一數據源
# 2. 標準化計算公式
# 3. 記錄計算版本

TECHNICAL_INDICATOR_VERSION = {
    'rsi': {
        'version': '1.2.0',
        'period': 14,
        'method': 'wilders',  # Wilder's smoothing
        'data_source': 'primary'
    },
    'macd': {
        'version': '1.1.0',
        'fast': 12,
        'slow': 26,
        'signal': 9,
        'method': 'ema'
    }
}
```

### 📝 開發建議

#### DEV-A01: House View 版本控制
```python
# 建議：實施 House View 版本控制追蹤
# 
# 版本策略：
# 1. 每次生成新版本
# 2. 保留歷史版本
# 3. 追蹤變更原因

class HouseViewVersion:
    def create_version(self, current_view: HouseView) -> HouseViewVersion:
        # 比較與上一版本差異
        previous = self.get_latest_version()
        changes = self.calculate_changes(previous, current_view)
        
        return {
            'version': previous.version + 1,
            'view_data': current_view,
            'changes': changes,
            'change_reason': changes.get('reason', 'Scheduled Update')
        }
```

#### DEV-A02: 個股分析快取策略
```typescript
// 建議：實施分層快取策略
// 
// 快取策略：
// Layer 1: Redis (5 分鐘) - 即時數據
// Layer 2: 瀏覽器 Storage (30 分鐘) - 用戶體驗
// Layer 3: 離線 Storage (24 小時) - 離線支援

const CACHE_STRATEGY = {
    realtime: { ttl: 300, storage: 'redis' },
    userView: { ttl: 1800, storage: 'localStorage' },
    offline: { ttl: 86400, storage: 'indexedDB' }
};
```

#### DEV-A03: 紅綠燈計算邏輯
```python
# 建議：標準化紅綠燈計算邏輯
# 
# 計算公式：
# Green: >= 70%
# Yellow: 40-70%
# Red: < 40%

class ChipTrafficLight:
    def calculate_light(
        self,
        holder_sync_rate: float,
        institution_flow: str,
        margin_ratio: float
    ) -> TrafficLight:
        score = 0
        
        # 大戶同步率 (40%)
        if holder_sync_rate >= 0.7:
            score += 40
        elif holder_sync_rate >= 0.4:
            score += 20
        
        # 機構流向 (30%)
        if institution_flow == 'Net Buy':
            score += 30
        elif institution_flow == 'Hold':
            score += 15
        
        # 券資比 (30%)
        if margin_ratio < 0.2:
            score += 30
        elif margin_ratio < 0.4:
            score += 15
        
        # 判定燈號
        if score >= 70:
            return 'Green'
        elif score >= 40:
            return 'Yellow'
        else:
            return 'Red'
```

#### DEV-A04: 技術指標模組化
```python
# 建議：實現技術指標計算的模組化
# 
# 模組結構：
# - BaseIndicator (抽象基類)
# - MovingAverageIndicator
# - RSIIndicator
# - MACDIndicator
# - IndicatorFactory

class IndicatorFactory:
    _indicators = {
        'ma': MovingAverageIndicator,
        'rsi': RSIIndicator,
        'macd': MACDIndicator,
        'adx': ADXIndicator,
        'bollinger': BollingerIndicator
    }
    
    @classmethod
    def create(cls, indicator_type: str, **params) -> BaseIndicator:
        indicator_class = cls._indicators.get(indicator_type)
        if not indicator_class:
            raise ValueError(f"Unknown indicator type: {indicator_type}")
        return indicator_class(**params)
```

---

## 11. 關聯文件索引

| 文件 | 說明 | 交互關係 |
|------|------|----------|
| [00_Full_Reconstruction_TOC.md](00_Full_Reconstruction_TOC.md) | 完整檔案結構索引 | L2 模組位置 |
| [05_Quant_Theory_and_Calculations.md](05_Quant_Theory_and_Calculations.md) | 量化理論 | 因子評分計算 |
| [09_Core_Module_Level_3_Decision.md](09_Core_Module_Level_3_Decision.md) | AI 決策輔助 | 訊號整合 |
| [11_Decision_Templates_Spec.md](11_Decision_Templates_Spec.md) | 決策模板 | AI 辯論 Prompt |
| [12_Daily_Strategy_Report_Spec.md](12_Daily_Strategy_Report_Spec.md) | 每日報告 | House View 整合 |

---

> **文件版本**：v1.0.1 (細節顯性化擴張)
> **關聯文件**：[00_Full_Reconstruction_TOC](00_Full_Reconstruction_TOC.md)
> **維護責任**：系統架構師 / 分析師
> **最後更新**：2026-02-10

