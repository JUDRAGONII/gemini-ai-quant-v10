# 10. 核心模組 4：行為金融與紀律成長 (Behavior & Discipline)

> **文件版本**：v1.0 (V10.0 完整規格書重構)
> **日期**：2026-02-10
> **核心使命：** 定義 MOD-X/AC/AG/AK/AN 模組的完整規格，涵蓋投資目標追蹤、行為金融教練與執行偏差分析

---

## 1. [X] 投資目標追蹤 (Investment Goals)

### 1.1 目標設定介面

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | UUID | 目標 ID |
| name | string | 目標名稱 |
| targetValue | currency | 目標金額 |
| currentValue | currency | 當前金額 |
| targetDate | date | 目標日期 |
| monthlyContribution | currency | 月投資金額 |
| successProbability | percent | 成功機率 |
| genomeId | UUID | **V10.0** - 演化策略配置 |

---

## 2. [AC] 行為金融教練

### 2.1 偏誤偵測類型

| 偏誤類型 | 說明 | V10.0 偵測方法 |
|----------|------|----------------|
| **DISPOSITION** | 處置效應 | 止盈不止損模式識別 |
| **CONFIRMATION** | 確認偏誤 | 只看利好消息 |
| **OVERTRADING** | 過度交易 | 交易頻率異常 |
| **ANCHORING** | 錨定效應 | 過度依賴買入成本 |
| **LOSS_AVOIDANCE** | 損失趨避 | 過早止損 |

---

## 3. [AG] 執行偏差分析

### 3.1 偏差熱圖

| 偏差類型 | 計算方式 |
|----------|----------|
| 權重偏差 | \|計劃權重 - 實際權重\| |
| 報酬偏差 | \|預期報酬 - 實際報酬\| |
| 風險偏差 | \|預期風險 - 實際風險\| |

---

## 4. [AN] 情緒日誌

### 4.1 情緒追蹤

| 情緒類型 | 說明 |
|----------|------|
| **GREED** | 貪婪 |
| **FEAR** | 恐懼 |
| **CALM** | 冷靜 |
| **ANXIETY** | 焦慮 |
| **EXCITEMENT** | 興奮 |

---

## 6. 邏輯拆解 (Logic Breakdown)

