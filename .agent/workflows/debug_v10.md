---
description: 錯誤診斷與經驗教訓記錄
---

# 🐞 除錯與復盤 (Debug & Lessons) - V10.0

當遇到報錯或異常時，執行此標準化除錯流程。

1. **錯誤捕捉 (Capture)**
   - 執行 `docker logs ai-worker` 或 `docker logs ai-frontend` 獲取完整 Traceback。
   - 複製關鍵錯誤訊息。

2. **根本原因分析 (Root Cause Analysis)**
   - **第一性原理**: 追溯是環境問題 (Env)、代碼邏輯 (Code)、還是數據異常 (Data)？
   - **假設驗證**: 提出假設 -> 建立最小重現腳本 (Reproduction Script) -> 驗證。

3. **解決方案 (Fix)**
   - 實作修復代碼。
   - 確保修復後通過相關的測試案例 (Regression Test)。

4. **經驗教訓記錄 (Log Lessons)**
   - 開啟 `doc/PCM/0-3_ERROR_LESSONS.md` (若無則建立)。
   - 紀錄格式：
     - **【問題現象】**: 錯誤訊息摘要。
     - **【底層原因】**: 為什麼會發生？
     - **【解決方案】**: 具體修復與 Commit ID。
     - **【預防措施】**: 未來如何避免 (建立 Checkbox)。