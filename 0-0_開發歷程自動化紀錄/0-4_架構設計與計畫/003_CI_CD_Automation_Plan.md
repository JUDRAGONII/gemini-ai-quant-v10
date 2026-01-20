# 003_CI_CD_Automation_Plan.md

## 📅 任務元數據 (Metadata)
*   **日期**: 2026-01-20
*   **階段**: Phase 3 Infrastructure Enhancement
*   **目標**: 建立 GitHub Actions 自動化測試流程，生成代碼覆蓋率報告。

## ✅ 已完成項目
1.  **Workflow 配置**:
    *   建立 `.github/workflows/ci_test.yml`。
    *   定義 Backend 測試與 Coverage 生成步驟。
    *   定義 Frontend Build 檢查步驟。
2.  **測試代碼**:
    *   新增 `backend/tests/test_unit.py`: 輕量級單元測試，不依賴 DB/API。
    *   排除 `tests/test_phase2.py` (整合測試) 於 CI 流程之外。
3.  **依賴管理**:
    *   更新 `0-1_DEV_SUMMARY` 與 `CHANGELOG`，記錄 CI/CD 功能。
    *   確認 `requirements.txt` 兼容性。

## 📊 成果指標
*   **自動化**: Push 觸發測試 (Time < 2min)。
*   **可視化**: Coverage HTML Report 可下載。
*   **健壯性**: 確保每次提交不破壞基礎編譯與邏輯。

## 🔗 相關文件
*   [ci_test.yml](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/.github/workflows/ci_test.yml)
