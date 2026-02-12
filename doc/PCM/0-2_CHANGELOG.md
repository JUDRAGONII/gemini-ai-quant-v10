# AI 投資分析儀 V10.0 變更紀錄 (CHANGELOG)

**文件編號**：DOC-V10.0-CHANGELOG
**版本**：2.0.0
**最後更新**：2026-02-12
**狀態**：正式 (Official)

---

## [V10.5.2] - 2026-02-12
### Updated
- **PCM 文件重構**:
  - Phase Control Matrix 補全 P11/P12/P13 詳細內容 (v1.4.0)
  - DEV_SUMMARY 全面擴展，新增 Phase 11-13 詳細摘要 (v2.0.0)
  - CHANGELOG 日期順序重新整理，確保chronological order

## [V10.5.1] - 2026-02-12
### Added
- **Phase 13.5 雙語 UI 轉型完工**:
  - **雙語組件**: 建立 `Bilingual.tsx` 支持 `stacked`, `inline`, `suffix` 三種模式。
  - **全域導航**: 重構 `Sidebar` 與 `MobileNav` 資料結構，完美隔離中英文字串。
  - **Level 1 滲透**: 完成 Monitor (數據監控)、Strategy (智慧策略)、Insights (智力決策) 及 Chips/Macro/Evolution 等六大核心頁面的 UI 雙語化。
  - **Level 2 滲透**: Radar/Debate/ProButton 動態組件雙語化。
  - **視覺優化**: 微調英文樣式（小字、大寫、寬間距），符合 Rich Aesthetics 專業感。
  - **測試交付**: `Bilingual.test.tsx`: 5/5 PASS，TypeScript: 0 errors

## [V10.4.0] - 2026-02-12
### Added
- **法人級風險風控系統 (Phase 13.4)**:
  - **後端**: 實作 `RiskService` 模擬 Greeks (Delta, Gamma, Theta, Vega) 與 Barra 風格因子分解。
  - **API**: 新增 `GET /api/v1/professional/risk-matrix` 端點，支援 Redis 快取 (TTL 1hr)。
  - **前端**: 開發 `GreeksMonitor` 熱圖組件與 `PsychologyHub` 行為偏誤分析。
  - **頁面**: 建立 `/ai/risk` 風控終端主頁面，整合專業級風控指標。
  - **壓力測試**: 支援歷史極端場景分析 (2008 金融海嘯、2020 COVID)。
  - **驗證**: `verify_rtss$py$` 通過，TypeScript 0 errors。

## [V10.3.4] - 2026-02-12
### Added
- **演化策略基因組視覺化 (Phase 13.3 完工)**:
    - **GenomeMap**: 實作 26 階基因組映射雷達圖，將虛擬參數轉化為具備業務意義的視覺標籤。
    - **FitnessHistory**: 實作演化適應度遷移趨勢圖，動態監控策略收斂進程。
    - **持久化機制**: 建立 `evolution_history` 資料表 (float8[]) 與對應 RLS 門禁政策。
    - **引擎重構**: 修改 `EvolutionEngine.run` 實現手動迭代持久化。
    - **API 路由器**: 新增 `/api/v1/evolution/history` 與 `/api/v1/evolution/best` 端點。
    - **數據鉤子**: 封裝 `useEvolution` SWR Hook，支援演化進程實時監控。
- **介面整合**: 在 `/evolution` 頁面部署進階視覺化終端，取代佔位符。

## [V10.3.3] - 2026-02-11
### V10.5.1 (2026-02-11) - Phase 13.5 Level 1 雙語滲透完工
- **雙語組件**: 建立 `Bilingual.tsx` 支持 `stacked`, `inline`, `suffix` 三種模式。
- **全域導航**: 重構 `Sidebar` 與 `MobileNav` 資料結構，完美隔離中英文字串。
- **Level 1 滲透**: 完成 Monitor (數據監控)、Strategy (智慧策略)、Insights (智力決策) 及 Chips/Macro/Evolution 等六大核心頁面的 UI 雙語化。
- **視覺優化**: 微調英文樣式（小字、大寫、寬間距），符合 Rich Aesthetics 專業感。
- **測試交付**:
    - `Bilingual.test.tsx`: 5/5 PASS — 覆蓋三種模式與自訂樣式
    - TypeScript: `tsc --noEmit` → 0 errors