### 6.1 [X] 投資目標追蹤流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    [X] 投資目標追蹤流程                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    目標設定層                                         │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │                    目標輸入                                  │  │   │
│   │   │   • 目標名稱 (e.g., 退休基金)                              │  │   │
│   │   │   • 目標金額 (e.g., 10,000,000)                           │  │   │
│   │   │   • 目標日期 (e.g., 2046-01-01)                           │  │   │
│   │   │   • 月投資金額                                              │  │   │
│   │   │   • 風險承受度                                              │  │   │
│   │   │   • 演化策略配置 (V10.0)                                   │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                            │                                        │   │
│   │                            ▼                                        │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │                    可行性計算                               │  │   │
│   │   │                                                            │  │   │
│   │   │   ┌─────────────────────────────────────────────────────┐ │  │   │
│   │   │   │   Monte Carlo 模擬                                  │ │  │   │
│   │   │   │   • 模擬 10,000 次路徑                             │ │  │   │
│   │   │   │   • 使用歷史報酬分布                                 │ │  │   │
│   │   │   │   • 考量通膨與費用                                   │ │  │   │
│   │   │   └─────────────────────────────────────────────────────┘ │  │   │
│   │   │                                                            │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                            │                                        │   │
│   │                            ▼                                        │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │                    成功機率計算                            │  │   │
│   │   │                                                            │  │   │
│   │   │   success_probability =                                     │  │   │
│   │   │   (達標路徑數 / 總模擬路徑數) × 100%                       │  │   │
│   │   │                                                            │  │   │
│   │   │   ⚠️ 若 < 50%：建議調整策略                               │  │   │
│   │   │   ⚠️ 若 50-70%：需謹慎評估                                │  │   │
│   │   │   ✅ 若 > 70%：目標可行                                    │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    進度追蹤層                                        │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │                    進度儀表板                              │  │   │
│   │   │   • 當前價值 vs 預期價值                                   │  │   │
│   │   │   • 剩餘時間 vs 所需報酬                                    │  │   │
│   │   │   • 離目標差距                                              │  │   │
│   │   │   • 調整建議                                                │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 [AC] 行為金融教練流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    [AC] 行為金融教練流程                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    行為數據收集                                       │   │
│   │                                                                      │   │
│   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │   │
│   │   │   交易記錄   │  │   持倉模式   │  │   情緒日誌   │             │   │
│   │   │   Transactions│  │   Holdings   │  │   Emotions  │             │   │
│   │   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │   │
│   │          │                 │                 │                       │   │
│   │          └─────────────────┼─────────────────┘                       │   │
│   │                            │                                         │   │
│   │                            ▼                                         │   │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              偏誤偵測引擎                               │      │   │
│   │   │   • DISPOSITION (處置效應)                             │      │   │
│   │   │   • CONFIRMATION (確認偏誤)                            │      │   │
│   │   │   • OVERTRADING (過度交易)                             │      │   │
│   │   │   • ANCHORING (錨定效應)                               │      │   │
│   │   │   • LOSS_AVOIDANCE (損失趨避)                          │      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                            │                                         │   │
│   │                            ▼                                         │   │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              偏誤嚴重性評估                            │      │   │
│   │   │                                                            │      │   │
│   │   │   ┌─────────────────────────────────────────────────────┐│      │   │
│   │   │   │   Severity = Frequency × Impact × Duration       ││      │   │
│   │   │   │                                                    ││      │   │
│   │   │   │   • Frequency: 發生頻率                            ││      │   │
│   │   │   │   • Impact: 對績效的影響                          ││      │   │
│   │   │   │   • Duration: 持續時間                            ││      │   │
│   │   │   └─────────────────────────────────────────────────────┘│      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                            │                                         │   │
│   │                            ▼                                         │   │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              介入建議生成                              │      │   │
│   │   │                                                            │      │   │
│   │   │   ┌─────────────────────────────────────────────────────┐│      │   │
│   │   │   │              AI Coaching Prompt                    ││      │   │
│   │   │   │   "您最近 3 筆交易都是止盈不錯損，                  ││      │   │
│   │   │   │    這可能反映了處置效應。                          ││      │   │
│   │   │   │    研究顯示設定移動止損可以改善長期績效。"          ││      │   │
│   │   │   └─────────────────────────────────────────────────────┘│      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.3 [AG] 執行偏差分析流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    [AG] 執行偏差分析流程                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    偏差類型定義                                       │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   權重偏差 (Weight Deviation)                              │  │   │
│   │   │   W_dev = |W_plan - W_actual|                             │  │   │
│   │   │   • < 2%: 可接受                                           │  │   │
│   │   │   • 2-5%: 需關注                                           │  │   │
│   │   │   • > 5%: 警告                                             │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   報酬偏差 (Return Deviation)                              │  │   │
│   │   │   R_dev = |R_expected - R_actual|                         │  │   │
│   │   │   • < 1%: 可接受                                           │  │   │
│   │   │   • 1-3%: 需關注                                           │  │   │
│   │   │   • > 3%: 警告                                             │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   風險偏差 (Risk Deviation)                                │  │   │
│   │   │   Risk_dev = |Risk_expected - Risk_actual|                  │  │   │
│   │   │   • < 5%: 可接受                                           │  │   │
│   │   │   • 5-15%: 需關注                                          │  │   │
│   │   │   • > 15%: 警告                                            │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    偏差熱圖生成                                      │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │                    產業維度熱圖                              │  │   │
│   │   │                                                            │  │   │
│   │   │   ┌─────────────────────────────────────────────────────┐ │  │   │
│   │   │   │   半導體  │ 金融  │ 電子  │ 傳產  │ 醫療      │ │  │   │
│   │   │   ├──────────┼───────┼───────┼───────┼──────────┤ │  │   │
│   │   │   │   🟢 2%  │  🟡 4% │  🟢 1% │  🔴 8% │  🟢 1%  │ │  │   │
│   │   │   └─────────────────────────────────────────────────────┘ │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │                    因子維度熱圖                              │  │   │
│   │   │                                                            │  │   │
│   │   │   ┌─────────────────────────────────────────────────────┐ │  │   │
│   │   │   │   Value  │ Quality │ Momentum │ Growth │ Vol   │ │  │   │
│   │   │   ├─────────┼─────────┼──────────┼────────┼───────┤ │  │   │
│   │   │   │   🟢 1% │  🟢 2%  │  🟡 5%   │  🟢 1% │  🔴 7% │ │  │   │
│   │   │   └─────────────────────────────────────────────────────┘ │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.4 [AN] 情緒日誌流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    [AN] 情緒日誌流程                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    情緒收集                                           │   │
│   │                                                                      │   │
│   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │   │
│   │   │   手動記錄   │  │   交易關聯   │  │   AI 推斷   │             │   │
│   │   │   User Input │  │   Trade Link │  │   AI Infer  │             │   │
│   │   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │   │
│   │          │                 │                 │                       │   │
│   │          └─────────────────┼─────────────────┘                       │   │
│   │                            │                                         │   │
│   │                            ▼                                         │   │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              情緒分類引擎                               │      │   │
│   │   │   • GREED (貪婪)                                       │      │   │
│   │   │   • FEAR (恐懼)                                        │      │   │
│   │   │   • CALM (冷靜)                                        │      │   │
│   │   │   • ANXIETY (焦慮)                                     │      │   │
│   │   │   • EXCITEMENT (興奮)                                   │      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                            │                                         │   │
│   │                            ▼                                         │   │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              情緒影響評估                              │      │   │
│   │   │                                                            │      │   │
│   │   │   ┌─────────────────────────────────────────────────────┐│      │   │
│   │   │   │   Impact Score = 強度 × 持續時間 × 交易關聯     ││      │   │
│   │   │   │                                                    ││      │   │
│   │   │   │   • 強度: 1-10 (1=輕微, 10=極強)                  ││      │   │
│   │   │   │   • 持續時間: 小時/天/週                          ││      │   │
│   │   │   │   • 交易關聯: 是否有對應交易                       ││      │   │
│   │   │   └─────────────────────────────────────────────────────┘│      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                            │                                         │   │
│   │                            ▼                                         │   │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              建議生成                                  │      │   │
│   │   │                                                            │      │   │
│   │   │   • 若 GREED 高: 提醒分散投資                          │      │   │
│   │   │   • 若 FEAR 高: 提醒長期視角                          │      │   │
│   │   │   • 若 ANXIETY 高: 建議減少查看頻率                    │      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. 邊界條件定義 (Edge Cases)

