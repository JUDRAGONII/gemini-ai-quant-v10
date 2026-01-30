'use client';

import { useState, useEffect } from 'react';

interface AIPredictionRes {
    stock_code: string;
    prediction_date: string;
    predicted_5d_alpha: number;
    win_rate: number;
    error?: string;
}

export function useAIPrediction(symbol: string) {
    const [data, setData] = useState<AIPredictionRes | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!symbol) return;

        async function fetchPrediction() {
            setLoading(true);
            try {
                const response = await fetch(`/api/ai/predict/${symbol}`);
                if (!response.ok) {
                    throw new Error(`AI API failed: ${response.status}`);
                }
                const result = await response.json();
                setData(result);
                setError(null);
            } catch (err: any) {
                console.error('AI Fetch error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchPrediction();
    }, [symbol]);

    return { data, loading, error };
}
