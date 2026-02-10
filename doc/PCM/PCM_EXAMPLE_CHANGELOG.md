# 變更紀錄 (CHANGELOG)

**文件編號**：DOC-V10.0-CHANGELOG
**版本**：2.0.0
**狀態**：正式 (Official)
**建立日期**：2026-01-27
**最後更新**：2026-02-06
**維護原則**：
- 使用語意化版本 (Semantic Versioning)
- 所有重大變更必須記錄
- 版本號格式：`[主版本].[次版本].[修訂版本]`

---

## 版本變更紀錄摘要

| 版本 | 日期 | 變更類型 | 變更摘要 | 重大變更 |
|------|------|----------|----------|----------|
| V10.4.0 | 2026-02-05 | Minor | 進階 AI 洞察引擎、Bento Grid V3 佈局 | 否 |
| V10.3.16 | 2026-02-05 | Minor | Phase 11~12 全景開發計畫 | 否 |
| V10.3.15 | 2026-02-05 | Minor | 專案全景全量深度調研 | 否 |
| V10.3.0 | 2026-01-30 | Minor | Phase 8 AI 智慧與策略驗證完成 | 否 |
| V10.2.0 | 2026-01-28 | Minor | Phase 7 資料庫補全完成 | 否 |
| V10.0.0 | 2026-01-20 | Major | 初始版本發布 | 是 |

---

## [V10.4.0] - 2026-02-05

### Added
- **進階 AI 洞察引擎 (Advanced Insights Engine)**
  - 實作 `InsightsService` 採用 Pandas 進行跨資產關聯分析
  - 支援 `Outer Join` 數據對齊與 `Rolling Correlation` 計算
  - 新增 API `/api/v1/insights/correlation` 端點

- **Bento Grid V3 佈局 (UI/UX Pro Max)**
  - 重構 `MacroPage` 為高質感 Bento 佈局
  - 整合玻璃擬態與 1px 漸層發光邊框
  - 整合 `InsightsPanel` 互動圖表組件

- **TDD 測試驅動開發 (QA)**
  - 建立 `insights.test.tsx` 驗證組件渲染與數據加載狀態
  - 通過 `phase12_verification.py` 完成後端邏輯 E2E 驗收

### Changed
- 監控中心卡片數量擴展至 9 種分類
- 色彩主題系統優化

### Fixed
- 宏觀數據品質修復：過濾 IMF 未來預測數據

---

## [V10.3.16] - 2026-02-05

### Added
- **Phase 11~12 全景開發計畫重構**
  - 重構 Phase 11.2 ~ Phase 12 全景開發計畫
  - 完成台股 1990 全歷史調研
  - 確定「Yahoo Finance + TWSE」雙源切換策略
  - 產出 043, 044, 045, 046 詳細子計畫文件

### Planning
- 開發日誌 081、082 完成

---

## [V10.3.15] - 2026-02-05

### Added
- **專案全景全量深度調研**
  - 完成對系統架構 (Next.js/FastAPI/Supabase) 全面審計
  - 完成數據現狀與功能對齊分析
  - 完成代碼品質評估

### Identified Gaps
- P0 級數據真空識別
- `exchange_rates` 結構缺失
- `economic_event_fetcher` 未實作

### Documentation
- 產出 `080_Full_Scale_Project_Audit_Report.md`

---

## [V10.3.0] - 2026-01-30

### Added
- **Phase 8 AI 智慧與策略驗證完成**
  - **後端驗證**：通過 `test_phase8.py` 驗證 XGBoost 推理準確性
  - **前端優化**：實作 `StrategyHubPage` 權益曲線繪製
  - **導航審計**：補齊全站「可進入、可返回」路徑

### Fixed
- **Vector Engine**：修復回測首列 NaN 問題
- **Frontend Build**：修正 `PortfolioPerformanceChart` 導入路徑

---

## [V10.2.0] - 2026-01-28

### Added
- **Phase 7: 資料庫補全與後端完整性強化**

  - **Migration 腳本 (6 個)**：
    - `20260128_01_create_stocks_table.sql`
    - `20260128_02_create_stock_financials.sql`
    - `20260128_03_create_user_portfolios.sql`
    - `20260128_04_create_user_watchlist.sql`
    - `20260128_05_add_columns_to_daily_price.sql`
    - `20260128_06_add_columns_to_ai_reports.sql`

  - **API 端點補全 (5 個)**：
    - `/api/stocks/search`
    - `/api/stocks/[symbol]/institutional`
    - `/api/ai/scores`
    - `/api/ai/scores/[symbol]`
    - `/api/ai/reports`

  - **RLS 安全政策強化**：
    - user_portfolios - 用戶只能存取自己的投資組合
    - user_holdings - 依 portfolio_id 關聯控制
    - user_watchlist - 用戶只能存取自己的自選股
    - stock_financials - 匿名可讀、service_role 可寫

---

## [V10.0.0] - 2026-01-20

### Added
- **初始版本發布**
  - Docker Compose 服務編排 (PostgreSQL, Redis, Kong, Auth, Realtime)
  - FastAPI 後端基礎架構
  - Next.js 14 前端應用
  - 基礎 ETL 數據管道 (FRED, Tiingo, Fugle)
  - AI 演化引擎框架
  - 基礎 UI 組件庫

### Breaking Changes
- 首次發布，無向後相容性考量

---

## 版本號說明

| 版本類型 | 說明 | 範例 |
|----------|------|------|
| Major | 重大變更，可能影響相容性 | 1.0.0 → 2.0.0 |
| Minor | 新功能，向後相容 | 1.0.0 → 1.1.0 |
| Patch | 錯誤修復，向後相容 | 1.0.0 → 1.0.1 |

## 變更類型說明

| 變更類型 | 說明 | 範例 |
|----------|------|------|
| Added | 新增功能 | 新增使用者註冊功能 |
| Changed | 現有功能變更 | 修改 API 回應格式 |
| Deprecated | 廢棄功能（未來會移除） | 標記 v1 API 為廢棄 |
| Fixed | 錯誤修復 | 修復登入 Session 問題 |
| Security | 安全性相關變更 | 修復 SQL Injection 漏洞 |
| Removed | 移除功能 | 移除舊版 API 端點 |

---

## 統計資訊 (截至 V10.4.0)

| 統計項目 | 數量 |
|----------|------|
| 總版本數 | 6 |
| Major 版本數 | 1 |
| Minor 版本數 | 5 |
| Patch 版本數 | 0 |
| 新增功能數 | 25+ |
| 錯誤修復數 | 30+ |

---

## 附錄

### A. 常用縮寫對照

| 縮寫 | 全名 | 說明 |
|------|------|------|
| API | Application Programming Interface | 應用程式介面 |
| DB | Database | 資料庫 |
| ETL | Extract, Transform, Load | 資料萃取轉載 |
| UI | User Interface | 使用者介面 |
| RLS | Row Level Security | 資料庫列級安全 |
| TDD | Test-Driven Development | 測試驅動開發 |
| CI/CD | Continuous Integration/Deployment | 持續整合/部署 |
| RAG | Retrieval-Augmented Generation | 檢索增強生成 |
| RPC | Remote Procedure Call | 遠端程序呼叫 |

### B. 參考資源

| 資源 | 連結 |
|------|------|
| 語意化版本 | https://semver.org/ |
| Keep a Changelog | https://keepachangelog.com/ |

---

**文件結束**

*文件編號：DOC-V10.0-CHANGELOG*
*版本：2.0.0*
*建立日期：2026-01-27*
*最後更新：2026-02-06*
*狀態：正式 (Official)*
