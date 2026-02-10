# V10.0 前端深度分析與調研補缺計畫 (Frontend Gap Detailed Plan)

> **文件版本**：v1.0 (V10.0 完整規格書重構)
> **日期**：2026-02-10
> **核心使命：** 基於 `detailed_v9.3` 的 Level 2-4 規格，對比 V10.0 的 18 維度評分、演化策略視覺化與專業法人模型，識別組件缺口並定義具體實作路徑

---

## 1. 審計目標 (Audit Objective)

基於 V10.0 完整規格書的雙核心 AI 架構、18 維度評分與演化策略遺傳演算法，對比現有組件實作，識別「深度分析」與「調研」領域的組件缺口，並定義 Phase 10 的具體實作路徑。

---

## 2. V10.0 組件審計結果

| 規格編號 | 模組名稱 | V10.0 核心功能 | 現有開發狀態 | V10.0 補缺動作 |
|:---|:---|:---|:---|:---|
| **MOD-T** | House View | 130+ 宏觀指標、18 維度評分、多代理人辯論 | 🟡 基礎版本 | **強化 `HouseView.tsx`** - 整合 18 維度雷達圖 |
| **MOD-M** | 深度分析 | 18 維度評分、Barra/Brinson 模型 | ❌ 缺失 | **新建 `DeepDiveV10.tsx`** |
| **MOD-S** | 籌碼戰情室 | 11 家 13F 機構持倉追蹤 | 🟡 基礎版本 | **強化 `ChipAnalysis.tsx`** |
| **MOD-R** | 技術分析中心 | MA 排列、RSI、ADX、Greeks | 🟡 基礎版本 | **新建 `TechnicalAnalysis.tsx`** |
| **MOD-D** | AI 決策指示燈 | CIO 核心論點、多級買賣燈號、演化策略 | ❌ 缺失 | **新建 `DecisionAssistant.tsx`** |
| **MOD-O** | 壓力測試面板 | 2008/2020 情境模擬、VaR 95%、Barra 模型 | ❌ 缺失 | **新建 `StressTestV10.tsx`** |
| **MOD-Z** | RAG 透明監控 | 對話上下文面板、9GB 語義向量索引 | ❌ 缺失 | **重構 `ChatAdvisor.tsx`** |
| **MOD-P** | Greeks 監控 | Delta、Gamma、Vega、Theta、Rho | ❌ 缺失 | **新建 `GreeksMonitor.tsx`** |
| **MOD-AC** | 行為金融教練 | 認知偏誤偵測、執行偏差分析 | 🟡 基礎版本 | **強化 `PsychologyHub.tsx`** |
| **MOD-X** | 投資目標追蹤 | 目標進度、成功機率、演化策略配置 | 🟡 基礎版本 | **強化 `GoalTracker.tsx`** |

---

## 3. V10.0 三大戰術工作站開發計畫

### 3.1 量化技術站 (Quant-Tech Station)

| 組件 | V10.0 強化內容 |
|------|----------------|
| **TechnicalAnalysis.tsx** | MA 排列、RSI 霓虹感應、ADX 趨勢強度儀表 |
| **GreeksMonitor.tsx** | Greeks Risk Matrix (Delta, Gamma, Vega, Theta, Rho) |
| **FactorRadarChart.tsx** | 18 維度雷達圖 (擴充自 6 因子) |

### 3.2 行為審計站 (Behavioral Audit Station)

| 組件 | V10.0 強化內容 |
|------|----------------|
| **PsychologyHub.tsx** (整合 AC, AG, AN) | 偏差熱圖 (Deviation Heatmap)、情緒時間軸 |
| **GoalTracker.tsx** | 目標進度、成功機率、演化策略配置顯示 |

### 3.3 AI 戰略站 (AI Strategy Station)

| 組件 | V10.0 強化內容 |
|------|----------------|
| **DecisionAssistant.tsx** | CIO 核心論點、多級買賣燈號 |
| **ChatAdvisor.tsx** (RAG Context) | 對話上下文面板、9GB 語義向量索引引用 |
| **EvolutionVisualizer.tsx** | 演化策略基因組視覺化、26 基因圖表 |

---

## 4. API 對接預規劃 (V10.0)

