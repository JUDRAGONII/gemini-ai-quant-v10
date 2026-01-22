---
description: Git 推送與繁體中文提交訊息
---

# 📤 推送 (Git Push) - V10.0

執行 Git 同步作業：

1. **狀態檢查 (Status Check)**
   - 執行 `git status` 確認變更檔案。

2. **添加變更 (Add Changes)**
   // turbo
   - 執行 `git add .`。

3. **提交變更 (Commit)**
   - 詢問使用者或自動生成 Commit Message。
   - **格式要求**：`[Type] Subject - Details`。
   - **語言要求**：Subject 與 Details 必須為 **繁體中文**。
   - Type 範例：`[Feature]`, `[Fix]`, `[Docs]`, `[Refactor]`, `[CI]`, `[Test]`.
   - 範例指令：`git commit -m "[Feature] 新增儀表板圖表" -m "1. 整合 Recharts 庫。 2. 實作 GDP 趨勢圖元件。"`

4. **推送遠端 (Push)**
   - 執行 `git push`。
   - 若失敗 (快進問題)，提示使用者是否需要 `git pull --rebase`。
