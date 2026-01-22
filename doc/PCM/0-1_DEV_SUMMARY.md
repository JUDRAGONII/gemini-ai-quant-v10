# 0-1_DEV_SUMMARY (開發摘要)

## 📌 當前里程碑 (Current Milestone)
**階段**：Phase 4.3: 功能擴充 (Feature Expansion)
**狀態**：✅ 籌碼與宏觀子頁面 (P1/P2) 實作與 TDD 驗證達成 100% 通過。語義搜尋 (P3) 延後。

---

## 📝 待辦清單 (Todo List)

### Priority 1: 基礎設施與後端 (Backend) - [COMPLETED]
- [x] **建立專案環境與 QA**
- [x] **實作 ETL 模組** (`etl/macro.py`)
- [x] **實作 AI 引擎** (`agents/dialectic.py`)
- [x] **實作 Prefect 任務編排** (`flows.py`)

### Priority 2: 前端應用開發 (Frontend Implementation) - [Phase 4.2 COMPLETED]
- [x] **Next.js 專案初始化**
- [x] **Supabase Client (Frontend) 封裝**
- [x] **Dashboard 介面實作** (Trend Charts, Recharts)
- [x] **AI 報告視覺化頁面** (Markdown, Prose, Dynamic Route)
- [x] **Phase 4.2 核心功能強化** (StockCard, PriceChart, Ranking)

### Priority 3: 功能擴充 (Phase 4.3) - [P1/P2 COMPLETED]
- [x] **籌碼子頁面**：`/chips/margin`, `/chips/institutional` (Layout + Charts)
- [x] **宏觀子頁面**：`/macro`, `/macro/[indicator]` (Supabase Integration)
- [ ] **[DEFERRED]** **語義搜尋**：RAG Pipeline + `CommandK` 組件 (待後端開發完畢後啟動)

### Priority 4: 系統整合與發布 (Phase 5 & 6)
- [ ] **E2E Browser Test (Playwright)**: 解決 Mock 無法捕捉的渲染/CORS 問題 (Phase 5)。
- [ ] **Refactor**: 統一升級專案環境 (Docker + CI) 至 Python 3.11 (Phase 5 Post-Launch)。
- [ ] **Security Audit (CodeQL)**: 上線前安全掃描 (Phase 6)。

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

