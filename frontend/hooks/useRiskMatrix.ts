import useSWR from "swr";

export interface RiskMatrixData {
    ticker: string;
    timestamp: string;
    greeks: {
        delta: number;
        gamma: number;
        theta: number;
        vega: number;
    };
    barra_decomposition: {
        size: number;
        value: number;
        momentum: number;
        volatility: number;
        growth: number;
    };
    stress_tests: Array<{
        scenario: string;
        impact_pct: number;
        recovery_days: number;
    }>;
    behavioral_biases: Array<{
        type: string;
        confidence: number;
        suggestion: string;
    }>;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useRiskMatrix(ticker: string) {
    const { data, error, isLoading, mutate } = useSWR<RiskMatrixData>(
        ticker ? `/api/v1/professional/risk-matrix?ticker=${ticker}` : null,
        fetcher
    );

    return {
        riskData: data,
        isLoading,
        isError: error,
        mutate,
    };
}