| 組件 | 核心 API 端點 | 數據結構要點 |
|:---|:---|:---|
| **18維度評分** | `GET /api/v1/analysis/18factor-scores` | 返回 18 維度分數、演化 regime |
| **演化策略** | `GET /api/v1/evolution/genomes` | 返回 26 基因組成的染色體 |
| **13F 機構** | `GET /api/v1/institutions/13f` | 返回 11 家機構持倉變化 |
| **Greeks** | `GET /api/v1/professional/greeks` | 返回權利金敏感度矩陣 |
| **Barra 模型** | `GET /api/v1/analysis/barra-risk` | 返回因子曝險分解 |

---

## 5. 開發守則 (V10.0)

> [!IMPORTANT]
> **V10.0 開發守則**：
> 1. 保留 Carbon Dark 質感，禁止過度花哨
> 2. 數據 Mock 必須符合真實金融邏輯 (例如：Greeks 數值範圍)
> 3. 所有組件必須具備響應式，在側邊欄收合時依然可用
> 4. 18 維度評分必須有對應的計算公式說明
> 5. 演化策略基因組必須有圖表視覺化
> 6. 9GB 語義向量索引必須有載入狀態指示

---

## 7. 邏輯拆解 (Logic Breakdown)

### 7.1 前端組件審計流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    前端組件審計流程                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    V10.0 規格分析                                    │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   1. 分析 V10.0 完整規格書                                   │  │   │
│   │   │   • 18 維度評分系統                                           │  │   │
│   │   │   • 演化策略遺傳演算法                                        │  │   │
│   │   │   • Barra 風險因子模型                                        │  │   │
│   │   │   • Brinson 績效歸因                                          │  │   │
│   │   │   • 130+ 宏觀指標                                            │  │   │
│   │   │   • 11 家 13F 機構持倉                                        │  │   │
│   │   │   • RAG 語義向量索引                                          │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                              │                                     │
│   │                              ▼                                     │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   2. 比對現有組件                                            │  │   │
│   │   │   • 識別現有組件                                             │  │   │
│   │   │   • 評估功能覆蓋率                                           │  │   │
│   │   │   • 識別功能缺口                                              │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                              │                                     │
│   │                              ▼                                     │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   3. 制定補缺計畫                                            │  │   │
│   │   │   • 優先級排序                                                │  │   │
│   │   │   • 實作路徑定義                                             │  │   │
│   │   │   • 資源評估                                                 │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 量化技術站組件流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    量化技術站組件流程                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    TechnicalAnalysis.tsx                            │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   MA 排列模組                                                │  │   │
│   │   │   • MA5, MA20, MA60, MA120                                 │  │   │
│   │   │   • 排列狀態判斷 (多頭/空頭/盤整)                             │  │   │
│   │   │   • 趨勢方向指示器                                           │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                              │                                     │
│   │                              ▼                                     │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   RSI 霓虹感應模組                                          │  │   │
│   │   │   • RSI-14 數值                                             │  │   │
│   │   │   • 霓虹色漸變 (Overbought/Oversold/Neutral)               │  │   │
│   │   │   • 背離偵測                                               │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                              │                                     │
│   │                              ▼                                     │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   ADX 趨勢強度儀表                                          │  │   │
│   │   │   • ADX-14 值                                              │  │   │
│   │   │   • +DI / -DI 方向                                        │  │   │
│   │   │   • 趨勢強度儀表盤                                         │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    GreeksMonitor.tsx                                 │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   Greeks 曝險矩陣                                            │  │   │
│   │   │   • Delta (Δ) 價格敏感度                                   │  │   │
│   │   │   • Gamma (Γ) Delta 變化率                                 │  │   │
│   │   │   • Vega (ν) 波動率敏感度                                   │  │   │
│   │   │   • Theta (Θ) 時間衰減                                      │  │   │
│   │   │   • Rho (ρ) 利率敏感度                                     │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                              │                                     │
│   │                              ▼                                     │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   風險警示系統                                              │  │   │
│   │   │   • 曝險閾值設定                                           │  │   │
│   │   │   • 彩色警示標記                                           │  │   │
│   │   │   • 對沖建議                                                │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.3 AI 戰略站組件流程

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AI 戰略站組件流程                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    DecisionAssistant.tsx                              │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   CIO 核心論點模組                                          │  │   │
│   │   │   • 多代理人辯論結果                                         │  │   │
│   │   │   • 論點強度圖示                                            │  │   │
│   │   │   • 信心度評分                                              │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                              │                                     │
│   │                              ▼                                     │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   多級買賣燈號                                              │  │   │
│   │   │   • STRONG_BUY / BUY / NEUTRAL / WARNING / SELL           │  │   │
│   │   │   • 燈號歷史趨勢                                           │  │   │
│   │   │   • 信心度星級                                              │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                     │
│                                      ▼                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    EvolutionVisualizer.tsx                            │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   演化策略基因組視覺化                                      │  │   │
│   │   │   • 26 基因圖表展示                                        │  │   │
│   │   │   • 適應度歷史曲線                                         │  │   │
│   │   │   • 族群多樣性指標                                         │  │   │
│   │   │   • 演化進度指示器                                         │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                              │                                     │
│   │                              ▼                                     │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │   帕累托最優前端                                          │  │   │
│   │   │   • 多目標優化可視化                                       │  │   │
│   │   │   • 前端選擇器                                             │  │   │
│   │   │   • 權重配置編輯器                                         │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. 邊界條件定義 (Edge Cases)

