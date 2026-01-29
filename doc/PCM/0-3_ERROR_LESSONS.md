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
---

### 2026-01-23 Phase 4.4 RWD 與 TDD 測試教訓

### 問題現象
1. **測試攔截失敗**：`fireEvent.click(overlay)` 沒反應，Drawer 無法關閉。
2. **時間戳斷言失敗**：`expect.stringContaining` 在驗證 `SettingsContext` 的 JSON 時報錯，因為 `lastUpdated` 欄位是動態變化的。
3. **Mock 屬性遺失**：`Link` 組件在測試中丟失了 `className`，導致 CSS 斷言（如 `cursor-pointer`）失敗。

### 底層根本原因
1. **元素重疊與層次**：在 HTML 結構中，`spacer` 元素或不具備事件監聽器的 `div` 可能覆蓋了目標 `overlay`。使用過於通用的選擇器（如 `[aria-hidden="true"]`）會選中錯誤的元素。
2. **非確定性數據驗證**：在斷言整個對象字串時，包含隨機值（UUID）或動態值（Timestamp）會導致精確匹配失敗。
3. **Mock 不完全**：手動 Mock `next/link` 時若只考慮 `children` 和 `href`，會導致其他必要的 Props 被丟棄。

### 解決方案
1. **精準選擇器**：為測試目標添加唯一的類名（如 `.bg-black/60`）或使用 `data-testid` 以避開干擾元素。
2. **局部斷言**：將字串 `JSON.parse` 後，使用 `expect.objectContaining` 只檢查確定性的欄位，或對動態欄位使用 `expect.any(String)`。
3. **透傳屬性 (Spread Props)**：在 Mock 組件中透傳 `...props` 或明確定義 `className` 的傳遞。

### 預防重複犯錯的 Checkbox
- [ ] 測試 Overlay 交互時，優先使用精準的類名或 `data-testid`。
- [ ] 驗證 LocalStorage 持久化時，使用 `JSON.parse` 進行對象層級的比對。
- [ ] Mock 第三方組件時，確保常用的 HTML 屬性（如 `className`, `id`）被正確傳遞。
148: 
149: ### 2026-01-23 端口衝突與 Next.js 資源缺失教訓
150: 
151: ### 問題現象
152: - **Port Jump**: Next.js 提示端口 3000 被佔用，自動跳轉至 3001。
153: - **Hydration/404 Error**: 頁面載入異常，瀏覽器 Console 出現大量 `main-app.js` 或分塊檔案 404 錯誤。
154: 
155: ### 底層根本原因
156: - **殭屍進程佔位**: 前次異常結束的 Node.js 進程（如 PID 3176）未釋放 3000 端口。
157: - **緩存失同步**: Next.js 的編譯產物 (`.next`) 可能包含基於原端口的靜態引用。當服務器跳轉端口後，若瀏覽器仍試圖請求舊端口的資源，或 HMR 更新無法正確對接，會導致白屏或資源缺失。
158: 
159: ### 解決方案
160: 1. 使用 `netstat -ano | findstr :3000` 找出佔用進程。
161: 2. 使用 `taskkill /F /PID <PID>` 強制中止。
162: 3. 重啟前端服務於標準端口 3000。
163: 
164: ### 預防重複犯錯的 Checkbox
165: - [ ] 啟動服務前優先確認 3000 端口是否乾淨。
166: - [ ] 遭遇端口跳轉時，優先清理程序而非順從跳轉。
167: - [ ] 配合 `Ctrl + F5` 強制刷新瀏覽器緩存。

### 2026-01-23 概念與實作落差 (Concept vs Implementation Gap) 教訓

### 問題現象
- **安全漏洞**: `018_數據監控中心_Concept.md` 規劃了開發者模式檢查，但實作 `MonitorPage` 時完全遺漏了該邏輯。
- **測試失敗**: 執行 TDD 案例 `TC-2101` 時，預期應阻擋非開發者訪問，但實際卻直接渲染頁面。

### 底層根本原因
- **依賴慣性**: 開發時過於專注 UI 渲染與數據 Fetching，將「非功能性需求」(Security) 延後處理，最終遺忘。
- **文件脫節**: 實作階段未隨時參照 Design Doc 的每一個 Checkbox。

