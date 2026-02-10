# 09. 核心模組 3：決策輔助與 AI 戰略 (Decision & AI Strategy)

> **文件版本**：v1.0 (V10.0 完整規格書重構)
> **日期**：2026-02-10
> **核心使命：** 定義 MOD-D/O/Z/P 模組的完整規格，涵蓋 AI 投資策略、壓力測試、RAG 對話與 Greeks 監控

---

## 1. [D] AI 投資策略建議 (AI CIO - V10.0 強化)

### 1.1 智能觸發燈號

| 燈號 | 說明 | V10.0 強化 |
|------|------|------------|
| **STRONG_BUY** | 強力買進 | 信心分數 8.5+ |
| **BUY** | 買進 | 信心分數 7.0-8.4 |
| **NEUTRAL** | 中性 | 信心分數 5.0-6.9 |
| **WARNING** | 警告 | 信心分數 3.0-4.9 |
| **SELL** | 賣出 | 信心分數 <3.0 |

### 1.2 多面相雷達 (V10.0 18 維度)

| 維度 | 說明 |
|------|------|
| 量化打分 | 18 維度綜合評分 |
| 籌碼面 | 13F 機構 + 大戶同步率 |
| 技術面 | MA/RSI/MACD/ADX |
| AI 信心度 | 多代理人辯論信心 |
| 演化策略 | 基因組適應度 |

---

## 2. [O] 投資組合優化與壓測 (V10.0 強化)

### 2.1 壓力測試情境

| 情境 | 市場跌幅 | 產業衝擊 |
|------|----------|----------|
| **2008 金融海嘯** | -50% | 金融 -60%, 科技 -55% |
| **2020 疫情崩盤** | -30% | 旅遊 -70%, 科技 -25% |
| **2022 通膨危機** | -25% | 科技 -40%, 消費 -30% |

### 2.2 專業模型整合

| 模型 | 用途 | V10.0 |
|------|------|--------|
| **VaR 95%** | 風險值計算 | ✅ |
| **Barra 模型** | 多因子風險分解 | ✅ (新增) |
| **Brinson 歸因** | 績效歸因 | ✅ (新增) |
| **Greeks 監控** | 衍生品敏感度 | ✅ (新增) |

---

## 3. [Z] RAG 智能對話 (V10.0 強化)

### 3.1 對話介面結構

| 元件 | 用途 |
|------|------|
| 對話區域 | AI 對話介面 |
| 上下文面板 | RAG 引用來源顯示 |
| 知識庫搜尋 | 9GB 語義向量索引 |

---

## 4. [P] 衍生品 Greeks 監控 (V10.0 新增)

### 4.1 Greeks 曝險矩陣

| Greek | 符號 | 說明 | 風險等級 |
|-------|------|------|----------|
| **Delta** | Δ | 價格敏感度 | 低/中/高 |
| **Gamma** | Γ | Delta 變化率 | 低/中/高 |
| **Vega** | ν | 波動率敏感度 | 低/中/高 |
| **Theta** | Θ | 時間衰減 | 低/中/高 |
| **Rho** | ρ | 利率敏感度 | 低/中/高 |

---

## 6. 邏輯拆解 (Logic Breakdown)

