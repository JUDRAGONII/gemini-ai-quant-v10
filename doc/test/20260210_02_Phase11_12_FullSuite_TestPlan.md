# 20260210_02_Phase11_12_FullSuite_TestPlan.md

## 測試目標
全量驗證 Phase 11（數據對接、監控中心、UI/UX 巔峰）與 Phase 12（AI 洞察引擎、戰術閉環、生產硬化）的系統完整性。
覆蓋範圍：前端 6 個新組件 + 後端 4 個 API 端點 + 代理配置 + 防禦性解析。

## 測試環境
*   **Framework**: Next.js 14, Jest, React Testing Library
*   **Backend**: Python 3.10+ / FastAPI / Supabase (PostgreSQL 15)
*   **Target Files**:
    - `frontend/components/Dashboard/DialecticPanel.tsx`
    - `frontend/components/Dashboard/CorrelationChart.tsx`
    - `frontend/components/Dashboard/TacticalPlanner.tsx`
    - `frontend/components/macro/EconomicCalendar.tsx`
    - `frontend/app/ai/insights/page.tsx`
    - `frontend/hooks/useAlerts.ts`
    - `frontend/next.config.mjs`
    - `backend/api/routers/macro.py`
    - `backend/api/routers/alerts.py`
    - `backend/api/routers/insights.py`
*   **Test Files**:
    - `frontend/__tests__/components/Dashboard/DialecticPanel.test.tsx`
    - `frontend/__tests__/components/Dashboard/CorrelationChart.test.tsx`
    - `frontend/__tests__/components/Dashboard/TacticalPlanner.test.tsx`
    - `frontend/__tests__/components/macro/EconomicCalendar.test.tsx`
    - `frontend/__tests__/app/ai/insights/page.test.tsx`

---

## 測試案例清單

### 1. 基礎路徑測試 (Happy Path)

#### [DialecticPanel — AI 辯證引擎]
- [x] **TC-1101: 數據加載成功後應渲染共識文字與信心度百分比**: 給定 mock `dialectic` 回傳 `{consensus: "中性偏多", conviction: 0.75, agents: [...]}`，預期渲染 `"中性偏多"` 與 `"75%"`。
- [x] **TC-1102: 三個代理人意見應全部渲染為獨立卡片**: 預期 3 個 `agent` 卡片各顯示 `name`, `opinion`, `reason`。
- [x] **TC-1103: 加載中狀態應顯示 "AI 正在辯證中..." 動畫文字**: `isLoading=true` 時預期顯示 pulse 動畫。

#### [CorrelationChart — 跨資產相關性圖表]
- [x] **TC-1201: 正確渲染相關性數值與狀態文字**: 給定 `summary.current=0.37, summary.status="低度相關/中性"`，預期渲染 `"0.3709"` 與狀態文字。
- [x] **TC-1202: Recharts AreaChart 應收到正確的 series 數據**: 驗證 `<AreaChart data={series}>` 接收至少 1 筆 `{date, value}` 數據。
- [x] **TC-1203: 加載中狀態應顯示 "CALCULATING CORRELATION MATRIX..."**: `isLoading=true` 時預期顯示 mono 字型載入文字。

#### [TacticalPlanner — 戰術計畫器]
- [x] **TC-1301: 無計畫時應顯示 "無運行中戰術計畫" 空狀態**: `plans=[]` 時預期渲染空狀態圖示與文字。
- [x] **TC-1302: 有計畫時應正確渲染計畫卡片**: 給定 1 筆 mock plan，預期顯示 `stock_code`, `entry_price`, `stop_loss`, `take_profit`。
- [x] **TC-1303: 點擊 "啟動新戰術" 應顯示表單**: 點擊按鈕後預期渲染 input 欄位與提交按鈕。

