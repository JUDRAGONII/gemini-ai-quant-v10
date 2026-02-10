import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useInsights(assetA: string, assetB: string, window: number = 20) {
    const { data, error, isLoading } = useSWR(
        assetA && assetB
            ? `/api/v1/insights/correlation?asset_a=${assetA}&asset_b=${assetB}&window=${window}`
            : null,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000, // 1分鐘內不重複對接
        }
    );

    return {
        insights: data?.data,
        isLoading,
        error: error || (data?.status === 'error' ? data.message : null),
    };
}
