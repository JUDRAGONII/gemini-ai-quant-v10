# 開發日誌 073：修復 GitHub CI 前端建置錯誤與 TypeScript 類型衝突

- **日期**: 2026-02-04
- **版本**: V10.3.9
- **作者**: Antigravity

## 1. 任務概要
在 Phase 10 部署階段，GitHub CI 在 frontend 建置過程失敗。經排查為 Next.js Server Component 限制與 SWR 陣列 Key 類型推斷問題。

## 2. 變更詳情

### 2.1 Frontend 修復
#### [MODIFY] `frontend/src/components/alerts/AlertToastContainer.tsx`
- **問題**: `useEffect` 與 `useSWR` 在 Server Component 中使用報錯。
- **修復**: 添加 `"use client";` 指令。

#### [MODIFY] `frontend/src/hooks/useHeatmap.ts`
- **問題**: TS2345 報錯，`string[]` 無法賦值給 `keyof HeatmapData`。
- **修復**: 在 `useSWR` 的 array key 參數中，將 `market` 與 `category` 強制類型斷言為 `keyof HeatmapData`。

## 3. 驗證結果
- **本地編譯**: `npm run build` 通過。
- **類型檢查**: `npm run lint` 通過。

## 4. 經驗教訓
- 任何使用 React Hooks 的組件必須標註 `"use client";`。
- SWR API Fetcher 與 Key 之間的類型連動需要精準定義。
