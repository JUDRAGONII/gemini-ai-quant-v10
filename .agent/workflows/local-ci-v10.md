---
description: 本地 CI 驗證與自動推送工作流 (Local CI & Auto Push)
---

# 🛡️ 本地 CI 驗證 (Local CI) - V10.0

執行地端全量檢查，確保代碼 100% 綠燈後才執行 Git 推送。

## 第一階段：前端驗證 (Frontend Check)

1. **型別檢查 (Type Check)**
   // turbo
   - 執行 `cd frontend; npx tsc --noEmit`。
   - 若失敗：停止並提示修復型別錯誤。

2. **單元與整合測試 (Jest Tests)**
   // turbo
   - 執行 `cd frontend; npm test`。
   - 若失敗：停止並提示修正測試案例。

## 第二階段：後端驗證 (Backend Check)

1. **單元測試 (Pytest)**
   // turbo
   - 執行 `cd backend; pytest tests/test_unit.py -v`。
   - 若失敗：停止並提示修復後端邏輯。

## 第三階段：自動推送 (Auto Push)

若以上步驟皆為 **綠燈 (Pass)**，則執行：

1. **調用推送工作流**
   - 執行 `/git_push_v10`。

---
**執行準則**：
1. **嚴禁帶病投醫**：任何一項測試失敗，均不得執行 `git push`。
2. **自動化優先**：使用 `// turbo` 標記以加速本地驗證過程。
3. **報告導向**：測試完成後，若有失敗點，請自動總結原因並記錄至 `/debug_v10`。