### 7.1 [X] 投資目標邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-G01** | 模擬路徑 90% 失敗 | 目標可行性低 | 紅色警示，建議調整 |
| **EC-G02** | 月投資金額為負數 | 驗證失敗 | 提示輸入正數 |
| **EC-G03** | 目標日期 < 今天 | 日期驗證失敗 | 提示選擇未來日期 |
| **EC-G04** | 目標金額 < 0 | 金額驗證失敗 | 提示輸入正數 |
| **EC-G05** | 模擬超時 (> 60 秒) | 返回近似結果 | 標記 "Approximate" |
| **EC-G06** | 歷史數據不足 5 年 | 降低模擬置信度 | 標記 "Limited History" |

### 7.2 [AC] 行為偏誤邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-G07** | 偏誤偵測樣本不足 (< 10 筆交易) | 不做偵測 | 提示 "Insufficient Data" |
| **EC-G08** | 多種偏誤同時發生 | 優先處理高影響偏誤 | 排序顯示 |
| **EC-G09** | 使用者否認偏誤 | 記錄否認次數 | 累積記錄 |
| **EC-G10** | 偏誤改善後再次出現 | 重置偵測計時器 | 重新追蹤 |
| **EC-G11** | 偏誤嚴重性計算為負數 | 使用預設值 | 記錄日誌 |
| **EC-G12** | AI 教練建議過於頻繁 | 實施冷卻期 | 每日最多 3 次 |

### 7.3 [AG] 執行偏差邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-G13** | 計劃權重總和 ≠ 100% | 權重驗證失敗 | 提示重新輸入 |
| **EC-G14** | 偏差計算除零錯誤 | 返回 NULL | 記錄日誌 |
| **EC-G15** | 熱圖渲染超時 (> 10 秒) | 使用簡化視圖 | 標記 "Simplified" |
| **EC-G16** | 歷史偏差數據過多 (> 1000 筆) | 實施分頁 | 顯示最近 100 筆 |
| **EC-G17** | 偏差趨勢異常 (連續 5 日惡化) | 觸發特別提醒 | 標記 "Trend Alert" |

### 7.4 [AN] 情緒日誌邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-G18** | 情緒記錄過於頻繁 (< 1 小時) | 提示冷靜期 | 記錄但提醒 |
| **EC-G19** | 情緒強度與交易不符 | 記錄不一致 | AI 反思建議 |
| **EC-G20** | 負面情緒持續 > 7 天 | 觸發關懷機制 | 建議休息 |
| **EC-G21** | 情緒日誌加密失敗 | 記錄失敗 | 使用明文並標記 |
| **EC-G22** | 同步至外部失敗 | 本地儲存 | 待網路恢復重試 |

