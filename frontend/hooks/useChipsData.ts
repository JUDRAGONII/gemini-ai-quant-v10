import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => {
    if (!r.ok) throw new Error('Failed to fetch chips data');
    return r.json();
});

export interface ChipDailyData {
    date: string;       // YYYY-MM-DD
    price: number;      // 收盤價
    foreign: number;    // 外資買賣超(元)
    trust: number;      // 投信買賣超(元)
    dealer: number;     // 自營商買賣超(元)
    total_institutional: number; // 三大法人合計
    margin_balance: number; // 融資餘額(元/張)
    margin_change: number;  // 融資增減
    short_balance: number;  // 融券餘額(張)
    short_change: number;   // 融券增減
    short_ratio: number;    // 券資比(%)
}

export interface ChipsResponse {
    ticker: string;
    success: boolean;
    data: ChipDailyData[];
}

export function useChipsData(ticker: string, days: number = 30) {
    const { data, error, isLoading } = useSWR<ChipsResponse>(
        `/api/v1/chips/${ticker}?days=${days}`,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000,
        }
    );

    return {
        chipsData: data?.data || [],
        isLoading,
        isError: error
    };
}
