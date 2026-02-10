# 093_Phase12_FullSuite_Tests.md

**日期**: 2026-02-10
**階段**: Phase 12 — AI 洞察引擎生產硬化 + 全量測試
**開發者**: AI Assistant

## 任務目標
修復 Phase 12 前端渲染錯誤並建立全量自動化測試覆蓋。

## 完成項目

### 錯誤修復（5 處）
1. **`macro.py`** `/calendar` 端點 — 嵌套 `{status, count, data}` 改為直接返回陣列
2. **`EconomicCalendar.tsx`** — fetcher 加入防禦性解析，自動解包嵌套結構
3. **`CorrelationChart.tsx`** — `summary ?? fallback` 防禦性存取，防止 `null.toFixed()` 崩潰
4. **`next.config.mjs`** — 6 條分散 rewrites 合併為 `/api/:path*` catch-all
5. **`useAlerts.ts`** — alerts 路徑加 trailing slash 避免 FastAPI 307 redirect

### 全量測試（22 TC，5 Test Suites，全 Pass）
| 測試檔案 | TC 數 | 狀態 |
|---------|------|------|
| `DialecticPanel.test.tsx` | 5 | ✅ Pass |
| `CorrelationChart.test.tsx` | 5 | ✅ Pass |
| `TacticalPlanner.test.tsx` | 4 | ✅ Pass |
| `EconomicCalendar.test.tsx` | 6 | ✅ Pass |
| `InsightsPage.test.tsx` | 2 | ✅ Pass |

## 技術決策
- **KISS 原則**：選擇修改後端返回格式（直接返回陣列）而非前端加多層解構
- **防禦性雙保險**：前端 fetcher 仍加入 `Array.isArray(json?.data)` 解包邏輯，以應對未來 API 變更
- **catch-all rewrite**：一條規則覆蓋所有 API 路徑，新增路由器不需改 `next.config.mjs`
