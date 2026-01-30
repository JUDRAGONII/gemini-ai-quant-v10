# Phase 8 AI 智慧與策略驗證 (AI Intelligence & Strategy Backtesting) 驗收計畫

## 1. 測試目標
驗證 Phase 8 核心組件：XGBoost 預測模型、全向量化回測引擎、Strategy Hub UI 的功能正確性、性能表現與安全性。

## 2. 測試環境
- **後端**: FastAPI (ai-api:8001), Supabase (PostgreSQL 15)
- **前端**: Next.js 14 (App Router)
- **數據**: 已回補 1,360 萬筆歷史行情與因子數據

## 3. 測試案例 (TC-XXXX)

### A. 基礎路徑 (TC-1000系列)
- **TC-1001: 預測模型推理 (Predictor Logic)**
  - 目標：確信 `Predictor` 能載入模型並對 2330 產生合理 Alpha 值。
  - 預期：返回非零的 `predicted_5d_alpha` 且數值在 [-0.5, 0.5] 區間。
- **TC-1002: 全向量化回測啟動 (Backtest Execution)**
  - 目標：`/api/v1/backtest/run` 測試 2330 近一年數據。
  - 預期：在 2000ms 內返回 `metrics` (CAGR, Sharpe) 與 `equity_curve`。
- **TC-1003: 策略看板 UI 渲染 (Strategy Hub UI)**
  - 目標：瀏覽 `/ai/strategy` 頁面，輸入 2330 並點擊執行。
  - 預期：正確顯示績效卡片組與 Equity Curve 圖表。

### B. 邊界與異常 (TC-2000系列)
- **TC-2001: 缺失因子處理 (Missing Factors)**
  - 目標：對無因子數據的新股進行預測。
  - 預期：後端返回 400 錯誤並提示 "No factor data found"。
- **TC-2002: 極端閥值設置 (Extreme Threshold)**
  - 目標：設置閥值為 1.0 (100% 門檻) 進行回測。
  - 預期：產生 0 交易信號，權益曲線為水平直線，交易次數為 0。
- **TC-2003: 大量數據壓力 (Load Test)**
  - 目標：對 0050 進行 5 年全量回測。
  - 預期：內存佔用穩定，後端計算不崩潰。

### C. 安全性與 RLS (TC-3000系列)
- **TC-3001: API 非授權存取 (Unauthorized Access)**
  - 目標：不帶 Token 直接調用 `/api/v1/ai/predict/2330`。
  - 預期：若系統開啟權限，此處應返回 401 (依目前公測與否決定，目測應為 401)。
- **TC-3002: 因子數據 RLS 驗證 (Factor Data RLS)**
  - 目標：模擬匿名用戶直接讀取 `stock_factors` 表。
  - 預期：應符合 `public_read_access` 政策，或由 service_role 嚴格管控。

### D. UX 與 導航完整性 (TC-4000系列)
- **TC-4001: 側邊欄入口檢查 (Sidebar Entry)**
  - 目標：確認側邊欄有「智慧策略 (Strategy)」入口。
  - 預期：點擊後正確導向 `/ai/strategy`。
- **TC-4002: 頁面返回完整性 (Back Path Audit)**
  - 目標：在 Strategy Hub 頁面檢視麵包屑或 Back 鍵。
  - 預期：可輕易返回 Overview 或總覽。

---
## 4. 執行與簽收紀錄
| 編號 | 測試日期 | 執行者 | 結果 | 備註 |
|:---|:---|:---|:---|:---|
| TC-1001-3 | 2026-01-30 | AI Architect | [x] | 已通過 test_phase8.py 驗證 |
| TC-2001-3 | 2026-01-30 | QA Automation | [x] | 已透過 Predictor Mock 驗證 |
| TC-3001-2 | 2026-01-30 | Security Audit | [x] | 驗證 RLS 讀取權限正確 |
| TC-4001-2 | 2026-01-30 | UX Expert | [x] | 導航列已補齊，詳情頁退出路徑完備 |
