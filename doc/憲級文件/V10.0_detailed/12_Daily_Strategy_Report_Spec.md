# 12. 每日戰略投資報告生成規格 (Daily Report Spec)

> **文件版本**：v1.0 (V10.0 完整規格書重構)
> **日期**：2026-02-10
> **核心使命：** 定義 8-Part 每日 House View 報告結構，涵蓋 V10.0 130+ 宏觀指標整合與演化策略輸出

---

## 1. 報告八大核心部分 (V10.0 強化)

| Part | 區塊名稱 | V10.0 強化內容 |
|------|----------|----------------|
| **1** | 核心觀點 (One-liner) | 僅限一句話，定義今日市場定調 |
| **2** | 市場情緒儀表板 | 判定：極度恐慌 / 恐慌 / 中性 / 樂觀 / 極度貪婪 |
| **3** | 宏觀環境定錨 | 根據 130+ FRED 指標、EPI、VIX 判定景氣位置 |
| **4** | 建議持倉水位 | 百分比建議 + 演化策略權重配置 |
| **5** | 戰術行動建議 | 列出 3 個具體動作 (含 18 維度評分) |
| **6** | 昨日觀點覆盤 | 比對昨日預測與今日市場表現 |
| **7** | 風險預警清單 | 掃描黑天鵝因子 + Barra 風險預警 |
| **8** | 下週展望 | 基於當前斜率預測 + 演化策略推演 |

---

## 2. V10.0 報告生成流程

```python
# V10.0 每日報告生成流程 (定義)

def generate_daily_report_v10() -> DailyReportV10:
    """生成 V10.0 每日戰略報告"""
    
    # 步驟 1: 抓取 130+ 宏觀指標
    macro = fetch_macro_indicators_v10()  # 130+ 指標
    
    # 步驟 2: 計算市場情緒
    sentiment = calculate_market_sentiment()
    
    # 步驟 3: 取得 18 維度因子熱力圖
    factors = get_18factor_heatmap()
    
    # 步驟 4: 取得 PTT/社群情緒
    ptt = get_sentiment_ptt()
    
    # 步驟 5: 執行演化策略更新
    evolution = run_evolution_step()
    
    # 步驟 6: 生成 House View 報告
    report = call_debate_system(macro, sentiment, factors, ptt, evolution)
    
    return report
```

---

## 4. 邏輯拆解 (Logic Breakdown)

