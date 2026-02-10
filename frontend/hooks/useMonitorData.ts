import useSWR from 'swr';
import { supabase } from '@/lib/supabase';

export interface MonitorStats {
    tw_equity: number;
    us_equity: number;
    tw_macro: number;
    us_macro: number;
    realtime: number;
    factors: number;
    genes: number;
    fx: number;
    economic_calendar: number;
}

const fetcher = async () => {
    const { data, error } = await (supabase as any).rpc('get_category_counts');
    if (error) throw error;
    return data as MonitorStats;
};

/**
 * 數據監控中心統計 Hook
 * 具備自動輪詢 (5s) 與 SWR 緩存機制
 */
export function useMonitorData() {
    const { data, error, mutate, isLoading } = useSWR<MonitorStats>(
        'monitor_category_counts',
        fetcher,
        {
            refreshInterval: 5000, // 5秒輪詢
            revalidateOnFocus: true,
            dedupingInterval: 2000,
        }
    );

    return {
        stats: data || ({} as Partial<MonitorStats>),
        isLoading,
        isError: error,
        refresh: mutate
    };
}
