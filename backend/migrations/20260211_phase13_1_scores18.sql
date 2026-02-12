-- ============================================================
-- Phase 13.1: 量化智力下沉 (Quant Intelligence DB)
-- 建立 18 因子 Percentile 評分表與計算函數
-- 日期: 2026-02-11
-- ============================================================

-- 1. 建立 18 因子評分表
CREATE TABLE IF NOT EXISTS public.stock_scores_18 (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    trade_date DATE NOT NULL,

    -- Value 維度 (4 因子)
    v_pe_score SMALLINT DEFAULT 0,        -- 本益比排名
    v_pb_score SMALLINT DEFAULT 0,        -- 股價淨值比排名
    v_dy_score SMALLINT DEFAULT 0,        -- 股利殖利率排名
    v_ev_ebitda_score SMALLINT DEFAULT 0, -- EV/EBITDA 排名

    -- Growth 維度 (3 因子)
    g_rev_growth_score SMALLINT DEFAULT 0,   -- 營收成長率排名
    g_eps_growth_score SMALLINT DEFAULT 0,   -- EPS 成長率排名
    g_stability_score SMALLINT DEFAULT 0,    -- 盈餘穩定度排名

    -- Quality 維度 (5 因子)
    q_roe_score SMALLINT DEFAULT 0,       -- ROE 排名
    q_gm_score SMALLINT DEFAULT 0,        -- 毛利率排名
    q_nm_score SMALLINT DEFAULT 0,        -- 淨利率排名
    q_lev_score SMALLINT DEFAULT 0,       -- 負債比排名 (反向: 越低越好)
    q_ocf_score SMALLINT DEFAULT 0,       -- 營運現金流排名

    -- Momentum 維度 (4 因子)
    m_rs_score SMALLINT DEFAULT 0,        -- 相對強弱排名
    m_mom6m_score SMALLINT DEFAULT 0,     -- 6 個月動能排名
    m_rsi_score SMALLINT DEFAULT 0,       -- RSI 排名
    m_vol_mom_score SMALLINT DEFAULT 0,   -- 量能動能排名

    -- 聚合指標
    v_avg DECIMAL(5,2) DEFAULT 0,         -- Value 維度均分
    g_avg DECIMAL(5,2) DEFAULT 0,         -- Growth 維度均分
    q_avg DECIMAL(5,2) DEFAULT 0,         -- Quality 維度均分
    m_avg DECIMAL(5,2) DEFAULT 0,         -- Momentum 維度均分
    composite_score DECIMAL(5,2) DEFAULT 0, -- VQGM 綜合評分
    macro_regime VARCHAR(20) DEFAULT 'NEUTRAL', -- 宏觀環境標籤

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT uk_scores_18 UNIQUE (symbol, trade_date)
);

-- 2. 建立加速索引
CREATE INDEX IF NOT EXISTS idx_scores18_symbol ON public.stock_scores_18(symbol);
CREATE INDEX IF NOT EXISTS idx_scores18_date ON public.stock_scores_18(trade_date DESC);
CREATE INDEX IF NOT EXISTS idx_scores18_composite ON public.stock_scores_18(composite_score DESC);

-- 3. RLS 策略 (公開讀取)
ALTER TABLE public.stock_scores_18 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read for scores_18" ON public.stock_scores_18;
CREATE POLICY "Public read for scores_18"
    ON public.stock_scores_18 FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role full access to scores_18" ON public.stock_scores_18;
CREATE POLICY "Service role full access to scores_18"
    ON public.stock_scores_18 USING (auth.jwt()->>'role' = 'service_role');