### 解決方案
- **TDD 作為最後防線**: 依賴測試計畫中的 TC-2101，在代碼提交前成功攔截了此漏洞。
- **實作補強**: 在 `useEffect` 中補上 `localStorage` 檢查與 `router.push('/')` 重定向。

### 預防重複犯錯的 Checkbox
- [ ] 實作前將 Design Doc 的條列項轉為代碼中的 TODO 註釋。
- [ ] 涉及權限與安全的功能，必須優先撰寫測試案例 (Test First)。

---

### 2026-01-25 大規模數據回補與 API 限制教訓

### 問題現象
1. **美股卡頓**：Tiingo API 報錯「Quota Exceeded」(500 Symbol Limit)。
2. **台股筆數不增**：每日回補僅新增 1 筆，且 15 年跨度請求被 Fugle 拒絕（400 Error）。
3. **資料庫報錯**：Upsert 時出現 `ON CONFLICT DO UPDATE command cannot affect row a second time` (Error 21000)。

### 底層根本原因
1. **配額限制**：Tiingo 免費版單月僅能查詢 500 個不重覆標的。
2. **接口與跨度限制**：
    - 誤用盤中接口 `intraday.candles`（僅回傳最新日線）。
    - 歷史接口 `historical.candles` 限制單次查詢跨度不得超過一年。
3. **數據重複**：API 返回的單一批次中包含相同日期的重複行，導致 PostgreSQL 在執行 Upsert 時邏輯衝突。

### 解決方案
1. **金鑰輪詢**：實作 `Config.get_tiingo_key()` 循環調度多組 API Key。
2. **接口切換與分段**：
    - 切換至 `historical.candles`。
    - 實作「年分段擷取 (Yearly Chunking)」循環邏輯。
3. **本地去重**：在 `BaseFetcher.upsert` 前使用 Pandas `drop_duplicates(keep='last')` 預處理數據。

### 預防重複犯錯的 Checkbox
- [ ] 大規模抓取前先確認 API 的「單次時間跨度限制」與「標的總量配額」。
- [ ] 歷史數據 (EOD) 應優先使用 Historical 接口而非 Intraday 接口。
- [ ] 執行 Bulk Upsert 前，必須在應用組序進行 Primary Key 級別的本地去重。
- [ ] 關鍵外部 SDK 調用前，檢查核心組件（如 `time`）是否已匯入。

---

---

### 2026-01-26 數據分類邏輯偏差 (Market Mix-up Over-correction)

### 問題現象
- **現象**：數據補洗後，所有包含字母的標的（如台股債券 ETF `00937B`）被誤標為 `TIINGO` (美股)。
- **影響**：台股行情數據在前端市場過濾時遺失部分重要標的，且美股數據庫充斥錯誤的台股代號。

### 底層根本原因
- **過度簡化的正則判定**：原先採用 `~ '[A-Z]'` (包含字母即美股) 作為分類標準，忽略了台股權證與債券 ETF 亦會使用字母後綴。

### 解決方案
- **特徵提取轉向**：將規則修正為 `~ '^[0-9]'` (首位數字開頭即台股)，利用台股代號物理結構的確定性來避開字母干擾。
- **特定排除法**：針對期交所標的 (`TX`, `MTX`) 採用顯式清單排除。

### 預防重複犯錯的 Checkbox
- [ ] 執行全球市場 SQL 補洗前，必須先抽樣檢索「代號交集區」(如混合數字與字母者)。
- [ ] 分類邏輯應建立在「排除法」與「確定性前綴」之上，而非單一字符特徵。

---

### 2026-01-26 容器環境導入路徑 (Docker ModuleNotFoundError)

### 問題現象
- **現象**：`ai-worker` 容器啟動時報錯 `ModuleNotFoundError: No module named 'etl'`。
- **根本原因**：Docker 容器內部工作目錄 (`/app`) 缺少與宿主機一致的 Python Path 配置，導致手動開發時建立的相對導入在封裝環境下失效。
- **解決方案**：在啟動腳本中動態動入專案根目錄，或統一採用絕對路徑導入 (`backend.etl...`) 並配置 `PYTHONPATH`。

