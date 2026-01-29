# AI 投資分析儀 V10.0：架構審計與全域檢視報告 (Architect Global Audit)

**文件編號**：ARCH-20260128-GLOBAL
**審計日期**：2026-01-28
**審計對象**：AI 投資分析儀 V10.0 全系統 (Frontend, Backend, Database, DevOps)
**核心結論**：系統已進入「功能完備期」，基礎設施穩定，但存在「數據適配一致性」與「計算下沉不足」等中長期架構風險。

---

## 🏛️ 一、 系統架構概覽 (System Architecture)

本系統採用 **Hybrid SSR/RAG 架構**，結合了 Next.js 14 的強互動性與 Python 在數據處理/AI 領域的優勢。

### 1.1 技術棧與組件
| 層級 | 技術選型 | 關鍵職責 |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router), Tailwind, Lucide, Lightweight-Charts | UI 渲染、客戶端數據計算 (MA/RSI)、用戶狀態管理 |
| **BFF (API)** | Next.js API Routes (Route Handlers), Supabase JS SDK | 跨表數據聚合、數據格式適配 (Adapters)、安全過濾 |
| **Backend (Worker)** | Python 3.x, Pandas, Supabase-py, Gemini AI | 大規模 ETL、因子計算、AI 語義化分析 (RAG)、定時任務 |
| **Database** | PostgreSQL (Supabase), pgvector | 持久化存儲、向量檢索、RLS (Row-Level Security) 行級安全策略 |
| **Infrastructure** | Docker Compose, Kong Gateway, GoTrue | 身份驗證容器化、逆向代理、本地開發環境一致性 |

---

## 🔍 二、 核心模組審計 (Core Module Audit)

### 2.1 數據流與適配層 (Data Adaptive Layer)
- **現狀**：前端 API Route (`app/api/stocks/[symbol]/route.ts`) 承擔大量適配工作（如 `open_price` -> `open`）。
- **風險**：適配邏輯散落在各個 API Route 與前端 Hook，缺乏單一事實來源 (SSOT)。
- **建議**：
  > [!TIP]
  > 應考慮建立共享的 `types/api.ts` 與後端 `schema.sql` 強制對齊，或在後端透過 PostgreSQL `VIEW` 先行完成欄位映射。

### 2.2 AI 與 RAG 整合
- **成果**：已成功串接 Gemini AI 並實作分維度評分 (Value, Growth, etc.)。
- **優點**：使用 `pgvector` 支持語義搜尋，相似度分數視覺化提升了透明度。
- **改進點**：後端 AI 日誌與前端顯示存在時間差，建議引入 Supabase Realtime 監聽 AI 報告生成狀態。

---

## ⚡ 三、 效能與可擴展性 (Performance & Scalability)

### 3.1 計算重心轉移 (Computation Offloading)
- **問題**：技術指標（MA, RSI）目前在前端 JS 即時計算。
- **案由**：若回測時間跨度拉長至 5 年以上，大數據量會導致 UI 線程卡頓。
- **決策矩陣**：

| 方案 | 效能 (Performance) | 實作複雜度 | 靈活性 |
| :--- | :--- | :--- | :--- |
| **現有 (Client Calc)** | 低 (大數據量) | 極低 | 高 (隨時改參數) |
| **DB Window Functions** | **極高** | 中 | 低 (參數需傳回後端) |
| **AI Worker Pre-calc** | 高 | 高 (需維護因子表) | 中 (定時更新) |

**結論**：建議針對「常用指標 (MA5/20/60)」執行 **[計算下沉]**，利用 PostgreSQL 窗口函數在取出數據時即完成。

### 3.2 錯誤處理的一致性
- **優化成果**：已實作 `errorUtils.ts` 達成雙語顯示，有效解決截圖中 `Unauthorized` 無法直觀理解的問題。
- **下一步**：所有 `npm run dev` 啟動提示應標準化，避免用戶在「端口跳轉 (3000 -> 3001)」時產生認知錯誤。

---

## 🛡️ 四、 安全性審計 (Security Review)

- **身份驗證**：已整合 GoTrue/Auth，但部分 Admin 頁面仍需補足 Middleware 層級的 `AuthGuard`。
- **數據隔離**：`user_portfolios` 表已正確啟用 RLS，防範橫向越權。
- **API 金鑰**：Tiingo/FMP 金鑰已實作輪詢機制，能有效規避 429 配額限制。

---

## 🗺️ 五、 未來里程碑建議 (Phase 7+ Roadmap)

1.  **[API] 統一適配層**：將 `frontend/app/api` 下的重複變換邏輯歸併為單一的寫入與讀取 Transformer。
2.  **[UX] 圖表響應度**：修正 `lightweight-charts` 在極端解析度下的 ID 衝突異常（已在 Phase 4.6 初步修復）。
3.  **[AI] 閉環反饋**：新增使用者對 AI 報告的「評分功能」，將反饋寫回向量資料庫提升後續報告準確度。

---

**審計結論**：架構設計穩健，符合 **KISS (Keep It Simple, Stupid)** 原則。目前首要任務是維持「前端數據解構」與「後端資料表結構」的強一致性。

*簽署人：系統架構師 Antigravity*
*審計結束*
