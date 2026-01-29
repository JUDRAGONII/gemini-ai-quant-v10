# Phase 7.7 GitHub CI 前端建置修復歷程 (CI Build Fix)

## 任務摘要
在 Phase 7.6 交付後，GitHub Action 回報前端 Build 失敗，共有 81 個 TypeScript 型別錯誤。本任務旨在診斷並修復這些錯誤，確保 CI 流程恢復綠燈。

## 主要修復內容

### 1. 型別庫對齊 (`frontend/types/api.ts`)
- **問題**：`StockDetailResponse` 介面與 V1 API 返回的聚合 JSON 結構不符。
- **修復**：重新定義 `StockDetailResponse` 結構，包含 `stock`, `quote`, `financials`, `ai_score` 與 `technical_indicators` 的嵌套結構。

### 2. API 路由型別安全性
- **涉及檔案**：
    - `app/api/v1/stocks/[symbol]/detail/route.ts`
    - `app/api/v1/ai/generate-report/route.ts`
    - `app/api/v1/ai/reports/[id]/route.ts`
    - `app/api/stocks/[symbol]/technical/route.ts` (Legacy)
- **修復**：導入 `StockDetailResponse`，並針對 Supabase 資料庫查詢結果使用顯式 Any 斷言 (`as any`) 或屬性映射，解決隱式 Any 導致的建置崩潰。

### 3. 首頁元件修復 (`app/page.tsx`)
- **元件**：`MacroChart`
- **問題**：Props 傳遞漏填 `title` 且有多餘欄位 `hideGrid`。
- **修復**：重構 `MacroChart.tsx` 組件，使 `title` 為選擇性，並正式支援 `hideGrid` 屬性。

## 驗證結果
- **地端檢查指令**：`cd frontend && npx tsc --noEmit`
- **結果**：`Exit code: 0` (81 Errors -> 0 Errors)
- **狀態**：代碼庫已準備好重新推送至遠端倉庫。

## 附錄：關鍵教訓
- 複雜的聯表查詢（Joins）在 Supabase TS 生成工具中可能推導出 `never` 型別，開發時應輔以顯式型別宣告。
- CI 環境的嚴格檢查有助於發現本地 `npm run dev` 忽略的潛在崩潰點。