### 預防重複犯錯的 Checkbox
- [ ] 任何 ETLFetcher 實作必須確保在 Docker 環境下具備正確的 `sys.path` 注入。
- [ ] 統一採用 `backend.` 作為頂層包路徑。

---

### 2026-01-26 Mock 數據與組件介面不同步 (Mock/Interface Drift)

### 問題現象
- **CI 報錯**：GitHub Actions 前端建置失敗，報錯 `Property 'historyData' does not exist on type`。
- **根本原因**：在重構 `mockMacro.ts` 時，將 `sparklineData` 替換為 `historyData`，但未同步修改：
    1. `MacroIndicatorCard.tsx` 的 Props 定義。
    2. `app/macro/page.tsx` 的調用處。
    3. 測試檔案 `page.test.tsx` 中的 Mock 數據。
- **連鏈反應**：`UNRATE`, `TW_SIGNAL` 等指標缺少 `fullName` 屬性，違反了新定義的 `MacroIndicator` 介面。

### 解決方案
1. 確保介面更新後，所有使用該介面的檔案同步修改。
2. 使用 `npx tsc --noEmit` 主動在本地執行型別檢查，避免 CI 延遲回饋。

### 預防重複犯錯的 Checkbox
- [ ] 修改 `interface` 或 `type` 定義後，立即搜索專案中所有引用該型別的檔案。
- [ ] 推送前必須先在本地執行 `npm run build`，確認 TypeScript 與 Lint 皆通過。
- [ ] 測試檔案中使用的 Mock Props 必須與真實組件的介面保持一致。
### 2026-01-26 前端測試歧義與代碼偏移教訓

### 問題現象
- **FAIL**: `Found multiple elements with the text: /VIX/`。
- **TypeError**: `indicator gdp not found` (Mock 數據中僅存在 `gdp_us`)。
- **Syntax Error**: 測試檔案無法解析，因大量 `it` 區塊遺失。

### 底層根本原因
1. **文本歧義**: 指標卡片同時顯示 `VIX` (代碼) 與 `波動率指數 (VIX)` (名稱)，寬鬆的 Regex 匹配導致失敗。
2. **路徑漂移 (Path Drift)**: 前端組件路徑實作為 `/macro/[indicator.toLowerCase()]`，而測試中使用了與 `mockMacro.ts` 二次定義不匹配的簡寫。
3. **工具覆寫風險**: 在執行 `multi_replace_file_content` 時，由於 TargetContent 匹配過廣，誤將包裹邏輯的外部函式刪除。

### 解決方案
1. 改用 `screen.getAllByText(/VIX/)[0]` 確保選中首個卡片標題。
2. 統一採用 `gdp_us` 作為基準代碼。
3. 程式碼大幅更動後，必須立即執行 `npm run test` 進行噴火測試 (Smoke Test) 並保留完整備份。

### 預防重複犯錯的 Checkbox
- [ ] 涉及重要 UI 組件名稱（如 ticker symbol）的斷言，優先使用 `getAllBy...` 並配合索引或 `data-testid`。
- [ ] Mock 數據變動後，需全域搜尋對應代碼字串並同步更新測試腳本。
- [ ] 避免在未確認語法樹完整性的情況下，對大塊 `it` 區塊進行自動化替換。
### 2026-01-26 前端全量測試 (Full Test Run) 報錯教訓

### 問題現象
1. **異步競爭與自毀渲染**: `macro/page.test.tsx` 在全量測試中偶爾失敗，Console 充滿 React 組件重建導致的警告。
2. **Missing Key 警告**: `app/page.test.tsx` 顯示報錯，起因於 AI 報告 Mock 數據缺少 `id` 欄位。
3. **整合測試環境缺失**: `dataIntegrity.test.ts` 因缺少 `SUPABASE_SERVICE_ROLE_KEY` 導致整個測試套件崩潰。

