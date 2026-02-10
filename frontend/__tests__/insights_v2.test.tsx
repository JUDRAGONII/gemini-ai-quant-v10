import React from 'react';
import { render, screen } from '@testing-library/react';
import InsightsPanel from '@/components/macro/InsightsPanel';
import { useInsights } from '@/hooks/useInsights';

// Mock Dependencies
jest.mock('@/hooks/useInsights', () => ({
    useInsights: jest.fn(),
}));

// Mock Recharts ResponsiveContainer to avoid size 0 issue in JSDOM
jest.mock('recharts', () => {
    const OriginalModule = jest.requireActual('recharts');
    return {
        ...OriginalModule,
        ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
            <div style={{ width: '800px', height: '400px' }}>{children}</div>
        ),
    };
});

describe('Phase 12: AI Insights Integration', () => {

    describe('InsightsPanel 功能測試', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('TC-1203: 數據加載成功後應渲染圖表與相關性描述', async () => {
            (useInsights as jest.Mock).mockReturnValue({
                insights: {
                    pair: ['STOCK:2330', 'MACRO:DXY'],
                    summary: {
                        current: -0.85,
                        mean: -0.72,
                        status: 'Strong Negative'
                    },
                    series: [
                        { date: '2023-01-01', correlation: -0.80 },
                        { date: '2023-01-02', correlation: -0.85 }
                    ]
                },
                isLoading: false,
                error: null
            });

            render(<InsightsPanel />);

            expect(screen.getByText('跨資產關聯分析')).toBeInTheDocument();
            expect(screen.getByText('-0.85')).toBeInTheDocument();
            expect(screen.getByText('Strong Negative')).toBeInTheDocument();
            expect(screen.getByTestId('insights-chart')).toBeInTheDocument();
        });

        it('TC-2201: 數據加載錯誤時應顯示錯誤狀態', async () => {
            (useInsights as jest.Mock).mockReturnValue({
                insights: null,
                isLoading: false,
                error: 'API Connection Refused'
            });

            render(<InsightsPanel />);

            expect(screen.getByText('Analysis Failed')).toBeInTheDocument();
            expect(screen.getByText('API Connection Refused')).toBeInTheDocument();
        });

        it('TC-1203b: 加載中應顯示 Skeleton', () => {
            (useInsights as jest.Mock).mockReturnValue({
                insights: null,
                isLoading: true,
                error: null
            });

            render(<InsightsPanel />);
            expect(screen.getByTestId('insights-skeleton')).toBeInTheDocument();
        });
    });
});
