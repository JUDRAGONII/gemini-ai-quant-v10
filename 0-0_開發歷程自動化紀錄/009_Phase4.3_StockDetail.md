# 009_Phase4.3_StockDetail.md  
**日期**: 2026-01-26  
**階段**: Phase 4.3 - 個股詳情頁核心功能開發  
**執行者**: Antigravity AI Agent

---

## 📋 任務目標
依照 `/sdd` (規格驅動開發) 與 `/ui-ux-pro-max` 規範，完成個股動態詳情頁的全棧實作。

---

## 🛠️ 開發內容

### 1. 後端 API 實作
**檔案**: `frontend/app/api/stocks/[symbol]/route.ts`
- 聚合 `stocks`, `daily_price`, `stock_factors` 三張表數據
- 自動將日期轉換為 UNIX Timestamp 格式
- 支援 `?limit=N` 參數限制回傳筆數

### 2. 前端 Hook 封裝
**檔案**: `frontend/hooks/useStockDetail.ts`
- 封裝 API 請求邏輯
- 提供 `data`, `loading`, `error` 三態管理

### 3. K 線圖組件
**檔案**: `frontend/components/Chart/StockChart.tsx`
- 基於 `lightweight-charts` v5.x 實作
- 支援 Crosshair 追蹤與自適應寬度
- **修復**: 適配 v5 統一 API (`addSeries(CandlestickSeries)`)

### 4. 詳情頁面佈局
**檔案**: `frontend/app/stocks/[symbol]/page.tsx`
- 玻璃擬態 (Glassmorphism) 設計
- 財務指標卡片 (PE/PB/ROE/殖利率)
- Framer Motion 進場動畫

---

## 🐛 故障排除

### Issue 1: 404 無法載入數據
**現象**: 前端顯示「無法載入數據 (Failed to fetch stock detail: 404)」  
**根本原因**: 
1. `frontend/.env.local` 不存在，Supabase SDK 使用無效 Mock Key
2. Next.js 不讀取父目錄的 `.env`

**解決方案**: 建立 `frontend/.env.local` 並同步 Supabase 金鑰

### Issue 2: price_series 空陣列
**現象**: API 返回 200，但 `price_series: []`  
**根本原因**: API 查詢 `open, close`，但資料庫欄位為 `open_price, close_price`

**解決方案**: 修正 `route.ts` 中的欄位名稱映射

### Issue 3: chart.addCandlestickSeries is not a function
**現象**: 前端 Console 報錯 `TypeError`  
**根本原因**: `lightweight-charts` v5.x 移除了 `addCandlestickSeries()` 方法

**解決方案**: 改用 v5 統一 API `chart.addSeries(CandlestickSeries, {...})`

---

## 📁 環境配置同步
- **更新**: `.env.example` 加入 `NEXT_PUBLIC_*` 變數說明
- **建立**: `frontend/.env.local` 同步 Supabase 金鑰
- **安全**: 將 `frontend/.env.local` 加入 `.gitignore`

---

## 🔐 安全性說明 (ANON_KEY)
`NEXT_PUBLIC_SUPABASE_ANON_KEY` 是「設計上可公開的」金鑰：
- 受 Supabase RLS (Row Level Security) 保護
- 只能執行被策略允許的操作
- 這是 Supabase 官方推薦的「Client-Side Safe Key」模式

---

## ✅ 驗證結果
- API 測試: `curl http://localhost:3000/api/stocks/2330` 返回 HTTP 200
- 數據量: 台積電 (2330) 共 3963 筆歷史行情
- 前端渲染: K 線圖正確顯示

---

## 📊 相關文件
- 規格書: `doc/開發文件/008_API端點詳細規格_StockDetail.md`
- PCM Summary: `doc/PCM/0-1_DEV_SUMMARY.md`
- Changelog: `doc/PCM/0-2_CHANGELOG.md`