## [V10.5.0] - 2026-02-10
### Added
- **進階 AI 洞察與決策閉環 (Phase 12 全鏈路完工)**:
    - **AI 辯證引擎**: 模擬「價值、動能、宏觀」三方專家 AI 辯論邏輯，產出結構化共識報告。
    - **滯後相關性分析**: 支援計算領先/滯後 (Lead-Lag) 跨資產相關性，捕捉領先指標信號。
    - **戰術覆盤系統**: 建立 `tactical_plans` (RLS 安全加固)，落實投資決策的紀律化紀錄與反饋。
    - **Redis 二級緩存**: 實作智慧分級緩存，複雜洞察結果響應時間降至 < 2ms。
- **智力決策中心 (UI/UX Pro Max)**:
    - 建立 `app/ai/insights` 頁面，實裝 Bento Grid V3 佈局。
    - 整合 `DialecticPanel`, `TacticalPlanner`, `CorrelationChart` 高度動態交互組件。
- **基礎設施修復**:
    - 補齊缺失的 `auth.uid()` 函數與 `auth.users` 表架構，解鎖 Supabase RLS 權限鏈條。
- **API 回傳結構修復與生產硬化**:
    - `macro.py` `/calendar` 端點改為直接返回陣列，統一 API 回傳風格。
    - `CorrelationChart.tsx` 加入 `summary ?? fallback` 防禦性存取，防止 `null.toFixed()` 崩潰。
    - `EconomicCalendar.tsx` fetcher 加入巢狀結構自動解包。
    - `next.config.mjs` 合併為 `/api/:path*` catch-all rewrite，消除路由遺漏。
    - `useAlerts.ts` 修復 FastAPI trailing slash 307 redirect 問題。
- **全量自動化測試穩定性硬化 (Phase 11-12 CI Fix)**:
    - **Supabase Mock 強化**: 實作顯式鏈式 Mock (`.mockReturnValue(mockChain)`)，徹底解決 `query.order is not a function` 錯誤。
    - **SWR 測試隔離**: 在測試框架中導入 `SWRConfig` 局部 Cache 清理機制，消除測試案例間的數據污染。
    - **UI 文字同步**: 統一 `...` 載入文字與 `Refresh Data` 標籤，確保斷言 100% 命中。
    - **成功驗收**: 關鍵套件 (`MacroPage`, `AdminMonitor`, `MonitorV2`) 在全量測試下達成 100% Pass。

## [V10.4.2] - 2026-02-09
### Added
- **數據工程與全歷史回補 (Phase 11.7)**:
    - **標的主檔**: 重建 `init_stock_list.py`，完整覆蓋台股上市/上櫃、美股熱門成分股、大盤指數及期貨標的。
    - **Hybrid Fetcher**: 實作雙軌擷取邏輯，2010 年前強制轉換至 Yahoo Finance (還原股價)，2010 年後走官方 API。
    - **成功驗證**: 完成 AAPL 自 1990 年起約 9000 筆數據回補，2330 回補至 yfinance 極限年份 (2000)。
- **腳本優化**: 重構 `backfill_manager.py`，移除舊有亂碼字符，整合斷點續傳快照功能。

## [V10.4.1] - 2026-02-09
### Added
- **Schema 對齊與結構穩固 (Phase 11.6 SDD)**:
    - **Database**: 補全 `daily_price` 之 `turnover` 實體化欄位，大幅優化熱力圖計算效能。
    - **重構**: 將 `exchange_rates` 之 `reference_date` 統一為 `trade_date`，並將 `currency_pair` 拆分為 `base/target_currency`。
    - **RPC**: 建立 `get_latest_exchange_rates()` 支援高效即時匯率查詢。
- **API 規格升級**:
    - 更新 `008_API 端點詳細規格.md` 至 v3.1.0，正式納入第十二章「匯率數據 API」。
- **後端同步**:
    - 實作 FastAPI `/api/v1/market/exchange_rates` 歷史與即時查詢端點。
- **前端同步**:
    - 更新 `api.ts` 加入 `ExchangeRateResponse` 與 `ExchangeRateLatestResponse` 型別定義。

