# 11. 統合究鏡版決策模板規範 (Decision Template Spec)

> **文件版本**：v1.0 (V10.0 完整規格書重構)
> **日期**：2026-02-10
> **核心使命：** 定義 15-Part 決策報告結構與 AI Prompt 組裝邏輯，涵蓋 V10.0 多代理人辯論系統與 18 維度評分整合

---

## 1. 決策報告十五進制結構 (15-Part)

| Part | 區塊名稱 | V10.0 強化內容 |
|------|----------|----------------|
| **1** | 核心觀點摘要 | 一句話總結 + 演化策略建議 |
| **2** | 決策結論表 | 信心分數、建議水位、目標價與停損價 |
| **3** | 量化因子雷達 | **18 維度評分** (擴充) |
| **4** | 技術面診斷 | MA 趨勢、RSI 強度、K 線型態 |
| **5** | 籌碼動力分析 | 11 家 13F 機構動向 |
| **6** | 基本面透視 | 營收、毛利、ROE 趨勢 |
| **7** | 宏觀定錨匹配 | 130+ 指標整合 |
| **8** | 產業護城河 | 行業地位、護城河強度 |
| **9** | 牛市論證 | 多代理人辯論 - 多頭觀點 |
| **10** | 熊市論證 | 多代理人辯論 - 空頭觀點 (強制) |
| **11** | 估值安全邊際 | 歷史 PE/PB 區間、DCF 預算 |
| **12** | 壓力測試結果 | Barra/Brinson/Greeks 專業分析 |
| **13** | 替代方案比對 | 同產業是否存在更有價值標的 |
| **14** | 行為心理檢查 | 是否有確認偏誤或處置效應 |
| **15** | 最終行動 | 立刻下單、掛單、移入觀察 |

---

## 2. V10.0 AI Prompt 組裝範本

### 2.1 多代理人辯論 Prompt

```python
# V10.0 多代理人辯論 Prompt (定義)

DEBATE_PROMPT_TEMPLATE = """
你是 Gemini AI Quant 的多代理人辯論系統。

【角色定義】
- Agent-Bull: 專門論證買進理由
- Agent-Bear: 專門論證賣出理由 (強制)
- Agent-CIO: 最終綜合判斷

【輸入數據】
{context_data}

【輸出格式】
嚴格遵守以下 JSON Schema：
{{
  "part9_bull_case": [...],   // Agent-Bull 輸出
  "part10_bear_case": [...],  // Agent-Bear 輸出 (必填)
  "part2_decision": {{...}},  // Agent-CIO 輸出
  "confidence": 8.5           // 辯論後信心度
}}

【強制要求】
1. Agent-Bear 必須獨立生成，不可遺漏
2. 每個論點必須有數據支撐
3. Agent-CIO 需綜合雙方觀點做最終判斷
"""

def build_decision_prompt_v10(...) -> str:
    """V10.0 組裝決策 Prompt (多代理人版本)"""
    pass
```

---

## 4. 邏輯拆解 (Logic Breakdown)

