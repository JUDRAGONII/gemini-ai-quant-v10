import React from 'react';
import { render, screen } from '@testing-library/react';
import EvolutionPage from '@/app/evolution/page';

// Mock 子元件與 Hooks
jest.mock('@/components/layout/Sidebar', () => {
    return {
        __esModule: true,
        default: () => <div data-testid="mock-sidebar">Sidebar</div>,
    };
});

jest.mock('@/components/layout/MobileNav', () => {
    return {
        __esModule: true,
        MobileNav: () => <div data-testid="mock-mobile-nav">MobileNav</div>,
    };
});

jest.mock('@/components/AI/EvolutionVisualizer', () => {
    return {
        EvolutionVisualizer: () => <div data-testid="mock-evolution-visualizer">EvolutionVisualizer</div>
    };
});

jest.mock('@/components/ui/Bilingual', () => {
    return {
        Bilingual: ({ zh, en }: any) => <div data-testid="mock-bilingual">{zh} - {en}</div>
    };
});

describe('EvolutionPage', () => {
    it('TC-6001: 確保演化分析主頁面正常渲染且包含子元件', () => {
        render(<EvolutionPage />);

        // 檢查頁面標題 Bilingual 是否存在
        expect(screen.getByText('演化運算分析 - Evolutionary Engine')).toBeInTheDocument();
        expect(screen.getByText('基於 DEAP 框架的遺傳演算法策略優化引擎 - Genetic algorithm strategy optimization engine based on DEAP framework.')).toBeInTheDocument();

        // 檢查狀態徽章 (Bilingual in StatusBadge)
        expect(screen.getByText('AI Worker - ONLINE')).toBeInTheDocument();
        expect(screen.getByText('Database - ONLINE')).toBeInTheDocument();

        // 檢查 Mock Components
        expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('mock-mobile-nav')).toBeInTheDocument();
        expect(screen.getByTestId('mock-evolution-visualizer')).toBeInTheDocument();
    });
});
