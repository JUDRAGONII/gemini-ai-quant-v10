# Phase 13.6: AI 監控中心最後封裝與總體 UAT — 實作計畫

**文件編號**: PLAN-052
**負責人**: System Architect & UI/UX Pro Max
**狀態**: Proposed

## 1. 問題描述與背景 (Problem Statement)
**目標**: Phase 13 已完成多個高階模組 (演化視覺化、法人風控、AI 辯證)，但目前散落在不同頁面。為了達到「戰情室」等級的操作體驗，需要一個**統一的 AI 監控中心 (AI Command Center)**，將警示、配額、風險與市場熱力圖進行最後的封裝與整合。

**核心挑戰**:
- **資訊碎片化**: 警示在 Sidebar，風控在 Professional，熱力圖在 Market。
- **可觀測性不足**: 無法一眼監控 `ai-worker` 健康度與 API 配額剩餘量。
- **UAT 缺乏**: 尚未進行長時間掛機的耐久性測試 (Endurance Test)。

## 2. 方案設計 (Architecture & Design)

### 2.1 系統架構 (System Architect)
採用 **"Micro-Frontend Composition"** 模式，將現有組件包裝為 Widget，並透過 `CommandCenterLayout` 進行統一渲染。

| 模組 | 來源組件 | 封裝策略 |
|:---|:---|:---|
| **核心監控** | `SystemStatusPanel` | 增強為 `SystemHealthWidget` (CPU/RAM/API Quota) |
| **市場感知** | `BentoGrid` (Market) | 縮減為 `MiniMarketHeatmap` (Top 50) |
| **風險雷達** | `GreeksMonitor` | 轉化為 `RiskAlertWidget` (僅顯示紅燈標的) |
| **策略演化** | `FitnessHeatmap` | 轉化為 `EvolutionTrendWidget` (世代遷移摘要) |
| **警示通知** | `AlertScanner` | 整合為 `LiveAlertFeed` (實時滾動流) |

### 2.2 UI/UX 設計 (UI/UX Pro Max)
- **風格**: **"Cyberpunk Financial Terminal"** (更深邃的黑底，高對比霓虹光)。
- **佈局**: Grid Layout (RGL) 支援拖利自定義 (Optional) 或 黃金比例固定佈局。
- **互動**: 
    - **SoundFX**: 嚴重警示時播放細微音效 (可靜音)。
    - **Focus Mode**: 全螢幕模式 (F11 體驗)。

---

## 3. Proposed Changes

### 3.1 [FRONTEND] AI 監控中心 (`app/monitor/command-center`)
#### [NEW] `CommandCenterPage.tsx`
- **Layout**: 3-Column 佈局 (左: 系統/資源, 中: 市場/風險, 右: 警示/演化)。
- **Features**: 
    - 自動刷新 (React Query `refetchInterval`).
    - 雙語切換支持。

#### [NEW] `SystemHealthWidget.tsx`
- 顯示 Docker 容器狀態 (Mock via API)、API Quota (Redis)、資料庫連線池狀態。

#### [NEW] `LiveAlertFeed.tsx`
- WebSocket (Supabase Realtime) 訂閱 `market_alerts` 表。
- 支援 "Acknowledge" (已讀) 操作。

### 3.2 [BACKEND] 監控聚合 API
#### [NEW] `backend/api/routers/monitor.py`
- `GET /api/v1/monitor/dashboard`: 聚合 System Status, Quota, Active Alerts。
- 確保回應時間 < 50ms (純 Redis 讀取)。

---

## 4. 驗證計畫 (UAT & QA)

### 4.1 自動化測試 (TC-1306)
- **TC-1306-01 (API)**: 驗證 `/monitor/dashboard` 聚合邏輯與回應速度。
- **TC-1306-02 (UI)**: 驗證 Realtime 警示推送與組件渲染。

### 4.2 總體 UAT (User Acceptance Testing)
1. **耐久性測試 (Endurance)**:
    - 掛機 6 小時，觀察記憶體洩漏 (Memory Leak) 與瀏覽器崩潰情況。
2. **極限壓力 (Stress)**:
    - 模擬每秒 10 筆警示寫入，觀察前端渲染幀率 (FPS)。
3. **雙語驗收**:
    - 切換 EN/ZH，確認監控術語準確性。

## 5. 執行步驟 (Step-by-Step)
1. **API 開發**: 實作 `monitor.py` 聚合端點。
2. **組件封裝**: 將現有 UI 拆解為 Widgets。
3. **頁面組裝**: 構建 `CommandCenterPage`。
4. **UAT 執行**: 啟動耐久性測試並記錄報告。
5. **Phase 13 結案**: 更新 PCM 與 DEV_SUMMARY。
