import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AgentDebatePanel from '../../components/AI/AgentDebatePanel';

// Mock Framer Motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('AgentDebatePanel', () => {
    const mockData = {
        ticker: "2330",
        consensus: "謹慎看多",
        conviction: 0.75,
        rationale: "基本面強勁但短線過熱",
        key_factor: "AI 需求",
        agents: [
            { name: "Bull Agent", role: "bull" as const, opinion: "看多", confidence: 80, arguments: ["營收創新高"] },
            { name: "Bear Agent", role: "bear" as const, opinion: "中性", confidence: 60, arguments: ["估值偏高"] },
        ],
        updated_at: new Date().toISOString(),
        cached: false
    };

    it('TC-4101: 正常顯示辯論結果', () => {
        render(<AgentDebatePanel data={mockData} isLoading={false} />);

        expect(screen.getByText('AI 辯證共識')).toBeInTheDocument();
        expect(screen.getByText('謹慎看多')).toBeInTheDocument();
        expect(screen.getByText('75%')).toBeInTheDocument(); // 0.75 * 100
        expect(screen.getByText('基本面強勁但短線過熱')).toBeInTheDocument();
        expect(screen.getByText('AI 需求')).toBeInTheDocument();
    });

    it('TC-4102: Loading 狀態顯示骨架屏', () => {
        const { container } = render(<AgentDebatePanel data={null} isLoading={true} />);
        // 檢查是否有 animate-pulse class
        // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
        expect(container.firstChild).toHaveClass('animate-pulse');
    });

    it('TC-4103: 無數據時不渲染', () => {
        const { container } = render(<AgentDebatePanel data={null} isLoading={false} />);
        expect(container).toBeEmptyDOMElement();
    });
});