### 8.1 組件開發邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-FE01** | 組件數據 Mock 不完整 | 顯示載入中 | 使用骨架屏 |
| **EC-FE02** | API 響應格式不符 | 控制台錯誤 | 記錄錯誤 |
| **EC-FE03** | 大量數據渲染 | 頁面卡頓 | 實施虛擬滾動 |
| **EC-FE04** | 側邊欄收合 | 組件佈局異常 | 測試響應式 |
| **EC-FE05** | 18 維度數據缺失 | 雷達圖不完整 | 標記缺失維度 |
| **EC-FE06** | 演化策略未初始化 | 視覺化空白 | 顯示初始化提示 |

### 8.2 數據處理邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-FE07** | Greeks 數值異常 | 顯示警告 | 標記數據異常 |
| **EC-FE08** | 歷史數據過長 | 記憶體問題 | 分頁載入 |
| **EC-FE09** | 實時數據斷流 | 顯示中斷 | 嘗試重連 |
| **EC-FE10** | 多語言支援缺失 | 回退英文 | 顯示原文 |
| **EC-FE11** | 響應式斷點衝突 | 佈局錯亂 | 測試所有斷點 |
| **EC-FE12** | 動畫效能問題 | 幀率下降 | 禁用動畫 |

### 8.3 用戶體驗邊界條件

| 情境 | 觸發條件 | 系統行為 | 處理方式 |
|------|----------|----------|----------|
| **EC-FE13** | 首次載入過慢 | 用戶流失 | 實施載入優化 |
| **EC-FE14** | 複雜操作未保存 | 數據丢失 | 實施自動保存 |
| **EC-FE15** | 權限不足操作 | 顯示錯誤 | 提示權限不足 |
| **EC-FE16** | 大量通知干擾 | 用戶困擾 | 實施通知整合 |
| **EC-FE17** | 深色模式閃爍 | 視覺不適 | 平滑過渡 |
| **EC-FE18** | 行動裝置體驗差 | 使用困難 | 實施響應式設計 |

---

## 9. Schema 完整化

### 9.1 前端組件配置資料表 `frontend_components`