### 4.1 十五進制決策報告生成流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    十五進制決策報告生成流程                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    資料聚合層                                         │   │
│   │                                                                      │   │
│   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │   │
│   │   │   量化數據   │  │   技術數據   │  │   籌碼數據   │             │   │
│   │   │   18 維度   │  │   MA/RSI    │  │   13F/大戶   │             │   │
│   │   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │   │
│   │          │                 │                 │                       │   │
│   │          └─────────────────┼─────────────────┘                       │   │
│   │                            │                                         │   │
│   │                            ▼                                         │   │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              Prompt 組裝引擎                             │      │   │
│   │   │   • 組裝上下文資料                                     │      │   │
│   │   │   • 選擇 Prompt 模板                                   │      │   │
│   │   │   • 注入變數                                          │      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                            │                                         │   │
│   │                            ▼                                         │   │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              多代理人辯論                               │      │   │
│   │   │                                                            │      │   │
│   │   │   ┌─────────────────────────────────────────────────────┐│      │   │
│   │   │   │   Agent-Bull ──▶ 多頭論證 ──▶ Part 9            ││      │   │
│   │   │   │                                                    ││      │   │
│   │   │   │   Agent-Bear ──▶ 空頭論證 ──▶ Part 10           ││      │   │
│   │   │   │                                                    ││      │   │
│   │   │   │   Agent-CIO ──▶ 綜合判斷 ──▶ Part 2             ││      │   │
│   │   │   └─────────────────────────────────────────────────────┘│      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                            │                                         │   │
│   │                            ▼                                         │   │
│   │   ┌─────────────────────────────────────────────────────────┐      │   │
│   │   │              報告渲染引擎                               │      │   │
│   │   │                                                            │      │   │
│   │   │   Part 1: 核心觀點摘要 ←─────────────────────────────│      │   │
│   │   │   Part 2: 決策結論表 ←───────────────────────────────│      │   │
│   │   │   Part 3: 量化因子雷達 ←─────────────────────────────│      │   │
│   │   │   Part 4: 技術面診斷 ←───────────────────────────────│      │   │
│   │   │   Part 5: 籌碼動力分析 ←─────────────────────────────│      │   │
│   │   │   Part 6: 基本面透視 ←───────────────────────────────│      │   │
│   │   │   Part 7: 宏觀定錨匹配 ←─────────────────────────────│      │   │
│   │   │   Part 8: 產業護城河 ←──────────────────────────────│      │   │
│   │   │   Part 9: 牛市論證 ←────────────────────────────────│      │   │
│   │   │   Part 10: 熊市論證 ←───────────────────────────────│      │   │
│   │   │   Part 11: 估值安全邊際 ←───────────────────────────│      │   │
│   │   │   Part 12: 壓力測試結果 ←────────────────────────────│      │   │
│   │   │   Part 13: 替代方案比對 ←───────────────────────────│      │   │
│   │   │   Part 14: 行為心理檢查 ←────────────────────────────│      │   │
│   │   │   Part 15: 最終行動 ←──────────────────────────────│      │   │
│   │   │                                                            │      │   │
│   │   └─────────────────────────────────────────────────────────┘      │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 AI Prompt 組裝流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AI Prompt 組裝流程                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    Prompt 模板庫                                      │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   {system_prompt}                                         │  │   │
│   │   │   你是一位資深投資分析師，專注於台灣市場...                  │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   {context_data}                                           │  │   │
│   │   │   18維度評分、財報數據、技術指標...                          │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   {output_schema}                                         │  │   │
│   │   │   嚴格遵守 JSON Schema...                                   │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    Prompt 組裝器                                      │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   Step 1: 選擇角色模板                                       │  │   │
│   │   │   • Agent-Bull: bullish                                     │  │   │
│   │   │   • Agent-Bear: bearish                                     │  │   │
│   │   │   • Agent-CIO: synthesis                                    │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                              │                                        │   │
│   │                              ▼                                        │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   Step 2: 注入上下文                                        │  │   │
│   │   │   • 18 維度評分                                            │  │   │
│   │   │   • 技術指標                                                │  │   │
│   │   │   • 籌碼數據                                                │  │   │
│   │   │   • 宏觀 Regime                                            │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                              │                                        │   │
│   │                              ▼                                        │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   Step 3: 指定輸出格式                                      │  │   │
│   │   │   • JSON Schema                                            │  │   │
│   │   │   • 字數限制                                                │  │   │
│   │   │   • 強制欄位                                                │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                              │                                        │   │
│   │                              ▼                                        │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   Step 4: 添加約束                                          │  │   │
│   │   │   • Agent-Bear 必須獨立生成                                  │  │   │
│   │   │   • 每個論點需有數據支撐                                     │  │   │
│   │   │   • 不得遺漏空頭論證                                        │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    最終 Prompt 輸出                                   │   │
│   │                                                                      │   │
│   │   system_prompt + context_data + output_schema + constraints        │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 多代理人辯論流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    多代理人辯論流程                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    辯論初始化                                        │   │
│   │                                                                      │   │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│   │   │ Agent-Bull │  │ Agent-Bear │  │ Agent-CIO │                 │   │
│   │   │ 專門多頭  │  │ 專門空頭   │  │ 綜合判斷  │                 │   │
│   │   │            │  │ (強制)      │  │            │                 │   │
│   │   └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    第一輪辯論                                         │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────┐                                   │   │
│   │   │      Agent-Bull 論證        │                                   │   │
│   │   │   • 價值面支撐              │                                   │   │
│   │   │   • 動能強勁                │                                   │   │
│   │   │   • 機構青睞                │                                   │   │
│   │   └─────────────────────────────┘                                   │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────┐                                   │   │
│   │   │      Agent-Bear 論證        │                                   │   │
│   │   │   • 估值偏高                │                                   │   │
│   │   │   • 風險聚集                │                                   │   │
│   │   │   • 市場環境不利            │                                   │   │
│   │   └─────────────────────────────┘                                   │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    Agent-CIO 綜合                                     │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   1. 評估雙方論點強度                                        │  │   │
│   │   │   2. 計算信心度加權                                         │  │   │
│   │   │   3. 做出最終判斷                                           │  │   │
│   │   │   4. 生成 Part 2 決策結論                                   │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. 邊界條件定義 (Edge Cases)

