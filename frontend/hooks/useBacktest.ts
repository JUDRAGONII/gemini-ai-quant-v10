'use client';

import { useState } from 'react';

interface BacktestMetrics {
    total_return: number;
    cagr: number;
    max_drawdown: number;
    sharpe: number;
    sortino: number;
    win_rate: number;
}

interface BacktestRes {
    stock_code: string;
    metrics: BacktestMetrics;
    charts: {
        equity: Array<{ date: string; value: number }>;
    };
}

export function useBacktest() {
    const [data, setData] = useState<BacktestRes | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const runBacktest = async (stockCode: string, threshold: number = 0.005) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/ai/backtest/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stock_code: stockCode,
                    strategy_config: { threshold }
                }),
            });

            if (!response.ok) {
                throw new Error(`Backtest failed: ${response.status}`);
            }

            const result = await response.json();
            setData(result);
        } catch (err: any) {
            console.error('Backtest error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, error, runBacktest };
}