## [V10.4.0] - 2026-02-05
### Added
- **進階 AI 洞察引擎 (Advanced Insights Engine)**:
    - 實作 `InsightsService`：採用 Pandas 進行跨資產關聯分析，支援 `Outer Join` 數據對齊與 `Rolling Correlation` 計算。
    - 新增 API `/api/v1/insights/correlation` 端點。
- **Bento Grid V3 佈局 (UI/UX Pro Max)**:
    - 重構 `MacroPage` 為高質感 Bento 佈局，整合玻璃擬態與 1px 漸層發光邊框。
    - 整合 `InsightsPanel` 互動圖表組件，具備 Recharts 動態渲染與 Pearson 狀態評定。
    - 實作 `SmallStatCard` 提升關鍵經濟指標 (GDP, CPI, FED) 之首屏可視化。
- **TDD 測試驅動開發 (QA)**:
    - 建立 `insights.test.tsx` 驗證組件渲染與數據加載狀態。
    - 通過 `phase12_verification.py` 完成後端邏輯 E2E 驗收。

## [V10.3.16] - 2026-02-05
### Planning
- **[Plan]** 重構 Phase 11.2 ~ Phase 12 全景開發計畫。
- **[Research]** 完成台股 1990 全歷史調研，確定「Yahoo Finance + TWSE」雙源切換策略。
- **[Doc]** 產出 043, 044, 045, 046 詳細子計畫文件。
- **[DevLog]** 完成 081、082 開發日誌。

## [V10.3.15] - 2026-02-05
### Added
- **專案全景全量深度調研**: 完成對系統架構 (Next.js/FastAPI/Supabase)、數據現狀、功能對齊及代碼品質的 360 度審計。
- **缺口識別**: 發現 P0 級數據真空、`exchange_rates` 結構缺失及 `economic_event_fetcher` 未實作。
- **審計報告**: 產出 `080_Full_Scale_Project_Audit_Report.md`。

## [V10.3.13] - 2026-02-04
### Added
- **數據監控中心 UI 改造**: 擴展至 9 分類卡片（台灣/美國行情、台灣/美國宏觀、即時報價、多因子評分、演化基因、匯率、貴金屬）。
- **新增 RPC**: `get_category_counts()` 提供分類統計數據。
- **色彩主題系統**: 7 種分類色彩 (blue, emerald, amber, rose, violet, cyan, slate)。
- **待補充狀態**: 匯率/貴金屬卡片顯示「待補」標籤。

## [V10.3.12] - 2026-02-04

### Fixed
- **宏觀數據品質修復**: 過濾 `macro_indicators` 表中的 IMF 未來預測數據，ETL 邏輯新增 `reference_date > today` 檢查。
- **資料庫清理**: 一次性刪除 8 筆異常記錄 (2027-2030 年)。

## [V10.3.11] - 2026-02-04

### Fixed
- **前端熱修復**: 解決 Docker 環境下找不到 `swr` 模組的問題，並通過刷新匿名磁碟卷解決快取衝突。
- **環境同步**: 透過 `npm install swr` 與 `docker-compose up -d --renew-anon-volumes` 強制同步依賴。

### Added
- **Docker 優化**: 建立 `frontend/.dockerignore` 排除 `node_modules` 與 `.next` 目錄，大幅提升 Docker Build Context 傳輸效率。

## [V10.3.10] - 2026-02-04
### Added
- **文檔更新**: 建立開發日誌 `074`，記錄 Phase 10 部署準備。
- **CI 驗證**: 準備推送代碼以觸發 GitHub Actions 全量測試。

### Fixed
- **前端 CI 失敗**: 
    - 為 `AlertToastContainer` 加入 `"use client";` 修正 Server Component 限制。
    - 修正 `useHeatmap` 中的 TypeScript 類型斷言 (TS2345)。
- **變更摘要**: 更新 `0-1_DEV_SUMMARY.md` 推動進度至 Phase 11 監控階段。

## [V10.3.9] - 2026-02-04
### Fixed
- **後端日誌**: 為 `logging.basicConfig` 加入 `force=True`，修復 ai-worker 日誌被其他套件覆蓋的問題。
- **代碼清理**: 移除 `worker_entry.py` 與 `alert_scanner_worker.py` 中的調試用 `print`。

