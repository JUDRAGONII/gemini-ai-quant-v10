---
description: Git 推送與繁體中文提交訊息
---

# 📤 推送 (Git Push) - V10.0

執行 Git 同步作業，確保地端與遠端同步後再推送，減少額度浪費：

1. **同步遠端 (Sync Remote)**
   // turbo
   - 執行 `git pull --rebase origin develop`。
   - **目的**：避免因遠端變更導致 push 被拒絕 (Rejected)。

2. **狀態檢查 (Status Check)**
   - 執行 `git status` 確認變更檔案。

3. **添加變更 (Add Changes)**
   // turbo
   - 執行 `git add .`。

4. **提交變更 (Commit)**
   - 詢問使用者或自動生成 Commit Message。
   - **格式要求**：`[Type] Subject - Details` (繁體中文)。
   - **警告**：在 Windows PowerShell 環境下，請**分開執行指令**，禁止使用 `&&` 連接（改用 `;`）。

5. **推送遠端 (Push)**
   // turbo
   - 執行 `git push`。
