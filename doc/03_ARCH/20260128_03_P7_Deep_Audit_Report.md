# 相位 7 深度審定報告：資料庫與後端實施計畫之「現況驗證」與「專家複核」

**文件編號**：AUDIT-20260128-P7-DEEP
**審定背景**：基於使用者要求，對 [025 計畫書](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/doc/plans/025_Phase7_DB_Backend_Completion_Plan.md) 進行深度調研，驗證與 `V10.1.6` 已完成功能之重疊情況。
**五大模式整合**：/0-0 (深度思考), /architect (架構), /sdd (規格), /ui-ux-pro-max (品質), /code-review (安全)

---

## 🔍 一、 事實取證：功能重疊驗證 (Investigation Results)

經過對專案底層文件的遍歷與代碼掃描，確認計畫書 025 存在顯著的 **「進度滯後 (Status Lag)」**：

| 計畫書 025 任務 (P0) | 現狀調研結果 (Evidence) | 審定結論 |
|:---|:---|:---|
| **Task 1.1: 建立 user_portfolios** | 已存在：`backend/scripts/migrations/002_create_portfolios_table.sql` | **重複開發** |
| **Task 1.1: 建立 user_holdings** | 已存在：同上腳本 (Lines 24-44) | **重複開發** |
| **Task 3.2: 實作 /api/portfolios** | 已存在：`frontend/app/api/portfolios/route.ts` | **重複開發** |
| **Task 5.2: 實作 RLS 政策** | 已存在：`002_create_portfolios_table.sql` (Lines 62-126) | **重複定義** |

> [!CAUTION]
> **風險警告**：若按原計畫 025 執行，將會導致資料庫 Migration 衝突 (Table already exists)，且白白耗費 18 人天預算中的約 3-4 人天。

---

## 🏛️ 二、 架構師深度建議 (Architectural Guidance)

基於上述事實，我建議對 Phase 7 進行 **[戰略轉向]**：將資源從「重複建置」轉移至「性能下沉」。

### 2.1 計算下沉 (The "First Principles" Path)
- **核心趨勢**：應落實計畫中的 Task 4.1，將 `MA5/20/60` 從前端 JS 移往 PostgreSQL `Window Functions`。
- **維護性取捨**：對於 MACD/RSI，建議採用 **「計算服務 (Calculation Service)」** 在寫入數據時同步更新 `stock_factors`，而非在查詢時動態計算。

---

## 🚀 三、 規格與代碼品質規範 (SDD & Code Review)

### 3.1 統一適配器 (BFF Adapter)
- **規格缺失**：目前 `frontend/app/api/portfolios` 直接回傳 Supabase 原始數據。
- **優化方案**：
  > [!TIP]
  > 應在 Task 6 實作 `ResponseTransformer`，將資料庫的 `snake_case` 或舊欄位名稱統一包裝，防範前述審計報告中提到的「數據適配一致性」風險。

---

## 🎨 四、 終極執行建議 (Final Action List)

1.  **[DELETE]** 移除 Task 1.1 中關於 `user_portfolios`, `user_holdings` 的建立任務。
2.  **[RENAME]** 將 Task 5 (RLS) 改為「安全滲透測試與邊界用例驗證」，確保現有政策無漏洞。
3.  **[ADD]** 在 Task 6 中明確加入 **「Python Pydantic Models 生成」** 任務。
4.  **[ADD]** 增加 **「數據預算/快取機制」** 實作，緩解 AI 分析頁面的載入延遲。

---
**審定委員**: AI Antigravity Assistant
**驗證狀態**: 已物理核實 (Physical Verification Completed)
**日期**: 2026-01-28