## [V10.3.8] - 2026-02-04
### Fixed
- [Frontend] 修復 `AlertToastContainer.tsx` 缺少 `"use client";` 指令導致的建置失敗。
- [Frontend] 修復 `useHeatmap.ts` 中 SWR fetcher 的 TypeScript TS2345 類型錯誤。
- [CI/CD] 通過本地 `npm run build` 驗證，解決 GitHub CI 前端編譯阻塞問題。

## [V10.3.8] - 2026-02-04
### Added
- [Phase 9.6] 實作「完全自動化調度器整合 (Automated Scheduler Integration)」。
- [Backend] 建立 `worker_entry.py` 作為統一 Worker 進入點，併發執行 `AlertScanner` (Async) 與 `Scheduler` (Async Loop)。
- [Infrastructure] 配置 `ai-worker` 強制日誌輸出 (`force=True`) 並持久化至文件，解決三方庫日誌黑洞問題。
- [Verification] 通過 Redis 模擬訊息流動驗證「行情-掃描-警示」完整閉環。

## [V10.3.7] - 2026-02-03

## [V10.3.6] - 2026-02-03
### Added
- [Phase 9.5] 實作「市場異動警示與通知引擎 (Market Alerts & Notification Engine)」。
- [Backend] 實作 `AlertService` 具備多維度條件掃描與 Redis 去重防抖。
- [Backend] 建立 `AlertScannerWorker` 異步監聽行情更新事件。
- [Backend] 完成 `market_alerts` 資料表、RLS 政策與 Realtime 廣播配置。
- [Frontend] 實作 `AlertToast`, `AlertPanel`, `AlertBadge` 全方位即時通知體系。
- [Frontend] 整合 `useAlerts` Hook 實現毫秒級 Supabase Realtime 推送響應。

## [V10.3.5] - 2026-02-03

## [V10.3.4] - 2026-02-03
### Changed
- **Phase 9 實作計畫校準 (Planning)**:
  - 調整「實時報價中繼」方案：改為「效能平衡報價中繼 (Quota-Balanced Market Relay)」。
  - 引入「配額感知」機制，將全市場更新頻率降低至 30 分鐘/次，優先保障自選股 (15 分鐘/次)。
  - 適配免費 API KEY 池 (Fugle, Tiingo) 之 RPM/RPD 限制，確保系統穩定性。

## [V10.3.3] - 2026-02-02
### Added
- **AI 決策報告分頁標籤化 (Phase 8.7 Completion)**:
  - 實作 `stocks/[symbol]/report` 獨立頁面，整合 markdown 渲染與評分雷達圖。
  - 在 `StockDetailLayout` 注入導航標籤，實現資訊一站式集成。
- **自動化測試強化**:
  - 實作 `stock_optimization.test.tsx` 覆蓋佈局變更與數據同步驗證。
  - 修復 `portfolio_crud.test.tsx` 與 `ranking/page.test.tsx` 之 UI 文字回歸問題，確保全站 100% 綠燈。

### Fixed
- **Infrastructure**: 修正 Server-side Fetch 因缺少封裝內網 API 權限導致的報告載入失敗，已通過 Docker 注入 `SERVICE_ROLE_KEY` 並優化 `INTERNAL_SUPABASE_URL`。
- **TypeScript**: 修復排行榜組件之屬性名稱大小寫不匹配與 `name` 屬性讀取錯誤。

## [V10.3.2] - 2026-02-02
### Fixed
- **智慧策略看板 UI/UX 優化**:
  - 新置「返回鍵」與麵包屑導航，解決深層頁面導航缺失問題。
  - 增加「預測閾值」描述提示文字，降低量化概念使用門檻。
  - 實作圖表週期切換 (1W/1M/3M/6M/1Y) 功能與地端數據數據濾邏輯。

## [V10.3.1] - 2026-02-02
### Fixed
- **GitHub CI 後端測試修復 (Infrastructure)**:
  - 建立 `backend/__init__.py` 確保 `backend` 被識別為有效 Python 套件。
  - 修正 `test_unit.py` 測試導入規範，統一使用 `backend.` 全域前綴。
  - 在 `ci_test.yml` 測試階段注入 `PYTHONPATH: ..`，解決遠端環境之模組解析衝突。
  - 補全 CI 環境之 `SERVICE_ROLE_KEY` Mock 以通過專案配置驗證。
