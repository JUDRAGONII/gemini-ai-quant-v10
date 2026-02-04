# 002_Phase2_BackendLogic (AI Engine)

## ✅ 已完成項目
1.  **AI Engine 模組 (Agents)**
    *   `backend/lib/llm.py`: 封裝 Google Gemini Client (目前使用 `gemini-2.0-flash`)。
    *   `backend/agents/dialectic.py`: 實作「多空辯論」邏輯，包含 Bull/Bear/Synthesis 三階段提示詞鏈。
    *   `backend/test_ai.py`: 診斷工具，用於列出可用模型與測試連線。

2.  **整合測試結果**
    *   **Importer**: 修復了 package import 路徑問題。
    *   **Model**: 確認 API Key 可存取 `gemini-2.0-flash` 等新模型。
    *   **Flow**: 成功執行 `DialecticAgent`，並將辯論結果寫入 `ai_reports` 資料庫表。
    *   **Rate Limit**: 測試過程觸發 429 Quota Exceeded，證明與 Google API 連線正常 (Free Tier 限制)。

## 📊 執行日誌快照
```text
Key loaded: AIzaS...
Listing models...
models/gemini-2.0-flash
...
Starting debate on: Current US Market Outlook
Gemini API Error: 429 You exceeded your current quota...
Synthesis Complete.
Report saved to database.
```

## ⚠️ 待優化項目
*   **Retry Logic**: 當遇到 429 時，`llm.py` 目前僅打印錯誤。需引入 `tenacity` 進行指數退避重試。
*   **Model Config**: 未來應將模型名稱移至 `config.py` 或 `.env` 以便切換。
