# 018_新功能：數據監控中心 Concept (DRAFT)

**功能名稱**：數據監控中心 (Data Monitor Center)
**路徑**：`/admin/monitor`
**開發者模式切換**：`localStorage.getItem('dev_mode') === 'true'`

---

## 1. User Story
身為開發者，我希望能在前端直接監看資料庫中與 ETL、AI 引擎相關的所有數據表狀態，而無需頻繁打開 Supabase Studio，以便快速驗證後端邏輯注入的執行結果。

## 2. 視覺與設計規格 (UI/UX Pro Max)
- **基礎風格**：OLED Dark Mode (純黑背景) + Midnight Blue (深藍裝飾)。
- **組件體系**：
    - **Status Cards**：展示各表 (macro, price, factors) 的總筆數、當日增量、最後存取時間。
    - **Live Table**：使用 `ProTable` 實現具備虛擬滾動、搜尋功能的數據表格。
    - **Technical Font**：關鍵數據使用 `Fira Code` 等寬字型，營造專業感。
- **微互動**：當數據有異動時（透過 Supabase Realtime），卡片邊緣呈現微弱的呼吸燈效。

## 3. 資料對接路徑
- **市場行情**：`daily_price` (過濾最後 100 筆)。
- **總經指標**：`macro_indicators` (按頻率與類別篩選)。
- **AI 因子**：`stock_factors` (展示因子分佈直方圖或表格)。
- **基因狀態**：`evolution_genes` (查看最新一代的 JSONB 參數)。

## 4. 隱藏機制 (KISS)
- 頁面預設不註冊於 Sidebar。
- 只有在 `/settings` 頁面快速點擊版本號 5 次，才會在選單中顯示此入口。
- [x] **開發環境限定**：檢查 `process.env.NODE_ENV === 'development'` 或特定 Cookie。

## 5. 風險評估
- **性能影響**：大量數據渲染可能導致前端卡頓，需採用分頁或虛擬列表。
- **安全風險**：若外流可能導致數據洩露。解決方案：上線前移除此路由或增加 Admin 權限校驗。

---
> [!NOTE]
> 本功能主要輔助 Phase 4.5/4.6 的開發過程驗證，建議在進入 Phase 5 (系統發布) 之前移除或鎖定。
