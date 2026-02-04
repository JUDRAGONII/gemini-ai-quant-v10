# 012_Data_Integrity_Verification (數據完整性校準與驗證)

## ✅ 已完成項目
1.  **數據一致性審計 (Data Audit)**
    *   執行 `dataIntegrity.test.ts` (TC-1101~4101)。
    *   對 5,388,534 筆歷史數據進行全量分類校準 (TWSE 3.4M / Tiingo 1.9M)。

2.  **精確分類邏輯修復**
    *   修復債券 ETF (如 00937B) 誤判為美股的問題。
    *   確立「數字開頭為台股」準則，並針對 `market_type` 欄位建立加速索引。

3.  **效能瓶頸解決**
    *   解決「500萬筆數據計數超時」導致監控中心顯示為 0 的問題。
    *   將計數器重構為基於標的覆蓋率的進度條。

## 📊 驗證日誌
```text
[AUDIT] Total records: 5,388,534
[AUDIT] TWSE: 3,421,029 | TIINGO: 1,967,505
[TEST] DataIntegrity TC-1101... PASS
[TEST] DataIntegrity TC-4101... PASS
```

## ⚠️ 待解問題 (Backlog)
- [ ] 針對大於 10M 筆的表格，未來需考慮實作 HyperLogLog 進行估算計數以節省效能。