---

## 8. Schema 完整化

### 8.1 投資目標資料表 `investment_goals`

```sql
-- ============================================================================
-- 投資目標資料表
-- 用途：存儲用戶投資目標與追蹤
-- ============================================================================

CREATE TABLE IF NOT EXISTS investment_goals (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES auth.users(id),
    
    -- 基本資訊
    goal_name           VARCHAR(200) NOT NULL,             -- 目標名稱
    goal_type           VARCHAR(50) NOT NULL,               -- retirement/education/purchase/emergency/custom
    
    -- 目標金額
    target_amount      DECIMAL(24,2) NOT NULL,             -- 目標金額
    current_amount     DECIMAL(24,2) DEFAULT 0,            -- 當前金額
    initial_amount     DECIMAL(24,2) DEFAULT 0,             -- 初始金額
    
    -- 時間框架
    target_date        DATE NOT NULL,                       -- 目標日期
    start_date         DATE NOT NULL,                       -- 開始日期
    
    -- 投資配置
    monthly_contribution DECIMAL(18,2) NOT NULL,            -- 月投資金額
    risk_tolerance     VARCHAR(20) DEFAULT 'medium',       -- low/medium/high
    genome_id           UUID,                                -- V10.0 演化策略配置
    genome_version     VARCHAR(20),                        -- 基因組版本
    
    -- 可行性分析
    success_probability DECIMAL(8,4),                       -- 成功機率 %
    expected_return    DECIMAL(8,4),                      -- 預期年化報酬 %
    required_return    DECIMAL(8,4),                       -- 達成所需報酬 %
    simulation_rounds  INTEGER DEFAULT 10000,               -- 模擬次數
    
    -- 進度追蹤
    progress_percent   DECIMAL(8,4) GENERATED ALWAYS AS (
        CASE 
            WHEN target_amount > 0 
            THEN (current_amount / target_amount) * 100 
            ELSE 0 
        END
    ) STORED,
    projected_completion DATE,                              -- 預計完成日期
    on_track           BOOLEAN,                             -- 是否按進度
    
    -- 狀態管理
    status             VARCHAR(20) DEFAULT 'active',         -- active/paused/completed/abandoned
    last_reviewed_at   TIMESTAMP WITH TIME ZONE,           -- 最後審視
    archived_at        TIMESTAMP WITH TIME ZONE,           -- 歸檔時間
    
    -- 元數據
    notes              TEXT,                                 -- 備註
    tags               VARCHAR(50)[],                       -- 標籤
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 目標進度快照資料表
-- ============================================================================

CREATE TABLE IF NOT EXISTS goal_progress_snapshots (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id             UUID NOT NULL REFERENCES investment_goals(id),
    snapshot_date       DATE NOT NULL,                       -- 快照日期
    
    -- 快照內容
    current_amount     DECIMAL(24,2) NOT NULL,             -- 當時金額
    progress_percent   DECIMAL(8,4) NOT NULL,              -- 當時進度 %
    total_contribution DECIMAL(24,2),                      -- 累計投入
    total_return       DECIMAL(24,2),                      -- 累計報酬
    
    -- 模擬結果摘要
    success_probability DECIMAL(8,4),                       -- 當時成功率
    projected_completion DATE,                              -- 當時預計完成日
    
    -- 市場環境
    market_regime       VARCHAR(20),                        -- 當時市場 Regime
    macro_index_value  DECIMAL(18,4),                      -- 當時宏觀指數
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT gps_date_uniq UNIQUE (goal_id, snapshot_date)
);

-- COMMENT 註解
COMMENT ON TABLE investment_goals IS '投資目標表 - 用戶目標設定與追蹤';
COMMENT ON TABLE goal_progress_snapshots IS '目標進度快照表';
COMMENT ON COLUMN investment_goals.success_probability IS 'Monte Carlo 模擬成功率';
COMMENT ON COLUMN investment_goals.genome_id IS 'V10.0 演化策略配置關聯';
```

### 8.2 行為偏誤資料表 `behavioral_bias`

