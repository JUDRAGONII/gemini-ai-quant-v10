# 測試案例清單 (TC-Phase12) - 進階 AI 洞察與決策閉環

## 1. 測試目標
驗證 AI 投資分析儀 V10.0 Phase 12 核心功能之正確性、安全性與效能，包含：
- 跨資產滯後相關性分析 (Lagged Correlation)
- AI 多代理人辯證引擎 (Dialectic Engine)
- 戰術計畫與覆盤系統 (Tactical Loop)
- Bento Grid V3 佈局持久化

## 2. 測試環境
- **Backend**: Python 3.10+ / FastAPI / Supabase (PostgreSQL 15)
- **Frontend**: Next.js 14 (App Router) / Jest / React Testing Library
- **Database**: Supabase RLS Enabled

## 3. 測試案例 (TestCase List)

### A. 基礎功能路徑 (1XXX)
- [ ] **TC-1001**: [Backend] 驗證 `GET /api/v1/insights/correlation` 能準確計算兩資產之 Pearson 相關係數及滯後影響。
- [ ] **TC-1002**: [Backend] 驗證 `GET /api/v1/insights/dialectic` 能同步呼叫多個代理人並產出共識。
- [ ] **TC-1003**: [DB] 驗證 `tactical_plans` 資料表能正確記錄並關聯至 `stock_code`。

### B. 邊界與異常處理 (2XXX)
- [ ] **TC-2001**: [Backend] 當輸入不合法之 Lag 參數 (如 > 100) 時，API 應回傳 422 錯誤。
- [ ] **TC-2002**: [Backend] 當目標資產數據長度不足以計算 Rolling Correlation 時，應回傳適當之空值提示而非崩潰。

### C. 安全性與 RLS 驗證 (3XXX)
- [ ] **TC-3001**: [DB] 驗證 `tactical_plans` 的 RLS 政策：User A 無權限讀取或修改 User B 的戰術計畫。
- [ ] **TC-3002**: [API] 驗證無效之 API Key 無法存取 Insights 端點。

### D. UX 與 視覺交互 (4XXX)
- [ ] **TC-4001**: [Frontend] 驗證 Bento Grid 拖放元件後，佈局 JSON 能正確保存至 Supabase `user_settings`。
- [ ] **TC-4002**: [Frontend] 驗證在手機端 (RWD) 佈局能自動降級為單欄顯示。
