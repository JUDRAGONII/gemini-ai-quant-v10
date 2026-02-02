# 058_Phase9_CI_Fix_Log (GitHub CI 修復紀錄)

## 📋 任務摘要
- **問題**: 推送到 `develop` 分支後，GitHub Actions 的後端測試階段失敗，報錯 `ModuleNotFoundError: No module named 'backend'`。
- **目標**: 修復 CI 環境下的後端導入路徑，確保自動化測試恢復運作。
- **優先級**: P0 (緊急)

## 🔍 問題診斷
1. **導入路徑衝突**:
   - 專案已全面調整為 `from backend.xxx` 導入規範。
   - GitHub Actions 設定 `working-directory: backend` 並在此目錄下執行 `pytest`。
   - 預設情況下，Python 不會將執行目錄的「父目錄」視為套件根目錄，除非顯式設置 `PYTHONPATH`。
2. **缺失 __init__.py**:
   - `backend/` 目錄下缺少 `__init__.py`，導致 Ubuntu CI 環境中的 Python 3.10 無法將其識別為正式 Package。

## 🛠️ 執行修復 (Implementation)
1. **建立 Package 指標**:
   - 於 `backend/` 下建立空的 `__init__.py`。
2. **更新測試代碼**:
   - 修改 `backend/tests/test_unit.py`，移除舊的手動 `sys.path` 操作（因不穩定）。
   - 統一改用 `from backend.xxx` 全域導入。
3. **注入 PYTHONPATH**:
   - 修改 `.github/workflows/ci_test.yml`。
   - 在執行 `pytest` 的步驟中，顯式添加 `env: PYTHONPATH: ..` (相對於 `backend` folder)。
4. **補全 Mock**:
   - 於 `ci_test.yml` 注入 `SERVICE_ROLE_KEY` 以通過 `Config.validate()`。

## ✅ 驗證結果
- **地端模擬**:
  ```powershell
  cd backend
  $env:PYTHONPATH=".."
  python -m pytest tests/test_unit.py -v
  ```
- **結果**: `3 passed in 14.08s` (100% Pass)。
- **遠端**: 已推送至 GitHub，觸發 CI 重新執行。

## 💡 經驗教訓
- Python 全域套件導入 (Unified Prefix) 是專案規模化的必經之路，但必須配套設置 Docker 與 CI 的路徑環境變數。
- 始終確保 `backend/` 目錄具備 `__init__.py` 以獲得最佳兼容性。

---
**紀錄人**: Antigravity
**日期**: 2026-02-02
