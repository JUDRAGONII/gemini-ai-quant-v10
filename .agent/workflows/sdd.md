---
description: 啟動規格驅動開發 (SDD) 流程：包含 API 規格定義、架構審核、及雙端代碼同步生成。
---

# 🚀 規格驅動開發 (SDD) 快捷指令

當我啟動 `/sdd` 指令時，請嚴格執行以下開發協定：

## 第一階段：規格先行 (Spec Design)
1. **定義契約**：在 `doc/api_spec.md` 或相關文件中建立 API 請求與響應格式。
2. **型別一致**：確保支援 TypeScript Interface 與 Python Pydantic Model 的對應。

## 第二階段：架構審核 (Sys Architect Audit)
1. **呼叫 /architect**：對規格進行底層審計。
2. **驗證 Checkbox**：
    - [ ] 欄位命名是否符合本專案規範？
    - [ ] 是否考慮了資料庫 RLS 安全性？
    - [ ] 是否具備邊界錯誤處理？

## 第三階段：代碼生成與同步 (Sync Generation)
1. **後端實作**：生成 Python FastAPI/Supabase 讀取邏輯。
2. **前端實作**：生成 Next.js 14 組件與數據抓取 Hook。
3. **歷程紀錄**：完成後自動執行 `/0-0` 以更新 PCM 與 Changelogs。

---
**執行準則**：
1. 嚴格遵守繁體中文輸出。
2. 規格未完成前，禁止進入代碼開發。
3. 優先確保數據流的安全性與一致性。