- **後端鏈式導入修復 (Deep Import Fix)**:
  - 統一修復 `backend/` 下所有 Python 子模組的內部絕對導入，將 `from lib` 等路徑對齊至 `from backend.lib`。
  - 修復 `dialectic.py` 因語法損壞導致的 `SyntaxError` 與中文字元編碼問題。

## [V10.3.0] - 2026-01-30
### Added
- **Phase 8 AI 智慧與策略驗證 (Verification Completion)**:
  - **後端驗證**: 通過 `test_phase8.py` 驗證 XGBoost 推理準確性與向量化回測引擎。
  - **前端優化**: 實作 `StrategyHubPage` 之權益曲線繪製，並整合「智慧策略」入口。
  - **導航審計**: 補齊全站「可進入、可返回」路徑，包括個股詳情頁之「返回行情中心」按鈕。
### Fixed
- **Vector Engine**: 修復回測首列 NaN 問題，確保權益曲線起點正確。
- **Frontend Build**: 修正 `PortfolioPerformanceChart` 導入路徑與類型不匹配故障。
- **Workflow**: 整合 `/gen-test-case-02` 至 Phase 8 驗收流程。


## [V10.2.11] - 2026-01-29
### Added
- **Phase 8 詳細實作計畫 (`026_Phase8_AI_Core_Backtest_Plan.md`)**:
  - 定義 Alpha 特徵工廠規格 (50+ 維度向量化因子)。
  - 定義 XGBoost 預測模型開發路徑 (Regressor + 超額收益預測)。
  - 定義高性能向量化回測引擎架構 (矩陣運算 vs 步進模擬)。
  - 規劃前端智慧回測看板 UI (Glassmorphism & Recharts 整合)。

## [V10.2.10] - 2026-01-29
### Added
- **本地 CI 驗證工作流 (`/local-ci-v10`)**: 整合前端型別檢查 (TSC)、前端測試 (Jest) 與後端測試 (Pytest)，確保地端綠燈後才執行推送。

### Updated
- **Git 推送工作流優化 (`git_push_v10.md`)**:
  - **強制 Rebase**: 將 `git pull --rebase` 提升至第一步，解決因遠端同步導致的推送失敗。
  - **PowerShell 相容性**: 移除命令列中的 `&&` 分隔符，修正 PowerShell 語法報錯，實現「一次成功」目標，節省 AI 額度。

## [V10.2.9] - 2026-01-29
### Added
- **Phase 7.2 文件更新與測試交付**:
  - **008_API 端點詳細規格.md v3.0**: 新增第十章 Phase 7 新增端點 (10.1-10.5) 與第十一章共用類型定義
  - **005_資料庫 Migration 腳本集.md v3.0**: 新增 Phase 7 Migration 清單、資料表結構、PostgreSQL 視圖、索引優化、ETL Fetcher 清單

- **AI 報告 API 端點補全**:
  - `/api/v1/ai/reports/{id}` - AI 報告詳情端點
  - `/api/v1/ai/generate-report` - AI 報告生成端點 (支援快取機制)

- **測試交付**:
  - `backend/tests/test_api_endpoints.py` - 15 項 API 端點測試 (結構驗證、資料驗證、錯誤處理、分區測試)

### Updated
- **PCM (Phase Control Matrix)**: Phase 7 狀態更新為「已完成 ✅」，新增 Phase 7.2 完成區塊與 Phase 8 待啟動區塊

## [V10.2.8] - 2026-01-29
### Fixed
- **ETL 精度修正**: 修正三大法人與融資融券擷取參數，恢復全市場數據更新能力。
- **動態欄位解析**: 解決證交所 RWD 介面欄位索引不固定問題。

## [V10.2.7] - 2026-01-28
### Added
- **Infrastructure Enhancement**: 部署 Supabase Studio (:54323) 與 Meta 服務，強化本地開發環境管理能力。
- **前端恢復**: 修復開發伺服器連線中斷問題。

## [V10.2.6] - 2026-01-28
### Added
- **UI/UX 強化**: 實作 Glassmorphism V2 與高品質圖表適配。

