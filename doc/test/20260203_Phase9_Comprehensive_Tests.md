# Phase 9 市場監控與選股中心全面性測試計畫

**日期**：2026-02-03
**測試目標**：針對 Phase 9 的五大核心功能（AI選股器、數據中繼、熱圖、配額、警示）進行全維度驗收。
**測試環境**：Next.js 14, FastAPI, Supabase, Redis.

## 測試案例清單

### 1. AI 智能選股引擎 (Phase 9.1)
- **TC-1101 (基礎)**: 驗證多維條件選股。輸入價格區間 [100, 500] 與 AI 分數 [80, 100]，預期回傳符合之標的列表。
- **TC-2101 (邊界)**: 輸入極端過濾條件（如價格 [0, 0]），預期回傳空列表並無報錯。
- **TC-3101 (安全)**: 驗證針對 `stock_factors` 的 RLS 政策，確認匿名請求無法繞過限額讀取。

### 2. 效能平衡行情中繼 (Phase 9.2)
- **TC-1201 (基礎)**: 驗證 Fugle 行情數據轉換 (Transform) 邏輯，確保 `symbol` 正確對齊 `stock_code`。
- **TC-2201 (邊界)**: 模擬 API 斷線或 404，驗證 Relay Worker 是否具備重試或錯誤跳過機制。

### 3. 市場看板視覺化 - 熱力圖 (Phase 9.3)
- **TC-1301 (基礎)**: 驗證 `/api/v1/market/heatmap` 返回的 D3 Hierarchy 階層結構正確。
- **TC-4301 (UX)**: 驗證熱圖區塊是否正確按「產業 (Sector)」進行分組。

### 4. API 配額管理中心 (Phase 9.4)
- **TC-1401 (基礎)**: 驗證執行 ETL 任務後，Redis 內的 Key 使用次數隨之遞增。
- **TC-2401 (邊界)**: 模擬 Key 額度用盡，驗證系統是否自動切換至下一個有效 Key 或進入冷卻期。
- **TC-3401 (安全)**: 驗證 Admin 介面是否對 API Key 進行遮照顯示。

### 5. 市場異動警示引擎 (Phase 9.5)
- **TC-1501 (基礎)**: 模擬價格大漲 5%，驗證後端是否成功生成 `market_alerts` 紀錄。
- **TC-2501 (邊界)**: 驗證 5 分鐘去重 (De-duplication) 機制，防止同一標的重複洗版警示。
- **TC-4501 (UX)**: 驗證前端 Toast 通告功能，確認 Realtime 推送能即時觸發 UI 反饋。

## 執行指令計畫
- **後端**: `pytest backend/tests/test_phase9_comprehensive.py`
- **前端**: `npm run test:screener` / `npm run test:alerts`

決。