### 6.1 [D] AI 投資策略建議生成流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    [D] AI 投資策略建議生成流程                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    策略輸入整合                                        │   │
│   │                                                                      │   │
│   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │   │
│   │   │   量化評分   │  │   籌碼分析   │  │   技術指標   │             │   │
│   │   │   18 維度    │  │   13F/大戶   │  │   訊號整合   │             │   │
│   │   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │   │
│   │          │                 │                 │                       │   │
│   │          └─────────────────┼─────────────────┘                       │   │
│   │                            │                                         │   │
│   │                            ▼                                         │   │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              信心度加權引擎                             │      │   │
│   │   │   Quant (40%) + Chip (25%) + Technical (25%) + AI (10%) │      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                            │                                         │   │
│   │                            ▼                                         │   │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              智能觸發燈號                               │      │   │
│   │   │   • STRONG_BUY: 信心 >= 8.5                           │      │   │
│   │   │   • BUY: 信心 7.0-8.4                                │      │   │
│   │   │   • NEUTRAL: 信心 5.0-6.9                            │      │   │
│   │   │   • WARNING: 信心 3.0-4.9                            │      │   │
│   │   │   • SELL: 信心 < 3.0                                  │      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                            │                                         │   │
│   │                            ▼                                         │   │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              多面相雷達圖                               │      │   │
│   │   │   • Quant Radar (18 維度)                              │      │   │
│   │   │   • Chip Radar (機構+大戶)                              │      │   │
│   │   │   • Technical Radar (MA/RSI/MACD/ADX)                  │      │   │
│   │   │   • AI Confidence Radar                                │      │   │
│   │   │   • Evolution Fitness Radar                             │      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 [O] 投資組合壓力測試流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    [O] 投資組合壓力測試流程                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    輸入配置                                           │   │
│   │                                                                      │   │
│   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │   │
│   │   │   持倉資料   │  │   歷史情境   │  │   情境參數   │             │   │
│   │   │   Portfolio │  │   Scenarios  │  │   Parameters │             │   │
│   │   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │   │
│   │          │                 │                 │                       │   │
│   │          └─────────────────┼─────────────────┘                       │   │
│   │                            │                                         │   │
│   │                            ▼                                         │   │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              VaR 計算引擎                               │      │   │
│   │   │   • Historical VaR                                    │      │   │
│   │   │   • Parametric VaR                                    │      │   │
│   │   │   • Monte Carlo VaR                                  │      │   │
│   │   │   • Expected Shortfall (CVaR)                        │      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                            │                                         │   │
│   │                            ▼                                         │   │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              壓力測試情境                               │      │   │
│   │   │   • 2008 金融海嘯 (Market -50%)                       │      │   │
│   │   │   • 2020 疫情崩盤 (Market -30%)                       │      │   │
│   │   │   • 2022 通膨危機 (Market -25%)                       │      │   │
│   │   │   • 自定義情境                                        │      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                            │                                         │   │
│   │                            ▼                                         │   │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              Barra 風險分解                            │      │   │
│   │   │   • Market Beta Risk                                  │      │   │
│   │   │   • Size Factor Risk                                  │      │   │
│   │   │   • Value Factor Risk                                 │      │   │
│   │   │   • Momentum Factor Risk                              │      │   │
│   │   │   • Idiosyncratic Risk                                │      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                            │                                         │   │
│   │                            ▼                                         │   │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              壓測結果報告                              │      │   │
│   │   │   • 最大損失估計                                       │      │   │
│   │   │   • 恢復時間估算                                       │      │   │
│   │   │   • 風險警訊等級                                       │      │   │
│   │   │   • 建議應對措施                                       │      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.3 [Z] RAG 智能對話流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    [Z] RAG 智能對話流程                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    使用者輸入                                         │   │
│   │   "分析 2330.TW 的投資機會與風險"                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    Intent Detection                                  │   │
│   │   • Investment Analysis                                            │   │
│   │   • Risk Assessment                                               │   │
│   │   • Strategy Recommendation                                        │   │
│   │   • Knowledge Query                                               │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    RAG Retrieval                                     │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │              向量搜尋 (pgvector)                           │  │   │
│   │   │   • 查詢嵌入 (Query Embedding)                            │  │   │
│   │   │   • 相似度檢索 (Top-K)                                    │  │   │
│   │   │   • 重排序 (Re-ranking)                                    │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                            │                                         │   │
│   │                            ▼                                         │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │              上下文組裝                                    │  │   │
│   │   │   • 相關文件片段                                          │  │   │
│   │   │   • 市場數據                                              │  │   │
│   │   │   • 使用者歷史                                            │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    LLM Generation                                   │   │
│   │   • Prompt Engineering                                            │   │
│   │   • Context Injection                                            │   │
│   │   • Response Generation                                           │   │
│   │   • Citation Generation                                          │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    回應輸出                                          │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │              對話區域顯示                                  │  │   │
│   │   │   • AI 回應                                               │  │   │
│   │   │   • 引用來源標註                                           │  │   │
│   │   │   • 資料新鮮度提示                                        │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.4 [P] 衍生品 Greeks 監控流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    [P] 衍生品 Greeks 監控流程                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    持倉資料                                           │   │
│   │   • 選擇權持倉 (Options)                                             │   │
│   │   • 期貨持倉 (Futures)                                              │   │
│   │   • 可轉換債券 (Convertibles)                                        │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    Greeks 計算引擎                                   │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   Delta (Δ) = ∂V/∂S 價格敏感度                              │  │   │
│   │   │   • 對沖比例計算                                             │  │   │
│   │   │   • 方向性曝險                                               │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   Gamma (Γ) = ∂²V/∂S² Delta 變化率                         │  │   │
│   │   │   • 非線性曝險                                               │  │   │
│   │   │   • Gamma Scalping 策略                                     │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   Vega (ν) = ∂V/∂σ 波動率敏感度                           │  │   │
│   │   │   • 波動率風險                                               │  │   │
│   │   │   • Vega 中性策略                                           │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   Theta (Θ) = -∂V/∂t 時間衰減                             │  │   │
│   │   │   • 時間價值損耗                                             │  │   │
│   │   │   • Theta 收割策略                                          │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   Rho (ρ) = ∂V/∂r 利率敏感度                              │  │   │
│   │   │   • 利率風險                                                 │  │   │
│   │   │   • 長期選擇權重要                                           │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    曝險矩陣顯示                                      │   │
│   │   • Delta 曝險矩陣 (按標的)                                        │   │
│   │   • Gamma 曝險矩陣 (按到期日)                                      │   │
│   │   • Vega 曝險矩陣 (按波動率)                                       │   │
│   │   • 風險警示閾值                                                   │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. 邊界條件定義 (Edge Cases)