### 底層根本原因
1. **Proxy Mock 不穩定性**: `jest.setup.js` 中的 Lucide Proxy Mock 每次 get 都返回新定義的組件函式，React 認定組件身分已變，強制重建渲染，導致狀態遺失與警告，並在高併發測試下引發競爭。
2. **數據完整性疏忽**: 測試用的 Mock 資料未對齊動態渲染所需的關鍵屬性（如 `key` 所在的 `id`）。
3. **環境耦合**: 整合測試直接依賴 env，未在建置/單元測試流程中加入斷路器（Breaker）。

### 解決方案
1. **Mock 精細化**:
   - 為 Lucide Proxy Mock 加入 **iconCache** 快取機制，確保組件穩定性。
   - 補齊 Recharts 的 `ResponsiveContainer` 與 `ResizeObserver` 模擬。
2. **數據校準**: 在測試數據中加入 `id: 'mock-id'` 消除 Key 警告。
3. **環境解耦**: 在整合測試頂層加入 `isDummyKey = SUPABASE_SERVICE_ROLE_KEY === '...'` 判斷邏輯，滿足條件時自動 `describe.skip`。

### 預防重複犯錯的 Checkbox
- [ ] 編寫 Proxy-based Mock 時必須實作快取 (Caching) 以保證組件實體一致。
- [ ] Mock 數據對象必須包含列表渲染所需的 `id` 或 `key` 屬性。
- [ ] 具有外部依賴（DB/API）的整合測試必須具備環境檢測與自動跳過機制。
- [ ] 在 `jest.setup.js` 中預設補齊 `useParams` 等 App Router 常用 Hook 的基礎 Mock。
- [ ] 在 `jest.setup.js` 中預設補齊 `useParams` 等 App Router 常用 Hook 的基礎 Mock。

---

## #23 Mock Hook 返回鍵名與元件解構不匹配

| 屬性 | 值 |
| --- | --- |
| 發生日期 | 2026-01-27 |
| 影響範圍 | CI/CD |
| 嚴重程度 | 中 |

### 問題現象
`page.test.tsx` 測試始終失敗，錯誤訊息為 `TypeError: Cannot read properties of undefined (reading 'market')`。

### 底層根因
1.  `useStockDetail` Hook 實際返回 `{ data, loading, error }`。
2.  測試中的 Mock 返回的是 `{ data, isLoading, error }` (鍵名不匹配)。
3.  元件解構 `const { data, loading, error } = useStockDetail(...)` 時，`loading` 為 `undefined`，導致 `if (loading)` 不成立，元件嘗試渲染未載入的 `data`，造成屬性讀取錯誤。

### 預防措施 (Checklist)
- [ ] 撰寫 Hook Mock 時，必須先查看實際 Hook 的返回介面 (`useXXX.ts`)。
- [ ] 測試新增後，先在本地執行 `npm test [file]` 確認通過再推送。
- [ ] 若 CI 失敗，優先查看「返回結構」與「解構賦值」是否一致。

### 2026-01-27 Docker 服務中斷導致 API 404 教訓

### 問題現象
- **API 失效**：前端呼叫 `/api/stocks/[symbol]` 回傳 404，Next.js Server Side Log 顯示 `TypeError: fetch failed`。
- **誤判**：起初誤以為是 Port 3000 被佔用或 API Route 邏輯錯誤。

### 底層根本原因
- **Docker Engine Down**：Docker Desktop 服務本身已停止 (Crash 或未啟動)，導致 Supabase 本地實例 (Port 8000) 無法存取。
- **錯誤訊息傳遞**：Next.js 的 `fetch` 失敗 (Connection Refused) 在 API Route 中被捕獲並回傳通用的 500 或 404，掩蓋了底層連線錯誤。

### 解決方案
- **服務檢查**：優先執行 `docker ps` 檢查容器狀態。
- **連線測試**：使用 `Test-NetConnection -Port 8000` 確認資料庫端口可達性。

### 預防重複犯錯的 Checkbox
- [ ] 遇到 `fetch failed` 時，第一步先檢查目標服務 (Docker/Database) 是否活著 (`docker ps`)。
- [ ] API Route 的 `try-catch` 區塊應區分「業務邏輯 404」與「基礎設施 500」，並在 Log 中輸出具體錯誤原因 (如 Connection Refused)。
### 2026-01-27 Phase 5.4/6 財報回補與驗證教訓