### 5.1 Prompt 生成邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-T01** | 上下文數據缺失 > 50% | Prompt 不完整警告 | 標記 "Partial Context" |
| **EC-T02** | 某代理人回應為空 | 論證不完整 | 重試或使用預設 |
| **EC-T03** | Prompt 超過 Token 限制 | 截斷或壓縮 | 優先保留核心數據 |
| **EC-T04** | 多代理人結論衝突 | 衝突檢測 | Agent-CIO 仲裁 |
| **EC-T05** | 強制欄位缺失 | 驗證失敗 | 不生成報告 |
| **EC-T06** | JSON 解析失敗 | 回應格式錯誤 | 重試或降級 |

### 5.2 論證生成邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-T07** | Agent-Bear 無法生成論證 | 使用通用空頭模板 | 標記 "Generic Bear" |
| **EC-T08** | 論證缺乏數據支撐 | 標記 "Weak Argument" | 提示人工審核 |
| **EC-T09** | 論證過於相似 | 缺乏多元觀點 | 降低信心度 |
| **EC-T10** | 論證包含敏感內容 | 內容過濾 | 移除或遮蔽 |
| **EC-T11** | Agent-CIO 信心度 < 3 | 低信心警告 | 標記 "Low Confidence" |
| **EC-T12** | 辯論超時 ( > 60 秒) | 返回部分結果 | 標記 "Incomplete" |

### 5.3 報告渲染邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-T13** | Part 數據渲染失敗 | 該 Part 灰色顯示 | 提示重新生成 |
| **EC-T14** | 雷達圖數據異常 | 使用替代視圖 | 標記 "Data Issue" |
| **EC-T15** | 圖表渲染超時 | 使用文字描述 | 標記 "Simplified" |
| **EC-T16** | 報告過長 (> 5000 字) | 自動摘要 | 提供摘要版本 |
| **EC-T17** | PDF 轉換失敗 | 保留 HTML | 標記 "Format Issue" |
| **EC-T18** | 加密失敗 | 提示用戶 | 使用明文 |

---

## 6. Schema 完整化

### 6.1 決策報告模板資料表 `decision_templates`

