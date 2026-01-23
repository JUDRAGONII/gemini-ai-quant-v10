# 0-2_CHANGELOG (變更紀錄)

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
