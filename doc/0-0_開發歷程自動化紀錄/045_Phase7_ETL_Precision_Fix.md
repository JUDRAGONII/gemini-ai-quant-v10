# 045_Phase7_ETL_Precision_Fix (籌碼數據深度修復)

## 1. 深度思考 (Thinking Phase)
- **問題分析**：
    1. **數據量不足**：`T86` 端點未帶 `selectType=ALL`，導致僅獲取特定分類數據（每日僅 7-8 筆）。
    2. **融資融券 404**：`rwd/zh/margin/MI_MARGN` 對於 RWD 路徑不存在，必須使用傳統 `exchangeReport/MI_MARGN`。
    3. **SSL 屏障**：Python `requests` 面臨 `CERTIFICATE_VERIFY_FAILED` 錯誤。
- **方案設計**：
    - **動態對齊**：不硬編碼 Index，根據 API 返回的 `fields` 動態尋找「證券代號」、「買進」、「賣出」等關鍵字索引。
    - **SSL 繞過**：實作 `verify=False` 與 `urllib3.disable_warnings()`。
    - **端點校準**：
        - 三大法人 -> `rwd/zh/fund/T86`
        - 融資融券 -> `exchangeReport/MI_MARGN`

## 2. 執行開發 (Execution Phase)
- **`InstitutionalFetcher` 優化**：
    - 加入 `selectType=ALL`。
    - 改良 `stock_code` 過濾邏輯 (4-6 碼)。
    - 動態 Index 搜尋機制。
- **`MarginFetcher` 優化**：
    - 更換 URL 至 `exchangeReport/MI_MARGN`。
    - 處理 `res['tables'][1]` 的二級表結構。
    - 實作融資、融券、資券互抵各欄位精確抓取。
- **資料庫大規模分區遷移 (Infrastructure)**：
    - **分區策略**：針對 `daily_price` 使用 `PARTITION BY RANGE (trade_date)` 進行年度分區。
    - **安全遷移**：採用「Rename-and-Copy」策略，將原表重新命名為 `daily_price_old`，防止 In-place 操作導致的數據損壞。
    - **範圍擴展**：考慮歷史數據深度，將分區範圍從原本預設的 2023 年擴展至 1990-2027 年，確保全量回溯數據皆有對應分區。
    - **錯誤修復**：修正了 `pg_table_is_partition` 函數的相容性問題，改用標準 `pg_class (relkind)` 判斷邏輯。

## 3. 驗證與結果 (Verification)
- **測試數據 (2024-01-18)**：
    - **三大法人**：成功擷取 14,548 筆 (含權證/ETF)。
    - **融資融券**：成功擷取 1,135 筆 (市場規模相符)。
- **回補啟動**:
    - 啟動 `backfill_p7_institutional_margin.py` (2024-01-01 ~ 2026-01-29)。
    - **初期 0 筆分析**: 因 2024-01-01 (元旦)、01-06~07 (週末) 為非交易日，Fetcher 正確跳過請求，導致日誌前段出現 0 筆，此為正常現象。
    - **終止前統計 (2026-01-29 09:42)**:
        - `stock_institutional`: **752,251 筆** (已大幅超越先前 3,895 筆)。
        - `stock_margin`: **53,357 筆** (已大幅超越先前 0 筆)。
    - **狀態**: 已依照用戶要求手動中斷，機制驗證成功。
- **分區結果驗證**：
    - **遷移筆數**：成功將 **5,388,550 筆** 歷史行情數據遷移至新分區表。
    - **查詢效能**：經初步測試，帶有 `trade_date` 條件的查詢性能大幅提升（透過 Partition Pruning）。
    - **自動化**：已成功掛載 `trg_auto_partition` 觸發器，未來插入新年份數據時將自動動態建立分區表。

## 4. 後續監控 (Next Steps)
- **Rate Limit 監控**：若頻繁出現 403，需增加 `sleep` 時間或引入 Proxy 輪詢。
- **性能檢查**：確保 500 萬筆 `daily_price` 分區表在寫入新回補數據時無索引延遲。
