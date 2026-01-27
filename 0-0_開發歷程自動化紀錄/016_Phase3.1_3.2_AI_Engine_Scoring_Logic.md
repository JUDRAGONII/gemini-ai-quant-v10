# 016_Phase3.1_3.2_AI_Engine_Scoring_Logic (AI 引擎與多因子評分邏輯)

## ✅ 已完成項目
1.  **多因子評分模型 (Multi-factor Scoring)**
    *   整合價值 (PE/PB)、成長 (Net Income Growth) 與動能指標。
    *   計算 Z-Score 進行數據歸一化，並根據權重矩陣生成綜合評分。
    *   實作 `/api/ai/scoring` 端點供前端儀表板顯示。

2.  **基因演算法優化 (Genetic Strategy)**
    *   定義策略基因組，包含 MA 交叉週期、RSI 強弱閥值等。
    *   實作回測引擎，以夏普比率 (Sharpe Ratio) 為適應度函數進行種群優化。

## 📊 驗證日誌
```text
[AI] Scoring logic: Normalization complete for 500+ symbols.
[AI] Genetic Evolution: Generation 50 reached. Fitness stable.
[AI] Top Gene: {ma_fast: 5, rsi_limit: 30, stop_loss: 0.05}
```

## ⚠️ 待解問題 (Backlog)
- [ ] 模擬回測目前僅支持日線級別，未來可考慮優化至分鐘級別測試。
- [ ] 探索將 GPT-4 與本地量化因子結合的 Hybrid 評分模式。