```sql
-- ============================================================================
-- 前端組件配置資料表
-- 用途：追蹤和管理前端組件配置
-- ============================================================================

CREATE TABLE IF NOT EXISTS frontend_components (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component_name      VARCHAR(100) NOT NULL,           -- 組件名稱
    component_type      VARCHAR(50) NOT NULL,             -- 組件類型
    module_category    VARCHAR(50) NOT NULL,            -- 模組分類
    
    -- V10.0 關聯
    v10_feature        VARCHAR(100),                      -- V10.0 功能
    related_modules    VARCHAR(100)[],                    -- 關聯模組
    
    -- 組件資訊
    file_path          VARCHAR(500) NOT NULL,           -- 檔案路徑
    component_version  VARCHAR(20) NOT NULL,             -- 組件版本
    dependencies       VARCHAR(200)[],                     -- 依賴組件
    
    -- 開發狀態
    development_status VARCHAR(20) NOT NULL,           -- planned/in_progress/testing/completed/deprecated
    priority           INTEGER DEFAULT 5,                  -- 優先級 1-5
    estimated_hours    DECIMAL(8,2),                      -- 估計工時
    
    -- 功能覆蓋
    features_implemented VARCHAR(200)[],                  -- 已實作功能
    features_planned   VARCHAR(200)[],                    -- 計劃功能
    features_missing   VARCHAR(200)[],                     -- 缺失功能
    
    -- API 關聯
    api_endpoints     VARCHAR(200)[],                     -- 關聯 API
    data_structures   VARCHAR(200)[],                     -- 數據結構
    
    -- 測試狀態
    unit_tests_status VARCHAR(20) DEFAULT 'pending',    -- pending/passed/failed
    e2e_tests_status  VARCHAR(20) DEFAULT 'pending',     -- pending/passed/failed
    
    -- 日期
    started_at        TIMESTAMP WITH TIME ZONE,           -- 開始日期
    completed_at       TIMESTAMP WITH TIME ZONE,           -- 完成日期
    deployed_at       TIMESTAMP WITH TIME ZONE,           -- 部署日期
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fc_name_uniq UNIQUE (component_name)
);

-- ============================================================================
-- 組件缺口記錄資料表
-- ============================================================================

CREATE TABLE IF NOT EXISTS component_gaps (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component_id        UUID REFERENCES frontend_components(id),
    gap_description    TEXT NOT NULL,                      -- 缺口描述
    
    -- 缺口分類
    gap_type           VARCHAR(50) NOT NULL,             -- feature/performance/ui/integration
    severity           VARCHAR(20) NOT NULL,             -- critical/high/medium/low
    
    -- V10.0 對應
    v10_requirement    TEXT,                              -- V10.0 需求描述
    related_factor      VARCHAR(100),                      -- 關聯因子
    related_api         VARCHAR(200),                      -- 關聯 API
    
    -- 處理狀態
    status             VARCHAR(20) DEFAULT 'open',       -- open/in_progress/resolved/accepted
    resolution         TEXT,                               -- 解決方案
    resolution_type    VARCHAR(50),                       -- implement/defer/wontfix
    
    -- 工時預估
    estimated_hours    DECIMAL(8,2),                      -- 估計工時
    actual_hours       DECIMAL(8,2),                      -- 實際工時
    
    -- 負責人
    assignee          VARCHAR(100),                        -- 指派給
    due_date          DATE,                               -- 截止日期
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 組件測試覆蓋率資料表
-- ============================================================================

CREATE TABLE IF NOT EXISTS component_test_coverage (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component_id        UUID REFERENCES frontend_components(id),
    test_type           VARCHAR(50) NOT NULL,             -- unit/integration/e2e
    
    -- 覆蓋率
    coverage_percent   DECIMAL(5,2) NOT NULL,            -- 覆蓋率 %
    lines_covered      INTEGER,                          -- 覆蓋行數
    lines_total         INTEGER,                          -- 總行數
    
    -- 測試狀態
    tests_passed       INTEGER DEFAULT 0,                  -- 通過測試
    tests_failed       INTEGER DEFAULT 0,                  -- 失敗測試
    tests_skipped      INTEGER DEFAULT 0,                  -- 跳過測試
    
    -- 測試日期
    test_date         DATE NOT NULL,                      -- 測試日期
    
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- COMMENT 註解
COMMENT ON TABLE frontend_components IS '前端組件配置表';
COMMENT ON TABLE component_gaps IS '組件缺口記錄表';
COMMENT ON TABLE component_test_coverage IS '組件測試覆蓋率表';
COMMENT ON COLUMN frontend_components.development_status IS '開發狀態: planned/in_progress/testing/completed/deprecated';
COMMENT ON COLUMN component_gaps.severity IS '嚴重程度: critical/high/medium/low';
```

---

## 10. 硬體/環境關聯 (QNAP TS-h973AX)

### 10.1 前端開發資源配置

```yaml
# ============================================================================
# 前端開發 Docker Compose
# ============================================================================

services:
  nextjs-dev:
    image: node:20-alpine
    container_name: frontend-dev
    working_dir: /app
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
    volumes:
      - /share/quant_pool/frontend:/app:rw
      - /share/quant_pool/node_modules:/app/node_modules:rw
    ports:
      - "3000:3000"
    command: >
      sh -c "npm run dev"
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 8G

  storybook:
    image: node:20-alpine
    container_name: storybook
    working_dir: /app
    environment:
      - NODE_ENV=development
    volumes:
      - /share/quant_pool/frontend:/app:rw
      - /share/quant_pool/node_modules:/app/node_modules:rw
    ports:
      - "6006:6006"
    command: >
      sh -c "npm run storybook"
    restart: unless-stopped
```