```sql
-- ============================================================================
-- 行為偏誤偵測資料表
-- 用途：存儲用戶行為偏誤偵測結果
-- ============================================================================

CREATE TABLE IF NOT EXISTS behavioral_biases (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES auth.users(id),
    
    -- 偏誤類型
    bias_type           VARCHAR(50) NOT NULL,               -- DISPOSITION/CONFIRMATION/OVERTRADING/ANCHORING/LOSS_AVOIDANCE
    bias_name           VARCHAR(100),                       -- 偏誤名稱
    
    -- 偵測結果
    detection_date      DATE NOT NULL,                      -- 偵測日期
    detection_method    VARCHAR(50),                        -- 偵測方法
    evidence_trades     UUID[],                             -- 相關交易 ID
    
    -- 偏誤評估
    severity_score      INTEGER CHECK (severity_score BETWEEN 1 AND 100), -- 嚴重性分數
    frequency_score    INTEGER CHECK (frequency_score BETWEEN 1 AND 100), -- 發生頻率
    impact_score       INTEGER CHECK (impact_score BETWEEN 1 AND 100), -- 影響程度
    duration_days      INTEGER,                             -- 持續天數
    
    -- 交易模式
    pattern_description TEXT,                               -- 模式描述
    example_trades     JSONB,                               -- 範例交易
    
    -- 介入歷史
    intervention_count  INTEGER DEFAULT 0,                   -- 介入次數
    last_intervention   TIMESTAMP WITH TIME ZONE,          -- 最後介入
    interventions      JSONB,                               -- 介入記錄
    
    -- 改善追蹤
    is_improving       BOOLEAN,                             -- 是否改善
    improvement_rate   DECIMAL(8,4),                       -- 改善率
    last_recurrence     DATE,                               -- 最近復發日期
    
    -- 狀態
    status             VARCHAR(20) DEFAULT 'detected',     -- detected/improving/resolved/recurring
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 行為教練介入記錄表
-- ============================================================================

CREATE TABLE IF NOT EXISTS coaching_interventions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES auth.users(id),
    bias_id             UUID REFERENCES behavioral_biases(id),
    
    -- 介入內容
    intervention_type   VARCHAR(50) NOT NULL,               -- reminder/tip/article/exercise/quiz
    title               VARCHAR(200) NOT NULL,              -- 介入標題
    message             TEXT NOT NULL,                      -- 介入訊息
    
    -- 互動追蹤
    is_read             BOOLEAN DEFAULT FALSE,               -- 是否已讀
    read_at            TIMESTAMP WITH TIME ZONE,           -- 閱讀時間
    is_completed       BOOLEAN DEFAULT FALSE,               -- 是否完成
    completed_at       TIMESTAMP WITH TIME ZONE,           -- 完成時間
    
    -- 用戶回饋
    user_rating        INTEGER CHECK (user_rating BETWEEN 1 AND 5), -- 評分
    user_feedback      TEXT,                                -- 回饋內容
    
    -- 效果追蹤
    effectiveness_score DECIMAL(8,4),                      -- 效果評分
    followed_trades     UUID[],                             -- 後續遵循交易
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- COMMENT 註解
COMMENT ON TABLE behavioral_biases IS '行為偏誤偵測表';
COMMENT ON TABLE coaching_interventions IS '行為教練介入記錄表';
COMMENT ON COLUMN behavioral_biases.bias_type IS '偏誤類型: DISPOSITION/CONFIRMATION/OVERTRADING/ANCHORING/LOSS_AVOIDANCE';
COMMENT ON COLUMN behavioral_biases.severity_score IS '嚴重性分數 1-100，100 最嚴重';
```

### 8.3 執行偏差資料表 `execution_deviation`

