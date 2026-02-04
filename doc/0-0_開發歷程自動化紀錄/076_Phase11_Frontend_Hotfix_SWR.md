# Dev Log 076: Phase 11 Frontend Hotfix - SWR Module Not Found

## 📌 任務摘要
- **日期**: 2026-02-04
- **當前階段**: Phase 11 (運作監控與結案)
- **問題類型**: 編譯錯誤 (Frontend Compilation Error)
- **修正目標**: 解決 `Can't resolve 'swr'` 錯誤，恢復前端開發環境運行。

## 🔍 問題診斷 (Thinking Phase)

### 【問題現象】
前端啟動後顯示黃色報錯頁面：
`./hooks/useAlerts.ts:1:0`
`Module not found: Can't resolve 'swr'`

### 【底層根本原因】
1. **依賴漂移**: Phase 9 中引入了市場警示功能，依賴 `swr` 進行數據獲取與快取。
2. **Docker 卷過時 (Stale Volume)**: `docker-compose.yml` 中 frontend 服務使用了匿名磁碟卷 `/app/node_modules` 來保留依賴。
3. **同步失效**: 當 `package.json` 更新時，若未執行 `docker-compose up -d --renew-anon-volumes`，Docker 會繼續使用舊的匿名卷（不包含新安裝的 `swr`），導致編譯時找不到模組。

## 🛠️ 執行修復 (Execution Phase)

1. **本地同步**: 於前端目錄執行 `npm install swr`，確保 `package-lock.json` 與本地 `node_modules` 正確。
2. **優化建置**: 建立 `.dockerignore` 以排除本地 `node_modules` 與 `.next` 目錄，確保 Docker Build Context 乾淨且高效。
3. **強制重建與卷更新**: 
   - 執行 `docker-compose build frontend` 重建映像。
   - 執行 `docker-compose up -d --force-recreate --renew-anon-volumes frontend` 強制更換容器與刷新匿名卷。

## ✅ 驗證結果
- **容器日誌**: `✓ Ready in 13.7s`
- **模組檢查**: `docker exec ai-frontend ls -d node_modules/swr` 回傳成功。
- **UI 狀態**: 前端首頁 (http://localhost:3000) 恢復正常訪問，警示圖標 (AlertBadge) 正常運作。

## 💡 經驗教訓 (Error Lessons)
- 涉及依賴變更（尤其是新套件加入）後，啟動 Docker 時應明確加上 `--renew-anon-volumes` 旗標。
- `.dockerignore` 是保持開發環境與容器環境隔離的關鍵工具。

---
*此紀錄自動由 `/0-0` 工作流生成。*
