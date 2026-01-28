# 20260127_12_Financials_Technical_Validation (美股財報與技術分析驗收)

## 1. 測試目標
- 驗證「美股財報 (Financials)」頁面之各項卡片、圖表與表格數據正確性。
- 驗證「技術分析 (Technical)」頁面之即時指標計算 (MA, RSI, MACD) 與互動圖表。
- 驗證後端與前端 API 路由之安全性 (RLS) 與數據完整性。

## 2. 測試環境
- **OS**: Windows (Localhost)
- **Frontend**: Next.js 14, Tailwind CSS, Recharts
- **Backend API**: Supabase (PostgreSQL), Next.js API Routes
- **Data Source**: Stock Financials Table, FMP API (Backfilled Data)
- **Test Date**: 2026-01-27

## 3. 測試案例清單

### 3.1 基礎路徑 (Happy Path) - Financials
- [x] **TC-1100**: 美股財報頁面訪問
  - **操作**: 進入 `/stocks/AAPL/financials`。
  - **預期**: 頁面正常載入，顯示 Glassmorphism UI，Tab 停留在「財務報表」。
  
- [x] **TC-1101**: 關鍵財務指標卡片顯示
  - **操作**: 檢視「總營收 (TTM)」、「毛利率」、「營業利益率」、「淨利率」卡片。
  - **預期**: 顯示數值正確，與 FMP 回補數據一致 (非 NaN)，且配色符合正負值規範。

- [x] **TC-1102**: 季度營收/淨利趨勢圖渲染
  - **操作**: 檢視「季度營收與淨利趨勢」圖表 (Bar Chart)。
  - **預期**: 顯示近 8 季數據，Tooltip 滑鼠懸停顯示正確數值。

- [x] **TC-1103**: 財務報表明細表
  - **操作**: 檢視下方詳細數據表格。
  - **預期**: 列表顯示年度與季度數據，時間排序正確 (最新在前)，且包含 EPS, Free Cash Flow 等關鍵欄位。

### 3.2 基礎路徑 (Happy Path) - Technical
- [x] **TC-1200**: 技術分析頁面訪問
  - **操作**: 進入 `/stocks/AAPL/technical`。
  - **預期**: 頁面正常載入，顯示「K線/均線圖」、「RSI 強弱指標」、「MACD 趨勢指標」。

- [x] **TC-1201**: 技術指標即時計算準確地
  - **操作**: 檢查 Summary 卡片區域 (RSI, MACD, MA Trend)。
  - **預期**: 
    - RSI 數值在 0-100 之間。
    - MACD 顯示 DIF, DEA 數值。
    - MA 趨勢顯示 Bullish/Bearish 狀態。

- [x] **TC-1202**: K線圖與均線疊加
  - **操作**: 觀察主圖表。
  - **預期**: K線 (Candlestick) 渲染正確，且疊加 MA5 (黃), MA20 (藍), MA60 (紫) 三條曲線。

### 3.3 邊界條件 (Edge Cases)
- [x] **TC-2100**: 無財報數據之個股處理
  - **操作**: 訪問未回補財報的個股頁面 (e.g., `/stocks/UNKNOWN/financials`)。
  - **預期**: 顯示「無財報數據」或「尚無資料」之友善提示 (Empty State)，而非頁面崩潰或無限 Loading。

- [x] **TC-2200**: 技術指標數據不足 (上市未滿 60 天)
  - **操作**: 模擬資料庫中僅有 10 筆股價數據的情況下訪問技術頁面。
  - **預期**: MA60 不顯示或為 null，但 MA5 正常顯示，系統不報錯 (Graceful Degradation)。

### 3.4 安全性驗證 (Security & RLS)
- [x] **TC-3100**: 匿名 (Anon) 權限讀取財報
  - **操作**: 使用未登入狀態 (Anon Key) 請求 `/api/stocks/AAPL/financials`。
  - **預期**: 成功回傳數據 (Status 200)，驗證 `public_read_access` RLS 政策生效。

- [x] **TC-3101**: 寫入權限阻擋
  - **操作**: 嘗試使用 Anon Key 對 `stock_financials` 執行 POST/INSERT。
  - **預期**: 請求失敗 (403 Forbidden 或 401 Unauthorized)，確保只有後端 ETL 可寫入。

### 3.5 UI/UX 體驗 (User Experience)
- [x] **TC-4100**: Tab 切換流暢度
  - **操作**: 在「總覽」、「籌碼」、「財報」、「技術」四個 Tab 間快速切換。
  - **預期**: 路由切換無顯著延遲 (<300ms)，且當前 Tab 高亮狀態正確。

- [x] **TC-4101**: RWD 手機版適配
  - **操作**: 調整瀏覽器寬度至 375px (iPhone SE)。
  - **預期**: 
    - 財報圖表自動垂直排列。
    - 表格顯示橫向捲軸 (X-scroll) 而非因擠壓破版。
