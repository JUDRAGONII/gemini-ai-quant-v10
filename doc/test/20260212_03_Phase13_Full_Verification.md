# Phase 13 全面全景全量測試計畫 (Master Verification Plan)

## 1. 測試目標 (Test Objectives)
驗證 Phase 13 (13.1 - 13.5) 所有核心功能的整合穩定性、數據一致性與 UI/UX 專業質感。確保系統在雙語環境下正常運作，且風險與演化模組數據正確對接。

## 2. 測試環境 (Test Environment)
- **Engine**: Python 3.11 (FastAPI)
- **Database**: Supabase / PostgreSQL (Local Docker)
- **Cache**: Redis 7.0
- **Frontend**: Next.js 14 / TypeScript / Tailwind
- **Verification Tools**: `pytest`, `unittest`, `tsc`, `curl`

## 3. 測試案例清單 (Test Case List)

### A. 量化智力與 AI 辯證 (13.1 - 13.2)
- **TC-1001**: 18 因子評分獲取 (Scoring API) —— 驗證 VQGM 四個維度數據完整性。
- **TC-1002**: AI CIO 辯證共識 —— 驗證 Bull/Bear 多空觀點與 Rationale 產出。
- **TC-1101**: Gemini 5-Key 池輪詢機制 —— 模擬高頻請求，驗證 API Key 自動切換。
- **TC-1102**: Redis 快取穿透測試 —— 驗證同標的第二次請求響應時間 < 10ms。

### B. 演化策略基因組視覺化 (13.3)
- **TC-2001**: 基因向量映射 (Genome Mapping) —— 26 維 `float8[]` 數據正確解析為前端業務標籤。
- **TC-2002**: 演化趨勢熱圖 (Fitness Heatmap) —— 驗證歷史世代適應度趨勢曲線渲染。
- **TC-2101**: `evolution_history` RLS 驗證 —— 確保非授權用戶無法寫入歷史數據。

### C. 法人級風險控系統 (13.4)
- **TC-3001**: Greeks 敏感度準確性 —— 驗證 Delta/Gamma/Theta/Vega 指標在正常波動下的預期數值。
- **TC-3002**: Barra 風格曝險對比 —— 驗證 Size/Value/Momentum 等因子權重總和邏輯。
- **TC-3101**: 壓力測試場景 —— 模擬「2008 金融海嘯 (-25.3%)」，驗證 Recovery Days 計算邏輯。

### D. 雙語 UI 轉型 (13.5)
- **TC-4001**: 全站佈局穩定性 —— 在英文模式下，驗證 `Monitor`, `Strategy`, `Insights`, `Risk` 頁面無破圖或溢出。
- **TC-4002**: `Bilingual` 組件覆蓋率 —— 抽檢各核心頁面板塊，確保英文描述 (Auxiliary text) 完整顯示。
- **TC-4101**: `ProButton` / `ProInput` 狀態驗證 —— Loading 狀態與雙語同步顯示測試。

### E. 全景全量 (Panoramic) 整合測試
- **TC-5001**: E2E 路徑：`Ticker Search` -> `Insights 分析` -> `Risk 監控` -> `Evolution 驗證`。
- **TC-5002**: TypeScript 全域型別零錯誤掃描 (`npx tsc --noEmit`)。

## 4. 執行狀態 (Execution Status)
- [ ] **階段 A**: 量化與辯證
- [ ] **階段 B**: 演化視覺化
- [ ] **階段 C**: 法人風險
- [ ] **階段 D**: 雙語 UI
- [ ] **階段 E**: 全景掃描

---
**核准記錄**: 待核准 (Pending)回報核心問題已解決。
