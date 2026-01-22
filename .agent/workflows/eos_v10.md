---
description: 下班總結、歸檔與安全停機工作流 (End of Session)
---

# 🌙 下班了 (End of Session) - V10.0

當輸入「下班了」或 `/eos` 時，執行以下閉環任務：

1. **文件歸檔 (Archive)**
   - 呼叫 `/archive_docs_v10` 流程。
   - 確保 `0-1_DEV_SUMMARY.md` 與 `0-2_CHANGELOG.md` 為最新狀態 (位於 `doc/PCM/`)。
   - 確保 `PCM` (Phase Control Matrix) 已反映今日進度。

2. **代碼同步 (Git Push)**
   - 呼叫 `/git_push_v10` 流程。
   - 確保所有變更已推送到 GitHub `develop` 分支。

3. **安全停機 (Graceful Shutdown)**
   // turbo
   - 執行 `docker-compose down` 停止並移除所有容器。
   - 確認 Supabase 資料庫已正確寫入磁碟 (ZFS Sync)。

4. **狀態回報 (Report)**
   - 回報：「文檔已歸檔、代碼已推送、服務已安全關閉」。
   - 祝賀使用者完成今日任務。
