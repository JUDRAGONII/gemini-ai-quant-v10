'use client';

import { useState, useEffect } from 'react';
import { formatErrorMessage } from '@/lib/errorUtils';

interface StockMetadata {
    symbol: string;
    name: string;
    market: string;
    is_active: boolean;
}

interface SummaryStats {
    pe_ratio: number | null;
    pb_ratio: number | null;
    dividend_yield: number | null;
    roe: number | null;
    last_price: number | null;
}

interface PricePoint {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface StockDetailData {
    metadata: StockMetadata;
    summary_stats: SummaryStats;
    price_series: PricePoint[];
}

/**
 * useStockDetail Hook
 * 封裝個股詳情 API 請求邏輯
 */
export function useStockDetail(symbol: string) {
    const [data, setData] = useState<StockDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!symbol) return;

        async function fetchDetail() {
            setLoading(true);
            try {
                const response = await fetch(`/api/stocks/${symbol}?limit=300`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch stock detail: ${response.status}`);
                }
                const result = await response.json();
                setData(result);
                setError(null);
            } catch (err: any) {
                console.error('Fetch error:', err);
                setError(formatErrorMessage(err.message));
            } finally {
                setLoading(false);
            }
        }

        fetchDetail();
    }, [symbol]);

    return { data, loading, error };
}