```sql
-- ============================================================================
-- 執行偏差分析資料表
-- 用途：存儲投資組合執行偏差分析
-- ============================================================================

CREATE TABLE IF NOT EXISTS execution_deviations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id        UUID NOT NULL,                       -- 投資組合 ID
    analysis_date       DATE NOT NULL,                        -- 分析日期
    
    -- 權重偏差
    weight_deviation    DECIMAL(8,4) NOT NULL,              -- 權重偏差 %
    max_weight_deviation DECIMAL(8,4),                      -- 最大權重偏差 %
    overweight_symbols  JSONB,                              -- 超配標的
    underweight_symbols JSONB,                              -- 低配標的
    
    -- 報酬偏差
    return_deviation   DECIMAL(8,4) NOT NULL,              -- 報酬偏差 %
    expected_return    DECIMAL(8,4),                       -- 預期報酬 %
    actual_return       DECIMAL(8,4),                       -- 實際報酬 %
    attribution_gap     DECIMAL(24,2),                      -- 歸因差距金額
    
    -- 風險偏差
    risk_deviation     DECIMAL(8,4),                       -- 風險偏差 %
    expected_risk       DECIMAL(8,4),                       -- 預期風險
    actual_risk         DECIMAL(8,4),                       -- 實際風險
    
    -- 偏差熱圖數據
    sector_deviation_heatmap JSONB,                        -- 產業維度熱圖
    factor_deviation_heatmap JSONB,                        -- 因子維度熱圖
    
    -- 偏差趨勢
    deviation_trend     VARCHAR(20),                        -- improving/stable/worsening
    consecutive_days_deviating INTEGER,                    -- 連續偏差天數
    
    -- 警示狀態
    alert_level         VARCHAR(20) DEFAULT 'normal',       -- normal/warning/critical
    alert_message      TEXT,                                -- 警示訊息
    
    -- 修正建議
    rebalance_suggestions JSONB,                          -- 調整建議
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT ed_date_uniq UNIQUE (portfolio_id, analysis_date)
);

-- COMMENT 註解
COMMENT ON TABLE execution_deviations IS '執行偏差分析表';
COMMENT ON COLUMN execution_deviations.weight_deviation IS '權重偏差 = |計劃權重 - 實際權重|';
COMMENT ON COLUMN execution_deviations.alert_level IS '警示等級: normal/warning/critical';
```

### 8.4 情緒日誌資料表 `emotion_log`

```sql
-- ============================================================================
-- 情緒日誌資料表
-- 用途：存儲用戶投資情緒追蹤
-- ============================================================================

CREATE TABLE IF NOT EXISTS emotion_log (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES auth.users(id),
    
    -- 情緒分類
    emotion_type        VARCHAR(50) NOT NULL,               -- GREED/FEAR/CALM/ANXIETY/EXCITEMENT/HOPE/DESPAIR
    emotion_intensity    INTEGER NOT NULL CHECK (emotion_intensity BETWEEN 1 AND 10), -- 強度 1-10
    
    -- 情緒描述
    description         TEXT,                                 -- 情緒描述
    trigger_event       VARCHAR(200),                        -- 觸發事件
    related_symbols     VARCHAR(20)[],                       -- 相關標的
    
    -- 持續時間
    started_at          TIMESTAMP WITH TIME ZONE NOT NULL,  -- 開始時間
    ended_at            TIMESTAMP WITH TIME ZONE,           -- 結束時間
    duration_hours      DECIMAL(10,2),                      -- 持續小時數
    
    -- 交易關聯
    trade_decisions     UUID[],                             -- 相關交易決策
    trade_outcome       VARCHAR(20),                        -- related/successful/neutral/regretful
    
    -- 影響評估
    impact_score       INTEGER CHECK (impact_score BETWEEN 1 AND 100), -- 影響分數
    decision_quality   VARCHAR(20),                        -- good/neutral/poor
    lessons_learned    TEXT,                                -- 學習心得
    
    -- AI 分析
    ai_insights         TEXT,                               -- AI 分析洞察
    coaching_suggestion TEXT,                               -- 教練建議
    
    -- 後續追蹤
    follow_up_date      DATE,                               -- 跟進日期
    follow_up_completed BOOLEAN DEFAULT FALSE,               -- 跟進完成
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 情緒趨勢統計表
-- ============================================================================

CREATE TABLE IF NOT EXISTS emotion_trends (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES auth.users(id),
    period_start        DATE NOT NULL,                       -- 期間開始
    period_end          DATE NOT NULL,                       -- 期間結束
    period_type         VARCHAR(20) NOT NULL,               -- daily/weekly/monthly
    
    -- 情緒統計
    dominant_emotion    VARCHAR(50),                        -- 主要情緒
    emotion_distribution JSONB NOT NULL,                    -- 情緒分布
    avg_intensity       DECIMAL(8,4),                      -- 平均強度
    max_intensity       INTEGER,                            -- 最大強度
    
    -- 交易日誌統計
    total_entries       INTEGER DEFAULT 0,                   -- 總記錄數
    trading_days_count  INTEGER,                            -- 交易日數
    trading_with_emotion INTEGER,                          -- 有情緒記錄的交易日
    
    -- 偏誤關聯
    detected_biases     VARCHAR(50)[],                       -- 偵測到的偏誤
    bias_improvement    DECIMAL(8,4),                      -- 偏誤改善率
    
    -- AI 摘要
    trend_summary       TEXT,                               -- 趨勢摘要
    coaching_recommendations TEXT,                          -- 教練建議
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- COMMENT 註解
COMMENT ON TABLE emotion_log IS '情緒日誌表';
COMMENT ON TABLE emotion_trends IS '情緒趨勢統計表';
COMMENT ON COLUMN emotion_log.emotion_type IS '情緒類型: GREED/FEAR/CALM/ANXIETY/EXCITEMENT/HOPE/DESPAIR';
COMMENT ON COLUMN emotion_log.emotion_intensity IS '情緒強度 1-10，10 最強烈';
```

