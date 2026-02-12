import { MonitorDashboardResponse } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1';

export class MonitorRepository {
    /**
     * 獲取 AI 監控中心聚合數據
     */
    static async getDashboardSummary(): Promise<MonitorDashboardResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/monitor/dashboard`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                next: { revalidate: 0 } // No cache for realtime monitoring
            });

            if (!response.ok) {
                throw new Error(`Monitor API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to fetch monitor dashboard:', error);
            throw error;
        }
    }
}