```sql
-- ============================================================================
-- 決策報告模板資料表
-- 用途：存儲十五進制決策報告模板定義
-- ============================================================================

CREATE TABLE IF NOT EXISTS decision_templates (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name       VARCHAR(100) NOT NULL,           -- 模板名稱
    template_version    VARCHAR(20) NOT NULL,             -- 模板版本
    description         TEXT,                             -- 模板描述
    
    -- 模板結構
    template_structure JSONB NOT NULL,                   -- 模板結構 JSON
    
    -- Prompt 模板
    system_prompt       TEXT NOT NULL,                   -- 系統提示
    part_prompts        JSONB NOT NULL,                   -- 各 Part Prompt
    output_schema       JSONB NOT NULL,                  -- 輸出 JSON Schema
    
    -- 代理人配置
    agent_config        JSONB NOT NULL,                   -- 代理人配置
    
    -- 版本控制
    is_active          BOOLEAN DEFAULT TRUE,              -- 是否啟用
    is_default         BOOLEAN DEFAULT FALSE,             -- 是否預設
    previous_version   UUID,                             -- 上一版本 ID
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- AI 代理人回應資料表
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_responses (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id           UUID NOT NULL,                   -- 報告 ID
    agent_name          VARCHAR(50) NOT NULL,             -- 代理人名稱
    agent_role          VARCHAR(100),                      -- 代理人角色
    
    -- 回應內容
    raw_response        TEXT NOT NULL,                    -- 原始回應
    parsed_response     JSONB,                            -- 解析後回應
    
    -- 品質指標
    token_count         INTEGER,                          -- 使用 Token
    processing_time_ms  INTEGER,                          -- 處理時間
    confidence_score   DECIMAL(5,2),                    -- 信心分數
    
    -- 驗證狀態
    validation_status   VARCHAR(20) DEFAULT 'pending',   -- pending/valid/invalid
    validation_errors   TEXT[],                           -- 驗證錯誤
    
    -- 引用來源
    citations           JSONB,                            -- 引用來源
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 決策報告資料表
-- ============================================================================

CREATE TABLE IF NOT EXISTS decision_reports (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES auth.users(id),
    symbol              VARCHAR(20) NOT NULL,             -- 分析標的
    template_id         UUID NOT NULL REFERENCES decision_templates(id),
    
    -- 報告狀態
    status              VARCHAR(20) DEFAULT 'generating',   -- generating/completed/failed
    generation_progress DECIMAL(5,2) DEFAULT 0,           -- 生成進度 %
    
    -- 各 Part 內容
    parts_content       JSONB NOT NULL,                   -- 各 Part 內容
    
    -- 決策結論
    decision            VARCHAR(20),                     -- STRONG_BUY/BUY/NEUTRAL/WARNING/SELL
    confidence_score   DECIMAL(5,2),                    -- 信心分數
    target_price        DECIMAL(18,4),                   -- 目標價
    stop_loss_price    DECIMAL(18,4),                   -- 停損價
    
    -- AI 代理人摘要
    agent_summaries     JSONB,                            -- 代理人摘要
    
    -- 版本控制
    version             INTEGER DEFAULT 1,                -- 版本號
    is_latest          BOOLEAN DEFAULT TRUE,            -- 是否最新
    
    -- 審核
    requires_review    BOOLEAN DEFAULT FALSE,            -- 需要審核
    reviewed_by       UUID,                             -- 審核人
    reviewed_at       TIMESTAMP WITH TIME ZONE,          -- 審核時間
    
    -- 產出
    pdf_url            VARCHAR(500),                     -- PDF URL
    html_url           VARCHAR(500),                     -- HTML URL
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT dr_symbol_date_uniq UNIQUE (symbol, created_at)
);

-- COMMENT 註解
COMMENT ON TABLE decision_templates IS '決策報告模板表';
COMMENT ON TABLE agent_responses IS 'AI 代理人回應表';
COMMENT ON TABLE decision_reports IS '決策報告表';
COMMENT ON COLUMN decision_reports.decision IS '決策結論: STRONG_BUY/BUY/NEUTRAL/WARNING/SELL';
COMMENT ON COLUMN decision_reports.confidence_score IS '信心分數 1-10，10 為最高';
```

### 6.2 Prompt 變數定義資料表 `prompt_variables`