### 4.1 每日報告生成流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    每日戰略投資報告生成流程                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    T-1 日數據準備 (前一日 21:00)                     │   │
│   │                                                                      │   │
│   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │   │
│   │   │   宏觀數據   │  │   市場數據   │  │   因子數據   │             │   │
│   │   │   130+ 指標 │  │   OHLCV     │  │   18 維度    │             │   │
│   │   │   FRED/EPI  │  │   成交量    │  │   評分      │             │   │
│   │   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │   │
│   │          │                 │                 │                       │   │
│   │          └─────────────────┼─────────────────┘                       │   │
│   │                            │                                         │   │
│   │                            ▼                                         │   │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              數據驗證與清理                              │      │   │
│   │   │   • 完整性檢查                                          │      │   │
│   │   │   • 異常值處理                                          │      │   │
│   │   │   • 時間戳對齊                                          │      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼ (T 日 09:00)                       │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    T 日報告生成流程                                   │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              Part 1: 核心觀點生成                       │      │   │
│   │   │   • 分析宏觀與市場                                      │      │   │
│   │   │   • 生成一句话摘要                                     │      │   │
│   │   │   • 定義今日市場定調                                    │      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                              │                                     │
│   │                              ▼                                     │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              Part 2: 市場情緒儀表板                     │      │   │
│   │   │   • 計算情緒分數 (0-100)                              │      │   │
│   │   │   • 判定情緒狀態                                        │      │   │
│   │   │   • 極度恐慌 / 恐慌 / 中性 / 樂觀 / 極度貪婪          │      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                              │                                     │
│   │                              ▼                                     │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              Part 3: 宏觀環境定錨                       │      │   │
│   │   │   • 分析 130+ 指標                                      │      │   │
│   │   │   • 判定景氣位置                                        │      │   │
│   │   │   • Early/Mid/Late Cycle                                │      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                              │                                     │
│   │                              ▼                                     │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              Part 4: 建議持倉水位                       │      │   │
│   │   │   • 計算建議倉位                                        │      │   │
│   │   │   • 整合演化策略權重                                    │      │   │
│   │   │   • 股/債/另類 配置比例                                 │      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                              │                                     │
│   │                              ▼                                     │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              Part 5: 戰術行動建議                       │      │   │
│   │   │   • 生成 3 個具體動作                                   │      │   │
│   │   │   • 每個動作含 18 維度評分                              │      │   │
│   │   │   • 設定優先順序                                        │      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                              │                                     │
│   │                              ▼                                     │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              Part 6: 昨日觀點覆盤                       │      │   │
│   │   │   • 比對昨日預測                                        │      │   │
│   │   │   • 評估預測準確度                                      │      │   │
│   │   │   • 學習與改進                                          │      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                              │                                     │
│   │                              ▼                                     │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              Part 7: 風險預警清單                       │      │   │
│   │   │   • 掃描黑天鵝因子                                      │      │   │
│   │   │   • Barra 風險預警                                      │      │   │
│   │   │   • 流動性風險                                          │      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                              │                                     │
│   │                              ▼                                     │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              Part 8: 下週展望                           │      │   │
│   │   │   • 基於當前斜率預測                                    │      │   │
│   │   │   • 演化策略推演                                        │      │   │
│   │   │   • 不確定性說明                                        │      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼ (T 日 10:00)                       │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    報告發布流程                                       │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              格式轉換                                    │      │   │
│   │   │   • Markdown → HTML                                     │      │   │
│   │   │   • Markdown → PDF                                     │      │   │
│   │   │   • Markdown → Telegram                                 │      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                              │                                     │
│   │                              ▼                                     │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              多管道發布                                  │      │   │
│   │   │   • Telegram 群組                                       │      │   │
│   │   │   • Email 訂閱                                          │      │   │
│   │   │   • Web Dashboard                                      │      │   │
│   │   │   • LINE Notify                                        │      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 市場情緒判定流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    市場情緒判定流程                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    情緒指標輸入                                       │   │
│   │                                                                      │   │
│   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │   │
│   │   │   VIX 指數   │  │   PTT 情緒   │  │   融資斷頭  │             │   │
│   │   │   VIX < 15  │  │   PTT Bull % │  │   Margin    │             │   │
│   │   │   → 樂觀    │  │   > 60%     │  │   Call %   │             │   │
│   │   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │   │
│   │          │                 │                 │                       │   │
│   │          └─────────────────┼─────────────────┘                       │   │
│   │                            │                                         │   │
│   │                            ▼                                         │   │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              情緒分數計算 (0-100)                       │      │   │
│   │   │                                                            │      │   │
│   │   │   Sentiment_Score =                                       │      │   │
│   │   │   0.30 × VIX_Normalized +                                │      │   │
│   │   │   0.30 × PTT_Sentiment +                                  │      │   │
│   │   │   0.20 × Market_Technical +                              │      │   │
│   │   │   0.20 × Institutional_Flow                              │      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                            │                                         │   │
│   │                            ▼                                         │   │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              情緒狀態判定                              │      │   │
│   │   │                                                            │      │   │
│   │   │   ┌─────────────────────────────────────────────────┐  │      │   │
│   │   │   │   Score >= 80: 極度貪婪 (Extreme Greed)       │  │      │   │
│   │   │   │   Score 60-79: 樂觀 (Greed)                   │  │      │   │
│   │   │   │   Score 40-59: 中性 (Neutral)                 │  │      │   │
│   │   │   │   Score 20-39: 恐慌 (Fear)                     │  │      │   │
│   │   │   │   Score < 20: 極度恐慌 (Extreme Fear)          │  │      │   │
│   │   │   └─────────────────────────────────────────────────┘  │      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                            │                                         │   │
│   │                            ▼                                         │   │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              行動建議生成                              │      │   │
│   │   │                                                            │      │   │
│   │   │   • 極度貪婪: 建議減倉、謹慎入場                        │      │   │
│   │   │   • 樂觀: 適度增持、關注回調                            │      │   │
│   │   │   • 中性: 維持配置、觀望為主                            │      │   │
│   │   │   • 恐慌: 尋找買點、分批建倉                            │      │   │
│   │   │   • 極度恐慌: 積極佈局、長期視角                        │      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. 邊界條件定義 (Edge Cases)

