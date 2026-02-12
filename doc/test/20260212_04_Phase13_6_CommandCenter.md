# 20260212_04_Phase13_6_CommandCenter.md

**測試目標**：驗證 AI 監控中心 (Command Center) 的數據聚合正確性、即時更新能力與長時間運行的穩定性。
**測試環境**：Local Docker Environment (Next.js + FastAPI + Supabase + Redis)

## 1. 基礎路徑驗證 (Basic Path)

- [ ] **TC-1306-01**: 驗證 `GET /api/v1/monitor/dashboard` 聚合端點
    - **預期結果**: 回傳 200 OK，JSON 結構包含 `system`, `quota`, `active_alerts`, `market_summary`。回應時間 < 50ms (Redis Cached)。
- [ ] **TC-1306-02**: 驗證 `CommandCenterPage` 頁面渲染
    - **預期結果**: 頁面載入無錯誤，所有 Widgets (System, Alert, Risk, Evolution) 正確顯示初始數據。
- [ ] **TC-1306-03**: 驗證警示流 (LiveAlertFeed) 用戶互動
    - **預期結果**: 點擊 `Acknowledge` 按鈕後，該警示在前端視覺上標記為已讀或移除，並同步至後端狀態。

## 2. 邊界條件驗證 (Boundary & Exceptional)

- [ ] **TC-2306-01**: 驗證 Redis 對接失敗時的降級處理
    - **預期結果**: 若 Redis 斷線，API 應回退至直接查詢 DB 或回傳部分數據 (不應 500 Crash)。
- [ ] **TC-2306-02**: 驗證空數據狀態 (Empty State)
    - **預期結果**: 若無任何警示或市場數據，Widgets 應顯示友善的 "System Normal" 或 "No Data" 狀態，而非空白或破圖。

## 3. 安全性與權限驗證 (RLS & Security)

- [ ] **TC-3306-01**: 驗證非管理員/未授權存取
    - **預期結果**: 未攜帶有效 JWT token 訪問 API 應回傳 401 Unauthorized。

## 4. UX 與耐久性驗證 (UX & Endurance)

- [ ] **TC-4306-01**: 驗證 6 小時耐久性掛機 (Endurance Test)
    - **預期結果**: 前端記憶體佔用無顯著持續上升 (Memory Leak)，瀏覽器無崩潰。
- [ ] **TC-4306-02**: 驗證高頻更新下的渲染效能 (Stress Test)
    - **預期結果**: 模擬每秒推送 10 筆新警示時，UI 幀率 (FPS) 保持在 30 以上，無明顯卡頓。