```sql
-- ============================================================================
-- Prompt 變數定義資料表
-- 用途：管理 Prompt 模板中的動態變數
-- ============================================================================

CREATE TABLE IF NOT EXISTS prompt_variables (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variable_name       VARCHAR(100) NOT NULL,           -- 變數名稱
    variable_type       VARCHAR(50) NOT NULL,             -- 變數類型
    description         TEXT,                             -- 變數描述
    
    -- 變數來源
    source_table        VARCHAR(100),                     -- 來源資料表
    source_column       VARCHAR(100),                     -- 來源欄位
    source_query        TEXT,                             -- 自訂查詢
    
    -- 格式化規則
    format_type         VARCHAR(50),                       -- 格式化類型
    format_pattern      VARCHAR(100),                     -- 格式化規則
    
    -- 預設值
    default_value       TEXT,                             -- 預設值
    is_required         BOOLEAN DEFAULT TRUE,             -- 是否必填
    
    -- 版本
    template_id         UUID REFERENCES decision_templates(id),
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Prompt 版本歷史表
-- ============================================================================

CREATE TABLE IF NOT EXISTS prompt_version_history (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id         UUID NOT NULL REFERENCES decision_templates(id),
    version             VARCHAR(20) NOT NULL,             -- 版本號
    
    -- 版本內容
    system_prompt       TEXT NOT NULL,                   -- 系統提示
    part_prompts        JSONB NOT NULL,                   -- 各 Part Prompt
    
    -- 版本元數據
    change_description  TEXT,                             -- 變更說明
    changed_by          UUID,                             -- 變更者
    change_type         VARCHAR(50),                       -- 變更類型
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- COMMENT 註解
COMMENT ON TABLE prompt_variables IS 'Prompt 變數定義表';
COMMENT ON TABLE prompt_version_history IS 'Prompt 版本歷史表';
```

---

## 7. 硬體/環境關聯 (QNAP TS-h973AX)

### 7.1 資源需求對照表

| 流程階段 | CPU | RAM | Storage | 配置重點 |
|----------|-----|-----|---------|----------|
| **Prompt 組裝** | 2 核心 | 4 GB | SSD 20 GB | 字串處理 |
| **AI API 調用** | 1 核心 | 2 GB | SSD 10 GB | 網路 I/O |
| **報告渲染** | 4 核心 | 8 GB | SSD 50 GB | PDF 生成 |
| **模板管理** | 2 核心 | 4 GB | SSD 30 GB | 資料庫 |

### 7.2 ZFS 儲存配置

```bash
#!/bin/bash
# ============================================================================
# 決策模板 ZFS 配置
# ============================================================================

# 創建報告模板 Dataset
zfs create quant_pool/templates
zfs set compression=lz4 quant_pool/templates
zfs set atime=off quant_pool/templates
zfs set quota=30G quant_pool/templates

# 創建生成報告 Dataset
zfs create quant_pool/reports
zfs set compression=zstd quant_pool/reports
zfs set quota=200G quant_pool/reports

# 創建 Prompt 快取 Dataset
zfs create quant_pool/prompt_cache
zfs set compression=lz4 quant_pool/prompt_cache
zfs set atime=off quant_pool/prompt_cache
zfs set quota=20G quant_pool/prompt_cache
```

---

## 8. 開發者備註 (Developer Notes)

### ⚠️ 技術陷阱警示

#### TT-T01: Prompt 注入攻擊
```python
# 問題：用户输入可能包含惡意 Prompt 注入
# 
# 解決方案：
# 1. 輸入驗證與清理
# 2. 使用结构化输出
# 3. 實施 Prompt 隔離

class PromptSecurity:
    def sanitize_input(self, user_input: str) -> str:
        # 移除潜在惡意模式
        dangerous_patterns = [
            r"ignore previous instructions",
            r"system prompt",
            r"you are now",
            r"developer mode"
        ]
        
        for pattern in dangerous_patterns:
            user_input = re.sub(pattern, "[REDACTED]", user_input, flags=re.IGNORECASE)
        
        return user_input
    
    def build_prompt(self, template: str, context: dict, user_input: str) -> str:
        # 分離系統指令與用户輸入
        sanitized_input = self.sanitize_input(user_input)
        
        return template.format(**context, user_input=sanitized_input)
```