### 5.1 報告生成邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-R01** | 數據源全部不可用 | 報告生成失敗 | 延後至數據可用 |
| **EC-R02** | 宏觀指標缺少 > 30% | 報告部分生成 | 標記 "Partial Data" |
| **EC-R03** | 情緒計算樣本不足 | 返回中性預設 | 標記 "Low Sample" |
| **EC-R04** | 演化策略未初始化 | 使用預設權重 | 標記 "Default Weights" |
| **EC-R05** | 報告生成超時 (> 5 分鐘) | 返回部分報告 | 標記 "Incomplete" |
| **EC-R06** | 今日為假日 | 不生成報告 | 跳過當日 |

### 5.2 數據驗證邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-R07** | OHLCV 數據缺少收盤價 | 使用最後價格 | 標記 "Filled" |
| **EC-R08** | 宏觀數據為負值 | 驗證異常 | 檢查數據源 |
| **EC-R09** | 因子評分超出 (-3, 3) | 邊界裁剪 | np.clip() |
| **EC-R10** | 殖利率曲線倒掛 | 標記事件 | 特別關注 |
| **EC-R11** | VIX 異常飆升 (> 50) | 觸發緊急警報 | 通知用戶 |
| **EC-R12** | PTT 伺服器無回應 | 使用備用源 | 標記 "Alt Source" |

### 5.3 發布邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-R13** | Telegram 發送失敗 | 重試 3 次 | Email 備用 |
| **EC-R14** | PDF 轉換超時 | 生成 HTML | 標記 "HTML Only" |
| **EC-R15** | Email 發送失敗 | 存入草稿箱 | 標記 "Failed" |
| **EC-R16** | 報告內容包含敏感詞 | 自動過濾 | 標記 "Filtered" |
| **EC-R17** | 用戶偏好未設定 | 使用預設格式 | 標記 "Default" |
| **EC-R18** | 報告 URL 過期 | 重新生成 URL | 更新連結 |

---

## 6. Schema 完整化

### 6.1 每日報告資料表 `daily_reports`

