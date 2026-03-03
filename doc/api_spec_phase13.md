# Phase 13.3: 演化策略基因組視覺化 — API 規格 (Draft v1)

## 1. 演化歷史紀錄 (Evolution History)
獲取遺傳演算法歷代的演化統計數據，用於前端 `FitnessHeatmap` 與基因遷移分析。

- **Endpoint**: `GET /api/v1/evolution/history`
- **Method**: `GET`
- **Response**: `List[EvolutionRecord]`

### 數據結構 (EvolutionRecord)
```ts
interface EvolutionRecord {
  generation: number;       // 代數 (0 ~ N)
  best_genome: number[];    // 26 維基因向量 (float8[])
  avg_fitness: number;      // 該代平均適應度
  max_fitness: number;      // 該代最佳適應度
  created_at: string;       // ISO8601 時間戳
}
```

---

## 2. 當前最佳個體 (Current Best)
獲取當前 Hall of Fame 中最強個體的詳細資訊，用於 `GenomeMap` 渲染。

- **Endpoint**: `GET /api/v1/evolution/best`
- **Method**: `GET`
- **Response**: `BestIndividualResponse`

### 數據結構 (BestIndividualResponse)
```ts
interface BestIndividualResponse {
  generation: number;
  genome: number[];         // 26 維基因向量
  fitness: number;          // 加權得分
  metrics: {
    sharpe: number;         // 夏普比率
    mdd: number;           // 最大回撤
    annual_return: number; // 年化報酬
  };
}
```

---

## 3. 型別定義 (TypeScript / Pydantic)

### Frontend (TypeScript)
```tsx
export interface GenomeHistory {
  generation: number;
  bestGenome: number[];
  avgFitness: number;
  maxFitness: number;
  createdAt: string;
}
```

### Backend (Pydantic)
```python
class EvolutionRecord(BaseModel):
    generation: int
    best_genome: List[float]
    avg_fitness: float
    max_fitness: float
    created_at: datetime
```

---

## 4. 法人級風險矩陣 (Professional Risk Matrix)
提供標的或投資組合的敏感度分析 (Greeks)、風格因子分解 (Barra) 與壓力測試數據。

- **Endpoint**: `GET /api/v1/professional/risk-matrix`
- **Method**: `GET`
- **Parameters**: 
    - `ticker`: string (optional, 預設為全組合)
- **Response**: `RiskMatrixResponse`

### 數據結構 (RiskMatrixResponse)
```ts
interface RiskMatrixResponse {
  ticker: string;
  timestamp: string;
  // 敏感度矩陣 (模擬 Greeks)
  greeks: {
    delta: number;   // 價格敏感度
    gamma: number;   // 曲率敏感度 (二階)
    theta: number;   // 時間衰減 (策略冷卻)
    vega: number;    // 波動度敏感度
  };
  // Barra 風險風格分解
  barra_decomposition: {
    size: number;       // 市值規模貢獻
    value: number;      // 價值因子貢獻
    momentum: number;   // 動能因子貢獻
    volatility: number; // 波動性因子貢獻
    growth: number;     // 成長因子貢獻
  };
  // 壓力測試 (Stress Test Scenarios)
  stress_tests: Array<{
    scenario: string;    // 場景名稱 (如 "2008 Financial Crisis")
    impact_pct: number;  // 預期衝擊百分比
    recovery_days: number; // 預估恢復天數
  }>;
  // 行為心理偏誤偵測
  behavioral_biases: Array<{
    type: string;        // 偏誤類型 (如 "Loss Aversion")
    confidence: number;  // 偵測信心水準
    suggestion: string;  // 專家建議
  }>;
}
```
