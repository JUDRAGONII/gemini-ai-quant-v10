import useSWR from 'swr';

export interface ApiKeyStatus {
    id: string;
    provider: string;
    key_name: string;
    daily_limit: number;
    requests_today: number;
    last_reset_date: string;
    status: 'active' | 'cooling' | 'disabled';
    cooldown_until: string | null;
    error_count: number;
    last_error_message: string | null;
    updated_at: string;
    remaining_percent: number;
    health: 'healthy' | 'warning' | 'critical' | 'disabled';
}

export interface QuotaSummary {
    total: number;
    healthy: number;
    warning: number;
    critical: number;
    overall_health: 'healthy' | 'warning' | 'critical';
}

export interface QuotaResponse {
    keys: ApiKeyStatus[];
    by_provider: Record<string, ApiKeyStatus[]>;
    summary: QuotaSummary;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * useQuotaStatus Hook
 * 獲取所有 API 金鑰的配額與健康狀態。
 */
export function useQuotaStatus() {
    const { data, error, mutate, isValidating } = useSWR<QuotaResponse>(
        '/api/v1/admin/quota',
        fetcher,
        {
            refreshInterval: 10000, // 每 10 秒自動刷新一次
            revalidateOnFocus: true,
        }
    );

    const resetCooldown = async (keyId: string) => {
        try {
            const response = await fetch('/api/v1/admin/quota/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key_id: keyId }),
            });
            if (response.ok) {
                mutate(); // 成功後重新抓取數據
                return true;
            }
            return false;
        } catch (err) {
            console.error('Failed to reset cooldown:', err);
            return false;
        }
    };

    return {
        data,
        isLoading: !data && !error,
        isError: error,
        isValidating,
        resetCooldown,
        refresh: mutate,
    };
}
