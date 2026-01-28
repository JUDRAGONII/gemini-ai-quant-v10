# 開發歷程紀錄 027：GitHub CI 前端建置與測試故障修復

## 1. 核心問題診斷
GitHub CI 在「Frontend Build Check」階段失敗，經本地排查發現 27 個 Jest 測試套件中有超過 5 個核心套件因組件重構而崩潰。

### 根源分析：
1. **組件重構未同步測試**：`StockChart` 已更名為 `KLineChart`，但測試仍在使用舊的 Mock 導致 `undefined` 錯誤。
2. **數據欄位不匹配**：持股數據欄位由 `symbol` 變更為 `stock_code` 等，導致渲染檢查失敗。
3. **載入狀態處理缺失**：測試案例未等待 `loading` 狀態結束即進行元素查找。
4. **文字標籤衝突**：UI 文字簡化（如「新增」代替「新增持股」）且頁面出現多處標的代碼（AAPL）導致選擇器歧義。

## 2. 修復方案與實作流程

### 2.1 測試套件同步更新
- **KLineChart Mock**: 修正 `page.test.tsx` 以正確模擬新組件。
- **Field Alignment**: 更新 `portfolio_detail.test.tsx` 與 `ai/[id]/page.test.tsx` 的 Mock 數據結構。
- **Language & Label Sync**: 將測試斷言由英文或舊版文字對齊為實際的繁體中文 UI。

### 2.2 異步穩定性優化
- **Watchlist & Portfolio CRUD**: 引入 `waitFor` 與 `findBy` 邏輯，確保在 Loading Spinner 消失後再執行元素查找，徹底解決 Flaky Tests。

### 2.3 選擇器精確化
- **AAPL Ambiguity**: 使用 `getAllByText` 數組訪問，解決標的代碼在標題與導覽列同時出現的衝突。
- **Button Lookup**: 結合 `closest('button')` 與文字匹配，穩定識別帶有 Lucide 圖示的按鈕。

## 3. 驗證結果
- **指令**: `npm test`
- **結果**: 138 個測試案例全數通過 (100% Pass)。
- **建置驗證**: `npm run build` 成功。

## 4. 總結與預防措施
- **KISS 原則**: 測試代碼應保持輕量，但必須精確對齊數據介面。
- **TDD 導師建議**: 未來進行組件重構時，應優先考慮執行 `npm test` 以確認存量功能無損。
- **CI 守護**: 此修復確保了團隊開發流程的連續性，避免阻塞 CI 建置。

---
**日期**: 2026-01-28
**作者**: AI Antigravity Assistant
