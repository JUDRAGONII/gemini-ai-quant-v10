import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InsightsPage from '@/app/ai/insights/page';

// Mock 子組件以隔離測試
jest.mock('@/components/Dashboard/DialecticPanel', () => {
    return function MockDialecticPanel({ ticker }: { ticker: string }) {
        return <div data-testid="dialectic-panel">DialecticPanel: {ticker}</div>;
    };
});

jest.mock('@/components/Dashboard/TacticalPlanner', () => {
    return function MockTacticalPlanner() {
        return <div data-testid="tactical-planner">TacticalPlanner</div>;
    };
});

jest.mock('@/components/Dashboard/CorrelationChart', () => {
    return function MockCorrelationChart({ base, target, lag }: any) {
        return <div data-testid="correlation-chart">{base} ↔ {target} (Lag: {lag})</div>;
    };
});

// Mock DecisionAssistant 以避免其內部依賴導致 render 崩潰
jest.mock('@/components/AI/DecisionAssistant', () => {
    return function MockDecisionAssistant({ ticker }: { ticker: string }) {
        return <div data-testid="decision-assistant">DecisionAssistant: {ticker}</div>;
    };
});

jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        li: ({ children, ...props }: any) => <li {...props}>{children}</li>,
        span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    },
}));

jest.mock('lucide-react', () => {
    const React = require('react');
    const iconCache: Record<string, any> = {};
    return new Proxy({}, {
        get: (target, prop) => {
            if (typeof prop === 'string' && /^[A-Z]/.test(prop)) {
                if (!iconCache[prop]) {
                    const IconComponent = (props: any) => React.createElement('svg', { ...props, 'data-testid': `icon-${prop.toLowerCase()}` });
                    IconComponent.displayName = prop;
                    iconCache[prop] = IconComponent;
                }
                return iconCache[prop];
            }
            return undefined;
        }
    });
});

describe('InsightsPage — /ai/insights 整頁', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('基礎路徑測試', () => {

        it('TC-1501: 頁面應渲染三個核心區塊', () => {
            render(<InsightsPage />);

            // 驗證 DecisionAssistant 存在（已取代舊 DialecticPanel）
            expect(screen.getByTestId('decision-assistant')).toBeInTheDocument();
            // 驗證 TacticalPlanner 存在
            expect(screen.getByTestId('tactical-planner')).toBeInTheDocument();
            // 驗證 2 個 CorrelationChart 存在
            const correlationCharts = screen.getAllByTestId('correlation-chart');
            expect(correlationCharts).toHaveLength(2);

            // 驗證頁面標題（Bilingual 渲染）
            expect(screen.getByText('AI 智力決策中心')).toBeInTheDocument();
        });

        it('TC-1502: 搜尋框提交後應更新 ticker state', () => {
            render(<InsightsPage />);

            // 取得搜尋輸入框
            const searchInput = screen.getByPlaceholderText(/搜尋標的/);
            expect(searchInput).toBeInTheDocument();

            // 修改輸入值
            fireEvent.change(searchInput, { target: { value: 'NVDA' } });
            // 提交表單
            fireEvent.submit(searchInput.closest('form')!);

            // DecisionAssistant 應接收到更新後的 ticker (大寫 NVDA)
            expect(screen.getByText('DecisionAssistant: NVDA')).toBeInTheDocument();

            // CorrelationChart 也應包含新 ticker
            expect(screen.getByText('STOCK:NVDA ↔ FX:USD/TWD (Lag: 1)')).toBeInTheDocument();
            expect(screen.getByText('STOCK:NVDA ↔ MACRO:CPI (Lag: 0)')).toBeInTheDocument();
        });
    });
});
