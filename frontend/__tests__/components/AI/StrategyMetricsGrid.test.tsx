import React from 'react';
import { render, screen } from '@testing-library/react';
import { StrategyMetricsGrid } from '@/components/AI/StrategyMetricsGrid';

jest.mock('@/components/ui/Bilingual', () => {
    return {
        Bilingual: ({ zh, en }: any) => (
            <span data-testid="mock-bilingual">
                {zh} | {en}
            </span>
        )
    };
});

describe('StrategyMetricsGrid', () => {
    const mockMetrics = {
        total_return: 0.254,
        cagr: 0.125,
        max_drawdown: 0.156,
        sharpe: 1.85,
        sortino: 2.15,
        win_rate: 0.623
    };

    it('TC-7004: 確保所有六個指標正確渲染與數值進位 (Metrics rendering and rounding)', () => {
        render(<StrategyMetricsGrid metrics={mockMetrics} />);

        // 1. Total Return
        expect(screen.getByText('總報酬率 | Total Return')).toBeInTheDocument();
        expect(screen.getByText('25.40%')).toBeInTheDocument();

        // 2. CAGR
        expect(screen.getByText('年化回報 (CAGR) | CAGR')).toBeInTheDocument();
        expect(screen.getByText('12.50%')).toBeInTheDocument();

        // 3. Max Drawdown
        expect(screen.getByText('最大回撤 (MDD) | Max Drawdown')).toBeInTheDocument();
        expect(screen.getByText('15.60%')).toBeInTheDocument();

        // 4. Sharpe
        expect(screen.getByText('夏普比率 (Sharpe) | Sharpe Ratio')).toBeInTheDocument();
        expect(screen.getByText('1.85')).toBeInTheDocument();

        // 5. Sortino
        expect(screen.getByText('索提諾比率 | Sortino Ratio')).toBeInTheDocument();
        expect(screen.getByText('2.15')).toBeInTheDocument();

        // 6. Win Rate
        expect(screen.getByText('策略勝率 | Win Rate')).toBeInTheDocument();
        expect(screen.getByText('62.30%')).toBeInTheDocument();
    });
});
