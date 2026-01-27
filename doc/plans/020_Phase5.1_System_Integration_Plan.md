# 020_Phase5.1_System_Integration_Plan (全系統整合測試計畫)

## 1. 目標描述
在各核心模組（ETL、AI 引擎、前端 UI）開發完成後，執行端到端 (E2E) 的整合測試，確保數據流穩定、環境變數一致，並處理跨模組的異步競爭與 Hydration 錯誤。

## 2. 關鍵實作內容

### 2.1 E2E 測試與 Jest 整合
- **全域 Mock 策略**: 建立全域 `jest.setup.js`，模擬 `lucide-react` 圖標、`next/navigation` 及 `recharts` 響應式容器。
- **異步渲染優化**: 解決 `MacroPage` 與 `StockDetail` 在全量測試時的異步競爭 (Race conditions)。
- **Hydration 穩定化**: 修復 `SettingsPage` 與 `MonitorPage` 在伺服器/客戶端渲染不一致的錯誤。

### 2.2 數據一致性驗證 (Data Integrity)
- **壓力測試**: 模擬百萬級數據 (daily_price 5M+) 的計數與查詢效能。
- **市場分類校準**: 修正台美股代號混淆邏輯（如債券 ETF 字母判定錯誤）。
- **回補進度監控**: 實作 `/admin/monitor` 即時監控資料庫寫入狀態與索引健康度。

## 3. 技術點與故障排除
- **Docker 環境隔離**: 確保 `ai-worker` 容器與 `frontend` 在相同 `PYTHONPATH` 下運作。
- **Port 管理**: 監控 3000 (Next.js) 與 8000 (Kong/Supabase) 端口衝突，實作自動清理腳本。

## 4. 驗收指標 (Gate Review P5.1)
- [x] 全站 100+ Jest 測試達成 100% 通過率。
- [x] 成功修復 CI/CD (GitHub Actions) 上的型別報錯與資源缺失。
- [x] 資料庫 500 萬筆數據計數正常顯示 (不觸發超時)。
