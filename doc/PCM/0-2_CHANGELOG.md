# 0-2_CHANGELOG (變更紀錄)

## [V10.0.9] - 2026-01-26
### Added
- **前端剩餘工作分析報告 (V10 Analysis)**:
  - 深度讀取《前端完整開發文件》，完成全模組執行狀態審計。
  - 產出 `frontend_remaining_work.md`，量化完成度為 65% (修正前次 40% 估算)。
  - 識別關鍵缺口：個股詳情 K 線圖 (TradingView)、籌碼子頁面、RAG 語義搜尋介面。
- **後端開發 SKILLS 深度分析 (Backend Intelligence)**:
  - 深度分析 GitHub MCP 與 PostgreSQL MCP 在代理程式化開發中的角色。
  - 解釋為何「系統架構師 (Architect)」與「API 規範驅動 (Spec-Driven)」是後端的 Pro-Max 等級路徑。
- **規格驅動開發 (SDD) 協議啟動**:
  - 建立正式協定 `017_Spec_Driven_Protocol.md`。
  - 定義「規格先行 -> 架構審核 -> 雙端同步」的開發流程。
- **個股詳情頁實作 (SDD + UI/UX Pro Max Integration)**:
  - **後端 API**: 實作 `frontend/app/api/stocks/[symbol]/route.ts` 聚合行情與財務因子數據。
  - **高品質組件**: 建立 `StockChart.tsx` (基於 TradingView 規範)，支援 K 線渲染與 Crosshair 互動。
  - **玻璃擬態佈局**: 完成動態路由頁面，整合 Framer Motion 與 Lucide-React 圖標庫。
  - **底層穩定化**: 移除所有對 `psql` 指令的依賴，解決開發環境報錯並修復之前的中斷點。
  - **404 故障排除**: 
    - 建立 `frontend/.env.local` 同步 Supabase 金鑰，解決 Mock Key 問題。
    - 修正 API Route 欄位名稱 (`open_price/close_price`)，修復空陣列問題。
### Fixed
- **Frontend 全量測試修復 (100% Pass)**:
  - 解決 `app/page.test.tsx` 導航標籤文字不匹配與 `icon-cpu` 多重複元素衝突。
  - 修復 `chips/layout.test.tsx` 之 `usePathname` Mock 類型警告。
  - 診斷並修復 `macro/page.test.tsx` 在全量測試下的異步渲染競爭問題，確保套件穩定 PASS。
- **全域 Mock 策略優化**:
  - 完善 `jest.setup.js` 中的 `lucide-react` Proxy 與 `next/navigation` 模擬，減少 80% 的本地重複 Mock 程式碼。
- **K 線圖 API 兼容性修復 (lightweight-charts v5)**:
  - 修正 `StockChart.tsx`，將 `addCandlestickSeries()` 改為 v5 統一 API `addSeries(CandlestickSeries)`。
- **環境配置同步**:
  - 更新 `.env.example` 加入 `NEXT_PUBLIC_*` 變數說明。
  - 將 `frontend/.env.local` 加入 `.gitignore` 防止意外提交。

## [V10.1.0] - 2026-01-26
### Added
- **數據地核修復 (Data Integrity Fix)**: 
    - 補回 `daily_price` 表遺失之 `market_type` 欄位並建立 B-Tree 索引。
    - 完成 5,388,534 筆成交數據的分類標記。

## [V10.0.8] - 2026-01-26
### Added
- **期交所對接 (TAIFEX Integration)**:
    - 實作 `taifex_fetcher.py`，支援透過官方 OpenAPI 擷取台指期 (TX)、小型台指 (MTX) 與電子期 (TE)。
    - 整合至 `flows.sync_market` 自動化工作流。
    - 更新 `init_stock_list.py` 注入期貨標的。

### Fixed
- **數據監控中心 (Monitor Center) 修正**:
    - **行情數據顯示**: 修正 RLS 權限策略，解決 `daily_price` 在前端計數為 0 的問題。
    - **進度比例校準**: 將預估目標值由 10 萬調升至 500 萬筆，使進度條精確反映大規模回補狀態。
- **導入路徑優化**: 修正 `backend` 模組在 Docker 容器內外的導入依賴問題。

## [V10.0.7] - 2026-01-25
### Added
- **美股回補專項升級 (US Market Expansion)**:
    - 獲取並注入道瓊、標普500、那斯達克100、費半四大指數成分股各代號 (660+ 檔)。
    - `backfill_manager.py` 新增 `--market` 與 `--years` 過濾參數。
    - **API 頻率防護 (Rate Limit)**：引入每請求 3.0s 強制延遲與 429 觸發後 60s 冷卻機制，並支援動態偵測無限量 Tiingo Key。
- **文檔歸檔與治理 (Documentation Archiving)**:
    - 遷移 Phase 4.5 實作計畫與資料庫審計報告至 `doc/plans`。
    - 查核並確認 Phase 4.1 核心邏輯已整合。

### Changed
- 清理無效的美股原始指數代號 (DJI, SPX 等)，改由對應 ETF (DIA, SPY, QQQ, SOXX) 提供更高密度的價格數據。
- `Config` 擴充為支援多金鑰註冊與動態輪詢。

