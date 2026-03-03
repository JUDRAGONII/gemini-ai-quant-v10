# 048_Phase13_1_Quant_Intelligence_DB.md

# 🚀 Phase 13.1: 量化智力下沉與數據底座 (Quant Intelligence DB)

## 1. 需求解構 (Thinking Phase)
依照 V10.0 規格，18 因子評分 (VQGM) 的即時性與準確性是決策核心。為了實現極速前端體驗，我們需要將繁重的 Percentile 計算從應用層轉移到資料庫層 (DB Down-leveling)。
- **核心目標**：建立 `stock_scores_18` 表，並實作 PL/pgSQL 自動計算邏輯。

---

## 2. SDD 規格定義 (/sdd)

### 2.1 資料表 Schema
```sql
-- 儲存 18 因子詳細得分
CREATE TABLE stock_scores_18 (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    trade_date DATE NOT NULL,
    -- Value (4)
    v_pe_score SMALLINT, v_pb_score SMALLINT, v_dy_score SMALLINT, v_ev_ebitda_score SMALLINT,
    -- Growth (3)
    g_rev_growth_score SMALLINT, g_eps_growth_score SMALLINT, g_stability_score SMALLINT,
    -- Quality (5)
    q_roe_score SMALLINT, q_gm_score SMALLINT, q_nm_score SMALLINT, q_lev_score SMALLINT, q_ocf_score SMALLINT,
    -- Momentum (4)
    m_rs_score SMALLINT, m_mom6m_score SMALLINT, m_rsi_score SMALLINT, m_vol_mom_score SMALLINT,
    -- Aggregate
    composite_score DECIMAL(5,2),
    macro_regime VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uk_scores_18 UNIQUE (symbol, trade_date)
);
```

### 2.2 API Spec
- `GET /api/v1/analysis/18factor-scores?symbol=...`
- 返回 VQGM 四大維度聚合得分與 18 因子細項。

---

## 3. 架構設計審核 (/architect)

### 3.1 計算路徑對比
- **方案 A (Python-Heavy)**：API 請求時透過 Pandas 計算。 (❌ 慢，高併發下延遲大)
- **方案 B (SQL-Heavy)**：使用 `percent_rank()` 視窗函數在資料庫內預先算好。 (✅ 快，資料一致性強)
- **結論**：採用方案 B，並透過 `Trigger` 在 `daily_price` 更新時自動觸發計算。

---

## 4. 任務清單 (Tasks)
- [ ] **DB-01**: 執行 `stock_scores_18` 遷移腳本。
- [ ] **SQL-01**: 撰寫 `fn_calculate_vqgm` 儲存程序，實作 Percentile 排名邏輯。
- [ ] **API-01**: 實作 FastAPI 路由與 Pydantic Model 數據封裝。
- [ ] **TEST-01**: 驗證 18 因子計算結果與 Excel 手動計算一致性。

---
**日期**：2026-02-10
