import { SupabaseClient } from '@supabase/supabase-js';

export interface ApiResponse<T> {
    status: 'success' | 'error';
    data: T;
    meta?: PaginatedMeta;
    timestamp: string;
    error?: ErrorResponse;
}

export interface PaginatedMeta {
    page: number;
    per_page: number;
    total: number;
    total_pages?: number;
    has_more: boolean;
}

export interface ErrorResponse {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}

export interface StockQuote {
    stock_code: string;
    trade_date: string;
    open: number | null;
    high: number | null;
    low: number | null;
    close: number | null;
    volume: number | null;
    change_percent: number | null;
    adjusted_close?: number | null;
    market_type?: string;
}

export interface StockFinancials {
    stock_code: string;
    report_type: string;
    report_date: string;
    fiscal_year: number;
    revenue: number | null;
    net_income: number | null;
    eps: number | null;
    pe_ratio: number | null;
    pb_ratio: number | null;
    roe: number | null;
    gross_margin: number | null;
    net_margin: number | null;
}

export interface AIScore {
    stock_code: string;
    composite_score: number;
    scores: {
        value: number;
        growth: number;
        quality: number;
        momentum: number;
        macro: number;
    };
    last_updated: string;
}

export interface AIReport {
    id: string;
    stock_code: string;
    title: string;
    content: string;
    report_type: string;
    version: string;
    context_snapshot?: string;
    created_at: string;
}

export interface TechnicalIndicator {
    stock_code: string;
    trade_date: string;
    ma5: number | null;
    ma10: number | null;
    ma20: number | null;
    ma60: number | null;
    ma120: number | null;
    rsi_14: number | null;
    macd_line: number | null;
    signal_line: number | null;
    macd_histogram: number | null;
    bb_upper: number | null;
    bb_middle: number | null;
    bb_lower: number | null;
}

export interface StockInstitutional {
    stock_code: string;
    trade_date: string;
    foreign_buy: number;
    foreign_sell: number;
    foreign_net: number;
    trust_buy: number;
    trust_sell: number;
    trust_net: number;
    dealer_buy: number;
    dealer_sell: number;
    dealer_net: number;
}

export interface StockMargin {
    stock_code: string;
    trade_date: string;
    margin_balance: number;
    margin_buy: number;
    margin_sell: number;
    margin_net: number;
    short_balance: number;
    short_buy: number;
    short_sell: number;
    short_net: number;
}

export interface Portfolio {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

export interface Holding {
    id: string;
    portfolio_id: string;
    stock_code: string;
    shares: number;
    avg_cost: number;
    created_at: string;
    updated_at: string;
}

export interface Watchlist {
    id: string;
    user_id: string;
    stock_code: string;
    notes?: string;
    created_at: string;
}

export interface MacroFactor {
    indicator_code: string;
    indicator_name: string;
    country: string;
    category: string;
    value: number;
    unit: string;
    reference_date: string;
    is_estimate: boolean;
    is_revised: boolean;
}

export interface SupabaseConfig {
    url: string;
    key: string;
    client: SupabaseClient | null;
}

export type IndicatorType = 'ma5' | 'ma10' | 'ma20' | 'ma60' | 'ma120' | 'rsi' | 'macd' | 'bollinger';

export interface TechnicalIndicatorsResponse {
    stock_code: string;
    period: {
        start_date: string;
        end_date: string;
    };
    indicators: {
        ma?: {
            name: string;
            ma5: Array<{ date: string; value: number | null }>;
            ma10: Array<{ date: string; value: number | null }>;
            ma20: Array<{ date: string; value: number | null }>;
            ma60: Array<{ date: string; value: number | null }>;
            ma120: Array<{ date: string; value: number | null }>;
        };
        rsi?: {
            name: string;
            values: Array<{ date: string; value: number | null }>;
        };
        macd?: {
            name: string;
            values: Array<{ date: string; macd: number | null; signal: number | null; histogram: number | null }>;
        };
        bollinger?: {
            name: string;
            values: Array<{ date: string; upper: number | null; middle: number | null; lower: number | null }>;
        };
    };
    record_count: number;
}

export interface AIScoresResponse {
    scores: Array<{
        stock_code: string;
        stock_name: string;
        market: string;
        industry: string;
        composite_score: number;
        scores: {
            value: number;
            growth: number;
            quality: number;
            momentum: number;
            macro: number;
        };
        last_updated: string;
    }>;
    statistics: {
        avg_composite: number;
        highest_composite: number;
        lowest_composite: number;
        total_count: number;
    };
}

export interface StockSearchResult {
    code: string;
    name: string;
    market: string;
    industry?: string;
}

export interface StockDetailResponse {
    stock: {
        stock_code: string;
        stock_name: string;
        market_type: string;
        industry: string;
        sector: string;
        list_date: string;
        currency: string;
        is_active: boolean;
    };
    quote: StockQuote | null;
    financials: StockFinancials | null;
    ai_score: AIScore | null;
    technical_indicators: {
        period: {
            start_date: string;
            end_date: string;
        };
        ma: {
            ma5: Array<{ date: string; value: number | null }>;
            ma10: Array<{ date: string; value: number | null }>;
            ma20: Array<{ date: string; value: number | null }>;
            ma60: Array<{ date: string; value: number | null }>;
            ma120: Array<{ date: string; value: number | null }>;
        };
        rsi: {
            values: Array<{ date: string; value: number | null }>;
        };
        macd: {
            values: Array<{ date: string; macd: number | null; signal: number | null; histogram: number | null }>;
        };
        bollinger: {
            values: Array<{ date: string; upper: number | null; middle: number | null; lower: number | null }>;
        };
        record_count: number;
    } | null;
}
