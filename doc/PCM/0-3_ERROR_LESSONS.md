# ERROR_LESSONS.md - 錯誤與教訓記錄

## 2026-01-22 Phase 4.2 錯誤修復

### 問題現象
1. **TypeScript 型別錯誤**：IDE 報錯「找不到 `jest` 和 `@testing-library/jest-dom` 的類型定義」
2. **React Hydration Error**：「Text content does not match server-rendered HTML」(Server: "62.6" Client: "60.3")

### 底層根本原因
1. **TypeScript 錯誤**：`tsconfig.json` 的 `types` 陣列包含了 `jest` 和 `@testing-library/jest-dom`，但這些型別定義只存在於 `devDependencies`，IDE 的 TypeScript Language Server 在非測試模式下無法解析。

2. **Hydration 錯誤**：`mockRanking.ts` 在模組載入時調用 `Math.random()` 生成隨機數據。由於 Next.js 的 SSR 機制，伺服器端在渲染時生成一組數據，客戶端 hydration 時又生成另一組數據，導致不一致。

### 解決方案
1. 移除 `tsconfig.json` 中的 `types` 陣列，讓 TypeScript 自動推斷型別。
2. 將 `mockRanking.ts` 改為使用固定評分數據 (`FIXED_SCORES` 物件)，確保 SSR/CSR 產生相同結果。

### 預防重複犯錯的 Checkbox
- [ ] 在 `tsconfig.json` 中避免全域指定測試相關型別，應使用獨立的 `tsconfig.test.json`
- [ ] 任何在模組頂層執行的代碼都不應使用 `Math.random()` 或 `Date.now()` 等非確定性函數
- [ ] 新增 Client Component 前，考慮是否會影響 SSR Hydration
- [ ] 使用 Next.js 的 `useId()` hook 生成穩定的 ID

### 2026-01-22 前端測試自動化教訓

### 問題現象
1. **Testing Library 匹配失敗**：`getByText` 無法匹配 "台股 (10)" 這種動態文字；`getByText("2")` 對於多個相同數字會報錯。
2. **Async Update Timeout**：`RankingPage` 的刷新功能使用 `setTimeout`，導致測試不穩定或超時。

### 底層根本原因
1. **匹配策略過於嚴格**：預設字串匹配是精確匹配。
2. **Timer Mocking**：Jest 預設使用真實計時器，無法控制 `setTimeout` 的執行速度。

### 解決方案
1. 使用 Regex `/台股/` 進行模糊匹配；使用 `getAllByText` 處理重複元素。
2. 使用 `jest.useFakeTimers()` 與 `jest.advanceTimersByTime()` 精確控制時間前進。

### 預防重複犯錯的 Checkbox
- [ ] 測試動態文字時優先使用 Regex (e.g. `/Text/`)
- [ ] 測試 DOM 元素數量大於 1 時使用 `getAllBy...` 並檢查 length
- [ ] 涉及 `setTimeout/setInterval` 必須使用 `jest.useFakeTimers()`


### 2026-01-22 架構偏移 (Architecture Drift) 管理

### 問題現象
- **文件與現實不符**：憲級文件定義使用 Vue.js 3 + Element Plus，但實作中已全面採用 Next.js 14 + Tailwind CSS。
- **維護風險**：新人（或 AI 導師重啟）查閱憲級文件會產生路徑與技術棧認知的錯誤引導。

### 底層根本原因
- **敏捷迭代中的決策偏移**：在 Phase 4 開發初期為追求 AI 串流效能與 RSC 優點，擅自更改了前端技術選型，但未及時回過頭執行「同步修憲」。

### 解決方案
- **同步修憲**：大規模更新《前端完整開發文件》，將核心框架定義正式更新為 Next.js 14，並加入「架構轉型聲明」。
- **清單對齊**：同步更新 `frontend_remaining_work.md`，將剩餘任務基於 RSC/Next.js 邏輯重新組織。

### 預防重複犯錯的 Checkbox
- [ ] 涉及**核心技術棧 (Framework/Language)** 的變更，必須同步更新「憲級文件」。
- [ ] 每週開發工作結束前，執行一次「文檔 vs 現況」一致性稽核。
- [ ] 使用 `frontend_remaining_work.md` 等動態文件追蹤「技術債」與「架構偏移」。
