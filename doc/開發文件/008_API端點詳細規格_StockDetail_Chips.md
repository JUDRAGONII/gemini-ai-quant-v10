# 008_API端點詳細規格_StockDetail.md - 附錄 A: 籌碼分析 (Chips Analysis)

## 1. 取得個股籌碼數據 (Get Stock Chips)

### Endpoint
`GET /api/stocks/[symbol]/chips`

### Description
獲取指定個股在特定時間範圍內的三大法人買賣超數據，並附帶收盤價以供對照分析。

### Parameters
| Name | Type | In | Required | Default | Description |
|---|---|---|---|---|---|
| symbol | string | path | Yes | - | 股票代碼 (e.g., 2330) |
| days | number | query | No | 90 | 查詢天數 |

### Response Schema (200 OK)
```json
{
  "symbol": "2330",
  "data": [
    {
      "date": "2024-01-26",
      "price": 640.0,
      "foreign_inv": 15000,          // 外資買賣超 (張)
      "investment_trust": -200,      // 投信買賣超 (張)
      "dealer": 500,                 // 自營商買賣超 (張)
      "total": 15300                 // 合計買賣超 (張)
    },
    ...
  ]
}
```

### Data Logic
1.  **Join Strategy**: 以 `daily_price` 為主表 (確保有交易日)，Left Join `institutional_investors`。
2.  **Null Handling**: 若某日無法人數據 (null)，則視為 0。
3.  **Unit**: 資料庫存儲單位若為「股」，需轉換為「張」(除以 1000) 以利前端閱讀 (或前端自行轉換)。*註：需確認 DB 單位。* (通常 DB 存張數或股數需一致，假設 DB 為股數，API 回傳可維持股數或轉張數，此處建議 API 輸出原始股數，前端格式化)。
    *   **CORRECTION**: 經查 schema，`institutional_investors` 通常存「股數」。為方便前端，API 層統一轉為 **張數 (Shares / 1000)**。

### Error Responses
*   **400 Bad Request**: Symbol missing.
*   **404 Not Found**: Symbol not supported.
*   **500 Internal Server Error**: Database connection failure.