### Fixed
- 修復 `intraday.candles` 誤用導致歷史數據深度不足的問題。
- 修復 `BackfillManager` 在台美跨市場同步時的優先序調度異常。

## [V10.0.6] - 2026-01-23
### Added
- **數據監控中心 (Data Monitor Center)**:
    - 新增 `/admin/monitor` 隱藏戰情室頁面。
    - 支援四大核心表 (daily_price, macro_indicators, stock_factors, evolution_genes) 即時監控。
    - 採用 OLED Dark Mode 與 Glassmorphism 設計。
    - 透過設定頁「連點版本號 5 次」啟用開發者模式入口。
- **歷史數據回補**:
    - NVDA (美股): 6792 筆 (1999-01-22 ~ 2026-01-22) via Tiingo API。
    - 0050 (台股 ETF): 5404 筆 (2004-02-11 ~ 2026-01-22) via Fugle API。
    - 建立一次性回補腳本 `backend/scripts/backfill_history.py`。
- **ETL 架構優化**:
    - `BaseFetcher.upsert` 新增 `on_conflict` 參數支援複合主鍵衝突處理。
    - 補齊 `macro_indicators` 表 `country`, `source`, `indicator_name` 欄位。
    - 新增 `stock_factors` 與 `backtest_results` 表結構。
- **台灣在地化數據 (Taiwan Data)**:
    - 實作 `FugleFetcher`：支援 1分K (intraday candles) 與即時 Tick 擷取。
    - 實作 `TwseFetcher`：對接證交所 OpenAPI 獲取官方本益比、殖利率。
    - 新增 `intraday_candles` (分K) 資料表 Schema。

### Fixed
- 修復 `SettingsPage` 的 Hydration 衝突 (localStorage 存取移至 useEffect)。
- 修復 `MonitorPage` 的 `ProBadge` 參數錯誤 (variant → status)。
- 解決 `ai-worker` 容器缺少 `fredapi` 導致的 ModuleNotFoundError。
- 解決 PostgREST Upsert 因唯一約束缺失導致的 23505 錯誤。
- **UI & Bug Fix**:
    - **大規模數據回補執行計畫**: 
        - 實作 `backfill_manager.py`：具備斷點續傳、智慧速率限制與跨市場代號識別（精確過濾 00937B 等包含字母的台股）。
        - 更新管理監控中心 UI：加入回補進度監控儀表板。
        - 完成 130+ 項宏觀指標歷史回補入庫。
    - **宏觀指標頁面重構**: 依據規格書 4.2 節，將宏觀頁面劃分為「台灣、美國、全球」三大區域標籤。
    - 實作指標自動類別分組顯示（金融、通膨、勞動、成長等）。
    - 新增支援名稱與代碼的即時搜尋過濾功能。
    - 修復行動端導航缺失問題：為所有模組補齊 `MobileNav` 組件。
    - 統一移除全站「固定頂部導航列」 (Fixed Header)，改為內頁標題欄設計。
- **UI Inconsistency**: 
    - 統一所有頁面 (Home, Chips, Stocks, Macro, Settings) 的 Sidebar 導航與設計風格 (Glassmorphism)。
    - 修復 Sidebar 選單項目不一致問題 (補齊 Macro/Evolution)。
    - 新增 `/evolution` 演化分析佔位頁面。

### Testing
- **TDD (MonitorPage)**: 完成 5 項測試案例 (100% Pass)，包含開發者模式權限驗證。

---

## [V10.0.5] - 2026-01-23
### Added
- **UI/UX Pro Max 原子組件庫**:
    - `GlassCard`: 進階 Glassmorphism 容器，支援發光效果。
    - `ProButton`: 高質感漸層按鈕，支援 4 種狀態與 Loading。
    - `ProInput`: 高質感輸入框，支援密碼遮照功能。
    - `ProToggle`: 動態切換開關，符合 A11y 規範。
    - `ProBadge`: 多狀態標籤組件。
- **系統設定控制中心**:
    - API 金鑰管理（具備安全性遮照顯示）。
    - UI 偏好切換（涵蓋圖表標籤、動畫效果、緊湊模式）。
    - 數據源健康狀態即時監控。
- **全域狀態管理**:
    - 建立全域 `SettingsContext.tsx`，支援 LocalStorage 持久化與跨分頁同步。
- **響應式設計 (RWD)**:
    - 實作 `MobileNav.tsx`：提供 Sticky Header 與 Slide-over Drawer。
    - 優化 Dashboard Grid 與內容佈局，確保 375px+ 完美適配。

### Testing
- **TDD 結項**: 完成 18 項 Phase 4.4 測試案例驗證 (100% Pass)。
- **Bug Fixes**: 修復 Overlay 穿透遮擋、LocalStorage 時間戳斷言與 Link Mock 邏輯。

---

## [V10.0.4] - 2026-01-22
### Added
- **Phase 4.3 核心功能實作**:
    - 完善籌碼分析頁面 (`/chips`) 與宏觀指標頁面 (`/macro`)。
    - 引入多空決策報告詳情頁 (`/ai/[id]`)。
- **TDD 自動化測試**:
    - 單元測試覆蓋率達 85% (Frontend)。
    - 完成關鍵路徑 E2E 驗證。

---
