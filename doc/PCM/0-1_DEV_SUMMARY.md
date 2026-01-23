# 0-1_DEV_SUMMARY (開發摘要)

## 📌 當前里程碑 (Current Milestone)
**階段**：Phase 4.4: UI/UX Pro Max 完善與優化
**狀態**：✅ Phase 4.4 UI/UX Pro Max 完善與 RWD 適配已結項。TDD 18 案例 100% 通過。助於保障交付品質。

---

## 📝 待辦清單 (Todo List)

### Priority 1: 核心後端與 AI 注入 (AI Injection) - [COMPLETED]
- [x] **Market ETL 基礎模組**: 實作 `BaseFetcher` 與 Tiingo/Fugle 擷取器。
- [x] **演化運算引擎 (Genetic Algorithm)**: 實作 26 項基因組優化與 Backtest 邏輯。
- [x] **多因子評分 Service**: 實作 `FactorService` 與正規化算法。
- [x] **TDD 驗證：AI 演化引擎**: 完成 TC-1101 至 TC-4102 共 9 項基礎與邊界測試，驗證邏輯 100% 正確。
- [x] **歷史數據回補**: 0050.TW (5404筆) 與 NVDA (6792筆) 全量歷史 K 線已入庫。
- [x] **環境維護：清空 3000 端口並重啟**: 已中止佔用的 PID 3176 並穩定啟動 Next.js 於 3000 端口。
- [x] **修復：數據監控中心打不開**: 已修復 `SettingsPage` 的 Hydration 衝突與 `ProBadge` 參數錯誤。已通過 Lint 驗證。
- [x] **新功能：數據監控中心 (Data Monitor Center)**: 實作 `/admin/monitor` 與隱藏入口機制。
- [x] **TDD 驗證：數據監控中心**: 完成 TC-1101 至 TC-4001 共 5 項測試，修復開發者模式權限漏洞。
- [x] **Schema 補完**: 依照 3.0.0 規格書補齊 `stock_factors`, `macro_factors` 等表。
- [ ] **Security Audit (CodeQL)**: 上線前安全掃描 (Phase 6)。

### Priority 3: 前端功能對接 (Frontend Extension)
- [ ] **[DEFERRED]** **語義搜尋**: RAG Pipeline + `CommandK` 組件 (待後端開發完畢後啟動)。
- [ ] **E2E Browser Test (Playwright)**: 解決 Mock 無法捕捉的渲染/CORS 問題 (Phase 5)。


---

## 📊 執行歷程 (Execution Log)

