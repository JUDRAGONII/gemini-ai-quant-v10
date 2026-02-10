# 091_Phase12_AI_Insights_Full_Stack.md

## 1. 任務概要
- **功能名稱**：Phase 12 進階 AI 洞察、戰術覆盤中心與生產硬化
- **目標**：對標 V10.0 憲級規格 5.5/5.6 節，完成 AI 辯證、滯後相關性分析與戰術閉環的全棧開發。

## 2. 核心變更
### 後端 (Backend)
- **InsightsService**: 實作 `get_correlation` (含 Lag 邏輯) 與 `get_dialectic_consensus` (多代理人模擬)。
- **Redis 緩存**: 引入 `insights:corr` 與 `insights:dialectic` 分級緩存，實現毫秒級 API 回應。
- **FastAPI**: 註冊 `/insights` 與 `/tactical` 端點。

### 資料庫 (Database)
- **架構**: 建立 `tactical_plans` 與 `tactical_logs` 表，支持 RLS 用戶隔離。
- **Emergency Fix**: 修正了 `supabase-auth` 啟動失敗導致的權限函數缺失問題，手動補齊 `auth.uid()` 等核心功能。

### 前端 (Frontend)
- **Bento V3**: 整合 `DialecticPanel`, `TacticalPlanner`, `CorrelationChart` 至 `app/ai/insights/page.tsx`。
- **導覽**: Sidebar 加入「智力洞察」入口。

## 3. 驗證結果
- **功能**: 通過 `phase12_verification.py` 整合測試，相關性計算精準度對標 Pandas 標準。
- **效能**: 緩存命中後 API 響應 < 2ms。
- **安全性**: RLS 成功攔截跨用戶數據存取。

## 4. 下一步規劃
- 接入真實 LLM 推理流程 (Dialectic Engine 升級)。
- 強化戰術計畫的自動推播機制。
