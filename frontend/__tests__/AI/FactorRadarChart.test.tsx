import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FactorRadarChart from '../../components/AI/FactorRadarChart';

// Mock Framer Motion — 擴充 motion.li / motion.span
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        li: ({ children, ...props }: any) => <li {...props}>{children}</li>,
        span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
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
        expect(screen.getByText('VQGM Multi-Factor Radar')).toBeInTheDocument();
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

        // 取得所有維度切換按鈕（第 1 個是「四維度總覽」，後面是各維度）
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThanOrEqual(2);

        // 初始狀態：第一個按鈕（四維度總覽）應為活動狀態
        expect(buttons[0]).toHaveClass('text-cyan-400');

        // 點擊第二個按鈕（第一個維度）
        fireEvent.click(buttons[1]);

        // 預期元件仍存在且無報錯
        expect(screen.getByText('VQGM 全維度評分')).toBeInTheDocument();
    });
});
