# 010_Phase4.5_Taiwan_Data_And_Macro_Refactor (台股對接與宏觀頁面重構)

## ✅ 已完成項目
1.  **台股數據對接 (Taiwan Market Data)**
    *   實作 `backend/etl/tw_official.py` (TWSE) 與 `market.py` (Fugle v2)。
    *   擴充 `intraday_candles` 資料表結構以支援台股高頻數據。
    *   完成 0050.TW 近 15 年全歷史行情同步 (5404 筆)。

2.  **宏觀數據頁面重構 (Macro UI Refactor)**
    *   依據規格書 4.2 節優化頁面分區：台灣 (TW) / 美國 (US) / 全球 (Global)。
    *   實作分類分組與搜尋功能，解決指標過多導致的尋找困難。

3.  **大規模數據回補 (Data Backfill)**
    *   執行 `backfill_manager.py`，成功寫入 41,215 筆宏觀歷史數據 (1990-2026)。

## 📊 驗證日誌
```text
[TWSE] Syncing 0050.TW... Completed.
[MACRO] Backfilling 130 indicators... 41215 records upserted.
[UI] Macro Dashboard grouping: SUCCESS.
```

## ⚠️ 待解問題 (Backlog)
- [ ] 部分 FRED 指標在高頻更新時可能觸發 429，需進一步優化冷卻時間。
