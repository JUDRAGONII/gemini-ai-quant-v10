# AI 投資分析儀 V10.0 API 規格書 (Stock Detail)

## 1. 規格版本與狀態
*   **版本**：v1.0.0
*   **狀態**：草案 (Draft) / SDD 啟動
*   **更新日期**：2026-01-26

## 2. [GET] /api/stocks/{symbol}
獲取指定標的的詳情數據，包含基礎資料、財務指標與歷史價格序列。

### A. 請求參數
| 參數名稱 | 類型 | 必填 | 說明 | 範例 |
| :--- | :--- | :--- | :--- | :--- |
| `symbol` | string | 是 | 股票代號 | `2330.TW`, `NVDA` |
| `period` | string | 否 | 時間區間 (`1D`, `1W`, `1M`, `1Y`, `MAX`) | `1Y` (預設) |
| `interval` | string | 否 | 數據頻率 (`daily`, `weekly`, `monthly`) | `daily` (預設) |

### B. 響應結構 (Success 200)
```json
{
  "metadata": {
    "symbol": "2330.TW",
    "name": "台積電",
    "market": "TWSE",
    "sector": "半導體",
    "description": "全球領先的晶圓代工廠...",
    "price_precision": 1
  },
  "summary_stats": {
    "pe_ratio": 28.5,
    "dividend_yield": 1.8,
    "market_cap": 25000000000000,
    "last_price": 750.0,
    "change_percent": +2.3
  },
  "price_series": [
    {
      "time": 1706227200,
      "open": 745.0,
      "high": 755.0,
      "low": 740.0,
      "close": 750.0,
      "volume": 35000
    }
  ]
}
```

### C. 欄位映射與安全協議
*   **Symbol Mapping**: 公有 API 之 `symbol` 對應資料庫 `ticker` 欄位。
*   **Time Format**: 為優化 TradingView 渲染，`time` 欄位採 **UNIX Timestamp (Seconds)**。
*   **RLS Check**: 此端點需有 `ANON` 權限讀取 `stocks` 與 `daily_price` 表。

### C. 錯誤處理
*   `404 Not Found`: 標的代號不存在。
*   `429 Too Many Requests`: 觸發 API 頻率限制。
*   `500 Internal Server Error`: 資料庫連線或計算異常。

---
## 3. Type Mapping (SDD)
| 規格欄位 | 後端 (Python Pydantic) | 前端 (TypeScript) |
| :--- | :--- | :--- |
| `symbol` | `str` | `string` |
| `last_price` | `float` | `number` |
| `price_series` | `List[PricePoint]` | `Array<PricePoint>` |

---
**核准記錄**：待 `/architect` 審計。