### 7.1 [D] AI 策略建議邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-D01** | 多面向評分衝突 (> 30%) | 顯示評分差異警告 | 不隱藏分歧 |
| **EC-D02** | 信心評分計算失敗 | 返回 "Calculation Error" | 標記需人工審核 |
| **EC-D03** | 演化策略未初始化 | 演化策略面板灰色 | 提示 "GA Not Ready" |
| **EC-D04** | 個股數據極度異常 | 排除該維度評分 | 標記 "Data Anomaly" |
| **EC-D05** | 燈號建議與 AI 建議衝突 | 顯示原因說明 | 不覆蓋任一方 |
| **EC-D06** | 使用過期數據 (> 7 天) | 標記 "Stale Data" | 提示刷新 |

### 7.2 [O] 壓力測試邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-D07** | VaR 計算樣本不足 (< 252 日) | 降低 VaR 置信度 | 標記 "Limited History" |
| **EC-D08** | 持倉過度集中 (> 30% 單一標的) | 觸發集中度警告 | 顯示集中度風險 |
| **EC-D09** | 壓測損失 > 組合 50% | 紅色警戒 | 建議減倉 |
| **EC-D10** | Barra 矩陣奇異 | 使用簡化模型 | 標記 "Model Simplified" |
| **EC-D11** | 模擬超時 (> 120 秒) | 返回部分結果 | 提示 "Partial Results" |
| **EC-D12** | 歷史情境不可用 | 使用 Monte Carlo | 標記 "MC Simulation" |

### 7.3 [Z] RAG 對話邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-D13** | 查詢無相關結果 | 返回 "No Relevant Data" | 建議重新表述 |
| **EC-D14** | 引用來源過期 (> 1 年) | 標記 "Outdated Source" | 提供最新資訊連結 |
| **EC-D15** | 使用者查詢涉及法律建議 | 顯示免責聲明 | 不提供具體建議 |
| **EC-D16** | 對話上下文過長 (> 50 輪) | 摘要早期對話 | 保留最近 30 輪 |
| **EC-D17** | LLM 生成幻覺內容 | 引用驗證失敗 | 重新生成 |
| **EC-D18** | 查詢涉及多個衝突來源 | 顯示多方觀點 | 不做單一判斷 |

### 7.4 [P] Greeks 監控邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-D19** | Greeks 數據延遲 (> 15 分鐘) | 顯示延遲警告 | 標記 "Delayed Data" |
| **EC-D20** | Delta 中性偏離 > 5% | 觸發對沖提醒 | 建議 Rebalance |
| **EC-D21** | Gamma 曝險過高 | 紅色警示 | 建議降低倉位 |
| **EC-D22** | Vega 集中度過高 (> 40%) | 警告波動率風險 | 建議分散 |
| **EC-D23** | Theta 負值過大 | 時間衰減警告 | 建議收割或減倉 |
| **EC-D24** | 選擇權到期日臨近 (< 7 天) | 到期提醒 | 提示平倉或展期 |

---

## 8. Schema 完整化

### 8.1 AI 策略建議資料表 `ai_strategy_recommendations`

