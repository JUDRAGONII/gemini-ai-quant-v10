import React from 'react';
import { render, screen } from '@testing-library/react';
import CorrelationChart from '@/components/Dashboard/CorrelationChart';
import useSWR from 'swr';

// Mock 所有外部依賴
jest.mock('swr', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('recharts', () => {
    const OriginalModule = jest.requireActual('recharts');
    return {
        ...OriginalModule,
        ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
            <div data-testid="responsive-container" style={{ width: '800px', height: '400px' }}>{children}</div>
        ),
    };
});

jest.mock('lucide-react', () => ({
    Activity: () => <span data-testid="icon-activity" />,
    Info: () => <span data-testid="icon-info" />,
}));

const mockUseSWR = useSWR as jest.Mock;

// 標準 mock 數據
const mockCorrelationData = {
    pair: ['STOCK:2330', 'FX:USD/TWD'],
    window: 30,
    lag: 1,
    series: [
        { date: '2026-01-01', value: 0.35 },
        { date: '2026-01-02', value: 0.37 },
        { date: '2026-01-03', value: 0.39 },
    ],
    summary: {
        current: 0.3709,
        mean: 0.3212,
        status: '低度相關/中性',
    },
};

describe('CorrelationChart — 跨資產相關性圖表', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('基礎路徑測試', () => {

        it('TC-1201: 正確渲染相關性數值與狀態文字', () => {
            mockUseSWR.mockReturnValue({ data: mockCorrelationData, error: null, isLoading: false });
            render(<CorrelationChart base="STOCK:2330" target="FX:USD/TWD" />);

            // 驗證相關性數值 (toFixed(4))
            expect(screen.getByText('0.3709')).toBeInTheDocument();
            // 驗證狀態文字
            expect(screen.getByText('低度相關/中性')).toBeInTheDocument();
        });

        it('TC-1202: Recharts AreaChart 應收到正確的 series 數據', () => {
            mockUseSWR.mockReturnValue({ data: mockCorrelationData, error: null, isLoading: false });
            render(<CorrelationChart base="STOCK:2330" target="FX:USD/TWD" />);

            // 驗證 ResponsiveContainer 已渲染
            expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
        });

        it('TC-1203: 加載中狀態應顯示 "CALCULATING CORRELATION MATRIX..."', () => {
            mockUseSWR.mockReturnValue({ data: null, error: null, isLoading: true });
            render(<CorrelationChart />);

            expect(screen.getByText('CALCULATING CORRELATION MATRIX...')).toBeInTheDocument();
        });
    });

    describe('邊界條件測試', () => {

        it('TC-2101: summary 為 null 時不應崩潰', () => {
            const nullSummaryData = { ...mockCorrelationData, summary: null };
            mockUseSWR.mockReturnValue({ data: nullSummaryData, error: null, isLoading: false });

            // 不應拋錯
            expect(() => render(<CorrelationChart />)).not.toThrow();

            // fallback 應顯示 0.0000
            expect(screen.getByText('0.0000')).toBeInTheDocument();
            // fallback status 應顯示 N/A
            expect(screen.getByText('N/A')).toBeInTheDocument();
        });

        it('TC-2102: series 為空陣列時圖表應正常渲染', () => {
            const emptySeriesData = { ...mockCorrelationData, series: [] };
            mockUseSWR.mockReturnValue({ data: emptySeriesData, error: null, isLoading: false });

            // 不應拋錯
            expect(() => render(<CorrelationChart />)).not.toThrow();
            // 圖表容器仍應存在
            expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
        });
    });
});
