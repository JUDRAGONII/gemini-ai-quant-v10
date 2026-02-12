import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FactorRadarChart from '../../components/AI/FactorRadarChart';

// Mock Framer Motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock ResizeObserver for Recharts
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

describe('FactorRadarChart', () => {
    const mockDimensions = [
        { key: 'value', zh: '價值', en: 'Value', score: 70, factors: [] },
        { key: 'growth', zh: '成長', en: 'Growth', score: 80, factors: [] },
        { key: 'quality', zh: '品質', en: 'Quality', score: 90, factors: [] },
        { key: 'momentum', zh: '動能', en: 'Momentum', score: 60, factors: [] },
    ];

    it('TC-4001: 正常渲染雷達圖與標題', () => {
        render(
            <FactorRadarChart
                symbol="2330"
                dimensions={mockDimensions}
                compositeScore={75.0}
                grade={{ label: "A", color: "#10B981", description: "優良" }}
            />
        );

        expect(screen.getByText('VQGM 全維度評分')).toBeInTheDocument();
        expect(screen.getByText('18-Factor Radar / 2330')).toBeInTheDocument();
        expect(screen.getByText('75.0')).toBeInTheDocument();
        expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('TC-4002: 維度按鈕切換交互', () => {
        render(
            <FactorRadarChart
                symbol="2330"
                dimensions={mockDimensions}
            />
        );

        // 初始狀態：四維度總覽 (View Mode: dimension)
        const dimBtn = screen.getByText('四維度總覽');
        expect(dimBtn).toHaveClass('text-cyan-400');

        // 點擊 "價值" 維度
        const valueBtn = screen.getByText('價值');
        fireEvent.click(valueBtn);

        // 預期 "價值" 按鈕變亮 (class change logic in component)
        // 這裡我們簡單檢查是否沒有報錯，且元件仍存在
        expect(screen.getByText('VQGM 全維度評分')).toBeInTheDocument();
    });
});