-- 4. VQGM 計算函數 (使用 percent_rank 視窗函數)
CREATE OR REPLACE FUNCTION public.fn_calculate_vqgm(
    p_target_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INT := 0;
BEGIN
    -- 基於 stock_factors 表中最新數據計算 Percentile 排名
    -- 並寫入 stock_scores_18
    INSERT INTO public.stock_scores_18 (
        symbol, trade_date,
        v_pe_score, v_pb_score, v_dy_score, v_ev_ebitda_score,
        g_rev_growth_score, g_eps_growth_score, g_stability_score,
        q_roe_score, q_gm_score, q_nm_score, q_lev_score, q_ocf_score,
        m_rs_score, m_mom6m_score, m_rsi_score, m_vol_mom_score,
        v_avg, g_avg, q_avg, m_avg, composite_score
    )
    SELECT
        sf.stock_code AS symbol,
        sf.trade_date,
        -- Value 維度: PE (反向, 越低越好), PB (反向), DY (正向)
        COALESCE((100 - (percent_rank() OVER (ORDER BY sf.pe_ratio ASC NULLS LAST) * 100))::SMALLINT, 50),
        COALESCE((100 - (percent_rank() OVER (ORDER BY sf.pb_ratio ASC NULLS LAST) * 100))::SMALLINT, 50),
        COALESCE((percent_rank() OVER (ORDER BY sf.dividend_yield ASC NULLS LAST) * 100)::SMALLINT, 50),
        50, -- EV/EBITDA: 預設 50 (數據待補)

        -- Growth 維度
        COALESCE((percent_rank() OVER (ORDER BY sf.revenue_growth ASC NULLS LAST) * 100)::SMALLINT, 50),
        COALESCE((percent_rank() OVER (ORDER BY sf.eps_growth ASC NULLS LAST) * 100)::SMALLINT, 50),
        50, -- 盈餘穩定度: 預設 50

        -- Quality 維度
        COALESCE((percent_rank() OVER (ORDER BY sf.roe ASC NULLS LAST) * 100)::SMALLINT, 50),
        COALESCE((percent_rank() OVER (ORDER BY sf.gross_margin ASC NULLS LAST) * 100)::SMALLINT, 50),
        50, -- 淨利率: 預設 50
        COALESCE((100 - (percent_rank() OVER (ORDER BY sf.debt_to_equity ASC NULLS LAST) * 100))::SMALLINT, 50),
        50, -- 營運現金流: 預設 50

        -- Momentum 維度
        COALESCE((percent_rank() OVER (ORDER BY sf.relative_strength ASC NULLS LAST) * 100)::SMALLINT, 50),
        COALESCE((percent_rank() OVER (ORDER BY sf.momentum_1m ASC NULLS LAST) * 100)::SMALLINT, 50),
        50, -- RSI: 預設 50
        50, -- 量能動能: 預設 50

        -- 維度均分
        0, 0, 0, 0, 0
    FROM public.stock_factors sf
    WHERE sf.trade_date = p_target_date
    ON CONFLICT (symbol, trade_date) DO UPDATE SET
        v_pe_score = EXCLUDED.v_pe_score,
        v_pb_score = EXCLUDED.v_pb_score,
        v_dy_score = EXCLUDED.v_dy_score,
        v_ev_ebitda_score = EXCLUDED.v_ev_ebitda_score,
        g_rev_growth_score = EXCLUDED.g_rev_growth_score,
        g_eps_growth_score = EXCLUDED.g_eps_growth_score,
        g_stability_score = EXCLUDED.g_stability_score,
        q_roe_score = EXCLUDED.q_roe_score,
        q_gm_score = EXCLUDED.q_gm_score,
        q_nm_score = EXCLUDED.q_nm_score,
        q_lev_score = EXCLUDED.q_lev_score,
        q_ocf_score = EXCLUDED.q_ocf_score,
        m_rs_score = EXCLUDED.m_rs_score,
        m_mom6m_score = EXCLUDED.m_mom6m_score,
        m_rsi_score = EXCLUDED.m_rsi_score,
        m_vol_mom_score = EXCLUDED.m_vol_mom_score,
        updated_at = NOW();

    GET DIAGNOSTICS v_count = ROW_COUNT;

    -- 回填維度均分與綜合評分
    UPDATE public.stock_scores_18 SET
        v_avg = (v_pe_score + v_pb_score + v_dy_score + v_ev_ebitda_score) / 4.0,
        g_avg = (g_rev_growth_score + g_eps_growth_score + g_stability_score) / 3.0,
        q_avg = (q_roe_score + q_gm_score + q_nm_score + q_lev_score + q_ocf_score) / 5.0,
        m_avg = (m_rs_score + m_mom6m_score + m_rsi_score + m_vol_mom_score) / 4.0,
        composite_score = (
            (v_pe_score + v_pb_score + v_dy_score + v_ev_ebitda_score) / 4.0 * 0.25 +
            (g_rev_growth_score + g_eps_growth_score + g_stability_score) / 3.0 * 0.25 +
            (q_roe_score + q_gm_score + q_nm_score + q_lev_score + q_ocf_score) / 5.0 * 0.25 +
            (m_rs_score + m_mom6m_score + m_rsi_score + m_vol_mom_score) / 4.0 * 0.25
        )
    WHERE trade_date = p_target_date;

    RETURN jsonb_build_object(
        'status', 'ok',
        'date', p_target_date,
        'rows_affected', v_count
    );
END;
$$;
