---
description: 生成測試案例與執行自動化測試 (TDD)
---

# 🧪 測試與驗證 (Test & Verify) - V10.0

執行測試驅動開發 (TDD) 流程，確保程式碼品質。

1. **定義測試案例 (Define Cases)**
   - 根據需求，在 `doc/test/` 下建立或更新測試計畫 markdown (如 `YYYYMMDD_功能名稱.md`)。
   - 包含：正常路徑 (Happy Path)、邊界條件 (Edge Cases)、安全性 (Security)。

2. **撰寫/更新測試代碼 (Write Code)**
   - **Backend**: 於 `backend/tests/` 建立 `test_*.py`。
     - 規則：使用 `unittest` 或 `pytest`，繼承 `unittest.TestCase`。
   - **Frontend**: 於 `frontend/__tests__/` 建立元件測試 (如有)。

3. **執行測試 (Run Test)**
   - **Backend**:
     - 執行 `docker exec ai-worker python -m unittest discover backend/tests`。
   - **Frontend**:
     - 執行 `npm run test` (若已配置 Jest)。

4. **覆蓋率檢查 (Coverage)**
   - (Optional) 執行 `pytest --cov=.` 檢查覆蓋率是否達標 (>80%)。

5. **記錄結果 (Log)**
   - 將測試結果 (Pass/Fail) 更新回 `doc/test/*.md` 中的 Checkbox `[x]`。