---

## 9. 硬體/環境關聯 (QNAP TS-h973AX)

### 9.1 資源需求對照表

| 模組 | CPU | RAM | Storage | 配置重點 |
|------|-----|-----|---------|----------|
| **[X] 投資目標** | 2 核心 | 4 GB | SSD 30 GB | Monte Carlo 計算 |
| **[AC] 行為教練** | 2 核心 | 4 GB | SSD 20 GB | 模式匹配 |
| **[AG] 偏差分析** | 4 核心 | 8 GB | SSD 50 GB | 數據聚合 |
| **[AN] 情緒日誌** | 2 核心 | 4 GB | SSD 20 GB | 時間序列 |

### 9.2 ZFS 儲存配置

```bash
#!/bin/bash
# ============================================================================
# 行為金融模組 ZFS 配置
# ============================================================================

# 創建投資目標 Dataset
zfs create quant_pool/goals
zfs set compression=lz4 quant_pool/goals
zfs set atime=off quant_pool/goals
zfs set quota=50G quant_pool/goals

# 創建行為偏誤 Dataset
zfs create quant_pool/behavior
zfs set compression=zstd quant_pool/behavior
zfs set atime=off quant_pool/behavior
zfs set quota=30G quant_pool/behavior

# 創建情緒日誌 Dataset
zfs create quant_pool/emotions
zfs set compression=lz4 quant_pool/emotions
zfs set atime=off quant_pool/emotions
zfs set quota=20G quant_pool/emotions
```

---

## 10. 開發者備註 (Developer Notes)

### ⚠️ 技術陷阱警示

#### TT-G01: Monte Carlo 模擬效能
```python
# 問題：大量目標同時模擬導致效能瓶頸
# 
# 解決方案：
# 1. 使用 Vectorized 運算
# 2. 實施漸進式模擬
# 3. 結果快取

import numpy as np

class GoalMonteCarlo:
    def simulate(
        self,
        n_simulations: int = 10000,
        n_years: int = 20,
        monthly_contribution: float = 10000
    ) -> np.ndarray:
        # 向量化模擬
        returns = np.random.normal(
            self.expected_return / 12,
            self.volatility / np.sqrt(12),
            (n_years * 12, n_simulations)
        )
        
        # 計算累積價值
        portfolio_values = np.zeros((n_years * 12 + 1, n_simulations))
        portfolio_values[0] = self.initial_amount
        
        for i in range(1, len(portfolio_values)):
            portfolio_values[i] = (
                portfolio_values[i-1] * (1 + returns[i-1]) + monthly_contribution
            )
        
        return portfolio_values[-1]
```

#### TT-G02: 偏誤偵測樣本不足
```python
# 問題：新用戶交易樣本不足無法偵測偏誤
# 
# 解決方案：
# 1. 設定最低樣本門檻
# 2. 使用聚合分析
# 3. 提供通用建議

class BiasDetector:
    MIN_TRADES_FOR_DETECTION = 10
    MIN_DAYS_FOR_DETECTION = 30
    
    def can_detect(self, user_trades: List[Trade]) -> Tuple[bool, str]:
        if len(user_trades) < self.MIN_TRADES_FOR_DETECTION:
            return False, f"需要至少 {self.MIN_TRADES_FOR_DETECTION} 筆交易"
        
        if (user_trades[-1].date - user_trades[0].date).days < self.MIN_DAYS_FOR_DETECTION:
            return False, f"需要至少 {self.MIN_DAYS_FOR_DETECTION} 天數據"
        
        return True, "OK"
```

