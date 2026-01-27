# 010_Phase4.4_Settings_Monitor.md
**日期**: 2026-01-23
**階段**: Phase 4.4 - 系統設定與數據監控中心
**執行者**: Antigravity AI Agent

---

## 📋 任務目標
完成系統管理層功能，包含設定中心、數據回補監控與響應式導航優化。

---

## 🛠️ 開發內容

### 1. 系統設定中心 (`/settings`)
- 實作 API 金鑰管理介面 (支援 Mask/Unmask)。
- 建立全域狀態 `SettingsContext` (LocalStorage 持久化)。
- 支援 UI 偏好設定 (Compact/Normal Mode)。

### 2. 數據監控中心 (`/admin/monitor`)
- 實作隱藏戰情室 (Backdoor Entry)。
- 監控四大核心表 (`daily_price`, `macro`, `factors`, `genes`) 數據量。
- 整合回補進度儀表板 (Progress Dashboard)。

### 3. 響應式導航 (RWD)
- 實作 `MobileNav` 組件 (Sticky Header + Drawer)。
- 統一全站 Sidebar 設計 (Stocks/Chips/Macro/Settings)。
- 移除舊版 Fixed Header，優化行動端體驗。

### 4. 數據回補引擎 (Backfill)
- 實作 `backend/scripts/backfill_manager.py`。
- 支援斷點續傳 (Checkpoint) 與跨市場同步 (TW/US)。
- 寫入 41,215 筆宏觀歷史數據。

---

## ✅ 驗證結果
- [x] TDD: 完成 MonitorPage 與 SettingsPage 共 18 項測試 (100% Pass)。
- [x] RWD: 驗證 iPhone SE (375px) 至 Desktop (1920px) 佈局正常。
- [x] Data: 成功回補 NVDA (6792筆) 與 0050 (5404筆) 歷史行情。