```sql
-- ============================================================================
-- AI 策略建議資料表
-- 用途：存儲 AI 生成的投資策略建議
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_strategy_recommendations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol              VARCHAR(20),                         -- 標的代碼 (可為 NULL 表示整體策略)
    recommendation_date DATE NOT NULL,                        -- 建議日期
    
    -- 燈號與評分
    signal_light        VARCHAR(20) NOT NULL,                -- STRONG_BUY/BUY/NEUTRAL/WARNING/SELL
    confidence_score   DECIMAL(5,2) NOT NULL,               -- 信心評分 1-10
    
    -- 評分組成
    quant_score        DECIMAL(5,2),                       -- 量化評分 (40%)
    chip_score         DECIMAL(5,2),                       -- 籌碼評分 (25%)
    technical_score   DECIMAL(5,2),                       -- 技術評分 (25%)
    ai_confidence_score DECIMAL(5,2),                      -- AI 信心度 (10%)
    
    -- 多面向雷達
    radar_data         JSONB NOT NULL,                       -- 雷達圖數據
    
    -- 建議詳情
    summary            TEXT NOT NULL,                       -- 策略摘要
    rationale          TEXT,                                 -- 建議理由
    risk_factors       TEXT[],                               -- 風險因素
    opportunities      TEXT[],                               -- 機會因素
    
    -- 交易建議
    action             VARCHAR(20),                          -- BUY/SELL/HOLD
    position_size      DECIMAL(8,4),                       -- 建議部位比例
    target_price       DECIMAL(18,4),                      -- 目標價
    stop_loss_price    DECIMAL(18,4),                      -- 停損價
    take_profit_price DECIMAL(18,4),                      -- 停利價
    
    -- 演化策略關聯
    genome_id           UUID,                                -- 關聯基因組 ID
    genome_fitness     DECIMAL(10,6),                      -- 基因組適應度
    
    -- 版本控制
    version            INTEGER DEFAULT 1,                    -- 版本號
    is_latest          BOOLEAN DEFAULT TRUE,                -- 是否最新
    
    -- 審核狀態
    requires_review    BOOLEAN DEFAULT FALSE,                -- 需要人工審核
    reviewed_by       UUID,                                 -- 審核人
    reviewed_at       TIMESTAMP WITH TIME ZONE,             -- 審核時間
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT asr_date_uniq UNIQUE (symbol, recommendation_date, is_latest)
);

-- ============================================================================
-- Greeks 曝險資料表
-- ============================================================================

CREATE TABLE IF NOT EXISTS greeks_exposure (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id        UUID NOT NULL,                       -- 投資組合 ID
    calc_date           DATE NOT NULL,                        -- 計算日期
    
    -- 總曝險
    total_delta         DECIMAL(24,6) NOT NULL,             -- Delta 總曝險
    total_gamma         DECIMAL(24,6) NOT NULL,             -- Gamma 總曝險
    total_vega          DECIMAL(24,6) NOT NULL,              -- Vega 總曝險
    total_theta         DECIMAL(24,6) NOT NULL,              -- Theta 總曝險
    total_rho           DECIMAL(24,6) NOT NULL,              -- Rho 總曝險
    
    -- Delta 中性度
    delta_neutral_deviation DECIMAL(10,4),                   -- Delta 偏離 %
    delta_status        VARCHAR(20),                         -- Neutral/Long/Short
    
    -- 曝險矩陣 (按標的)
    exposure_by_underlying JSONB,                            -- 按標的分類
    
    -- 曝險矩陣 (按到期日)
    exposure_by_expiry JSONB,                               -- 按到期日分類
    
    -- 風險閾值
    delta_threshold    DECIMAL(10,4) DEFAULT 0.05,          -- Delta 閾值
    gamma_threshold    DECIMAL(10,4) DEFAULT 0.1,          -- Gamma 閾值
    vega_threshold     DECIMAL(10,4) DEFAULT 0.1,          -- Vega 閾值
    
    -- 警示狀態
    alert_status       VARCHAR(20) DEFAULT 'normal',        -- normal/warning/critical
    alert_message      TEXT,                                -- 警示訊息
    
    -- 對沖建議
    hedging_suggestion TEXT,                                 -- 對沖建議
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT ge_date_uniq UNIQUE (portfolio_id, calc_date)
);

-- COMMENT 註解
COMMENT ON TABLE ai_strategy_recommendations IS 'AI 策略建議表 - 燈號、評分與交易建議';
COMMENT ON TABLE greeks_exposure IS 'Greeks 曝險表 - 衍生品敏感度監控';
COMMENT ON COLUMN ai_strategy_recommendations.signal_light IS '訊號燈號: STRONG_BUY/BUY/NEUTRAL/WARNING/SELL';
COMMENT ON COLUMN ai_strategy_recommendations.confidence_score IS '信心評分 1-10，10 為最高';
```