```sql
-- ============================================================================
-- 每日戰略投資報告資料表
-- 用途：存儲每日生成的報告
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_reports (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_date         DATE NOT NULL UNIQUE,             -- 報告日期
    
    -- Part 1: 核心觀點
    one_liner           VARCHAR(500) NOT NULL,            -- 一句話摘要
    market_tone         VARCHAR(50) NOT NULL,             -- 市場定調
    
    -- Part 2: 市場情緒
    sentiment_score     DECIMAL(8,4) NOT NULL,           -- 情緒分數 0-100
    sentiment_status    VARCHAR(50) NOT NULL,             -- 極度恐慌/恐慌/中性/樂觀/極度貪婪
    sentiment_factors   JSONB,                            -- 情緒因素
    
    -- Part 3: 宏觀環境
    macro_regime        VARCHAR(50) NOT NULL,             -- Early/Mid/Late Cycle
    macro_indicators    JSONB,                            -- 宏觀指標摘要
    gdp_growth          DECIMAL(8,4),                     -- GDP 成長率
    inflation_rate      DECIMAL(8,4),                     -- 通膨率
    unemployment_rate   DECIMAL(8,4),                    -- 失業率
    
    -- Part 4: 持倉建議
    recommended_allocation JSONB NOT NULL,               -- 建議配置
    stock_allocation    DECIMAL(8,4),                    -- 股票 %
    bond_allocation     DECIMAL(8,4),                    -- 債券 %
    alternative_allocation DECIMAL(8,4),                  -- 另類 %
    cash_allocation     DECIMAL(8,4),                    -- 現金 %
    evolution_weights   JSONB,                            -- 演化策略權重
    
    -- Part 5: 戰術行動
    tactical_actions    JSONB NOT NULL,                   -- 戰術行動清單
    action_1            JSONB,                            -- 行動 1
    action_2            JSONB,                            -- 行動 2
    action_3            JSONB,                            -- 行動 3
    
    -- Part 6: 昨日覆盤
    yesterday_prediction VARCHAR(500),                     -- 昨日預測
    yesterday_actual    VARCHAR(500),                     -- 昨日實際
    prediction_accuracy DECIMAL(8,4),                    -- 預測準確度
    
    -- Part 7: 風險預警
    risk_warnings       JSONB NOT NULL,                   -- 風險預警清單
    black_swans         JSONB,                            -- 黑天鵝因子
    barra_alerts        JSONB,                            -- Barra 風險預警
    liquidity_alerts    JSONB,                            -- 流動性預警
    
    -- Part 8: 下週展望
    next_week_outlook   TEXT NOT NULL,                    -- 下週展望
    trend_prediction    VARCHAR(50),                      -- 上漲/盤整/下跌
    uncertainty_factors  TEXT[],                           -- 不確定因素
    evolution_scenario  JSONB,                            -- 演化策略情境
    
    -- 版本控制
    version             INTEGER DEFAULT 1,                -- 版本號
    is_finalized       BOOLEAN DEFAULT FALSE,             -- 是否已定稿
    
    -- 產出格式
    markdown_url       VARCHAR(500),                     -- Markdown URL
    html_url           VARCHAR(500),                     -- HTML URL
    pdf_url            VARCHAR(500),                      -- PDF URL
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 市場情緒歷史資料表
-- ============================================================================

CREATE TABLE IF NOT EXISTS market_sentiment_history (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calc_date           DATE NOT NULL,                    -- 計算日期
    
    -- 情緒指標
    vix_value           DECIMAL(8,4),                    -- VIX 指數
    vix_normalized      DECIMAL(8,4),                    -- VIX 標準化
    ptt_bull_ratio      DECIMAL(8,4),                    -- PTT 多空比
    margin_call_ratio   DECIMAL(8,4),                    -- 融資斷頭比
    institutional_flow  VARCHAR(20),                      -- 法人流向
    
    -- 計算結果
    sentiment_score     DECIMAL(8,4) NOT NULL,           -- 情緒分數
    sentiment_status    VARCHAR(50) NOT NULL,             -- 情緒狀態
    
    -- 市場背景
    market_return      DECIMAL(8,4),                     -- 當日報酬
    market_volatility  DECIMAL(8,4),                     -- 當日波動率
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT msh_date_uniq UNIQUE (calc_date)
);

-- ============================================================================
-- 報告版本歷史表
-- ============================================================================

CREATE TABLE IF NOT EXISTS report_versions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id          UUID NOT NULL REFERENCES daily_reports(id),
    version             INTEGER NOT NULL,                 -- 版本號
    
    -- 版本內容
    parts_content       JSONB NOT NULL,                   -- 各 Part 內容
    
    -- 版本元數據
    change_reason      VARCHAR(200),                     -- 變更原因
    changed_by         UUID,                             -- 變更者
    change_type        VARCHAR(50),                       -- 變更類型
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT rv_version_uniq UNIQUE (report_id, version)
);

-- COMMENT 註解
COMMENT ON TABLE daily_reports IS '每日戰略投資報告表';
COMMENT ON TABLE market_sentiment_history IS '市場情緒歷史表';
COMMENT ON TABLE report_versions IS '報告版本歷史表';
COMMENT ON COLUMN daily_reports.sentiment_status IS '情緒狀態: 極度恐慌/恐慌/中性/樂觀/極度貪婪';
COMMENT ON COLUMN daily_reports.macro_regime IS '宏觀周期: Early/Mid/Late Cycle';
```

---

## 7. 硬體/環境關聯 (QNAP TS-h973AX)

### 7.1 資源需求對照表

| 流程階段 | CPU | RAM | Storage | 配置重點 |
|----------|-----|-----|---------|----------|
| **數據準備** | 8 核心 | 16 GB | NVMe 100 GB | API 請求 |
| **報告生成** | 4 核心 | 8 GB | SSD 50 GB | LLM API |
| **格式轉換** | 2 核心 | 4 GB | SSD 30 GB | PDF 生成 |
| **發布分發** | 2 核心 | 4 GB | SSD 20 GB | 網路 I/O |

### 7.2 ZFS 儲存配置