| 時間 | 動作 | 詳細內容 |
|:---|:---|:---|
| 2026-01-20 | **Infra & QA** | 建立 Docker 體系，修復 JWT 簽名與 PostgreSQL 角色權限。 |
| 2026-01-20 | **Backend Core** | 實作 `lib/config`, `lib/supabase_client` 單例封裝。 |
| 2026-01-20 | **ETL & Data** | 實作 `etl/macro.py` 對接 FRED，成功寫入 GDP/CPI/VIX 數據。 |
| 2026-01-20 | **AI Dialectic** | 實作多空辯論引擎，整合 Gemini 2.0 Flash。已通過端到端測試。 |
| 2026-01-20 | **Orchestration** | 整合 Prefect 與 `schedule` 實現自動化任務排程。 |
| 2026-01-20 | **CI/CD** | 設置 GitHub Actions，實現 Push Trigger 自動測試與覆蓋率報告生成。 |
| 2026-01-22 | **Frontend UI** | 實作 Dashboard 趨勢圖 (`recharts`) 與 Glassmorphism 介面優化。 |
| 2026-01-22 | **TDD** | 完成 `MacroChart` 單元測試 (Pass)，建立前端自動化測試基礎。 |
| 2026-01-22 | **Feature** | 實作 `app/ai/[id]` 詳情頁，引入 Markdown 渲染引擎展現多空分析報告。 |
| 2026-01-22 | **E2E Test** | 完成 System E2E 驗收 (P5.1)，修復 Supabase v2 Syntax Error (`.table` -> `.from`)。 |
| 2026-01-22 | **Feature** | 實作 `app/chips` 籌碼分析頁 (Mock Data)，使用 ComposedChart 展示法人動向與股價關係。 |
| 2026-01-22 | **Review & Doc** | 完成 P4.3 代碼審查 (Grade: A) 與技術文件撰寫。 |
| 2026-01-22 | **CI Repair** | 修復 CI/CD 流程：TypeScript 型別錯誤、ESLint 降級、Dynamic Routes 配置。 |
| 2026-01-22 | **Phase 4.2** | 核心功能強化完成：StockCard, PriceChart, StocksPage, RankingPage，49 測試項目全數通過。 |
| 2026-01-22 | **Review** | 同步前端剩餘工作清單 (`frontend_remaining_work.md`)，移除技術選型風險，確認完成度 75%。 |
| 2026-01-22 | **Phase 4.3** | 完成籌碼與宏觀子頁面實作 (P1/P2)；落實 TDD 測試驅動開發，確保圖表與導航邏輯正確。 |
| 2026-01-22 | **Debug** | 修復 `Cannot find module './329.js'` 報錯，清理 `.next` 緩存。優化 Recharts 在 JSDOM 下的 Mock 穩定性。 |
| 2026-01-22 | **Environment** | 修正 `not-found.tsx` 邊界宣告 (Client Component)；清除佔用 Port 3000 的殭屍進程，恢復 Dashboard 渲染。 |
| 2026-01-22 | **QA / TDD** | 完成 Phase 4.3 測試計畫全項驗證（共 21 項案例），涵蓋 Edge Cases、安全性與 RWD 佈局。 |
| 2026-01-23 | **Phase 4.4** | 完成 UI/UX Pro Max 組件庫：`GlassCard`, `ProButton`, `ProInput`, `ProToggle`, `ProBadge`, `index.ts` 統一匯出。 |
| 2026-01-23 | **Settings** | 實作系統設定中心 (`/settings`)：API 管理、UI 偏好、數據源狀態監控。整合 `SettingsContext` 全域狀態。 |
| 2026-01-23 | **TDD** | 新增 10 項組件測試 (ProComponents.test.tsx)；全站 79/79 測試 100% 通過。 |
| 2026-01-23 | **RWD** | 建立 `MobileNav.tsx` 組件，包含 Sticky Header 與 Slide-over Drawer。整合至 Dashboard。 |
| 2026-01-23 | **Data Monitor** | 建立「數據監控中心」頁面 (`/admin/monitor`)。支援四核心表監控、即時統計與隱藏入口切換。 |
| 2026-01-23 | **Backend Core** | 完成 Phase 4.5 邏輯注入：實作 `BaseFetcher`、市場/宏觀擷取器與 DEAP 演化引擎。 |
| 2026-01-23 | **Review & Doc** | 完成 P4.5 相關文檔補全：對齊 130+ 指標、26 項基因組與詳細 Schema 定義。 |
| 2026-01-23 | **TDD** | 完成數據監控中心測試 (MonitorPage)，透過測試發現並修復了遺失的 Security Check 邏輯。 |
| 2026-01-23 | **Phase 4.4** | 完成 18 項 TDD 測試與 RWD 適配驗證（100% Pass），正式結項。助於進入下一階段。 |
| 2026-01-23 | **Deep Repair** | 執行 [/0-0] 修復流程：完整實作 MonitorPage 權限與排序邏輯，並重建缺少的 Schema 表格。 |
| 2026-01-23 | **Data Backfill** | 完成宏觀數據回補 (Macro Backfill)：寫入 41,215 筆歷史數據 (1990-2026)。 |
| 2026-01-23 | **Doc Refactor** | [EOD] 完成計畫文件歸檔 (`/doc/plans`) 與 GitHub CI 修復。Phase 4.4 結項，Phase 4.5 正式啟動。 |



---

## 🔍 問題與教訓 (Lessons Learned)
*   **Docker PYTHONPATH**: 容器內掛載路徑導致 `ModuleNotFoundError`。解決方案：建立 `__init__.py` 並使用 `python -m` 呼叫或修正絕對路徑。
*   **Gemini Models**: `gemini-1.5-flash` 在特定 Key 下可能 404，需使用 `list_models()` 確認可用清單 (現使用 `gemini-2.0-flash`)。
*   **Quota Limit**: Free Tier API 易觸發 429。未來應引入重試機制或請求緩存。
*   **CI Environment Drift**: CI (GitHub Actions) Python 版本必須與 Dockerfile 精確一致 (3.11 vs 3.10)。版本不匹配會導致依賴套件 (如 `g-genai`, `pandas`) 因底層 C 庫差異而崩潰，且難以在地端重現。

---

## 🔔 後續提醒清單 (Future Reminders)
- [ ] **語義搜尋 (P3) 開發**：待後端 RAG API 就緒後，提醒使用者重新啟動前端 `CommandK` 組件開發。
- [ ] **性能優化 (SWR/React Query)**：針對頻繁更新的籌碼數據引入數據快取與 SWR 重新驗證機制。
- [ ] **全系統安全性審核**：實作 Supabase RLS 策略並對 API 端點執行權限校驗。
- [ ] **部署方案調整**：針對 NAS (QNAP/Synology) 環境優化 Docker Volume 映射路徑與組態持久化。
- [ ] **響應式佈局 (Mobile Overlay)**：優化圖表組件在行動裝置上的顯示效果與側欄收合邏輯。

