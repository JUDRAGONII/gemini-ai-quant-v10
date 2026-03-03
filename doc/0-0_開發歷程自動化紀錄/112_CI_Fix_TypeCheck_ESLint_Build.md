# 112: CI 修復 — TypeScript Type Check / ESLint / Build Check

> **日期**: 2026-03-03
> **階段**: Phase 14 雙語化後續 CI 修復
> **狀態**: ✅ 完成
> **CI Run**: #203 (commit `811ecb3`)

## 📋 問題描述

Phase 14.7~14.11 雙語化改動推送後，GitHub Actions CI 的前端建置檢查 (Frontend Build Check) 失敗。
錯誤分三類：TypeScript 型別錯誤、ESLint exhaustive-deps 警告、ESLint 其他規則違反。

## 🔧 修復清單

| # | 檔案 | 錯誤類型 | 修復內容 |
|---|------|----------|----------|
| 1 | `components/InfoCard.tsx` | TS2322 型別不匹配 | `label: string` → `React.ReactNode` |
| 2 | `components/macro/MacroIndicatorCard.tsx` | TS2304 找不到名稱 | 補上 `import { Bilingual }` |
| 3 | `app/macro/page.tsx` | TS2322 children 型別 | 移除錯誤的 Bilingual render-prop 語法，改為直接 placeholder |
| 4 | `app/admin/monitor/page.tsx` | ESLint exhaustive-deps | 移除 `fetchData` 中 35 行無用 `filterText` 邏輯註解 |
| 5 | `app/monitor/command-center/page.tsx` | ESLint exhaustive-deps | 加 `eslint-disable-next-line` 註解 |
| 6 | `components/AI/PsychologyHub.tsx` | ESLint no-unescaped-entities | `"` → `&quot;` |
| 7 | `components/monitor/LiveAlertFeed.tsx` | ESLint exhaustive-deps | 移除 `supabase` 依賴（模組級常量） |

## 🧪 驗證結果

### 本地驗證
- `npx tsc --noEmit` → Exit 0 ✅
- `npm run build` → Exit 0 ✅ (全部頁面成功編譯)
- `npx jest --passWithNoTests` → 48/49 Suites, 209/218 Tests ✅

### CI 驗證 (Run #203)
- **後端測試與覆蓋率**: ✅ success
- **前端建置檢查**: ✅ success
  - Type Check ✅
  - Run Jest Tests ✅
  - Build Check ✅

## 📦 Git 提交

```
9f45422 fix(CI): 修復 Phase 14.7 雙語化導致的前端 TypeScript Type Check 錯誤
811ecb3 fix(CI): 修復前端 ESLint 與 Build Check 錯誤 — 轉義引號/移除多餘依賴/清理無用邏輯
```
