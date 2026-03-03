# 籌碼分析 API 規格 (Phase 14.4)

## `GET /api/v1/chips/{stock_code}`

獲取標的在指定天數內的歷史籌碼、法人動向與融資券數據，結合每日收盤價，供前端圖表繪製使用。

### Request
- **Path Parameter**: `stock_code` (string) - 股票代碼，如 `2330`
- **Query Parameter**: `days` (int) - 索取天數，預設 `30`，最大 `120`

### Response

```json
{
  "ticker": "2330",
  "success": true,
  "data": [
    {
      "date": "2024-03-01",
      "price": 700.0,
      
      // Institutional (三大法人 - 單位：元)
      "foreign": 1200000000,
      "trust": 500000000,
      "dealer": -100000000,
      "total_institutional": 1600000000,
      
      // Margin (融資券)
      "margin_balance": 50000000, // 融資餘額(張/元)
      "margin_change": 1000000,   // 本日增減
      "short_balance": 10000,     // 融券餘額(張)
      "short_change": -500,       // 本日增減
      "short_ratio": 5.2          // 券資比(%)
    }
  ]
}
```

### TypeScript Interface 對應

```typescript
export interface ChipDailyData {
    date: string;
    price: number;
    
    // 三大法人
    foreign: number;
    trust: number;
    dealer: number;
    total_institutional: number;
    
    // 融資券
    margin_balance: number;
    margin_change: number;
    short_balance: number;
    short_change: number;
    short_ratio: number;
}

export interface ChipsResponse {
    ticker: string;
    success: boolean;
    data: ChipDailyData[];
}
```

### 注意事項
1. **資料對齊**：若某日無籌碼資料但有股價，籌碼欄位應補 `0` 或是沿用前日餘額，需註記說明讓使用者知道。
2. **單位統一**：確保回傳的法人買賣超是以「元」為單位，前端再依需求轉換為「億」顯示。