```bash
#!/bin/bash
# ============================================================================
# 每日報告 ZFS 配置
# ============================================================================

# 創建每日報告 Dataset
zfs create quant_pool/daily_reports
zfs set compression=zstd quant_pool/daily_reports
zfs set atime=off quant_pool/daily_reports
zfs set quota=200G quant_pool/daily_reports

# 創建報告備份 Dataset
zfs create quant_pool/daily_reports/backups
zfs set compression=lz4 quant_pool/daily_reports/backups
zfs set snapshot=on quant_pool/daily_reports/backups

# 創建市場情緒 Dataset
zfs create quant_pool/sentiment
zfs set compression=lz4 quant_pool/sentiment
zfs set atime=off quant_pool/sentiment
zfs set quota=50G quant_pool/sentiment
```

### 7.3 PDF 生成配置

```yaml
# ============================================================================
# PDF 生成服務配置
# ============================================================================

services:
  pdf-generator:
    image: pandoc:latest
    container_name: pdf-generator
    volumes:
      - /share/quant_pool/daily_reports:/reports:rw
      - /share/templates:/templates:ro
    environment:
      - PANDOC_INPUT_FILE=/reports/input.md
      - PANDOC_OUTPUT_FILE=/reports/output.pdf
    command: >
      pandoc /reports/input.md 
      -o /reports/output.pdf 
      --template /templates/daily_report.latex
      --pdf-engine=xelatex
      -V mainfont="Noto Sans CJK TC"
      -V fontsize=12pt
    restart: unless-stopped
```

---

## 8. 開發者備註 (Developer Notes)

### ⚠️ 技術陷阱警示

#### TT-R01: 市場情緒波動過大
```python
# 問題：單日情緒分數波動過大導致建議不穩定
# 
# 解決方案：
# 1. 使用移動平均平滑
# 2. 實施漸進式調整
# 3. 設定閾值

class SentimentSmoother:
    def __init__(self, window: int = 5):
        self.window = window
        self.history = deque(maxlen=window)
    
    def calculate_smoothed_score(self, raw_score: float) -> float:
        # 加入歷史
        self.history.append(raw_score)
        
        # 計算加權移動平均 (近期權重更高)
        weights = np.linspace(1, 2, len(self.history))
        smoothed = np.average(self.history, weights=weights)
        
        # 限制變化幅度
        if len(self.history) >= 2:
            change = smoothed - self.history[-1]
            if abs(change) > 10:  # 單日變化不超過 10 分
                smoothed = self.history[-1] + np.sign(change) * 10
        
        return smoothed
```

#### TT-R02: 跨市場數據對齊
```問題：不同市場的交易時間不同導致數據對齊困難
# 
# 解決方案：
# 1. 標準化至 UTC
# 2. 使用最近可用數據
# 3. 標記數據延遲

class MarketDataAligner:
    def align_to_report_time(self, report_date: date, market: str) -> MarketData:
        market_tz = self.get_market_timezone(market)
        report_time = pytz.timezone('Asia/Taipei').localize(
            datetime.combine(report_date, REPORT_CUTOFF_TIME)
        )
        
        # 取得該市場在報告時間前的最後數據
        data = self.get_latest_data(market, before=report_time)
        
        if data is None:
            # 使用前一日數據
            data = self.get_latest_data(market, before=report_time - timedelta(days=1))
            data.is_stale = True
        
        return data
```

#### TT-R03: 報告一致性
```python
# 問題：每日報告風格和結構不一致
# 
# 解決方案：
# 1. 嚴格模板約束
# 2. 實施風格檢查
# 3. 使用 Textlint

class ReportConsistencyChecker:
    def check_consistency(self, report: DailyReport) -> ConsistencyResult:
        errors = []
        warnings = []
        
        # 檢查字數限制
        if len(report.one_liner) > 500:
            errors.append("One-liner 超過 500 字")
        
        # 檢查行動數量
        if len(report.tactical_actions) != 3:
            warnings.append(f"戰術行動數量應為 3，實際 {len(report.tactical_actions)}")
        
        # 檢查術語一致性
        allowed_terms = {'Bull', 'Bear', 'Neutral', 'Greed', 'Fear'}
        if report.sentiment_status not in allowed_terms:
            errors.append(f"不允許的情緒狀態: {report.sentiment_status}")
        
        return ConsistencyResult(errors=errors, warnings=warnings)
```

### 📝 開發建議

