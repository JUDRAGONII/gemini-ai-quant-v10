---
description: 記錄新點子與功能發想
---

# 💡 新點子 (New Idea) - V10.0

當有新功能發想或架構變更建議時，執行此流程：

1. **點子捕捉 (Capture)**
   - 詢問使用者點子的核心價值與目標。
   - 判斷其屬於 `Backend`, `Frontend`, `AI Engine` 或 `Infrastructure` 範疇。

2. **更新實作計畫 (Update Plan)**
   - 讀取 `.gemini/.../implementation_plan.md`。
   - 在適當的章節 (或新增 `Proposed Features` 章節) 加入該點子。
   - 標註為 `[DRAFT]` 狀態。

3. **建立詳細設計草稿 (Optional)**
   - 若點子夠複雜，於 `doc/開發文件/` 下建立新文件 (如 `018_新功能_Concept.md`)。
   - 撰寫包含 `User Story`, `Tech Stack`, `Risks` 的草案。

4. **更新待辦清單 (Update Todo)**
   - 評估優先權 (High/Medium/Low)。
   - 更新 `doc/PCM/0-1_DEV_SUMMARY.md` 的待辦清單。