## [V10.2.5] - 2026-01-28
### Added
- **Phase 7.1 延伸開發 (統一適配層與 ETL 補全)**:
  - **共用類型定義**: `frontend/types/api.ts` - ApiResponse、StockQuote、AIScore 等 20+ 共用類型
  - **聚合端點**: `/api/v1/stocks/{symbol}/detail` - 一次返回股價、財務、AI評分、技術指標
  - **ETL Fetcher 補全**:
    - `backend/etl/institutional_fetcher.py` - 三大法人買賣超數據擷取 (TWSE/TPEx)
    - `backend/etl/margin_fetcher.py` - 融資融券數據擷取 (TWSE)
  - **資料庫分區策略**: `backend/db/migrations/20260128_daily_price_partition.sql` - daily_price 年度分區

### Updated
- **PCM (Phase Control Matrix)**: Phase 7.1 延伸狀態更新為「已完成 ✅」，新增待執行項目區塊

### Files Added
- `frontend/types/api.ts`
- `frontend/app/api/v1/stocks/[symbol]/detail/route.ts`
- `backend/etl/institutional_fetcher.py`
- `backend/etl/margin_fetcher.py`
- `backend/db/migrations/20260128_daily_price_partition.sql`

## [V10.2.4] - 2026-01-28
### Updated
- **Phase 7.1 技術指標計算下沉 API 適配**:
  - `/api/stocks/[symbol]/technical` - 對接 `v_stock_technical_indicators` 視圖，移除 Mock 數據
  - `/api/ai/scores` - 改用 `stock_factors` 真實數據查詢，移除 `generateMockScores()`
  - **效能提升**：技術指標查詢延遲從 >3s 降至 <200ms
  - **數據驗證**：MA5/20/60, RSI(14), MACD(12,26,9), Bollinger Bands 數據正確

### Added
- **開發歷程紀錄 041**: `041_Phase7_API_Adapter.md` - API 適配開發紀錄
- **PCM 更新**: Phase 7 狀態更新為「已完成 ✅」，新增 Phase 7.1 技術指標下沉區塊

## [V10.2.3] - 2026-01-28
### Added
- **Phase 9.4: API 配額管理系統** (2026-02-03)
  - 實作 Redis + PostgreSQL 混合架構，支援高頻 API 配額計數。
  - 建立 `/admin/quota` 監控中心，視覺化多提供者 (Fugle, Tiingo, FRED) 健康狀態。
  - 整合 `BaseFetcher` 自動追蹤機制，支援異常連續錯誤自動冷卻功能。
- **Phase 9.2: 市場數據中繼站** (2026-02-03)
  - 完成行情數據中繼機制，整合至 ETL 管線。
- **Phase 7 完整 Migration (P0)**:
  - 實作具備冪等性的 `20260128_FIXED_MIGRATIONS.sql`。
  - **欄位更名**：成功將 `stocks` 表的 `symbol`, `name`, `market` 遷移至 `stock_code`, `stock_name`, `market_type`。
  - **新表建立**：建立 `user_portfolios`, `user_holdings`, `portfolio_performance`, `user_watchlist`, `stock_financials`。
  - **結構補全**：補齊 `daily_price` (adjusted_close) 與 `ai_reports` (report_type) 欄位。
  - **安全性**：注入 `auth.uid()` 與 `auth.jwt()` 以支援本地開發環境 RLS。

## [V10.2.2] - 2026-01-28
### Updated
- **全域欄位同步 (Global Field Sync)**:
  - 完成 `symbol` -> `stock_code` 全域更名，涵蓋 backend (Python) 與 frontend (Next.js) 層面。
  - 同步更新 `init_stock_list.py`, `backfill_manager.py`, `FMPFetcher`, `TwseFetcher` 等核心腳本。
  - 更新 `/api/stocks/[symbol]` 與 `/api/stocks/[symbol]/financials` 端點，確保資料庫欄位對齊。
  - 修正 `report_date`, `market_type`, `stock_name` 等規格定義欄位。
### Verified
- **Schema Reload**: 觸發 PostgREST Schema 重新加載，修正 API 屬性未定義錯誤。
- **ETL Success**: 成功透過 `init_stock_list.py` 重新初始化全市場標的清單。

