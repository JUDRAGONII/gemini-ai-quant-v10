import React from 'react';
import { render, screen } from '@testing-library/react';
import { EvolutionVisualizer } from '@/components/AI/EvolutionVisualizer';
import { useEvolution } from '@/hooks/useEvolution';

// Mock hooks
jest.mock('@/hooks/useEvolution');

// Mock Recharts to prevent render errors in generic test
jest.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    RadarChart: () => <div data-testid="mock-radar-chart" />,
    AreaChart: () => <div data-testid="mock-area-chart" />,
    Area: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Legend: () => null,
    PolarGrid: () => null,
    PolarAngleAxis: () => null,
    PolarRadiusAxis: () => null,
    Radar: () => null,
}));

describe('EvolutionVisualizer', () => {
    const mockUseEvolution = useEvolution as jest.MockedFunction<typeof useEvolution>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('TC-6002: 顯示載入中的狀態 (Loading State)', () => {
        mockUseEvolution.mockReturnValue({
            history: undefined,
            best: undefined,
            isLoading: true,
            error: undefined
        });

        render(<EvolutionVisualizer />);
        expect(screen.getByText('載入演化數據中...')).toBeInTheDocument();
        expect(screen.getByText('LOADING EVOLUTION DATA...')).toBeInTheDocument();
    });

    it('TC-6003: 顯示錯誤狀態 (Error State)', () => {
        mockUseEvolution.mockReturnValue({
            history: undefined,
            best: undefined,
            isLoading: false,
            error: new Error('API Error')
        });

        render(<EvolutionVisualizer />);
        expect(screen.getByText('數據獲取失敗')).toBeInTheDocument();
        expect(screen.getByText('FAILED TO FETCH DATA')).toBeInTheDocument();
    });

    it('TC-6004: 歷史數據為空時顯示 Empty State', () => {
        mockUseEvolution.mockReturnValue({
            history: [],
            best: undefined,
            isLoading: false,
            error: undefined
        });

        render(<EvolutionVisualizer />);
        expect(screen.getByText('尚無演化歷史數據')).toBeInTheDocument();
        expect(screen.getByText('NO EVOLUTION HISTORY FOUND')).toBeInTheDocument();
    });

    it('TC-6005: 成功載入數據並顯示 Heatmap 與 GenomeMap', () => {
        const mockBest = {
            generation: 152,
            best_genome: [0.1, 0.2, 0.3],
            avg_fitness: 0.5,
            max_fitness: 0.88,
            created_at: '2025-01-01'
        };

        const mockHistory = [mockBest];

        mockUseEvolution.mockReturnValue({
            history: mockHistory,
            best: mockBest,
            isLoading: false,
            error: undefined
        });

        render(<EvolutionVisualizer />);

        // 檢查標題 Bilingual
        expect(screen.getByText('最強個體基因圖譜')).toBeInTheDocument();
        expect(screen.getByText('BEST INDIVIDUAL GENOME MAP')).toBeInTheDocument();
        expect(screen.getByText('演化適應度遷移規律')).toBeInTheDocument();
        expect(screen.getByText('FITNESS EVOLUTION TRENDS')).toBeInTheDocument();

        // 檢查 Footer Insight 動態 Bilingual 文字
        expect(screen.getByText(/當前最佳個體在第 152 代產出，適應度為 0.8800/)).toBeInTheDocument();
        expect(screen.getByText(/The current best individual was produced in generation 152/)).toBeInTheDocument();

        // 檢查 Mock Charts 是否包含在內
        expect(screen.getByTestId('mock-radar-chart')).toBeInTheDocument();
        expect(screen.getByTestId('mock-area-chart')).toBeInTheDocument();
    });
});
