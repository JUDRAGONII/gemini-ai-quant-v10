import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface EvolutionRecord {
    generation: number;
    best_genome: number[];
    avg_fitness: number;
    max_fitness: number;
    created_at: string;
}

export function useEvolution() {
    // 獲取歷史紀錄
    const { data: history, error: historyError, isLoading: historyLoading } = useSWR<EvolutionRecord[]>(
        '/api/v1/evolution/history',
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 30000,
        }
    );

    // 獲取當前最強個體
    const { data: best, error: bestError, isLoading: bestLoading } = useSWR<EvolutionRecord>(
        '/api/v1/evolution/best',
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 10000,
        }
    );

    return {
        history,
        best,
        isLoading: historyLoading || bestLoading,
        error: historyError || bestError,
    };
}
