---
description: 開發歷程歸檔與文件同步
---

# 📚 文件歸檔 (Archive Documentation) - V10.0

當開發達到一個段落時，執行此流程：

1. **更新開發摘要 (Update Summary)**
   - 讀取 `doc/PCM/0-1_DEV_SUMMARY.md`。
   - 更新「當前里程碑」狀態。
   - 在「執行歷程」表中新增今日的關鍵產出。

2. **更新變更日誌 (Update Changelog)**
   - 讀取 `doc/PCM/0-2_CHANGELOG.md`。
   - 在 sort `[Unreleased]` 或新版本號下，紀錄 Added/Fixed/Changed 項目。

3. **錯誤與教訓同步 (Update Error Lessons)**
   - 讀取 `doc/PCM/0-3_ERROR_LESSONS.md`。
   - 確保今日遇到的關鍵問題已記錄。

4. **階段控制矩陣同步 (Update PCM)**
   - 讀取 `doc/PCM/0-0_V10.0_Phase_Control_Matrix.md`。
   - 若有完成的 Phase 或關鍵任務，將狀態標記為 ✅。

5. **任務清單同步 (Update Task)**
   - 檢查 `.gemini/.../task.md` (Artifact)，確保勾選狀態與實際進度一致。

6. **計畫與歷程歸檔 (Archive Plans & Logs)**
   - **計畫書**: 存於 `doc/plans/`，命名規則：`[三位數編號]_[階段]_[計畫名].md` (ex: `doc/plans/004_Phase3_DashboardUI.md`)。
   - **開發歷程**:
     - 每日紀錄存於 `0-0_開發歷程自動化紀錄/`，命名：`[編號]_[階段]_[功能名].md` (ex: `005_Phase3_ChartImpl.md`)。
     - **階段結案時**: 將該階段所有 logs 合併為單一檔案，內容按時間排序，不刪減細節。