### 問題現象
1. **Supabase 400 Error**: Python ETL 寫入財報時報錯 `"invalid input syntax for type json"`。
2. **Jest Timeout**: 前端測試時 `useSWR` 模擬數據導致 JSDOM 渲染死循環或超時。

### 底層根本原因
1. **NaN 污染**: FMP API 的原始數據包含空值，Pandas 讀取後轉為 `NaN` (float)。Python `json.dumps` 會將其轉為非標準 JSON 的 `NaN` 字串，而 Supabase (PostgreSQL) 的 `jsonb` 欄位無法解析此非標記符。
2. **SWR 狀態不完整**: Mock `useSWR` 時若未指定 `isValidating: false`，Recharts 或 Framer Motion 可能因不斷偵測到「驗證中」狀態而重新觸發動畫或重繪，導致 Jest 環境下的 `findBy` 操作超出預設 5s 限制。

### 解決方案
1. **數據清洗**: 在回傳 JSON 前，使用 `df.where(pd.notnull(df), None)` 將所有 `NaN` 強制轉換為標準的 `null`。
2. **Mock 狀態補完**: 確保 `useSWR` Mock 返回完整對象：`{ data, error, isLoading: false, isValidating: false }`。

### 預防重複犯錯的 Checkbox
- [ ] Python ETL 在 `upsert` 前必須執行 `replace({np.nan: None})` 處理。
- [ ] 涉及動畫或圖表的 Jest 測試，優先使用 `waitFor` 配合較大的 timeout 或縮減動畫時間。
- [ ] Supabase SDK 批量寫入時，務必檢查傳入的是物件列表 `List[dict]` 而非單個物件。
### 2026-01-28 端口 3000 殭屍進程導致 500 錯誤

### 問題現象
- 前端頁面完全空白，瀏覽器控制台顯示 `localhost:3000` 以及 `_app.js`, `_error.js` 等核心資源皆為 **500 Internal Server Error**。
- `npm run dev` 啟動時提示 `Port 3000 is in use, trying 3001 instead`。

### 底層根本原因
- **殭屍進程佔位 (Zombie Process)**：先前異常中斷的 Node.js 進程 (PID 552) 未能釋放 3000 端口。該進程雖處於 LISTENING 狀態，但其內部狀態已損壞，無法正確處理請求或提供靜態資源，導致所有請求回傳 500。由於用戶瀏覽器仍訪問 3000 端口，而正常的 Next.js 服務已跳轉至 3001，造成資源載入完全失效。

### 解決方案
1. 使用 `netstat -ano | findstr :3000` 找出 PID 552。
2. 使用 `taskkill /F /PID 552` 強制中止該進程。
3. 重啟 `npm run dev`，確保伺服器成功掛載於標準 3000 端口。

### 預防重複犯錯的 Checkbox
- [x] 遇到「Port Jump」(3000 -> 3001) 時，務必先清理 3000 端口而非順從跳轉。
- [x] 若出現全局 500 錯誤且伴隨資源 404/500，應優先檢查端口佔用與進程狀態。
- [x] 配合 `Ctrl + F5` 強制刷新，避免瀏覽器快取舊有的 500 報價。

### 2026-01-28 K線圖 priceScale('') 導致 Incorrect ID 錯誤

### 問題現象
- 前端在進入個股詳情頁或技術分析面板時，彈出 **Unhandled Runtime Error**: `Trying to apply price scale options with incorrect ID`。

### 底層根本原因
- **無效 ID 調用**：`lightweight-charts` 在指定版本中，`priceScale(id)` 的 ID 參數不能是空字串。傳入 `''` 會被視為無效 ID 調用。

### 解決方案
1. **配置下沉**：將 `scaleMargins` 配置移入 `createChart` 的 initialization options 中。
2. **明確 ID 定義**：對於自定義比例尺，給予明確的字串 ID（如 `'volume'`）。

### 預防重複犯錯的 Checkbox
- [x] 避免在 `useEffect` 中對匿名比例尺 (`priceScale('')`) 調用 `applyOptions`。
- [x] 新增序列時，務必提供明確的 `priceScaleId` 或使用預設 ID。

