# Changelog

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