### 8.2 壓力測試結果資料表 `stress_test_results`

```sql
-- ============================================================================
-- 壓力測試結果資料表
-- 用途：存儲投資組合壓力測試結果
-- ============================================================================

CREATE TABLE IF NOT EXISTS stress_test_results (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id        UUID NOT NULL,                       -- 投資組合 ID
    test_date           DATE NOT NULL,                        -- 測試日期
    
    -- 測試配置
    scenario_name       VARCHAR(100) NOT NULL,               -- 情境名稱
    scenario_type       VARCHAR(50) NOT NULL,                -- historical/custom/monte_carlo
    
    -- 測試參數
    market_shock       DECIMAL(8,4) NOT NULL,               -- 市場衝擊 %
    sector_shocks      JSONB,                                -- 產業衝擊 JSON
    correlation_regime VARCHAR(20),                         -- 相關係數 Regime
    
    -- 測試結果
    portfolio_loss      DECIMAL(24,2) NOT NULL,             -- 組合損失金額
    portfolio_loss_pct  DECIMAL(10,4) NOT NULL,             -- 組合損失 %
    max_drawdown       DECIMAL(10,4) NOT NULL,             -- 最大回撤
    
    -- VaR 結果
    var_95             DECIMAL(24,2),                       -- 95% VaR
    var_99             DECIMAL(24,2),                       -- 99% VaR
    cvar_95            DECIMAL(24,2),                       -- 95% CVaR
    
    -- Barra 風險分解
    market_risk        DECIMAL(24,2),                       -- 市場風險
    size_risk          DECIMAL(24,2),                       -- 規模風險
    value_risk         DECIMAL(24,2),                       -- 價值風險
    momentum_risk      DECIMAL(24,2),                       -- 動能風險
    idiosyncratic_risk DECIMAL(24,2),                       -- 特異風險
    
    -- 恢復分析
    recovery_days_est  INTEGER,                              -- 預估恢復天數
    recovery_probability DECIMAL(8,4),                      -- 恢復機率
    
    -- 風險評估
    risk_level         VARCHAR(20) NOT NULL,                -- low/medium/high/critical
    risk_score         INTEGER CHECK (risk_score BETWEEN 1 AND 100), -- 風險分數
    
    -- 建議措施
    recommendations    TEXT[],                               -- 建議措施
    hedging_suggestions TEXT,                               -- 對沖建議
    
    -- 版本控制
    version            INTEGER DEFAULT 1,                    -- 版本號
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT str_uniq UNIQUE (portfolio_id, test_date, scenario_name)
);

-- ============================================================================
-- 壓力測試情境定義表
-- ============================================================================

CREATE TABLE IF NOT EXISTS stress_test_scenarios (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_name       VARCHAR(100) NOT NULL UNIQUE,
    scenario_type       VARCHAR(50) NOT NULL,                -- historical/custom/systematic
    
    -- 情境描述
    description         TEXT,                                 -- 情境描述
    historical_period   VARCHAR(50),                         -- 歷史期間 (如: 2008-Q4)
    
    -- 市場參數
    market_shock       DECIMAL(8,4) NOT NULL,               -- 市場跌幅 %
    volatility_shock   DECIMAL(8,4),                        -- 波動率變化 %
    
    -- 產業參數
    sector_shocks      JSONB NOT NULL,                      -- 產業衝擊 %
    
    -- 相關係數
    correlation_regime VARCHAR(20),                         -- normal/stressed
    
    -- 狀態控制
    is_active          BOOLEAN DEFAULT TRUE,                 -- 是否啟用
    is_system          BOOLEAN DEFAULT FALSE,                -- 是否系統內建
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- COMMENT 註解
COMMENT ON TABLE stress_test_results IS '壓力測試結果表 - VaR/Barra/情境模擬';
COMMENT ON TABLE stress_test_scenarios IS '壓力測試情境定義表';
COMMENT ON COLUMN stress_test_results.risk_level IS '風險等級: low/medium/high/critical';
COMMENT ON COLUMN stress_test_scenarios.sector_shocks IS 'JSON: {"半導體": -0.55, "金融": -0.60, ...}';
```

### 8.3 RAG 對話資料表 `rag_conversations`

