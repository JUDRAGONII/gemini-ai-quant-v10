import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StrategyHubPage from '@/app/ai/strategy/page';
import { useBacktest } from '@/hooks/useBacktest';
import { useAIPrediction } from '@/hooks/useAIPrediction';

// Mock Hooks
jest.mock('@/hooks/useBacktest');
jest.mock('@/hooks/useAIPrediction');

// Mock Components to isolate testing scope
jest.mock('@/components/layout/Sidebar', () => ({
    __esModule: true,
    default: () => <div data-testid="mock-sidebar">Sidebar</div>,
}));

jest.mock('@/components/layout/MobileNav', () => ({
    __esModule: true,
    MobileNav: () => <div data-testid="mock-mobile-nav">MobileNav</div>,
}));

jest.mock('@/components/ui/Bilingual', () => ({
    __esModule: true,
    Bilingual: ({ zh, en }: any) => <span data-testid="mock-bilingual">{zh} - {en}</span>,
}));

jest.mock('@/components/Chart/PortfolioPerformanceChart', () => ({
    __esModule: true,
    default: () => <div data-testid="mock-portfolio-chart">PortfolioPerformanceChart</div>,
}));

describe('StrategyHubPage', () => {
    const mockUseBacktest = useBacktest as jest.MockedFunction<typeof useBacktest>;
    const mockUseAIPrediction = useAIPrediction as jest.MockedFunction<typeof useAIPrediction>;

    const runBacktestMock = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        mockUseBacktest.mockReturnValue({
            data: null,
            loading: false,
            error: null,
            runBacktest: runBacktestMock
        });

        mockUseAIPrediction.mockReturnValue({
            data: null,
            loading: false,
            error: null
        });
    });

    it('TC-7005: 正確渲染策略主頁面骨架與 Bilingual 文字', () => {
        render(<StrategyHubPage />);

        // Assert UI layout blocks
        expect(screen.getByText('智慧策略看板 - Strategy Hub')).toBeInTheDocument();
        expect(screen.getByText('當前分析標的 - ACTIVE ASSET')).toBeInTheDocument();

        // Assert default target symbol '2330'
        expect(screen.getByText('2330')).toBeInTheDocument();

        // Assert action buttons and forms
        expect(screen.getByPlaceholderText('輸入股票代號 (如: 2330)')).toBeInTheDocument();
        expect(screen.getByText('執行回測分析 - RUN BACKTEST')).toBeInTheDocument();
    });

    it('TC-7006: 搜尋股票代號並觸發 Backtest Hook', () => {
        render(<StrategyHubPage />);

        const input = screen.getByPlaceholderText('輸入股票代號 (如: 2330)');
        const form = input.closest('form');

        // Simulate changing input and submitting
        fireEvent.change(input, { target: { value: '2317' } });
        expect(input).toHaveValue('2317');

        fireEvent.submit(form!);

        // Target symbol should update
        expect(screen.getByText('2317')).toBeInTheDocument();

        // runBacktest should be called as an effect of symbol changing
        expect(runBacktestMock).toHaveBeenCalledWith('2317', 0.005);
    });

    it('TC-7007: 當 Backtest 回傳資料時，顯示績效圖與詳細指標', () => {
        const mockMetricsData = {
            total_return: 0.15,
            cagr: 0.1,
            max_drawdown: 0.05,
            sharpe: 1.5,
            sortino: 1.8,
            win_rate: 0.6
        };

        mockUseBacktest.mockReturnValue({
            data: {
                stock_code: '2330',
                metrics: mockMetricsData,
                charts: { equity: [] }
            },
            loading: false,
            error: null,
            runBacktest: runBacktestMock
        });

        render(<StrategyHubPage />);

        // Check Chart and KPI Title
        expect(screen.getByTestId('mock-portfolio-chart')).toBeInTheDocument();
        expect(screen.getByText('策略關鍵指標 - KPI METRICS')).toBeInTheDocument();
        expect(screen.getByText('策略績效回測 - Backtest Results')).toBeInTheDocument();

        // Metrics component is fully rendered (no need to deep test, just check presence of standard text)
        expect(screen.getByText('15.00%')).toBeInTheDocument(); // Return
    });

    it('TC-7008: 模擬 Loading 與 Error 狀態顯示', () => {
        mockUseBacktest.mockReturnValue({
            data: null,
            loading: true,
            error: 'Backend connection failed',
            runBacktest: runBacktestMock
        });

        const { rerender } = render(<StrategyHubPage />);

        // During loading, chart error shouldn't show but spinner should be somewhere (simulated by disabled button etc)
        const button = screen.getByRole('button', { name: /執行回測分析 - RUN BACKTEST/i });
        expect(button).toBeDisabled();

        // Now mock error state
        mockUseBacktest.mockReturnValue({
            data: null,
            loading: false,
            error: 'Backend connection failed',
            runBacktest: runBacktestMock
        });

        rerender(<StrategyHubPage />);

        // Error message should be rendered instead of charts
        expect(screen.getByText('Backend connection failed')).toBeInTheDocument();
    });
});
