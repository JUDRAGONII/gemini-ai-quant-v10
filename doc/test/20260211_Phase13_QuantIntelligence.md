# Phase 13 量化智力與辯證終端測試計畫

## 測試環境
- **Backend**: FastAPI + Supabase (PostgreSQL) + Redis + Gemini API (Mock/Real)
- **Frontend**: Next.js + React + Framer Motion + Recharts + SWR
- **Tools**: Pytest, Jest, React Testing Library

## 測試案例清單

### 1. 後端 Analysis Service (18 因子評分)
- [ ] **TC-1001**: `GET /api/v1/analysis/18factor-scores` - 正常查詢 (有資料)
    - **預期**: 回傳 200 OK, 包含 composite_score, dimensions, factors 結構
- [ ] **TC-1002**: `GET /api/v1/analysis/18factor-scores` - 查詢無資料標的
    - **預期**: 回傳 404 Not Found, detail="尚無...資料"
- [ ] **TC-1003**: `POST /api/v1/analysis/trigger-calculation` - 觸發計算RPC
    - **預期**: 回傳 200 OK, status="ok"
- [ ] **TC-2001**: `AnalysisService._format_dimension` - 處理 NULL/空值
    - **預期**: 分數預設為 0, 不拋出異常

### 2. 後端 Insights Service (AI 辯證)
- [ ] **TC-1101**: `get_dialectic_consensus` - 正常辯論流程
    - **預期**: 回傳 consensus, agents (bull/bear), rationale, 且結構正確
- [ ] **TC-2101**: `_safe_parse_json` - 異常 JSON 解析
    - **預期**: 當 LLM 回傳爛 JSON 時，使用 fallback 預設值，不崩潰
- [ ] **TC-3001**: Redis 快取機制驗證
    - **預期**: 第二次呼叫相同 Ticker 應回傳 `cached: true`

### 3. 前端 FactorRadarChart (雷達圖)
- [ ] **TC-4001**: 正常渲染雷達圖
    - **預期**: 顯示 4 維度 (VQGM) 與正確數值
- [ ] **TC-4002**: 維度切換交互
    - **預期**: 點擊維度按鈕，雷達圖數據切換為該維度的細項因子
- [ ] **TC-4003**: Tooltip 顯示
    - **預期**: Hover 雷達點顯示數值與名稱

### 4. 前端 AgentDebatePanel (辯論卡片)
- [ ] **TC-4101**: 正常顯示多空觀點
    - **預期**: 顯示 Bull/Bear 卡片、信心度進度條、Color Coded (綠/紅)
- [ ] **TC-4102**: Loading 狀態
    - **預期**: 資料載入中顯示 Skeleton 骨架屏
- [ ] **TC-4103**: 無資料狀態 (Null Data)
    - **預期**: 不顯示或顯示提示訊息，不報錯

### 5. 前端 DecisionAssistant (整合組件)
- [ ] **TC-4201**: SWR 數據整合
    - **預期**: 同時發起 Scores 與 Dialectic 請求，正確傳遞數據給子組件
- [ ] **TC-4202**: 重新分析按鈕
    - **預期**: 點擊 `refresh` 觸發 mutate，重新請求 API
- [ ] **TC-4203**: 錯誤處理 UI
    - **預期**: API 錯誤時顯示友善錯誤訊息 (或各組件自行處理)

## 安全性驗證 (Supabase RLS)
- [ ] **TC-3101**: `stock_scores_18` Public Read Access
    - **預期**: 匿名/認證用戶均可讀取
- [ ] **TC-3102**: RPC Execute Permission
    - **預期**: 僅 Service Role 或特定角色可執行 (目前代碼為 SECURITY DEFINER)
