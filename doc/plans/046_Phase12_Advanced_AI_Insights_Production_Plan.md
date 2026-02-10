# Phase 12: 進階 AI 洞察與生產硬化 (Advanced AI Insights & Production) 詳細計畫

## 1. 任務目標 (Executive Summary)
本計畫為「AI 投資分析儀 V10.0」的最終強化階段。在 Phase 11 完成數據與基礎設施恢復後，Phase 12 將專注於 **AI 深度洞察、跨資產關聯分析 (Cross-Asset Correlation)** 以及 **生產等級的穩定性硬化**。這將使系統從單純的數據查看器進化為實戰級的量化陪跑教練。

## 2. 進階功能與架構 (Architectural Insights)
採用 `/architect` 視角進行「高可用」與「智力增強」設計：

### 2.1 [NEW] 跨資產關聯引擎 (Cross-Asset Engine)
*   **目標**: 分析 USD/TWD 變動與台股加權指數、USD/CNY 與中概股的相關性。
*   **技術**: 使用 Pandas 實現滾動窗口相關係數 (Rolling Correlation)，並透過 FastAPI 曝露 API。

### 2.2 [NEW] 多語系與國際化 (I18n Hardening)
*   **目標**: 確保所有 UI 操作與錯誤提示皆具備「繁體中文 (Taiwan)」與「English (US)」的精確切換。

---

## 3. 執行路徑 (Execution Path)

### 第一階段：AI 洞察功能開發
1.  **[Backend]** 實作 `backend/services/insights_service.py` 負責相關性計算。
2.  **[Frontend]** 實作 `InsightsPanel` 組件，以雷達圖與散佈圖展現資產關聯度。

### 第二階段：生產硬化與效能優化
1.  **[Infra]** 配置 Redis 快取策略 (TTL 管理)，減少對 Supabase 的負擔。
2.  **[Security]** 執行全量 RLS 審計，確保 RAG 查詢與用戶持股數據嚴格隔離。

---

## 4. 測試與驗收標準 (TDD Master)

### 🧪 全系統 E2E 驗收 (TDD Master)
*   **TC-P12-01 (Red)**: 模擬極端匯率波動，驗證 AI 警示是否精確觸發。
*   **TC-P12-02 (Red)**: 併發 100 請求訪問 `/api/v1/screener`，驗證延遲 < 500ms。
*   **TC-P12-03 (Red)**: 驗證多語系切換時，所有 Charts 標題與 Tooltips 是否正確切換。

### ✅ 驗收 Checkbox
- [ ] 跨資產關聯圖表可正確顯示。
- [ ] 系統在高壓力下 (Heavy Backfill + UI Access) 保持穩定。
- [ ] 產出全量自動化測試報告 (All Green).

---

## 5. UI/UX 最終巔峰 (Premium Hardening)
*   應用「Bento Grid V3」設計：所有數據卡片支援拖拽排序與個性化保存。
*   實作「深/淺色模式」的完美適配。

---
**文件狀態**：待審核 (Pending Review)
**文件編號**：DOC-V10.3-046
