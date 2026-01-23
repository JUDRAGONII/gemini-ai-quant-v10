# 0-2_CHANGELOG (變更紀錄)

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

### Fixed
- 修復 `SettingsPage` 的 Hydration 衝突 (localStorage 存取移至 useEffect)。
- 修復 `MonitorPage` 的 `ProBadge` 參數錯誤 (variant → status)。
- 解決 `ai-worker` 容器缺少 `fredapi` 導致的 ModuleNotFoundError。
- 解決 PostgREST Upsert 因唯一約束缺失導致的 23505 錯誤。

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