#### [EconomicCalendar — 經濟日曆]
- [x] **TC-1401: 正確渲染經濟事件卡片**: 給定 mock 事件資料，預期每張卡片顯示 `country`, `event_name`, `scheduled_at`。
- [x] **TC-1402: 防禦性 fetcher 能正確解包嵌套結構**: 給定後端回傳 `{status, count, data:[...]}` 時，仍能正確渲染（不崩潰）。
- [x] **TC-1403: 無事件時應顯示 "未來一週無重大經濟事件"**: `data=[]` 時預期渲染空狀態文字。

#### [InsightsPage — /ai/insights 整頁]
- [x] **TC-1501: 頁面應渲染三個核心區塊**: 預期同時存在 DialecticPanel, CorrelationChart (x2), TacticalPlanner。
- [x] **TC-1502: 搜尋框提交後應更新 ticker state**: 輸入 "NVDA" 提交後預期 ticker 更新。

---

### 2. 邊界條件測試 (Edge Cases)

#### [CorrelationChart 防禦性邏輯]
- [x] **TC-2101: summary 為 null 時不應崩潰**: 給定 `data.summary = null`，預期 fallback 為 `{current: 0, mean: 0, status: 'N/A'}`，渲染 `"0.0000"`。
- [x] **TC-2102: series 為空陣列時圖表應正常渲染**: 給定 `series=[]`，預期 AreaChart 不拋錯。

#### [DialecticPanel 錯誤處理]
- [x] **TC-2201: API 錯誤時應顯示紅色錯誤提示**: `error` 非 null 時預期渲染 `"載入 AI 辯證數據失敗"` 文字。
- [x] **TC-2202: agents 為空陣列時不應崩潰**: 給定 `agents=[]`，共識區塊仍正常渲染。

#### [TacticalPlanner 表單驗證]
- [x] **TC-2301: stock_code 為空時 submit 應被 required 阻擋**: 不填必填欄位時按提交，預期表單不送出。

#### [EconomicCalendar 異常數據]
- [x] **TC-2401: 後端返回非陣列結構時 fetcher 應自動解包**: 給定 `{data: [{...}]}`，預期仍然渲染事件卡片。

---

### 3. 安全性與數據一致性

#### [API 代理安全性]
- [ ] **TC-3101: next.config.mjs rewrites 應代理所有 /api/ 請求**: 驗證 catch-all `/api/:path*` 規則存在。
- [ ] **TC-3102: 前端不應殘留硬編碼 localhost:8001 URL**: 掃描所有前端組件，預期無 `http://localhost:8001` 字串。

#### [後端 API 參數校驗]
- [ ] **TC-3201: correlation API 不合法 lag 參數 (>20) 應返回 422**: 驗證 `lag=100` 觸發 validation error。
- [ ] **TC-3202: calendar API 不合法 min_importance (>5) 應返回 422**: 驗證 `min_importance=10` 觸發 validation error。

---

### 4. 可訪問性與 UI/UX

#### [Phase 12 RWD 適配]
- [ ] **TC-4001: InsightsPage 在行動端自動坍縮為單欄**: 驗證 `lg:grid-cols-12` 在小螢幕下降級為 `grid-cols-1`。
- [ ] **TC-4002: TacticalPlanner 表單在行動端寬度 100%**: 驗證 form 在小螢幕下不溢出。

#### [Micro-animations]
- [ ] **TC-4101: DialecticPanel 信心度進度條有動畫效果**: 驗證 `motion.div` 存在 `animate` prop。
- [ ] **TC-4102: CorrelationChart hover 時卡片邊框高亮**: 驗證 `group` 與 `hover:border-emerald-500/30` class 存在。

---

## 測試執行結果 (Execution Result)
```
Test Suites: 5 passed, 5 total
Tests:       22 passed, 22 total
Snapshots:   0 total
Time:        29.433 s

 PASS  __tests__/components/Dashboard/DialecticPanel.test.tsx (5 tests)
 PASS  __tests__/components/Dashboard/CorrelationChart.test.tsx (5 tests)
 PASS  __tests__/components/Dashboard/TacticalPlanner.test.tsx (4 tests)
 PASS  __tests__/components/macro/EconomicCalendar.test.tsx (6 tests)
 PASS  __tests__/app/ai/insights/page.test.tsx (2 tests)
```