## [V10.2.1] - 2026-01-28
### Added
- **Phase 7 後半段 API 端點**:
  - `/api/stocks/[symbol]/technical` - 技術指標 API (MA5/20/60, RSI, MACD, Bollinger)
  - `/api/macro/factors` - 宏觀因子 API
- **前端建置**: 成功通過 `npm run build`

### Updated
- **前端 API 路由**: 修正 Supabase client 初始化與 TypeScript 類型錯誤

## [V10.2.0] - 2026-01-28
### Added
- **Phase 7: 資料庫補全與後端完整性強化**:
  - **Migration 腳本 (6 個)**:
    - `20260128_01_create_stocks_table.sql` - stocks 股票主檔
    - `20260128_02_create_stock_financials.sql` - stock_financials 財報表
    - `20260128_03_create_user_portfolios.sql` - user_portfolios/holdings/performance
    - `20260128_04_create_user_watchlist.sql` - user_watchlist 自選股
    - `20260128_05_add_columns_to_daily_price.sql` - market_type, adjusted_close
    - `20260128_06_add_columns_to_ai_reports.sql` - context_snapshot, report_type
  - **API 端點補全 (5 個)**:
    - `/api/stocks/search` - 股票搜尋 API
    - `/api/stocks/[symbol]/institutional` - 三大法人買賣超 API
    - `/api/ai/scores` - AI 評分排行 API
    - `/api/ai/scores/[symbol]` - 個股 AI 評分 API
    - `/api/ai/reports` - AI 報告列表 API
  - **RLS 安全政策強化**:
    - user_portfolios - 用戶只能存取自己的投資組合
    - user_holdings - 依 portfolio_id 關聯控制
    - user_watchlist - 用戶只能存取自己的自選股
    - stock_financials - 匿名可讀、service_role 可寫

### Updated
- **PCM (Phase Control Matrix)**: 新增 Phase 7 階段與 Phase 8 部署階段
- **開發摘要 (DEV_SUMMARY)**: 記錄 Phase 7 開發進度
- **Phase 7 計畫書 (Plan 025)**: 狀態更新為 In Progress

## [V10.1.9] - 2026-01-28
### Added
- **Physical Audit**: 完成 Phase 7 計畫之「物理取證」(`doc/03_ARCH/20260128_03_P7_Deep_Audit_Report.md`)。
- **Budget Protection**: 強制攔截重複開發任務，將 P0 階段資源重新配置於效能優化。

## [V10.1.8] - 2026-01-28
### Added
- **Multi-Expert Review**: 完成對 `025_Phase7_Plan` 的全方位複核 (`doc/03_ARCH/20260128_02_P7_Plan_Audit.md`)。
- **Status Alignment**: 排除「投資組合」重複開發計畫。
- **UI Fix**: 解決開發工作流 `TaskStatus` 重疊顯示問題。

## [V10.1.7] - 2026-01-28
### Added
- **Architectural Audit**: 執行全系統深度審計，完成 `doc/03_ARCH/20260128_01_Global_Audit.md`。
- **Roadmap**: 定義 Phase 7 關鍵路徑：API 統一適配層、計算下沉至 DB、AI 閉環反饋機制。

## [V10.1.6] - 2026-01-28
### Added
- **Phase 4.5-AI: 投資組合與 AI UI 完成**:
  - **投資組合完整 CRUD 功能**:
    - 設計並建立 `user_portfolios`, `user_holdings`, `portfolio_performance` 資料表
    - 實作 RLS 安全政策確保用戶數據隔離
    - 實作 `/api/portfolios` 完整 CRUD API 端點
    - 實作 `/api/holdings` 持股部位 CRUD API
    - 實作 `/api/portfolios/[id]/performance` 績效計算與圖表 API
    - 開發投資組合列表頁面 (`app/portfolios/page.tsx`)
    - 開發投資組合詳情頁面 (`app/portfolios/[id]/page.tsx`)
    - 整合 PortfolioPerformanceChart 績效圖表組件
  - **RAG 語義搜尋 UI**:
    - 開發 `app/ai/search/page.tsx` 搜尋頁面
    - 實作搜尋輸入框與結果卡片顯示
    - 實作相似度分數視覺化進度條
    - 實作展開/收合功能顯示完整摘要
  - **AI 報告頁面優化**:
    - 強化 ScoreRadarChart 評分雷達圖互動功能
    - 新增 Skeleton.tsx 骨架屏組件優化載入體驗
  - **後端 API 補全**:
    - 實作 `/api/calendar` 經濟日曆 API
    - 實作 `/api/indicators/compare` 指標對比 API
  - **測試成果**:
    - 115+ 測試案例通過，完成率 92%
    - 建立 UAT 檢查清單 (60 項)
  - **工時統計**: 預估 40 人天，實際 9 人天 (效率提升 77%)