#### TT-G03: 情緒數據隱私保護
```python
# 問題：情緒日誌包含敏感資訊
# 
# 解決方案：
# 1. 端對端加密
# 2. 匿名化處理
# 3. 用戶控制分享

class EmotionDataPrivacy:
    def encrypt_entry(self, entry: EmotionEntry, user_key: bytes) -> EncryptedEntry:
        # 使用 Fernet 對稱加密
        cipher = Fernet(user_key)
        encrypted = cipher.encrypt(entry.to_json().encode())
        
        return EncryptedEntry(
            encrypted_data=encrypted,
            iv=cipher.iv,
            auth_tag=cipher.auth_tag
        )
    
    def anonymize_for_analysis(self, entries: List[EmotionEntry]) -> List[AnonymizedEntry]:
        # 移除識別資訊
        return [
            AnonymizedEntry(
                emotion_type=e.emotion_type,
                intensity=e.intensity,
                duration_hours=e.duration_hours
            )
            for e in entries
        ]
```

### 📝 開發建議

#### DEV-G01: 目標進度追蹤 UI
```typescript
// 建議：實現直觀的目標進度追蹤 UI
// 
// UI 元件：
// 1. 進度環 (Progress Ring)
// 2. 剩餘路徑預測
// 3. 里程碑標記

function GoalProgressCard({ goal }: { goal: InvestmentGoal }) {
    // 進度百分比
    const progress = (goal.current_amount / goal.target_amount) * 100;
    
    // 預計完成日期計算
    const projectedDate = useMemo(() => {
        return calculateProjectedCompletion(goal);
    }, [goal]);
    
    return (
        <div className="goal-card">
            <ProgressRing progress={progress} />
            <MilestoneTracker milestones={goal.milestones} />
            <ProjectedCompletion date={projectedDate} />
            <SuccessProbability score={goal.successProbability} />
        </div>
    );
}
```

#### DEV-G02: 偏差熱圖渲染優化
```typescript
// 建議：實現高效的偏差熱圖渲染
// 
// 優化策略：
// 1. 使用 Canvas 而非 DOM
// 2. 懶加載
// 3. 互動時才載入詳細數據

function DeviationHeatmap({ data }: { data: DeviationData }) {
    // 使用 react-vis 或 echarts
    const option = {
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c}%'
        },
        series: [{
            type: 'treemap',
            data: transformToTreeMap(data),
            roam: false,
            breadcrumb: { show: false }
        }]
    };
    
    return <ReactECharts option={option} />;
}
```

#### DEV-G03: 情緒趨勢可視化
```typescript
// 建議：實現情緒趨勢時間軸可視化
// 
// 可視化類型：
// 1. 情緒河流圖
// 2. 日曆熱圖
// 3. 趨勢折線圖

function EmotionTrendChart({ entries }: { entries: EmotionEntry[] }) {
    return (
        <div className="emotion-trends">
            <EmotionRiver data={entries} />
            <EmotionCalendar entries={entries} />
            <EmotionIntensityLine entries={entries} />
        </div>
    );
}
```

#### DEV-G04: 行為教練互動設計
```typescript
// 建議：設計非侵入式的行為教練互動
// 
// 設計原則：
// 1. 適時提醒而非說教
// 2. 提供選擇而非命令
// 3. 肯定進步

function CoachingCard({ intervention }: { intervention: Intervention }) {
    return (
        <div className="coaching-card">
            <Icon type={intervention.type} />
            <Message content={intervention.message} />
            <ActionButtons
                primary="我知道了"
                secondary="告訴我更多"
                dismiss="暫時不要"
            />
            <FeedbackForm onSubmit={intervention.feedback} />
        </div>
    );
}
```

---

## 11. 關聯文件索引

| 文件 | 說明 | 交互關係 |
|------|------|----------|
| [00_Full_Reconstruction_TOC.md](00_Full_Reconstruction_TOC.md) | 完整檔案結構索引 | L4 模組位置 |
| [07_Core_Module_Level_1_Foundation.md](07_Core_Module_Level_1_Foundation.md) | 基礎持倉 | 持倉數據 |
| [08_Core_Module_Level_2_Analysis.md](08_Core_Module_Level_2_Analysis.md) | 深度分析 | 分析數據 |
| [11_Decision_Templates_Spec.md](11_Decision_Templates_Spec.md) | 決策模板 | 教練 Prompt |

---

> **文件版本**：v1.0.1 (細節顯性化擴張)
> **關聯文件**：[00_Full_Reconstruction_TOC](00_Full_Reconstruction_TOC.md)
> **維護責任**：系統架構師 / 用戶體驗設計師
> **最後更新**：2026-02-10