### 2026-01-28 KLineChart 變數作用域與渲染同步修復 (深度修補)

### 問題現象
- 前端在修正 ID 錯誤後，因作用域限制導致 `ReferenceError: volumeSeries is not defined`。
- 整頁（包含總覽）因 JavaScript 崩潰而導致白屏或無法操作。

### 底層根本原因
1. **作用域滲漏**：在 `useEffect` 中將變數 `volumeSeries` 宣告於 `if` 塊內，但在塊外試圖操作其數據。
2. **時序不一致**：指標面板圖表使用索引 (0,1,2...) 作為時間軸，導致其無法與主圖表 (UNIX Timestamp) 的渲染引擎正確共存或展示。

### 解決方案
1. **作用域提升 (Hoisting)**：在 `useEffect` 頂層定義局部變數實例，或直接同步在定義塊內完成 `setData`。
2. **時序標準化**：統一所有圖表組件使用 API 提供之 UNIX Timestamp，確保繪測引擎邏輯對齊。

### 預防重複犯錯的 Checkbox
- [x] 禁止在 Block Scope (if/for) 之外引用內部宣告的圖表實例。
- [x] 跨組件數據渲染前，必須確認其時間軸格式 (Timestamp vs Index) 絕對一致。

### 2026-01-28 日期欄位對齊導致 slice() 報錯

### 問題現象
- 前端頁面（Chips, Institutional, Margin）崩潰或顯示為空白。
- 報錯原因：`TypeError: Cannot read properties of undefined (reading 'slice')`。

### 底層根本原因
- **欄位未對齊**：前端預期 API 傳回 `date` 字串並使用 `slice(5)` 格式化，但 API 重構後僅傳回 `time` (UNIX Timestamp)，導致 `date` 欄位為 `undefined`。

### 解決方案
1. **統一標準**：前端全面改以 `time` 為基準。
2. **健壯的格式化函數**：不再依賴字串切割，改用法：`new Date(time * 1000)` 後提取月與日。

### 預防重複犯錯的 Checkbox
- [x] 嚴格禁止對可能不存在的 API 欄位直接調用 `slice()`。
- [x] 在 Recharts `XAxis` 格式化函數中，應先進行 Null Check。
- [x] 優先使用 UNIX Timestamp 作為時序數據的交換格式。
### #24 錯誤訊息本地化與雙語化教訓 (Bilingual Error Localization)

| 屬性 | 值 |
| --- | --- |
| 發生日期 | 2026-01-28 |
| 影響範圍 | UX / 可維護性 |
| 嚴重程度 | 中 (優化項) |

### 問題現象
- 使用者看到紅色警示框顯示 `Unauthorized` 或 `Failed to fetch`，雖知道出錯但不知具體含義。
- 若直接中文化，開發者在遠端排錯時會失去底層 Error String (如 401, 500 等原始碼)，難以判讀。

### 底層根因 (First Principles)
1. **導讀斷層**：UI 錯誤訊息通常直接透傳 `err.message`。
2. **資訊遺失**：在 fetch 時若不 `await response.json()`，則無法獲取伺服器返回的具體錯誤字串（例如後端返回的 `{ "error": "Unauthorized" }` 被 Next.js fetch 封裝成通用的 401）。

### 解決方案
1. **建立雙語工具函式**：實作 `formatErrorMessage(msg)`，將 `Unauthorized` 轉換為 `登入逾時或權限不足 (Unauthorized)`。
2. **優化 Error Parsing**：在 `if (!response.ok)` 時，先嘗試解析 JSON 中的 `error` 欄位再 `throw`，確保 `formatErrorMessage` 拿到的是最具體的錯誤原因。

### 預防重複犯錯的 Checkbox
- [x] UI 錯誤提示應遵循 `[繁體中文] ([English (Original Message)])` 格式。
- [x] catch 區塊統一使用 `formatErrorMessage(err.message)` 進行包裝。
- [x] 在 `throw new Error` 之前，務必檢查是否有後端傳回的詳細錯誤訊息可用。

