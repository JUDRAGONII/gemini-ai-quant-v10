# 002_Phase2_Backend_Plan.md

## 📅 任務元數據 (Metadata)
*   **日期**: 2026-01-20
*   **階段**: Phase 2 Backend Logic
*   **目標**: 實作核心 ETL 數據流與 AI 多空辯論引擎。

## ✅ 執行項目
1.  **ETL 模組 (`etl/macro.py`)**:
    *   整合 `pandas-datareader` 抓取 FRED 數據 (GDP, CPI, VIX)。
    *   實作 Upsert 機制確保資料冪等性。
2.  **AI 引擎 (`agents/dialectic.py`)**:
    *   實作 `DialecticAgent` 類別。
    *   設計 [BULL], [BEAR], [SYNTHESIS] 提示詞工程。
    *   整合 Gemini 2.0 Flash 模型。
3.  **任務編排 (`flows.py`)**:
    *   定義 Prefect `@task` 與 `@flow`。
    *   引入 `schedule` 庫實現每日 08:00 自動執行。

## 📊 成果指標
*   **數據完整性**: 成功寫入 VIX 等關鍵指標至 Supabase。
*   **AI 輸出**: 成功生成結構化投資報告。
*   **自動化**: AI Worker 容器可自動啟動排程。

## 🔗 相關文件
*   [flow.py](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/backend/flows.py)
*   [002_Phase2_BackendLogic_AIEngine.md](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/0-0_開發歷程自動化紀錄/002_Phase2_BackendLogic_AIEngine.md)
