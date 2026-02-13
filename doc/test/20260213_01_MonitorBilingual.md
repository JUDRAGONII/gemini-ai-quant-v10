# 🧪 測試計畫：AI 監控中心雙語化 (2026-02-13)

## 測試目標
驗證 AI 監控中心 (AI Command Center) 及其附屬組件是否正確實施雙語化轉型，且維持視覺美感與功能正常。

## 測試環境
- **前端**: Next.js 14 (App Router)
- **單元測試**: Vitest + React Testing Library
- **核心組件**: `Bilingual.tsx`

## 測試案例 (Test Cases)

### 4XXX: UX & UI 雙語驗證
- [x] **TC-4001: 頁面標題雙語化**
  - **期待結果**: 標題顯示「AI 監控中心」且下方有「AI COMMAND CENTER」小字。
- [x] **TC-4002: SystemHealthWidget 雙語化**
  - **期待結果**: 顯示「系統狀態 (SYSTEM HEALTH)」、「CPU 負載 (CPU Load)」、「RAM 佔用 (RAM Usage)」。
- [x] **TC-4003: RiskAlertWidget 雙語化**
  - **期待結果**: 顯示「風險雷達 (RISK RADAR)」、「高風險標的 (High Risk Tickers)」。
- [x] **TC-4004: EvolutionTrendWidget 雙語化**
  - **期待結果**: 顯示「演化趨勢 (EVOLUTION TREND)」。
- [x] **TC-4005: LiveAlertFeed 雙語化**
  - **期待結果**: 顯示「即時警示流 (LIVE ALERT FEED)」。

### 2XXX: 邊界與排版
- [x] **TC-2001: 長英文字串排版**
  - **期待結果**: 在 375px 移動端螢幕下，雙語文字不溢出容器。

### 3XXX: 安全性與渲染
- [x] **TC-3001: 數據載入後文字保持**
  - **期待結果**: SWR 數據更新後，`Bilingual` 組件文字不消失且不發生閃爍。