#### TT-T02: Token 限額管理
```python
# 問題：Prompt 超過模型 Token 限制
# 
# 解決方案：
# 1. 計算並優化 Prompt 長度
# 2. 實施智能截斷策略
# 3. 使用壓縮格式

class TokenManager:
    MODEL_LIMITS = {
        'gpt-4o': {'max_tokens': 128000, 'reserved': 4000},
        'claude-3-5-sonnet': {'max_tokens': 200000, 'reserved': 5000},
        'gemini-2-0-flash': {'max_tokens': 1000000, 'reserved': 2000}
    }
    
    def optimize_prompt(self, prompt: str, model: str) -> str:
        limit = self.MODEL_LIMITS[model]['max_tokens']
        reserved = self.MODEL_LIMITS[model]['reserved']
        available = limit - reserved
        
        # 計算當前 Token 數
        current_tokens = self.count_tokens(prompt)
        
        if current_tokens <= available:
            return prompt
        
        # 智能截斷策略
        return self.smart_truncate(prompt, available)
```

#### TT-T03: JSON Schema 驗證
```python
# 問題：AI 生成 JSON 可能不完全符合 Schema
# 
# 解決方案：
# 1. 使用 Pydantic 驗證
# 2. 實施容錯解析
# 3. 重試機制

from pydantic import BaseModel, ValidationError

class DecisionReport(BaseModel):
    part_9_bull_case: List[Argument]
    part_10_bear_case: List[Argument]
    part_2_decision: Decision
    confidence: float
    
    @validator('confidence')
    def validate_confidence(cls, v):
        if not 0 <= v <= 10:
            raise ValueError('Confidence must be between 0 and 10')
        return v

class ReportGenerator:
    def parse_response(self, raw_response: str) -> DecisionReport:
        try:
            # 嘗試解析 JSON
            data = json.loads(raw_response)
            return DecisionReport(**data)
        except (json.JSONDecodeError, ValidationError) as e:
            # 重試或使用容錯解析
            return self.retry_parse(raw_response)
```

### 📝 開發建議

#### DEV-T01: Prompt 模板版本管理
```typescript
// 建議：實施 Prompt 模板的版本控制
// 
// 版本策略：
// 1. 每個模板有版本號
// 2. 保留歷史版本
// 3. 支援回滾

interface PromptTemplate {
    id: string;
    name: string;
    version: string;
    parts: TemplatePart[];
    agents: AgentConfig[];
    schema: JSONSchema;
}

class TemplateVersionManager {
    async createVersion(template: PromptTemplate): Promise<PromptVersion> {
        // 驗證模板
        await this.validateTemplate(template);
        
        // 建立版本
        const version = {
            ...template,
            version: this.generateVersionNumber(),
            createdAt: new Date(),
            previousVersion: template.id
        };
        
        // 存儲版本
        await this.saveVersion(version);
        
        return version;
    }
    
    async rollbackTo(versionId: string): Promise<void> {
        const version = await this.getVersion(versionId);
        await this.deployVersion(version);
    }
}
```

#### DEV-T02: 多代理人協調
```python
# 建議：實現多代理人的協調執行
# 
# 協調策略：
# 1. 並行執行 Agent-Bull 和 Agent-Bear
# 2. 順序執行 Agent-CIO
# 3. 實施超時控制

import asyncio
from concurrent.futures import ThreadPoolExecutor

class MultiAgentCoordinator:
    def __init__(self):
        self.agents = {
            'bull': AgentBull(),
            'bear': AgentBear(),
            'cio': AgentCIO()
        }
    
    async def run_debate(self, context: dict) -> DebateResult:
        # 並行執行 Bull 和 Bear
        with ThreadPoolExecutor(max_workers=2) as executor:
            bull_future = executor.submit(self.agents['bull'].run, context)
            bear_future = executor.submit(self.agents['bear'].run, context)
            
            bull_result = await asyncio.wrap_future(bull_future)
            bear_result = await asyncio.wrap_future(bear_future)
        
        # CIO 綜合判斷
        cio_context = {**context, 'bull': bull_result, 'bear': bear_result}
        cio_result = await self.agents['cio'].run(cio_context)
        
        return DebateResult(
            bull=bull_result,
            bear=bear_result,
            cio=cio_result
        )
```

