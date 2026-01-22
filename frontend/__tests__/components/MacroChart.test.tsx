import React from 'react';
import { render, screen } from '@testing-library/react';
import MacroChart from '../../components/MacroChart';

// Mock Recharts ResponseContainer to ensure it renders children immediately
jest.mock('recharts', () => {
    const OriginalModule = jest.requireActual('recharts');
    return {
        ...OriginalModule,
        ResponsiveContainer: ({ children }: any) => <div className="recharts-responsive-container" style={{ width: 800, height: 600 }}>{children}</div>
    };
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

describe('MacroChart Component', () => {
    const mockData = [
        { reference_date: '2023-01-01', value: 100 },
        { reference_date: '2023-02-01', value: 105 },
        { reference_date: '2023-03-01', value: 110 }
    ];

    it('渲染標題與當前數值', () => {
        render(<MacroChart title="Test GDP" data={mockData} dataKey="value" color="#000000" />);

        expect(screen.getByText('Test GDP')).toBeInTheDocument();
        // Last value is 110
        expect(screen.getByText('110')).toBeInTheDocument();
        // Date check
        expect(screen.getByText('2023-03-01')).toBeInTheDocument();
    });

    it('渲染圖表區域', () => {
        const { container } = render(<MacroChart title="Test Chart" data={mockData} dataKey="value" color="#000000" />);
        // Check if Recharts wrapper exists
        expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
        // Check if area paths exist
        // Note: Recharts renders SVG paths, we can check by class or generic SVG existence
        // Alternatively, check distinct elements rendered by our component wrapper
        expect(screen.getByText('Last 3 Points')).toBeInTheDocument();
    });

    it('空數據處理', () => {
        render(<MacroChart title="Empty Chart" data={[]} dataKey="value" color="#red" />);

        expect(screen.getByText('Empty Chart')).toBeInTheDocument();
        // Should NOT display "Current" value section if data is empty
        const currentValue = screen.queryByText('Current');
        expect(currentValue).not.toBeInTheDocument();
    });

    it('顏色屬性應用', () => {
        render(<MacroChart title="Color Test" data={mockData} dataKey="value" color="#123456" />);
        const valueElement = screen.getByText('110');
        expect(valueElement).toHaveStyle({ color: '#123456' });
    });
});