### 10.2 ZFS 儲存配置

```bash
#!/bin/bash
# ============================================================================
# 前端開發 ZFS 配置
# ============================================================================

# 創建前端專案 Dataset
zfs create quant_pool/frontend
zfs set compression=lz4 quant_pool/frontend
zfs set atime=off quant_pool/frontend

# 創建組件庫 Dataset
zfs create quant_pool/frontend/components
zfs set compression=lz4 quant_pool/frontend/components
zfs set quota=50G quant_pool/frontend/components

# 創建測試報告 Dataset
zfs create quant_pool/frontend/test-reports
zfs set compression=lz4 quant_pool/frontend/test-reports
zfs set quota=30G quant_pool/frontend/test-reports

# 創建構建快取 Dataset
zfs create quant_pool/frontend/build-cache
zfs set compression=zstd quant_pool/frontend/build-cache
zfs set atime=off quant_pool/frontend/build-cache
```

---

## 11. 開發者備註 (Developer Notes)

### ⚠️ 技術陷阱警示

#### TT-FE01: 18 維度雷達圖效能
```typescript
// 問題：18 維度雷達圖渲染效能瓶頸
// 
// 解決方案：
// 1. 使用 Canvas 而非 SVG
// 2. 數據採樣
// 3. 漸進式渲染

import { useMemo } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

function FactorRadarChart({ factors }: { factors: Factor[] }) {
    // 使用 Canvas 渲染
    const chartData = useMemo(() => {
        return {
            labels: factors.map(f => f.name),
            datasets: [{
                data: factors.map(f => f.score),
                backgroundColor: 'rgba(0, 200, 150, 0.2)',
                borderColor: 'rgba(0, 200, 150, 1)',
                pointBackgroundColor: 'rgba(0, 200, 150, 1)',
            }]
        };
    }, [factors]);
    
    return (
        <Radar 
            data={chartData}
            options={{
                responsive: true,
                animation: {
                    duration: 500 // 減少動畫時間
                },
                scales: {
                    r: {
                        min: -3,
                        max: 3,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }}
        />
    );
}
```

#### TT-FE02: 實時數據同步
```typescript
// 問題：大量實時數據導致 React 重渲染
// 
// 解決方案：
// 1. 使用 WebSocket 管理
// 2. 實施狀態批處理
// 3. 使用 React.memo

import { useEffect, useRef, useState } from 'react';

function useRealTimeData<T>(
    endpoint: string,
    updateInterval: number = 1000
): T | null {
    const [data, setData] = useState<T | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    
    useEffect(() => {
        const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}${endpoint}`);
        wsRef.current = ws;
        
        ws.onmessage = (event) => {
            const update = JSON.parse(event.data);
            // 使用函數式更新避免頻繁渲染
            setData(prev => updateData(prev, update));
        };
        
        return () => {
            ws.close();
        };
    }, [endpoint]);
    
    return data;
}
```

#### TT-FE03: 演化策略視覺化記憶體
```typescript
// 問題：演化歷史視覺化記憶體使用過高
// 
// 解決方案：
// 1. 數據降採樣
// 2. 虛擬化渲染
// 3. 分塊載入

