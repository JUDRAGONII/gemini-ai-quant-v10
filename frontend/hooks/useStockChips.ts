import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch chips data');
    return res.json();
});

export interface ChipsDataPoint {
    date: string;
    time: number;
    price: number;
    foreign_inv: number;
    investment_trust: number;
    dealer: number;
    total: number;
}

export interface StockChipsResponse {
    symbol: string;
    data: ChipsDataPoint[];
    error?: string;
}

export function useStockChips(symbol: string, days: number = 90) {
    const { data, error, isLoading } = useSWR<StockChipsResponse>(
        symbol ? `/api/stocks/${symbol}/chips?days=${days}` : null,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000, // 1 minute cache
        }
    );

    return {
        data: data?.data || [],
        isLoading,
        isError: error,
    };
}
