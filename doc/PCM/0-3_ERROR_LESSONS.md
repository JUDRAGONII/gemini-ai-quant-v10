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

---

### 2026-01-22 Next.js 伺服器模組遺失教訓

### 問題現象
- **Server Error**: `Cannot find module './329.js'` 或類似的 chunk ID 報錯。

### 底層根本原因
- **Next.js 緩存衝突**：當開發伺服器運行中，若發生檔案重命名、刪除或頻繁的 HMR 更新，Webpack 生成的分塊清單與硬碟上的實際檔案可能出現不匹配。伺服器請求了一個過時或已被刪除的分塊分片。

### 解決方案
- 停止開發伺服器，手動刪除 `.next` 目錄，重新執行 `npm run dev` 進行純淨編譯。

### 預防重複犯錯的 Checkbox
- [ ] 遭遇 chunk 遺失類報錯時，應優先考慮清理 `.next` 緩存。
- [ ] 執行重大檔案結構調整前，建議暫停 `npm run dev`。

---

### 2026-01-22 JSDOM 環境下 Recharts 測試教訓

### 問題現象
- **測試崩潰**：報錯 `The tag <stop> / <defs> is unrecognized in this browser`。
- **類型錯誤**：報錯 `Check the render method of ...` 或元件渲染為空。

### 底層根本原因
- **SVG 兼容性**：JSDOM 並非真實瀏覽器，對於 `<stop>`, `<defs>`, `<linearGradient>` 等 SVG 內部標籤支援不佳，會引發 React 警告。
- **Mock 衝突**：Recharts 對外暴露多組組件，若 Mock 不完全或使用了混合導入（Named + Default），會導致 React 無法識別元件類型。

### 解決方案
- 在 Jest 中設置更全面的 Recharts Mock，將所有 SVG 類標籤模擬為純 `div` 或具備正確命名空間的 SVG 片段。
- 使用 `getAllByText` 配合 Regex 取代 `getByText` 以處理多重渲染與重複文字。

### 2026-01-22 測試 Mock 作用域失效教訓 (深度分析)

### 問題現象
- **測試反覆失敗**：即使在 `jest.mock` 中正確路徑，頁面測試仍嘗試渲染該組件的原始邏輯，或拋出元件內部相依（如 Lucide/Recharts）的報錯。

### 底層根本原因 (First Principles)
- **閉包與模組作用域**：當組件定義在 Page 檔案內部（與 Page 同一 Module）時，Page 對該組件的引用發生在模組內部。`jest.mock` 僅能攔截跨模組（`import/export`）的呼叫。
- **不可攔截性**：由於組件對 Page 而言是「私有」或來自同一閉包，Jest 無法透過修改模組加載器來替換該組件實例。

### 解決方案
- **外部化 (Externalization)**：將所有需要被獨立測試或 Mock 的子組件抽離至獨立檔案（如 `components/` 目錄）。這強制 Page 透過 `import` 引用該組件，從而恢復 `jest.mock` 的攔截能力。

### 2026-01-22 Next.js Event Handler 邊界衝突教訓

### 問題現象
- **Runtime Error**: `Event handlers cannot be passed to Client Component props.`
- **連鎖反應**: 頁面頻繁自動刷新，最終顯示「missing required error components」。

### 底層根本原因
- **邊界宣告缺失**: 在 App Router 中，任何包含 `onClick`、`useState` 或 `useEffect` 的組件必須明確標註 `"use client"`。
- **衝突路徑**: `not-found.tsx` 預設為 Server Component，當其中使用了 `onClick={() => window.history.back()}` 時，React 會認定您正試圖將一個不可序列化的函數從伺服器傳向客戶端屬性，進而導致 Hydration 崩潰。
- **殭屍進程佔位**: 當 Next.js 因嚴重錯誤崩潰時，Node.js 進程有時無法自動釋放 Port，導致使用者刷新瀏覽器時看到的依然是舊有的報錯頁面或連線被拒。

### 解決方案
- **精準宣告**: 確保所有包含交互行為的檔案（如 `error.tsx`, `not-found.tsx`, `global-error.tsx`）頂層均有 `"use client"`。
- **強制清理**: 遭遇連線異常或 404 時，應手動清除佔用 Port 3000 的 PID。

### 預防重複犯錯的 Checkbox
- [ ] `not-found.tsx` 與 `error.tsx` 預設加入 `"use client"`。
- [ ] 重大環境報錯修復後，務必檢查 Port 佔用狀態並重啟。