#### DEV-R01: 報告生成排程
```python
# 建議：實施智能排程系統
# 
# 排程策略：
# 1. 根據數據可用時間動態調整
# 2. 避開市場開盤時間
# 3. 預留緩衝時間

class ReportScheduler:
    def calculate_optimal_time(self, report_date: date) -> datetime:
        # 台股收盤後 30 分鐘
        taiwan_close = self.get_taiwan_close(report_date) + timedelta(minutes=30)
        
        # 美股數據通常在 08:00 (台灣時間) 前可用
        us_data_deadline = report_date.replace(hour=8, minute=0)
        
        # 選擇較晚的時間
        start_time = max(taiwan_close, us_data_deadline)
        
        # 預留 1 小時生成時間
        return start_time + timedelta(hours=1)
```

#### DEV-R02: 情緒指標優化
```python
# 建議：持續優化情緒指標權重
# 
// 優化方法：
// 1. 使用回測評估預測能力
// 2. 實施 A/B 測試
// 3. 收集用戶反饋

class SentimentOptimizer:
    def optimize_weights(self, sentiment_data: List[SentimentData]) -> Dict[str, float]:
        best_weights = None
        best_score = -np.inf
        
        # 網格搜索最優權重
        for w_vix in np.arange(0.2, 0.4, 0.05):
            for w_ptt in np.arange(0.2, 0.4, 0.05):
                for w_tech in np.arange(0.15, 0.35, 0.05):
                    w_flow = 1.0 - w_vix - w_ptt - w_tech
                    if 0.1 <= w_flow <= 0.3:
                        weights = {
                            'vix': w_vix,
                            'ptt': w_ptt,
                            'technical': w_tech,
                            'flow': w_flow
                        }
                        score = self.evaluate_weights(sentiment_data, weights)
                        if score > best_score:
                            best_score = score
                            best_weights = weights
        
        return best_weights
```

#### DEV-R03: 報告預覽功能
```typescript
// 建議：實現報告預覽功能
// 
// 預覽功能：
// 1. 快速預覽模式
// 2. 全功能預覽
// 3. 版本比較

function ReportPreview({ reportDate }: { reportDate: Date }) {
    const [mode, setMode] = useState<'quick' | 'full' | 'compare'>('quick');
    
    return (
        <div className="report-preview">
            <PreviewModeSelector mode={mode} onChange={setMode} />
            
            {mode === 'quick' && <QuickPreview reportDate={reportDate} />}
            {mode === 'full' && <FullPreview reportDate={reportDate} />}
            {mode === 'compare' && <ComparePreview reportDate={reportDate} />}
        </div>
    );
}
```

#### DEV-R04: 報告分發追蹤
```python
# 建議：實施報告分發追蹤
// 
// 追蹤指標：
// 1. 開啟率
// 2. 閱讀時長
// 3. 互動行為

class DistributionTracker:
    def track_opening(self, report_id: str, channel: str, user_id: str):
        # 記錄開啟事件
        self.db.insert('report_openings', {
            'report_id': report_id,
            'channel': channel,
            'user_id': user_id,
            'opened_at': datetime.utcnow()
        })
        
        # 更新統計
        self.redis.incr(f'report:{report_id}:opens:{channel}')
    
    def track_reading_time(self, report_id: str, user_id: str, duration_seconds: int):
        self.db.insert('report_reading_times', {
            'report_id': report_id,
            'user_id': user_id,
            'duration_seconds': duration_seconds
        })
```

---

## 9. 關聯文件索引

| 文件 | 說明 | 交互關係 |
|------|------|----------|
| [00_Full_Reconstruction_TOC.md](00_Full_Reconstruction_TOC.md) | 完整檔案結構索引 | 報告位置 |
| [06_Automation_and_Prefect_Workflow.md](06_Automation_and_Prefect_Workflow.md) | 工作流自動化 | 排程觸發 |
| [08_Core_Module_Level_2_Analysis.md](08_Core_Module_Level_2_Analysis.md) | 深度分析 | 數據來源 |
| [11_Decision_Templates_Spec.md](11_Decision_Templates_Spec.md) | 決策模板 | Prompt 模板 |

---

> **文件版本**：v1.0.1 (細節顯性化擴張)
> **關聯文件**：[00_Full_Reconstruction_TOC](00_Full_Reconstruction_TOC.md)
> **維護責任**：系統架構師 / 報告工程師
> **最後更新**：2026-02-10