#### DEV-T03: 報告生成效能優化
```python
# 建議：實施報告生成的並行處理
# 
// 優化策略：
// 1. 各 Part 獨立生成
// 2. 依賴部分先行
// 3. 結果緩存

class ReportGenerator:
    PART_DEPENDENCIES = {
        'part_1': ['part_2'],
        'part_2': ['part_9', 'part_10'],
        'part_3': [],  # 獨立
        'part_4': [],  # 獨立
        'part_5': [],  # 獨立
        'part_6': [],  # 獨立
        'part_7': [],
        'part_8': [],
        'part_9': [],
        'part_10': [],
        'part_11': ['part_2', 'part_6'],
        'part_12': ['part_2'],
        'part_13': ['part_2', 'part_8'],
        'part_14': [],
        'part_15': ['part_2', 'part_14']
    }
    
    async def generate_report(self, symbol: str) -> DecisionReport:
        # Topological sort 確定生成順序
        generation_order = self.topological_sort(self.PART_DEPENDENCIES)
        
        # 並行生成獨立 Part
        tasks = {}
        for part_name in generation_order:
            if not self.PART_DEPENDENCIES[part_name]:
                tasks[part_name] = self.generate_part(part_name, symbol)
        
        # 依賴完成後生成相依 Part
        for part_name in generation_order:
            if part_name in tasks:
                continue
            
            await self.wait_for_dependencies(tasks, self.PART_DEPENDENCIES[part_name])
            tasks[part_name] = self.generate_part(part_name, symbol)
        
        # 收集結果
        return {part: await task for part, task in tasks.items()}
```

#### DEV-T04: Prompt 測試框架
```python
# 建議：建立 Prompt 測試框架
// 
// 測試維度：
// 1. 格式正確性
// 2. 論證品質
// 3. 一致性檢查
// 4. 邊界條件

class PromptTester:
    TEST_CASES = [
        {'name': 'normal_case', 'symbol': '2330.TW'},
        {'name': 'low_confidence', 'symbol': 'low_confidence_stock'},
        {'name': 'bear_market', 'symbol': 'bear_market_stock'},
        {'name': 'edge_case', 'symbol': 'thinly_traded_stock'}
    ]
    
    async def run_tests(self, template: PromptTemplate) -> TestResult:
        results = []
        
        for test_case in self.TEST_CASES:
            result = await self.run_single_test(template, test_case)
            results.append(result)
        
        return TestResult(
            total=len(results),
            passed=sum(1 for r in results if r.passed),
            failed=sum(1 for r in results if not r.passed),
            details=results
        )
```

---

## 9. 關聯文件索引

| 文件 | 說明 | 交互關係 |
|------|------|----------|
| [00_Full_Reconstruction_TOC.md](00_Full_Reconstruction_TOC.md) | 完整檔案結構索引 | 模板位置 |
| [05_Quant_Theory_and_Calculations.md](05_Quant_Theory_and_Calculations.md) | 量化理論 | 因子評分 |
| [09_Core_Module_Level_3_Decision.md](09_Core_Module_Level_3_Decision.md) | AI 決策輔助 | 策略建議 |
| [12_Daily_Strategy_Report_Spec.md](12_Daily_Strategy_Report_Spec.md) | 每日報告 | 報告整合 |

---

> **文件版本**：v1.0.1 (細節顯性化擴張)
> **關聯文件**：[00_Full_Reconstruction_TOC](00_Full_Reconstruction_TOC.md)
> **維護責任**：系統架構師 / AI 工程師
> **最後更新**：2026-02-10

