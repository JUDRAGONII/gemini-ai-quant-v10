# Phase 8.2：AI 因子整合詳細實作計畫

**計畫編號**：028
**版本**：1.0.0
**建立日期**：2026-01-30
**所屬階段**：Phase 8.2 (Factor Integration)
**關聯任務**：T-AI-005 (後半部)
**狀態**：規劃中 (Planning)
**預估工時**：5 人天

---

## 一、計畫核心目標

本計畫旨在將 Phase 8.1 實作的 `AlphaFactory` 計算引擎與真實數據庫進行對接，實現「每日自動化因子生產線」。

### 核心任務
1.  **資料庫擴充 (Migration)**: 修改 `stock_factors` 表格，新增 `factors_all` (JSONB) 欄位以存儲 50+ 動態因子。
2.  **ETL 服務實作**: 開發 `backend/etl/factor_etl.py`，負責數據聚合、清洗與寫入。
3.  **排程整合**: 將因子計算任務排入 `backend/flows.py` (Prefect/Schedule)。

---

## 二、資料庫 Schema 變更

### 2.1 擴充 `stock_factors`
由於因子數量多且可能隨研發迭代變動，採用 **Hybrid Schema**：
- **核心因子 (固定欄位)**: `pe_ratio`, `roe` 等傳統財務因子維持不變。
- **AI 因子 (動態欄位)**: 新增 `factors_all` JSONB 欄位，存儲如 `MOM_RSI`, `VOL_ATR` 等計算結果。

```sql
-- Migration Script: 20260130_add_dynamic_factors.sql
ALTER TABLE public.stock_factors 
ADD COLUMN IF NOT EXISTS factors_all JSONB COMMENT '存放 AlphaFactory 計算之所有動態因子';

-- Create GIN Index for JSONB (加速查詢)
CREATE INDEX IF NOT EXISTS idx_stock_factors_json ON public.stock_factors USING GIN (factors_all);
```

---

## 三、ETL 服務架構設計 (`backend/etl/factor_etl.py`)

### 3.1 類別結構 `FactorETL`
```python
class FactorETL:
    def __init__(self, db: SupabaseClient):
        self.db = db
        
    def fetch_data(self, stock_code: str, days: int = 365) -> Dict[str, pd.DataFrame]:
        """
        從 DB 撈取該標的所需的 Raw Data:
        1. daily_price (OHLCV)
        2. stock_institutional (Chips)
        3. stock_margin (Margin)
        4. macro_indicators (Macro - Global)
        """
        pass
        
    def run_single(self, stock_code: str):
        """
        單一標的執行流程:
        Fetch -> AlphaFactory -> Format -> Upsert
        """
        # 1. Fetch
        data = self.fetch_data(stock_code)
        
        # 2. Calc
        factory = AlphaFactory(data['price'])
        factory.add_chip_factors(data['chips'])
        factory.add_macro_factors(data['macro'])
        factors = factory.get_factors()
        
        # 3. Upsert
        self.upsert_factors(stock_code, factors)
        
    def run_all(self, limit: int = None):
        """
        批量執行 (Batch Processing)
        """
        pass
```

### 3.2 數據流 (Data Pipeline)
1.  **Input**: 指定股票代碼列表 (List[StockCode])。
2.  **Validation**: 檢查該標的今日是否已更新行情 (Pre-condition)。
3.  **Processing**: 呼叫 `AlphaFactory` 進行向量化運算。
4.  **Output**: 將 `DataFrame` 轉換為 List of Dicts，準備寫入 DB。
    *   注意：`JSONB` 不支援 `NaN`，需轉換為 `None`。

---

## 四、驗收標準

1.  **正確性**: `stock_factors.factors_all` 能正確查詢到 `MOM_RSI` 等數值。
2.  **效能**: 單一標的 (1 年數據) 完整 ETL 流程 < 5 秒 (含 DB IO)。
3.  **完整性**: 必須處理缺資料 (Missing Data) 的狀況，避免 ETL 崩潰。

---

## 五、執行步驟 (Action Plan)

1.  **DB Migration**: 執行 SQL 腳本修改 `stock_factors`。
2.  **ETL 開發**: 實作 `backend/etl/factor_etl.py`。
3.  **整合測試**: 拿 `2330` 與 `0050` 進行端到端跑測。

---

**文件結束**
*計畫編號：028*
*版本：1.0.0*
*建立日期：2026-01-30*
*文件狀態：正式發布*