### Updated
- **PCM (Phase Control Matrix)**: Phase 4.5-AI 狀態更新為「已完成 ✅」
- **開發摘要 (DEV_SUMMARY)**: 記錄 Phase 7 里程碑為 PLANNING
- **Phase 4.5-AI 計畫書 (Plan 024)**: 狀態更新為 Completed

## [V10.1.5] - 2026-01-28
### Added
- **Localization**: 實作 `errorUtils` 支援「繁體中文 (English)」雙語錯誤訊息格式，符合核心開發工作流要求。
- **Error Handling**: 優化 `fetch` 捕捉邏輯，能自動解析 API 返回的 `Unauthorized` (401) 等身分驗證錯誤並進行本地化轉換。

## [V10.1.4] - 2026-01-28
### Fixed
- **CI/CD Pipeline**: 解決 GitHub Actions 前端測試套件全面失效問題。
- **Testing**: 修正 `KLineChart`, `PortfolioDetail`, `Watchlist`, `AIReport` 等多個測試案例的模擬物件 (Mocks) 與斷言 (Assertions)。
- **Async Loading**: 解決測試案例在組件加載完成前進行斷言導致的 Flaky Tests。
- **UI Consistency**: 同步測試中的按鈕文字、佔位文字與實際 UI 渲染內容。

## [V10.1.3] - 2026-01-27
### Fixed
- **圖表渲染與時序對齊修復 (Chart & Timescale Alignment)**:
  - **日期欄位對齊**: 解決 API 欄位從 `date` 改為 `time` 導致的 `slice()` 渲染崩潰，並擴及 `chips`, `institutional`, `margin` 等所有子頁面。
  - **作用域與核心修復**: 解決 `KLineChart.tsx` 中 `volumeSeries` 的 ReferenceError 與 ID 映射衝突。
  - **時序標準化**: 統一所有技術指標組件（RSI/MACD）採用與 K線圖一致的 UNIX Timestamp 時序軸。
  - **數據流優化**: 調整 `useStockDetail` 抓取筆數至 300 點，確保 MA60 等長線指標具備足夠計算空間。

## [V10.1.2] - 2026-01-28
### Fixed
- **Emergency: 前端 Runtime Error 修復**:
  - **K線圖 ID 修正**: 修復 `priceScale('')` 引起的 Incorrect ID 錯誤，優化指標面板與 K 線圖之比例尺邊距配置。
  - **殭屍進程清理**: 偵測並中止佔用 3000 端口的 PID 552 殭屍進程，解決資源加載 500 錯誤。
  - **服務重啟**: 重啟 Next.js 並成功掛載於標準 3000 端口。
  - **PCM 更新**: 同步更新「錯誤教訓 (ERROR_LESSONS)」與「開發日誌 (Dev Log)」。

## [V10.1.1] - 2026-01-27
### Added
- **Phase 6: 財報與技術分析驗證 (Validation Phase)**:
  - **自動化測試**: 實作 `frontend/__tests__/financials_technical.test.tsx`，通過 8 項核心測試案例 (100% Pass)。
  - **安全性驗證**: 驗證 `stock_financials` 表之 RLS 政策，確認匿名讀取與 Service Role 寫入隔離。
  - **計算準確性**: 驗證前端 `useStockDetail` 結合即時指標 (MA, RSI, MACD) 邏輯在不同數據長度下的穩定性。
  - **Bug Fix**: 解決 JSDOM 環境下 SWR 與 Framer Motion 導致的測試超時與組件重建問題。

### Verified
- TypeScript: `npx tsc --noEmit` → Exit 0 ✅
- Jest: 19 Passed, 1 Skipped, 101 Tests ✅

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
