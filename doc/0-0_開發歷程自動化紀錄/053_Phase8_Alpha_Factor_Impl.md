# 053_Phase8_Alpha_Factor_Impl.md

## 任務背景
依據 Phase 8.1 計畫 (Plan 027)，實作 AI 特徵工廠 (`AlphaFactory`)。這是 AI 模型訓練的基礎建設。

## 開發成果
1.  **AlphaFactory 類別實作** (`backend/research/alpha_factors.py`)：
    *   **架構**：Stateless 設計，輸入 DataFrame，輸出特徵矩陣。
    *   **核心功能**：
        *   `add_technical_factors`: 實作 RSI, MACD, ADX, ATR, BB 等技術指標 (純 Pandas 向量化)。
        *   `add_chip_factors`: 實作法人淨買比、買超累計、券資比等籌碼因子。
        *   `add_macro_factors`: 實作 Beta、RS (相對強弱)、VIX 相關性等宏觀因子。
2.  **驗證腳本** (`backend/research/test_alpha_factors.py`)：
    *   模擬 OHLCV、籌碼 (Institutional/Margin) 與宏觀 (Index/VIX) 數據。
    *   驗證所有因子欄位能否正確生成且無 Runtime Error。

## 技術決策
*   **Vectorization**: 全程使用 `rolling()`, `diff()`, `ewm()` 等 Pandas 方法，避免 Python Loop，確保效能。
*   **Dependency**: 僅依賴 `pandas` 與 `numpy`，無需 `ta-lib`，降低部署複雜度。

## 下一步
*   將此模組整合至 `backend/etl/factor_service.py`，實現每日自動更新真正的 `stock_factors` 資料庫。
