# 012_Phase5_Financials_Technical 開發日誌

## 開發日期
2026-01-27

## 開發階段
Phase 5: 美股財報對接及技術分析子頁面

---

## 功能摘要

### Phase 5.1: 財務報表對接
1. **後端 ETL (FMP API)**
   - 實作 `backend/etl/financials_fetcher.py`
   - 支援 Income Statement / Balance Sheet / Cash Flow 三表擷取
   - 雙 API Key 輪詢機制 (`FMP_API_KEY_1`, `FMP_API_KEY_2`)

2. **Config 擴充**
   - 新增 `FMP_KEYS` 列表與 `get_fmp_key()` 方法至 `lib/config.py`

3. **DB Migration**
   - 建立 `stock_financials` 表 (15 個欄位)
   - 含 Unique Constraint 與加速索引

4. **前端 API Route**
   - `GET /api/stocks/[symbol]/financials`
   - 回傳年報 (5 年) + 季報 (8 季)，含毛利率/淨利率計算

5. **前端頁面 (Glassmorphism)**
   - 統計卡片 (營收/EPS/毛利率/淨利率)
   - 季度營收/淨利趨勢 BarChart
   - 年度盈利能力 LineChart
   - 年度明細 Table

### Phase 5.2: 技術分析子頁面
1. **技術指標計算 (前端即時)**
   - SMA (5/20/60)
   - RSI (14)
   - MACD (12/26/9)

2. **前端頁面**
   - 指標卡片 (多空趨勢判斷)
   - 股價與均線 LineChart
   - RSI AreaChart (含超買/超賣參考線)
   - MACD BarChart + Line 疊加

3. **Layout 導航更新**
   - 新增 "財務報表" 與 "技術分析" 兩個 Tab

---

## 驗證結果
- TypeScript: `npx tsc --noEmit` → Exit 0
- Jest: 19 Passed, 1 Skipped, 101 Tests

---

## 檔案變更清單
| 類型 | 路徑 |
|:---|:---|
| NEW | `backend/etl/financials_fetcher.py` |
| MODIFY | `backend/lib/config.py` |
| NEW | `supabase/migrations/20260127_stock_financials.sql` |
| NEW | `frontend/app/api/stocks/[symbol]/financials/route.ts` |
| NEW | `frontend/app/stocks/[symbol]/financials/page.tsx` |
| NEW | `frontend/app/stocks/[symbol]/technical/page.tsx` |
| MODIFY | `frontend/app/stocks/[symbol]/layout.tsx` |