function EvolutionChart({ evolutionId }: { evolutionId: string }) {
    const [data, setData] = useState<EvolutionData[]>([]);
    
    useEffect(() => {
        // 分塊載入歷史數據
        const loadData = async () => {
            const chunks = await fetchEvolutionHistory(evolutionId, {
                chunkSize: 1000,
                totalChunks: 100
            });
            
            // 初始載入第一塊
            const firstChunk = await chunks[0];
            setData(firstChunk);
        };
        
        loadData();
    }, [evolutionId]);
    
    return (
        <div className="evolution-chart">
            <ResponsiveContainer>
                <LineChart data={data}>
                    <Line 
                        type="monotone" 
                        dataKey="fitness" 
                        stroke="#00C896"
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
```

### 📝 開發建議

#### DEV-FE01: 組件開發規範
```typescript
// 建議：實施一致的組件開發規範
// 
// 規範要點：
// 1. 使用 TypeScript
// 2. 遵循原子設計
// 3. 實施 Storybook 文檔

// 組件模板
interface ComponentProps {
    // 必要屬性
    data: DataType;
    // 可選屬性
    variant?: 'default' | 'compact' | 'detailed';
    height?: number;
    onEvent?: (event: EventType) => void;
}

// 組件結構
export function ComponentName({ 
    data, 
    variant = 'default',
    height = 400,
    onEvent 
}: ComponentProps) {
    // 1. 計算
    const computed = useMemo(() => {
        return transform(data);
    }, [data]);
    
    // 2. 渲染
    return (
        <div style={{ height }}>
            {/* 渲染邏輯 */}
        </div>
    );
}

// Storybook
export default {
    title: 'Components/ModuleName',
    component: ComponentName,
    argTypes: {
        variant: { control: 'select', options: ['default', 'compact', 'detailed'] }
    }
};

export const Default = {
    args: {
        data: mockData,
        variant: 'default'
    }
};
```

#### DEV-FE02: 響應式設計策略
```typescript
// 建議：實施一致的響應式設計策略
// 
// 斷點規範：
// - xs: 0-639px (手機)
// - sm: 640-767px (大手机)
// - md: 768-1023px (平板)
// - lg: 1024-1279px (桌面)
// - xl: 1280px+ (大桌面)

// 使用 Tailwind CSS 斷點
function ResponsiveComponent() {
    return (
        <div className="
            grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 
            md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6
        ">
            {/* 根據斷點調整列數 */}
        </div>
    );
}

// 自定義 Hook
function useBreakpoint() {
    const [breakpoint, setBreakpoint] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('xl');
    
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 640) setBreakpoint('xs');
            else if (width < 768) setBreakpoint('sm');
            else if (width < 1024) setBreakpoint('md');
            else if (width < 1280) setBreakpoint('lg');
            else setBreakpoint('xl');
        };
        
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    return breakpoint;
}
```

#### DEV-FE03: 效能優化策略
```typescript
// 建議：實施系統化的效能優化
// 
// 優化策略：
// 1. Code Splitting
// 2. Lazy Loading
// 3. Memoization
// 4. Virtual Scrolling

// 1. Code Splitting
const TechnicalAnalysis = lazy(() => import('./components/TechnicalAnalysis'));
const GreeksMonitor = lazy(() => import('./components/GreeksMonitor'));
const FactorRadar = lazy(() => import('./components/FactorRadar'));

// 2. 漸進式載入
function QuantStation() {
    return (
        <Suspense fallback={<LoadingSkeleton />}>
            <Switch>
                <Route path="/technical" component={TechnicalAnalysis} />
                <Route path="/greeks" component={GreeksMonitor} />
                <Route path="/factors" component={FactorRadar} />
            </Switch>
        </Suspense>
    );
}

// 3. Memoization
const MemoizedChart = memo(function MemoizedChart({ 
    data, 
    config 
}: ChartProps) {
    return <Chart data={data} config={config} />;
});

