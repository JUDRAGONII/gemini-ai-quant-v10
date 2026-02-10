import useSWR from 'swr';
import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { MarketAlert, UnreadCountResponse } from '@/types/alert';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useAlerts() {
    // 1. 獲取警示列表
    const { data: alerts, error, mutate: alertMutate } = useSWR<MarketAlert[]>('/api/v1/alerts/', fetcher, {
        revalidateOnFocus: false,
    });

    // 2. 獲取未讀數量
    const { data: countData, mutate: countMutate } = useSWR<UnreadCountResponse>('/api/v1/alerts/count', fetcher, {
        revalidateOnFocus: false,
    });

    // 3. 即時訂閱 Supabase Realtime
    useEffect(() => {
        const channel = supabase
            .channel('market_alerts_realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'market_alerts',
                },
                (payload) => {
                    const newAlert = payload.new as MarketAlert;

                    // 更新警示列表 (將新警示插入頂部)
                    alertMutate((current) => {
                        if (!current) return [newAlert];
                        return [newAlert, ...current];
                    }, false);

                    // 更新未讀數量
                    countMutate((current) => ({
                        unread_count: (current?.unread_count || 0) + 1,
                    }), false);

                    // 觸發全局的 Toast
                    window.dispatchEvent(new CustomEvent('new-market-alert', { detail: newAlert }));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [alertMutate, countMutate]);

    // 4. 標記已讀操作
    const markAsRead = useCallback(async (alertId: string) => {
        try {
            await fetch(`/api/v1/alerts/${alertId}/read`, { method: 'POST' });

            // 樂觀更新列表
            alertMutate((current) => {
                return current?.map(a => a.id === alertId ? { ...a, is_read: true } : a);
            }, false);

            // 樂觀更新數量
            countMutate((current) => ({
                unread_count: Math.max(0, (current?.unread_count || 0) - 1),
            }), false);
        } catch (e) {
            console.error('Failed to mark alert as read', e);
        }
    }, [alertMutate, countMutate]);

    const markAllAsRead = useCallback(async () => {
        try {
            await fetch('/api/v1/alerts/read-all', { method: 'POST' });
            alertMutate();
            countMutate({ unread_count: 0 });
        } catch (e) {
            console.error('Failed to mark all alerts as read', e);
        }
    }, [alertMutate, countMutate]);

    return {
        alerts,
        unreadCount: countData?.unread_count || 0,
        isLoading: !alerts && !error,
        isError: error,
        markAsRead,
        markAllAsRead,
        refresh: alertMutate
    };
}
