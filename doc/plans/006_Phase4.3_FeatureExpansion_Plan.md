# 006_Phase4.3_FeatureExpansion_Plan.md

## 📅 任務元數據 (Metadata)
*   **日期**: 2026-01-22
*   **階段**: Phase 4.3 Feature Expansion
*   **目標**: 擴充籌碼子頁面、宏觀指標頁面與語義搜尋功能。
*   **設計規範**: UI/UX Pro Max (Glassmorphism + Fintech Dark)

## 🧠 深度思考 (Thinking Phase)

### 需求解構
1.  **籌碼子頁面**: `/chips` 改為 Nested Layout，新增「融資融券」與「三大法人」分頁。
2.  **宏觀子頁面**: `/macro` 主頁 + `/macro/[indicator]` 詳情頁，串接 Supabase `macro_indicators`。
3.  **語義搜尋**: Gemini Embedding + Supabase pgvector 實現 RAG 搜尋。

### 方案對比

| 模組 | 推薦方案 | 理由 |
|:---|:---|:---|
| 籌碼子頁面結構 | Nested Layout (`/chips/margin`) | 符合 Next.js App Router 最佳實踐，SEO 友好 |
| 語義搜尋後端 | Gemini Embedding + Supabase pgvector | KISS 原則：免額外 Vector DB，簡化架構 |

## 📂 待執行項目 (Pending)

### 1. 籌碼子頁面 (P1)
- [ ] `frontend/app/chips/layout.tsx`: 共用 Layout + Tab 導航
- [ ] `frontend/app/chips/(tabs)/margin/page.tsx`: 融資融券詳細頁
- [ ] `frontend/app/chips/(tabs)/institutional/page.tsx`: 三大法人頁
- [ ] `frontend/data/mockMargin.ts`: 模擬數據

### 2. 宏觀子頁面 (P2)
- [ ] `frontend/app/macro/page.tsx`: 宏觀指標主頁 (六大指標卡片)
- [ ] `frontend/app/macro/[indicator]/page.tsx`: 指標詳情頁
- [ ] `frontend/components/MacroIndicatorCard.tsx`: 指標卡片組件

### 3. 語義搜尋 RAG (P3)
- [ ] `backend/agents/embedding.py`: Gemini Embedding API
- [ ] `backend/api/routes/search.py`: 搜尋 API
- [ ] `frontend/components/CommandK.tsx`: 全局搜尋 Modal (Cmd+K)

## 🔗 相關文件
*   [005_Phase4.2_CoreFeatures_Plan.md](file:///c:/Users/GV72/Desktop/私人事務/APP/AI投資分析儀V10.0/doc/plans/005_Phase4.2_CoreFeatures_Plan.md)
*   [implementation_plan.md](file:///C:/Users/GV72/.gemini/antigravity/brain/5766d70f-b6af-43f7-9f40-a1fe3f95b728/implementation_plan.md)
