# 開發歷程紀錄 028：錯誤訊息中英雙語化優化

## 1. 需求解構
為了提升系統的可用性 (Usability) 與可維護性 (Maintainability)，使用者要求將 UI 上的錯誤訊息轉換為「繁體中文 (英文)」格式。
- **繁體中文**：讓操作者（使用者）第一時間理解故障現象。
- **英文**：保留原始底層訊息，方便開發者或 AI 進行技術診斷。
- **特別處理**：擷取並轉換截圖中出現的 `Unauthorized` 身份驗證失敗訊息。

## 2. 第一性原理分析與方案
- **原問題**：直接在代碼中寫死中文會丟失底層錯誤細節；直接顯示英文則對非技術使用者不友善。
- **解決方案**：建立具備映射機制的工具函式 `formatErrorMessage`。
  - **KISS 原則**：不使用複雜的 i18n 框架，僅針對關鍵 API 錯誤建立對照表。
  - **動態識別**：若為未知錯誤，仍保留原始英文並補上提示。

## 3. 執行開發與變更詳情

### 3.1 核心工具建置
建立 `frontend/lib/errorUtils.ts`，負責常見錯誤（如 `Unauthorized`, `Failed to fetch`）的雙語轉換邏輯。

### 3.2 前端頁面整合
- **`portfolios/page.tsx`**、**`portfolios/[id]/page.tsx`**、**`watchlist/page.tsx`**：
  - 更新 `fetch` 邏輯，先行解析伺服器回傳的 JSON 錯誤（例如提取 `Unauthorized`）。
  - 在 `catch` 區塊套用 `formatErrorMessage` 進行雙語化顯示。
- **`hooks/useStockDetail.ts`**：
  - 封裝 API 端的錯誤格式化，確保圖表載入失敗時顯示雙語提示。

## 4. 驗證結果
- **測試場景**：故意製造 401 Unauthorized 情況。
- **UI 預期顯示**：`登入逾時或權限不足 (Unauthorized)`（紅色警示框）。
- **測試場景**：斷網測試。
- **UI 預期顯示**：`連線失敗或無法串接數據 (Failed to fetch)`。

## 5. 總結
此次優化不僅解決了語言障礙，更強化了系統在異常情況下的自我描述能力，完美契合 `0-0` 工作流的深度開發品質要求。

---
**日期**: 2026-01-28
**作者**: AI Antigravity Assistant