### 2026-01-29 Phase 7.5 籌碼數據 ETL 與 API 精度教訓

### 問題現象
1. **SSL 憑證失敗**：Python `requests` 報錯 `[SSL: CERTIFICATE_VERIFY_FAILED]`，致使後端無法從證交所抓取資料。
2. **數據量嚴重不足**：每日僅抓取到 7-8 筆資料，原以為是 API 改版，實際為參數遺漏。
3. **欄位偏移與 404**：原有的 Margin API 接口失效回傳 404，且手動調整索引後的資料在 API 更新後出現對齊錯誤。

### 底層根本原因
1. **SSL 阻礙**：證交所部分路徑的憑證校驗在某些 Python 環境下載入不全。
2. **隱藏參數限制**：`rwd/zh/fund/T86` 預設僅返回部分分類，需顯式指定 `selectType=ALL` 始能獲取全市場資料。
3. **硬編碼索引 (Hardcoding)**：使用 `row[2]`, `row[3]` 存取數據。當證交所為了 RWD 調整 HTML 結構或新增欄位（如「外資自營商買進金額」）時，索引即發生偏移。

### 解決方案
1. **SSL 繞過與後端強化**：實作 `verify=False` 並加入 `urllib3.disable_warnings()` 清理日誌。
2. **參數校準**：將 `type=DAY` 修正為 `selectType=ALL`。
3. **動態關鍵字導航**：實作「關鍵字索引映射」機制。程式碼自動遍歷 `fields` 列表，尋找包含「證券代號」、「投信買進」等關鍵字的索引值，確保即使欄位順序更動，抓取邏輯仍具抗壓性。

### 預防重複犯錯的 Checkbox
- [x] 大量擷取前，手動用瀏覽器測試 API 返還的 JSON `count` 是否與市場實際標的數量一致。
- [x] 禁止在 ETL 邏輯中使用硬編碼數字索引，務必動態匹配 `fields`。
- [x] 若遭遇 SSL 憑證報錯，應先評估資料來源安全性，隨後套用 `verify=False` 作過度。
- [x] 對於 RWD 版 API 介面，應確認是否存在傳統 `exchangeReport` 穩定接口作為備援。
### 2026-01-29 Phase 7.7 GitHub CI 前端建置 (Build) 失敗教訓

### 問題現象
1. **GitHub Actions 報錯**：在執行 `Frontend Build Check` 時失敗，回報 81 個 TypeScript 型別錯誤。
2. **錯誤集中點**：集中在 `app/api/v1/` 路由與 `app/page.tsx` 首頁元件。

### 底層根本原因
1. **聚合 Endpoint 型別偏移**：新開發的 V1 API 返回的是多表聚合數據，但前端 `StockDetailResponse` 介面仍停留在舊版的單表結構（陣列型態），導致存取屬性（如 `quote`, `financials`）時報錯。
2. **隱式 any 限制**：CI 環境的 `tsconfig.json` 開啟了嚴格模式，而代碼中在 `map` 迴圈處理數據時漏掉型別宣告，且 `supabase` 的 `single()` 回傳值被推導為 `never` 或 `unknown`。
3. **Props 不匹配**：`MacroChart` 組件在使用時漏填了 `title` 必填項，且傳入了未定義的 `hideGrid` 屬性。

### 解決方案
1. **對齊型別庫**：更新 `types/api.ts` 確保 `StockDetailResponse` 完美對齊 V1 API 的 JSON 結構。
2. **強化型別斷言**：在 API Route 中使用 `const d = priceData as any` 或 `as any[]` 顯式規避 Supabase 聯表查詢時的推導困難。
3. **組件重構 (KISS)**：修改 `MacroChart` 使其 Prop 具備預設值與選擇性，增加 UI 調用彈性。

### 預防重複犯錯的 Checkbox
- [x] 推送代碼前，務必在地端執行一次 `npx tsc --noEmit`。
- [x] 對於複雜的聚合查詢（Joint Query），若 Supabase 自動推導失效，應建立專屬介面或使用型別斷言。
- [x] 新增 API 路由時，應同時檢查 `frontend/types/api.ts` 是否同步更新結構。
