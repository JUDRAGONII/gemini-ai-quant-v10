# 🧪 測試案例清單：演化策略基因組視覺化 (Evolutionary Visualizer)

## 1. 測試目標
驗證演化歷史數據的正確存儲、API 安全存取、以及前端基因圖譜與熱圖的視覺渲染。

## 2. 測試環境
- **前端**: Next.js 14 (Jest + React Testing Library)
- **後端**: FastAPI (Pytest)
- **資料庫**: Supabase (PostgreSQL RLS)

---

## 3. 測試案例 (Test Cases)

### 3.1 基礎功能驗證 (Core Path)
- [ ] **TC-1341**: 基因數據存儲 - 確保 `evolution_history` 能正確寫入 26 維 `float8[]` 向量。
- [ ] **TC-1342**: 歷程 API 獲取 - `GET /api/v1/evolution/history` 返回正確的 JSON 數組與分頁。
- [ ] **TC-1343**: GenomeMap 渲染 - 確認 26 個基因位點均正確顯示於前端圖表。

### 3.2 邊界與異常處理 (Boundary & Error)
- [ ] **TC-2341**: 空數據狀態 - 當演化尚未啟動時，UI 應顯示「演化初始化中」或佔位屏。
- [ ] **TC-2342**: 數據不連續 - 模擬 `generation` 跳號時，熱圖應能正確補點或處理斷點。

### 3.3 安全性驗證 (Security / RLS)
- [ ] **TC-3341**: 匿名攔截 - 驗證 `anon` key 無法讀取 `evolution_history` 表。
- [ ] **TC-3342**: 授權讀取 - 驗證具有 JWT Token 的使用者可獲取歷史紀錄。

### 3.4 性能驗證 (Performance)
- [ ] **TC-4341**: 大數據載入 - 當代數 > 500 時，前端渲染 `FitnessHeatmap` 的加載時間應 < 1.5s。

---
**日期**：2026-02-12
**計畫編號**：TEST-P13-3
