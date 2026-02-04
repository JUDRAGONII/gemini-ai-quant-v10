# Dev Log 063: API 連線修復、數據一致性優化與報告導覽補強

## 📅 日期: 2026-02-02
## 👤 執行者: Antigravity

---

### 🔍 問題診斷 (Root Cause Analysis)
1. **個股詳情 404 (2330 載入失敗)**:
    - **現象**: 點選台積電 (2330) 時顯示「Failed to fetch stock detail: 404」。
    - **原因**: 前端 Next.js API Routes (Server Components/Server Actions) 在 Docker 內部環境中嘗試連線 `http://localhost:8000`。由於 Docker 容器網路隔離，`localhost` 指向前端容器本身而非 Kong 閘道器，導致 API 請求失敗。
2. **評分數據不一致 (Ranking Mismatch)**:
    - **現象**: 排行榜表格顯示 NVDA 80 分，但雷達圈顯示 81 分。
    - **原因**: 排行榜計算使用的是「加權平均」(Weighted Average)，而雷達圖組件內部使用的是「算術平均」(Simple Average)，且存在四捨五入邏輯差異。
3. **報告頁面缺失 (Navigation Breach)**:
    - **現象**: 使用者找不到從「智慧排名」或「個股詳情」前往 AI 生成報告的入口。

### 🛠️ 執行動作 (Actions Taken)
1. **API 連線熱修復**:
    - 更新 `docker-compose.yml` 與 `frontend/.env.local`：新增 `INTERNAL_SUPABASE_URL=http://kong:8000`。
    - 確保前端在伺服器端環境下能正確透過 Docker 網域名稱存取 Supabase 服務。
2. **同步評分邏輯**:
    - 修改 `ScoreRadarChart` 組件：新增 `customScore` Prop，改由父組件傳入已計算完成的「加權總分」，移除組件內部的二次平均計算。
    - 更新 `RankingPage`：確保表格與雷達圖顯示的分數來源完全一致。
3. **補強決策報告導覽**:
    - 在「智慧排名」側邊欄新增「查看 AI 投資報告」快速按鈕。
    - 修改「個股詳情」主操作按鈕，導向至 `/ai/search?q={symbol}`，實現從行情到決策的完整流程閉環。

### ✅ 驗證清單 (Verification)
- [ ] 進入 `/stocks/2330`，確認「總覽、籌碼、財務」分頁數據已可正常載入 (不再 404)。
- [ ] 進入 `/ai/ranking`，比對各標的分數，確認表格與雷達圖數值 100% 同步。
- [ ] 測試側邊欄與個股頁面的「查看報告」按鈕，確認能正確引導至搜尋結果或具體報告。

---
**專案狀態**: Phase 8.6 熱修復完成 | 數據穩定性提升
**下一動作**: 準備進入 Phase 9: 行情即時監控開發。決。