```sql
-- ============================================================================
-- RAG 對話資料表
-- 用途：存儲 RAG 智能對話記錄
-- ============================================================================

CREATE TABLE IF NOT EXISTS rag_conversations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES auth.users(id),
    
    -- 對話元數據
    title               VARCHAR(500),                        -- 對話標題
    first_message       TEXT,                                -- 首則訊息
    message_count       INTEGER DEFAULT 0,                  -- 訊息數量
    
    -- 狀態
    status              VARCHAR(20) DEFAULT 'active',       -- active/archived/deleted
    
    -- Token 使用
    total_tokens_used   INTEGER DEFAULT 0,                  -- 總使用 Token
    prompt_tokens       INTEGER DEFAULT 0,                  -- Prompt Token
    completion_tokens   INTEGER DEFAULT 0,                 -- Completion Token
    
    -- 最後活動
    last_message_at     TIMESTAMP WITH TIME ZONE,          -- 最後訊息時間
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- RAG 對話訊息資料表
-- ============================================================================

CREATE TABLE IF NOT EXISTS rag_messages (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id    UUID NOT NULL REFERENCES rag_conversations(id),
    
    -- 訊息內容
    role                VARCHAR(20) NOT NULL,                -- user/assistant/system
    content             TEXT NOT NULL,                       -- 訊息內容
    
    -- 意圖分類
    intent_category    VARCHAR(100),                       -- 意圖類別
    entities           JSONB,                               -- 識別的實體
    
    -- RAG 引用
    retrieved_docs      JSONB,                              -- 檢索的文件
    citations           JSONB,                               -- 引用來源
    
    -- LLM 使用
    model_used          VARCHAR(50),                        -- 使用的模型
    tokens_used        INTEGER,                             -- 使用 Token
    processing_time_ms  INTEGER,                             -- 處理時間
    
    -- 評價
    user_rating        INTEGER CHECK (user_rating BETWEEN 1 AND 5), -- 用戶評分
    user_feedback      TEXT,                                -- 用戶回饋
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT rm_conversation_order UNIQUE (conversation_id, created_at)
);

-- ============================================================================
-- 知識庫索引追蹤表
-- ============================================================================

CREATE TABLE IF NOT EXISTS knowledge_base_stats (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 索引統計
    total_documents     INTEGER DEFAULT 0,                  -- 總文件數
    total_chunks        INTEGER DEFAULT 0,                  -- 總 Chunk 數
    index_size_bytes   BIGINT DEFAULT 0,                   -- 索引大小
    
    -- 向量統計
    embedding_model     VARCHAR(100),                       -- 嵌入模型
    vector_dimension    INTEGER,                            -- 向量維度
    index_type          VARCHAR(50),                        -- 索引類型 (IVF/HNSW)
    
    -- 更新追蹤
    last_index_update   TIMESTAMP WITH TIME ZONE,          -- 最後索引更新
    documents_added     INTEGER DEFAULT 0,                  -- 本次新增文件
    documents_removed   INTEGER DEFAULT 0,                  -- 本次移除文件
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- COMMENT 註解
COMMENT ON TABLE rag_conversations IS 'RAG 對話表 - 智能對話會話';
COMMENT ON TABLE rag_messages IS 'RAG 對話訊息表 - 每則訊息與引用';
COMMENT ON TABLE knowledge_base_stats IS '知識庫統計表 - 追蹤索引狀態';
COMMENT ON COLUMN rag_messages.intent_category IS '意圖類別: investment_analysis/risk_assessment/strategy_recommendation/knowledge_query';
```

---

## 9. 硬體/環境關聯 (QNAP TS-h973AX)

### 9.1 資源需求對照表

| 模組 | CPU | RAM | Storage | 配置重點 |
|------|-----|-----|---------|----------|
| **[D] AI 策略** | 8 核心 | 16 GB | SSD 100 GB | LLM API, 評分計算 |
| **[O] 壓力測試** | 16 核心 | 32 GB | NVMe 200 GB | Monte Carlo |
| **[Z] RAG 對話** | 4 核心 | 16 GB | SSD 50 GB | pgvector 查詢 |
| **[P] Greeks** | 4 核心 | 8 GB | SSD 30 GB | 即時計算 |

### 9.2 pgvector 配置