// 4. 虛擬滾動
function DataTable({ data }: { data: Data[] }) {
    const rowVirtualizer = useVirtualizer({
        count: data.length,
        getScrollElement: () => tableRef.current,
        estimateSize: () => 48,
        overscan: 10,
    });
    
    return (
        <div ref={tableRef} style={{ height: '600px', overflow: 'auto' }}>
            <div style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
                {rowVirtualizer.getVirtualItems().map((virtualRow) => (
                    <TableRow
                        key={virtualRow.key}
                        data={data[virtualRow.index]}
                        style={{
                            position: 'absolute',
                            top: 0,
                            height: `${virtualRow.size}px`,
                            transform: `translateY(${virtualRow.start}px)`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
```

#### DEV-FE04: 測試策略
```typescript
// 建議：實施全面的前端測試策略
// 
// 測試金字塔：
// - Unit: 60%
// - Integration: 30%
// - E2E: 10%

// Unit Test 範例
describe('FactorRadarChart', () => {
    it('should render 18 factors correctly', () => {
        render(<FactorRadarChart factors={mockFactors} />);
        
        // 檢查所有維度標籤存在
        mockFactors.forEach(factor => {
            expect(screen.getByText(factor.name)).toBeInTheDocument();
        });
    });
    
    it('should handle missing factor gracefully', () => {
        const factorsWithMissing = [...mockFactors];
        factorsWithMissing[0] = { ...factorsWithMissing[0], score: null };
        
        render(<FactorRadarChart factors={factorsWithMissing} />);
        
        // 檢查缺失維度有標記
        expect(screen.getByText(/missing/i)).toBeInTheDocument();
    });
});

// Integration Test 範例
describe('QuantTech Station', () => {
    it('should navigate between components', async () => {
        render(<QuantStation />);
        
        userEvent.click(screen.getByText(/technical analysis/i));
        await waitFor(() => {
            expect(screen.getByTestId('technical-chart')).toBeInTheDocument();
        });
    });
});

// E2E Test 範例
describe('Full Trading Flow', () => {
    it('should execute buy order successfully', async () => {
        await page.goto('/dashboard');
        
        await page.click('[data-testid="buy-button"]');
        await page.fill('[data-testid="quantity-input"]', '100');
        await page.click('[data-testid="confirm-order"]');
        
        await waitFor(() => {
            expect(page.locator('.order-success')).toBeVisible();
        });
    });
});
```

---

## 12. 關聯文件索引

| 文件 | 說明 | 交互關係 |
|------|------|----------|
| [00_Full_Reconstruction_TOC.md](00_Full_Reconstruction_TOC.md) | 完整檔案結構索引 | 前端位置 |
| [08_Core_Module_Level_2_Analysis.md](08_Core_Module_Level_2_Analysis.md) | 深度分析模組 | 組件規格 |
| [09_Core_Module_Level_3_Decision.md](09_Core_Module_Level_3_Decision.md) | AI 決策輔助 | 組件規格 |
| [10_Core_Module_Level_4_Growth.md](10_Core_Module_Level_4_Growth.md) | 行為金融 | 組件規格 |
| [11_Decision_Templates_Spec.md](11_Decision_Templates_Spec.md) | 決策模板 | AI 提示 |

---

## 完成進度追蹤

| 文件編號 | 檔案名稱 | 狀態 | 備註 |
|----------|----------|------|------|
| 00 | 00_Full_Reconstruction_TOC.md | ✅ 完成 | 原始檔 |
| 01 | 01_Vision_and_Philosophy.md | ✅ 完成 | 細節顯性化 |
| 02 | 02_Technical_Architecture.md | ✅ 完成 | 細節顯性化 |
| 03 | 03_Data_Management_and_Database.md | ✅ 完成 | 細節顯性化 |
| 04 | 04_Data_Sources_and_API_Governance.md | ✅ 完成 | 細節顯性化 |
| 05 | 05_Quant_Theory_and_Calculations.md | ✅ 完成 | 細節顯性化 |
| 06 | 06_Automation_and_Prefect_Workflow.md | ✅ 完成 | 細節顯性化 |
| 07 | 07_Core_Module_Level_1_Foundation.md | ✅ 完成 | 細節顯性化 |
| 08 | 08_Core_Module_Level_2_Analysis.md | ✅ 完成 | 細節顯性化 |
| 09 | 09_Core_Module_Level_3_Decision.md | ✅ 完成 | 細節顯性化 |
| 10 | 10_Core_Module_Level_4_Growth.md | ✅ 完成 | 細節顯性化 |
| 11 | 11_Decision_Templates_Spec.md | ✅ 完成 | 細節顯性化 |
| 12 | 12_Daily_Strategy_Report_Spec.md | ✅ 完成 | 細節顯性化 |
| 13 | 13_Development_and_Deployment_Ops.md | ✅ 完成 | 細節顯性化 |
| 14 | 14_Security_and_Reliability.md | ✅ 完成 | 細節顯性化 |
| 15 | 15_Appendix_and_Environment_Vars.md | ✅ 完成 | 細節顯性化 |
| - | FRONTEND_GAP_DETAILED_PLAN.md | ✅ 完成 | 細節顯性化 |

**完成進度：17/17 (100%)**

---

> **文件版本**：v1.0.1 (細節顯性化擴張)
> **關聯文件**：[00_Full_Reconstruction_TOC](00_Full_Reconstruction_TOC.md)
> **維護責任**：系統架構師 / 前端工程師
> **最後更新**：2026-02-10

