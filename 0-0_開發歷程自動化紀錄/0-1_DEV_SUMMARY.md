# 0-1_DEV_SUMMARY (開發摘要)

## 📌 當前里程碑 (Current Milestone)
**階段**：Phase 3: 前端應用開發 (Frontend Development)
**狀態**：🚀 正在實作 Dashboard 介面。子計畫 001_ 已完成。

---

## 📝 待辦清單 (Todo List)

### Priority 1: 基礎設施與後端 (Backend) - [COMPLETED]
- [x] **建立專案環境與 QA**
- [x] **實作 ETL 模組** (`etl/macro.py`)
- [x] **實作 AI 引擎** (`agents/dialectic.py`)
- [x] **實作 Prefect 任務編排** (`flows.py`)

### Priority 2: 前端應用開發 (Frontend Implementation)
- [ ] **Next.js 專案初始化**
- [ ] **Supabase Client (Frontend) 封裝**
- [ ] **Dashboard 介面實作**
- [ ] **AI 報告視覺化頁面**

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

---

## 🔍 問題與教訓 (Lessons Learned)
*   **Docker PYTHONPATH**: 容器內掛載路徑導致 `ModuleNotFoundError`。解決方案：建立 `__init__.py` 並使用 `python -m` 呼叫或修正絕對路徑。
*   **Gemini Models**: `gemini-1.5-flash` 在特定 Key 下可能 404，需使用 `list_models()` 確認可用清單 (現使用 `gemini-2.0-flash`)。
*   **Quota Limit**: Free Tier API 易觸發 429。未來應引入重試機制或請求緩存。
