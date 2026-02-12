# 20260212_02_Risk_Management_TestPlan.md

## 測試目標
驗證法人級風險矩陣的 Greeks 模擬、Barra 風格分解與壓力測試組件的穩定性、數據準確性與安全性。

## 測試環境
*   **Framework**: Next.js 14, Jest, React Testing Library, FastAPI
*   **Target Files**: 
    - `backend/api/routers/professional.py`
    - `frontend/components/AI/GreeksMonitor.tsx`
*   **Test Files**: `frontend/__tests__/**`

## 測試案例清單

### 1. 基礎路徑測試 (Happy Path)
#### [Risk Management API]
- [ ] **TC-1401: 描述**: 調用 `/professional/risk-matrix` 端點，應正常返回包含 Greeks, Barra 與 StressTest 的 JSON 結構。

#### [GreeksMonitor 組件]
- [ ] **TC-1402: 描述**: 組件應能正確渲染熱圖 (Heatmap)，且 Delta/Gamma 等數值對應色階分佈正常。

### 2. 邊界條件測試 (Edge Cases)
- [ ] **TC-2401: 描述**: 針對無歷史數據標的 (如新股)，API 應返回預設空數據或提示，而非 500 錯誤。
- [ ] **TC-2402: 描述**: 壓力測試場景在數據極端 (如 VIX 異常) 時，應具備計算截斷機制防止數值溢出。

### 3. 安全性與數據一致性
- [ ] **TC-3401: 描述**: 驗證 Barra 分解中的「價值(Value)」因子權重與資料庫 `stock_factors` 真實權重一致。
- [ ] **TC-3402: 描述**: 驗證 RLS 權限，非本人持倉不可透過 API 獲取詳細壓力測試結果。

### 4. 可訪問性與 UI/UX
- [ ] **TC-4401: 描述**: 懸停熱圖單元格時，應彈出 Tooltip 顯示詳細定義與具體曝險數值。

## 測試執行結果 (Execution Result)
```bash
# 待執行
```
