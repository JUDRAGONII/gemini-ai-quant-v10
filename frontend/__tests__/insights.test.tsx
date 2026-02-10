import React from 'react';
import { render, screen } from '@testing-library/react';
import InsightsPanel from '@/components/macro/InsightsPanel';

// 1. Mock Lucide Icons (already partially done in jest.setup.js but ensuring local match)
jest.mock('lucide-react', () => ({
    TrendingUp: () => <div data-testid="icon-trending" />,
    Activity: () => <div data-testid="icon-activity" />,
    Info: () => <div data-testid="icon-info" />,
    AlertCircle: () => <div data-testid="icon-alert" />,
}));

// 2. Mock useInsights Hook
jest.mock('@/hooks/useInsights', () => ({
    useInsights: jest.fn(),
}));

import { useInsights } from '@/hooks/useInsights';

describe('InsightsPanel Component (TDD)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the panel title and layout', () => {
        (useInsights as jest.Mock).mockReturnValue({
            insights: null,
            isLoading: false,
            error: null
        });

        render(<InsightsPanel />);

        expect(screen.getByText(/跨資產關聯分析/i)).toBeInTheDocument();
    });

    it('should show loading state (Skeleton)', () => {
        (useInsights as jest.Mock).mockReturnValue({
            insights: null,
            isLoading: true,
            error: null
        });

        render(<InsightsPanel />);

        expect(screen.getByTestId('insights-skeleton')).toBeInTheDocument();
        expect(screen.getByText(/ANALYZING/i)).toBeInTheDocument();
    });

    it('should display correlation data after successful fetch', () => {
        (useInsights as jest.Mock).mockReturnValue({
            insights: {
                pair: ["STOCK:2330", "MACRO:DXY"],
                series: [{ date: '2026-01-01', correlation: -0.85 }],
                summary: { current: -0.85, status: "Strong Negative", mean: -0.7 }
            },
            isLoading: false,
            error: null
        });

        render(<InsightsPanel assetA="STOCK:2330" assetB="MACRO:DXY" />);

        expect(screen.getByText(/Strong Negative/i)).toBeInTheDocument();
        expect(screen.getByText(/-0.85/)).toBeInTheDocument();
        expect(screen.getByTestId('insights-chart')).toBeInTheDocument();
    });

    it('should show error state on failure', () => {
        (useInsights as jest.Mock).mockReturnValue({
            insights: null,
            isLoading: false,
            error: 'API Connection Failed'
        });

        render(<InsightsPanel />);

        expect(screen.getByText(/Analysis Failed/i)).toBeInTheDocument();
        expect(screen.getByText(/API Connection Failed/i)).toBeInTheDocument();
    });
});