```sql
-- ============================================================================
-- pgvector 索引配置
-- ============================================================================

-- 建立向量擴展
CREATE EXTENSION IF NOT EXISTS vector;

-- 建立知識庫向量表
CREATE TABLE knowledge_vectors (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chunk_id            VARCHAR(100) UNIQUE,                -- 文件塊 ID
    content             TEXT NOT NULL,                      -- 文本內容
    embedding           VECTOR(1536),                       -- OpenAI Ada-002 維度
    metadata            JSONB,                              -- 元數據
    source_type         VARCHAR(50),                        -- 來源類型
    source_id           VARCHAR(100),                       -- 來源 ID
    created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立 HNSW 索引 (高效能向量索引)
CREATE INDEX ON knowledge_vectors USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 建立 IVFFlat 索引 (替代方案)
-- CREATE INDEX ON knowledge_vectors USING ivfflat (embedding vector_cosine_ops)
-- WITH (lists = 100);

-- 查詢範例：檢索最相似文件
SELECT id, content, 1 - (embedding <=> query_embedding) AS similarity
FROM knowledge_vectors
ORDER BY embedding <=> query_embedding
LIMIT 5;
```

### 9.3 ZFS 儲存配置

```bash
#!/bin/bash
# ============================================================================
# 決策模組 ZFS 配置
# ============================================================================

# 創建策略建議 Dataset
zfs create quant_pool/strategy
zfs set compression=zstd quant_pool/strategy
zfs set atime=off quant_pool/strategy
zfs set quota=100G quant_pool/strategy

# 創建壓力測試 Dataset
zfs create quant_pool/stress_test
zfs set compression=lz4 quant_pool/stress_test
zfs set quota=200G quant_pool/stress_test

# 創建 RAG 對話 Dataset
zfs create quant_pool/rag
zfs set compression=zstd quant_pool/rag
zfs set atime=off quant_pool/rag
zfs set quota=50G quant_pool/rag
```

---

## 10. 開發者備註 (Developer Notes)

### ⚠️ 技術陷阱警示

#### TT-D01: VaR 計算記憶體爆炸
```python
# 問題：Monte Carlo VaR 模擬樣本過大導致 OOM
# 
# 解決方案：
# 1. 使用分塊模擬
# 2. 實施 Importance Sampling
# 3. 使用 Historical VaR 作為替代

class VaRCalculator:
    def monte_carlo_var(
        self,
        returns: np.ndarray,
        portfolio_value: float,
        confidence: float = 0.95,
        n_simulations: int = 10000
    ) -> float:
        # 分塊模擬避免 OOM
        block_size = 1000
        n_blocks = n_simulations // block_size
        
        all_losses = []
        for _ in range(n_blocks):
            # 生成隨機報酬
            simulated_returns = np.random.choice(
                returns,
                size=(block_size, len(returns)),
                replace=True
            )
            
            # 計算組合損失
            portfolio_returns = simulated_returns @ self.weights
            losses = -portfolio_returns * portfolio_value
            all_losses.extend(losses)
        
        # 排序計算 VaR
        var_index = int((1 - confidence) * len(all_losses))
        return sorted(all_losses)[var_index]
```

#### TT-D02: Greeks 數值穩定性
```python
# 問題：選擇權 Greeks 計算在高 Theta 時不穩定
# 
# 解決方案：
# 1. 使用解析解而非數值微分
# 2. 實施數值穩定性檢查
# 3. 使用自動微分庫

from scipy.stats import norm

class BlackScholesGreeks:
    @staticmethod
    def delta(S: float, K: float, T: float, r: float, sigma: float, option_type: str) -> float:
        """解析解 Delta"""
        d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
        if option_type == 'call':
            return norm.cdf(d1)
        else:
            return norm.cdf(d1) - 1
    
    @staticmethod
    def gamma(S: float, K: float, T: float, r: float, sigma: float) -> float:
        """解析解 Gamma"""
        d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
        return norm.pdf(d1) / (S * sigma * np.sqrt(T))
```

#### TT-D03: RAG 幻覺檢測
```python
# 問題：LLM 生成內容可能包含幻覺
# 
# 解決方案：
# 1. 實施引用驗證
# 2. 使用事實檢查模型
# 3. 標記不确定性

class RAGHallucinationDetector:
    def __init__(self):
        self.claim_extractor = ClaimExtractor()
        self.fact_checker = FactChecker()
    
    def detect_hallucinations(self, response: str, citations: List[Citation]) -> List[Hallucination]:
        # 提取聲明
        claims = self.claim_extractor.extract(response)
        
        # 事實檢查
        hallucinations = []
        for claim in claims:
            if not self.fact_checker.verify(claim, citations):
                hallucinations.append(Hallucination(
                    claim=claim,
                    confidence=0.9,
                    suggestion="This claim cannot be verified from the sources"
                ))
        
        return hallucinations
```

### 📝 開發建議

