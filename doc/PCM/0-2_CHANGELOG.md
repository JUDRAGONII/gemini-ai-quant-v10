# Changelog

## [V10.0.3] - 2026-01-22

### Added - Phase 4.3: 功能擴充 (進行中)
- **計畫補建**: 補建 `doc/plans/005_Phase4.2_CoreFeatures_Plan.md` 與 `006_Phase4.3_FeatureExpansion_Plan.md`。
- **憲級文件修正**: 修復架構偏移風險。將《前端完整開發文件》從 Vue.js 3 體系更新為 Next.js 14 + Tailwind CSS。
- **UI/UX 規範**: 載入 UI/UX Pro Max 設計技能 (Glassmorphism + Fintech Dark)。
- **籌碼子頁面 (P1)**: 完成 - `layout.tsx` (Tab 導航), `margin/page.tsx` (融資融券), `institutional/page.tsx` (三大法人), `mockMargin.ts` (模擬數據)。
- **宏觀子頁面 (P2)**: 完成 - `MacroIndicatorCard.tsx` (卡片組件), `mockMacro.ts` (六大指標模擬數據), `/macro/page.tsx` (主頁), `/macro/[indicator]/page.tsx` (詳情頁)。

---

## [V10.0.2] - 2026-01-22

### Added - Phase 3: 前端應用開發
- **Dashboard**: 實作 `MacroChart.tsx` 組件，引入 `recharts` 繪製 GDP/CPI/VIX 歷史趨勢圖。
- **UI Design**: 升級為 "Premium Dark Mode"，採用 Glassmorphism 設計與動態漸層。
- **Data Fetching**: 實作 `getIndicatorHistory` 並行抓取多維度時間序列數據。
- **Testing**: 建立 `MacroChart` 單元測試 (`__tests__/components/MacroChart.test.tsx`)，覆蓋率 100%。
- **New Page**: 實作 AI 報告詳情頁 (`app/ai/[id]`)，支援 Markdown 渲染與 Tailwind Typography 美化。
- **New Page**: 實作籌碼分析頁 (`app/chips`)，展示外資/投信/融資模擬數據與股價的連動分析。
- **Library**: 引入 `react-markdown`, `remark-gfm`, `@tailwindcss/typography`。
- **Docs**: 完成 Chips Page 相關代碼審查報告與技術規格書。
- **Core Features (Phase 4.2)**:
  - 實作完整股票查詢系統 (`/stocks`) 與 AI 評分排行 (`/ai/ranking`)。
  - 完成前端自動化測試 (`__tests__/app/stocks`, `__tests__/app/ai`)，解決 Hydration 與 Async Update 問題。
  - 實作 `StockCard`, `PriceChart` (Recharts), `ScoreRadarChart` 等核心組件。

## [V10.0.1] - 2026-01-20

### Added - Phase 2: 後端邏輯實作
- **後端核心**: `lib/config.py`, `lib/supabase_client.py` 提供穩定的連線與環境配置。
- **ETL 引擎**: `etl/macro.py` 成功抓取 FRED 數據 (GDP, CPI, UNRATE, FEDFUNDS, VIX, M2)。
- **AI 引擎**: `agents/dialectic.py` 實作多空辯論分析，整合 Google Gemini 2.0 Flash。
- **任務排程**: `flows.py` 導入 Prefect 任務管理與 `schedule` 自動排程器。
- **存檔機制**: 每完成一個子計畫自動產出驗證存檔 (`001`, `002`, `003`) 於專案日誌目錄。

### Added - Phase 1: 基礎設施建置
- **Infrastructure**: Initial Docker Compose setup for Supabase (DB, Kong, Auth, Rest, Realtime, Storage) and AI Worker.
- **Config**: `.env.example` template with support for multiple API keys.
- **Database**: `schema.sql` including `pgvector`, `pg_cron` extensions and core tables.
- **QA Tool**: `fix_jwt.py` 修復 JWT 簽名錯誤；`test_env.py` 驗證連線。

### Fixed
- 修復 Docker 容器內 Python Package 引用錯誤 (`ModuleNotFoundError`).
- 補齊缺失的 Python 依賴 `schedule`。
- 解決 `google-generativeai` 模型不匹配問題。

### CI/CD
- **GitHub Actions**: 新增 `ci_test.yml` 自動化流程。
- **Automated Testing**: 整合 `pytest` 運行單元測試與 `pytest-cov` 生成代碼覆蓋率報告 (HTML/XML)。
- **Artifacts**: 覆蓋率報告可直接從 GitHub Actions Summary 下載。

