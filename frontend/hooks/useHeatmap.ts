import useSWR from 'swr';

export interface HeatmapNode {
    name: string;
    stock_code?: string;
    value?: number;
    change_percent?: number;
    price?: number;
    children?: HeatmapNode[];
}

export interface HeatmapResponse {
    name: string;
    children: HeatmapNode[];
    total_stocks: number;
}

const fetcher = async (url: string, marketType: string, groupBy: string) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ market_type: marketType, group_by: groupBy })
    });
    if (!response.ok) throw new Error('Failed to fetch heatmap data');
    return response.json();
};

/**
 * useHeatmap Hook
 * 獲取市場熱力圖階層資料。
 */
export function useHeatmap(marketType: string = 'ALL', groupBy: string = 'sector') {
    const { data, error, isValidating } = useSWR<HeatmapResponse>(
        ['/api/v1/market/heatmap', marketType, groupBy],
        ([url, m, g]: [string, string, string]) => fetcher(url, m, g),
        {
            revalidateOnFocus: false,
            refreshInterval: 300000, // 5 分鐘刷新一次
        }
    );

    return {
        data: data || null,
        isLoading: !data && !error,
        isValidating,
        isError: error
    };
}
