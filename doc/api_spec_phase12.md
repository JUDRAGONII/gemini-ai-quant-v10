## 3. AI 辯證引擎 API
**Endpoint**: `GET /api/v1/insights/dialectic`
**Parameters**:
- `ticker`: 標的代码
- `agents`: 參與代理人類型 (預設: `value,momentum,macro`)

**Response**:
```json
{
  "consensus": "Neutral",
  "arguments": [
    {"agent": "Value", "opinion": "Bullish", "reason": "PE < 15"},
    {"agent": "Momentum", "opinion": "Bearish", "reason": "RSI > 75"}
  ],
  "conviction": 0.65
}
```
