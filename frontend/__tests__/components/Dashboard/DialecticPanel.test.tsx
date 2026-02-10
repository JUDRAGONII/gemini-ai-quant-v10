import React from 'react';
import { render, screen } from '@testing-library/react';
import DialecticPanel from '@/components/Dashboard/DialecticPanel';
import useSWR from 'swr';

// Mock 所有外部依賴
jest.mock('swr', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

jest.mock('lucide-react', () => ({
    MessageSquare: () => <span data-testid="icon-message" />,
    ShieldCheck: () => <span data-testid="icon-shield" />,
    TrendingUp: () => <span data-testid="icon-up" />,
    TrendingDown: () => <span data-testid="icon-down" />,
    AlertTriangle: () => <span data-testid="icon-warn" />,
}));

const mockUseSWR = useSWR as jest.Mock;

// 標準 mock 數據
const mockDialecticData = {
    ticker: '2330',
    consensus: '中性偏多',
    conviction: 0.75,
    agents: [
        { name: '技術分析師', opinion: '看多', reason: 'MACD 金叉，動能轉強' },
        { name: '基本面分析師', opinion: '中性', reason: '營收持平，等待法說會' },
        { name: '風控專家', opinion: '偏空', reason: '系統性風險升高，建議減碼' },
    ],
    updated_at: '2026-02-10T12:00:00Z',
};

describe('DialecticPanel — AI 辯證引擎', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('基礎路徑測試', () => {

        it('TC-1101: 數據加載成功後應渲染共識文字與信心度百分比', () => {
            mockUseSWR.mockReturnValue({ data: mockDialecticData, error: null, isLoading: false });
            render(<DialecticPanel ticker="2330" />);

            // 驗證共識文字
            expect(screen.getByText('中性偏多')).toBeInTheDocument();
            // 驗證信心度百分比 (0.75 * 100 = 75)
            expect(screen.getByText('75%')).toBeInTheDocument();
        });

        it('TC-1102: 三個代理人意見應全部渲染為獨立卡片', () => {
            mockUseSWR.mockReturnValue({ data: mockDialecticData, error: null, isLoading: false });
            render(<DialecticPanel ticker="2330" />);

            // 驗證 3 個 agent 的名稱都存在
            expect(screen.getByText('技術分析師')).toBeInTheDocument();
            expect(screen.getByText('基本面分析師')).toBeInTheDocument();
            expect(screen.getByText('風控專家')).toBeInTheDocument();

            // 驗證意見標籤
            expect(screen.getByText('看多')).toBeInTheDocument();
            expect(screen.getByText('中性')).toBeInTheDocument();
            expect(screen.getByText('偏空')).toBeInTheDocument();

            // 驗證推理原因
            expect(screen.getByText('MACD 金叉，動能轉強')).toBeInTheDocument();
        });

        it('TC-1103: 加載中狀態應顯示 "AI 正在辯證中..." 動畫文字', () => {
            mockUseSWR.mockReturnValue({ data: null, error: null, isLoading: true });
            render(<DialecticPanel ticker="2330" />);

            expect(screen.getByText('AI 正在辯證中...')).toBeInTheDocument();
        });
    });

    describe('邊界條件測試', () => {

        it('TC-2201: API 錯誤時應顯示紅色錯誤提示', () => {
            mockUseSWR.mockReturnValue({ data: null, error: new Error('API Error'), isLoading: false });
            render(<DialecticPanel ticker="2330" />);

            expect(screen.getByText('載入 AI 辯證數據失敗')).toBeInTheDocument();
        });

        it('TC-2202: agents 為空陣列時不應崩潰', () => {
            const emptyAgentsData = { ...mockDialecticData, agents: [] };
            mockUseSWR.mockReturnValue({ data: emptyAgentsData, error: null, isLoading: false });

            // 不應拋錯
            expect(() => render(<DialecticPanel ticker="2330" />)).not.toThrow();

            // 共識仍應正常顯示
            expect(screen.getByText('中性偏多')).toBeInTheDocument();
        });
    });
});
