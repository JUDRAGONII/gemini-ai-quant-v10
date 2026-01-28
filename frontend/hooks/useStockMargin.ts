import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch margin data');
    return res.json();
});

export interface MarginDataPoint {
    date: string;
    margin_balance: number;
    margin_buy: number;
    margin_sell: number;
    margin_net: number;
    short_balance: number;
    short_buy: number;
    short_sell: number;
    short_net: number;
    margin_utilization: number;
    short_utilization: number;
    price: number;
}

export interface MarginResponse {
    symbol: string;
    data: MarginDataPoint[];
    statistics?: {
        avg_margin_balance: number;
        avg_margin_utilization: number;
        margin_change_5d: number;
        short_change_5d: number;
    };
}

export function useStockMargin(symbol: string, days: number = 30) {
    const { data, error, isLoading } = useSWR<MarginResponse>(
        symbol ? `/api/stocks/${symbol}/margin?days=${days}` : null,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000,
        }
    );

    return {
        data: data?.data || [],
        statistics: data?.statistics,
        isLoading,
        isError: error,
    };
}
