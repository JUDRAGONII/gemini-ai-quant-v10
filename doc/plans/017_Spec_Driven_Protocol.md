# 017 V10.0 規格驅動開發協定 (Spec-Driven Protocol)

## 1. 核心理念 (KISS Principle)
**「先定義契約，再撰寫邏輯」**。所有 API 變更必須先在規格文件中達成共識，嚴格禁止直接修改 `.py` 或 `.tsx` 中的介面參數。

## 2. 啟用步驟 (Activation Workflow)

### 🚀 第一步：規格先行 (Spec First)
當您需要新增功能（如：個股詳情）時，指令應包含：
> 「請為 [功能名稱] 建立 API 規格定義，參考 `doc/api_spec.md`。」

### 🧠 第二步：架構審核 (Architect Review)
在開發前，呼叫 `/architect` 技能對規格進行審計：
*   **檢查點 1**：欄位命名是否與資料庫 Schema 1:1 對齊？
*   **檢查點 2**：是否具備必要的 Error Handling (401, 404, 429)？
*   **檢查點 3**：型別定義是否可直接共用於前端 TypeScript？

### 🛠️ 第三步：雙端同步 (Bi-directional Sync)
1.  **後端**：依據規格生成 Python Pydantic Models。
2.  **前端**：依據規格生成 TypeScript Interfaces。
3.  **驗收**：執行測試套件，確保雙端通過「零手動欄位校準」測試。

## 3. 防呆機制 (Safety Guard)
*   若 AI 在未更新規格的情況下試圖修改代碼邊界，系統應自動觸發「攔截」，要求先同步規格。

---
**本協定自 2026-01-26 起對 V10 專案生效。**