#### DEV-D01: 策略建議版本控制
```python
# 建議：實施策略建議的版本控制
# 
# 版本策略：
# 1. 每次建議生成新版本
# 2. 保留歷史建議
# 3. 追蹤評估結果

class StrategyVersionManager:
    def create_version(self, recommendation: StrategyRecommendation) -> StrategyVersion:
        # 計算與上一版本差異
        previous = self.get_latest_version(recommendation.symbol)
        
        version = {
            'version_number': previous.version + 1 if previous else 1,
            'recommendation': recommendation,
            'changes': self.calculate_changes(previous, recommendation),
            'created_at': datetime.utcnow()
        }
        
        # 標記上一版本為非最新
        if previous:
            previous.is_latest = False
        
        return self.save(version)
```

#### DEV-D02: 壓測情境管理
```python
# 建議：實現壓力測試情境的動態管理
# 
# 管理功能：
# 1. 情境 CRUD
# 2. 情境驗證
# 3. 敏感性分析

class StressScenarioManager:
    def validate_scenario(self, scenario: StressScenario) -> ValidationResult:
        errors = []
        
        # 驗證市場衝擊範圍
        if not -1.0 <= scenario.market_shock <= 0:
            errors.append("Market shock must be between -100% and 0%")
        
        # 驗證產業衝擊總和
        sector_impact_sum = sum(scenario.sector_shocks.values())
        if abs(sector_impact_sum - scenario.market_shock) > 0.01:
            errors.append("Sector shocks must sum to market shock")
        
        return ValidationResult(errors=errors)
```

#### DEV-D03: RAG 效能優化
```python
# 建議：實施 RAG 查詢效能優化
# 
# 優化策略：
# 1. 查詢快取
# 2. 結果快取
# 3. 漸進式載入

class RAGQueryOptimizer:
    def __init__(self):
        self.query_cache = TTLCache(maxsize=1000, ttl=3600)
        self.result_cache = TTLCache(maxsize=1000, ttl=3600)
    
    async def query_with_cache(self, query: str) -> RAGResult:
        # 查詢快取
        query_hash = self.hash_query(query)
        
        if query_hash in self.result_cache:
            return self.result_cache[query_hash]
        
        # 執行查詢
        result = await self.rag_engine.query(query)
        
        # 存入快取
        self.result_cache[query_hash] = result
        
        return result
```

#### DEV-D04: Greeks 閾值動態調整
```python
# 建議：實現 Greeks 警示閾值的動態調整
# 
# 動態調整策略：
# 1. 根據市場波動率調整
# 2. 根據持倉規模調整
# 3. 根據歷史命中率調整

class DynamicGreeksThresholds:
    def calculate_thresholds(
        self,
        portfolio_value: float,
        current_volatility: float,
        historical_alerts: List[Alert]
    ) -> GreeksThresholds:
        # 基礎閾值
        base_delta_threshold = 0.05
        base_gamma_threshold = 0.10
        base_vega_threshold = 0.10
        
        # 根據波動率調整
        vol_multiplier = current_volatility / 0.20  # 假設正常波動率 20%
        
        # 根據持倉規模調整
        size_multiplier = min(portfolio_value / 10000000, 2.0)  # 最大 2x
        
        return GreeksThresholds(
            delta=base_delta_threshold * vol_multiplier * size_multiplier,
            gamma=base_gamma_threshold * vol_multiplier,
            vega=base_vega_threshold * vol_multiplier
        )
```

---

## 11. 關聯文件索引

| 文件 | 說明 | 交互關係 |
|------|------|----------|
| [00_Full_Reconstruction_TOC.md](00_Full_Reconstruction_TOC.md) | 完整檔案結構索引 | L3 模組位置 |
| [01_Vision_and_Philosophy.md](01_Vision_and_Philosophy.md) | 願景與哲學 | 演化策略整合 |
| [05_Quant_Theory_and_Calculations.md](05_Quant_Theory_and_Calculations.md) | 量化理論 | Barra/Brinson 模型 |
| [10_Core_Module_Level_4_Growth.md](10_Core_Module_Level_4_Growth.md) | 行為金融 | 交易行為追蹤 |
| [11_Decision_Templates_Spec.md](11_Decision_Templates_Spec.md) | 決策模板 | AI Prompt 模板 |

---

> **文件版本**：v1.0.1 (細節顯性化擴張)
> **關聯文件**：[00_Full_Reconstruction_TOC](00_Full_Reconstruction_TOC.md)
> **維護責任**：系統架構師 / 量化工程師
> **最後更新**：2026-02-10

