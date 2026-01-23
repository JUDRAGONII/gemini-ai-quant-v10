# 007_Phase4.4_ProMax_Optimization_Plan.md

## 📅 任務元數據 (Metadata)
*   **日期**: 2026-01-23
*   **階段**: Phase 4.4 UI/UX Pro Max 完善與優化
*   **目標**: 建立原子化 UI 組件庫並實作控制中心風格的系統設定模組。
*   **設計規範**: UI/UX Pro Max (Premium Glassmorphism + Dynamic Glow)

## 🧠 深度思考 (Thinking Phase)

### 需求解構
1.  **原子化組件庫**: 將重複的 UI 邏輯（玻璃卡片、按鈕、輸入框）封裝為精緻的原子組件。
2.  **系統設定中心**: `/settings` 頁面，負責 API 管理與 UI 偏好設置。
3.  **全域狀態優化**: 全站共享用戶偏好（如動畫開關、圖表標籤顯示）。

### 方案對比

| 模組 | 推薦方案 | 理由 |
|:---|:---|:---|
| 組件結構 | 原子組件 (`frontend/components/ui/`) | 提高復用性，統一視覺語言 (KISS原則) |
| 狀態持久化 | LocalStorage + Context API | 用戶偏好存儲於瀏覽器，無需後端 DB 即時同步，反應最快 |
| API 安全 | 遮照輸入框 (Password Type) | 防止螢幕錄製或窺視洩漏 Key |

## 📂 待執行項目 (Pending)

### 1. 原子化組件庫 (P1)
- [x] `frontend/components/ui/GlassCard.tsx`: 進階玻璃容器
- [x] `frontend/components/ui/ProButton.tsx`: 高質感漸層按鈕
- [x] `frontend/components/ui/ProInput.tsx`: 具備密碼遮照的輸入框
- [x] `frontend/components/ui/ProToggle.tsx`: 滑動切換開關
- [x] `frontend/components/ui/ProBadge.tsx`: 多狀態標籤
- [x] `frontend/components/ui/index.ts`: 統一匯出入口

### 2. 系統設定中心 (P2)
- [x] `frontend/context/SettingsContext.tsx`: 全域設定管理 (LocalStorage)
- [x] `frontend/app/settings/page.tsx`: 控制中心頁面實作
- [x] `frontend/app/layout.tsx`: 注入 `SettingsProvider`

### 3. TDD 驗證 (P3)
- [x] `frontend/__tests__/components/ui/ProComponents.test.tsx`: 10 項關鍵案例

## 🔗 相關文件
*   [006_Phase4.3_FeatureExpansion_Plan.md](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/doc/plans/006_Phase4.3_FeatureExpansion_Plan.md)
*   [20260123_06_Ph4.4_Settings_Components.md](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/doc/test/20260123_06_Ph4.4_Settings_Components.md)
