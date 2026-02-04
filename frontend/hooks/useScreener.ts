import { useState, useCallback } from 'react';
import useSWR from 'swr';

export interface ScreenerResult {
    stock_code: string;
    name: string;
    price: number;
    change_percent: number;
    volume: number;
    ai_score: number;
    rsi_14: number;
    factors_all: any;
    updated_at: string;
}

export interface ScreenerFilters {
    price_range?: [number, number];
    change_range?: [number, number];
    ai_score_range?: [number, number];
    rsi_14_range?: [number, number];
}

const fetcher = async (url: string, filters: any, sortBy: string, sortOrder: string, page: number) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            filters,
            sort_by: sortBy,
            sort_order: sortOrder,
            page,
            page_size: 50
        })
    });
    if (!response.ok) throw new Error('Failed to fetch screener results');
    return response.json();
};

/**
 * useScreener Hook
 * 管理選股篩選器的狀態與數據交互。
 */
export function useScreener() {
    const [filters, setFilters] = useState<ScreenerFilters>({});
    const [sortBy, setSortBy] = useState<string>('ai_score');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(1);

    // 使用 SWR 進行數據抓取 (自動快取與響應式)
    // 將 filters 轉為字串作為 key 的一部分，確保條件變動時觸發刷新
    const { data, error, isValidating } = useSWR(
        ['/api/v1/screener/screen', filters, sortBy, sortOrder, page],
        ([url, f, s, o, p]) => fetcher(url, f, s, o, p),
        {
            revalidateOnFocus: false,
            dedupingInterval: 2000, // 2秒內重複請求合併
        }
    );

    const updateFilters = useCallback((newFilters: Partial<ScreenerFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPage(1); // 篩選條件變動時重置頁碼
    }, []);

    const handleSort = useCallback((column: string) => {
        if (sortBy === column) {
            setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
        } else {
            setSortBy(column);
            setSortOrder('desc');
        }
        setPage(1);
    }, [sortBy]);

    return {
        results: data?.data || [],
        count: data?.count || 0,
        filters,
        updateFilters,
        sortBy,
        sortOrder,
        handleSort,
        page,
        setPage,
        isLoading: !data && !error,
        isValidating,
        isError: error
    };
}
