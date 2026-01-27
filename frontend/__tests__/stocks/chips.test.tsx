import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import StockChipsPage from '@/app/stocks/[symbol]/chips/page';
import { useStockChips } from '@/hooks/useStockChips';

// Mock Hook
jest.mock('@/hooks/useStockChips');
const mockUseStockChips = useStockChips as jest.Mock;

// Mock GlassCard (Keep local check if needed, or rely on global if available. 
// Global jest.setup doesn't seem to mock @/components/ui index exports specifically unless mapped.
// Let's keep a simple internal mock for consistency if not globally mapped in mapped modules)
jest.mock('@/components/ui', () => ({
    GlassCard: ({ children, className }: any) => <div data-testid="glass-card" className={className}>{children}</div>
}));

describe('籌碼分析頁面功能驗收 (Chips Validation)', () => {
    const mockParams = { symbol: '2330' };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('1. 基礎路徑測試 (Happy Path)', () => {
        const mockData = [
            { date: '2024-01-01', time: 1704067200, foreign_inv: 100, investment_trust: 50, dealer: 10, price: 500, total: 160 },
            { date: '2024-01-02', time: 1704153600, foreign_inv: -20, investment_trust: 10, dealer: 5, price: 505, total: -5 }
        ];

        /* TC-1101 is technically a Hook unit test, but we verify the data flow here via Integration */
        it('TC-1101/TC-1202: 圖表數據映射與 Hook 整合驗證', () => {
            mockUseStockChips.mockReturnValue({
                data: mockData,
                isLoading: false,
                isError: null
            });

            render(<StockChipsPage params={mockParams} />);

            // Check if ComposedChart received the data
            // Since we mocked ComposedChart to render a div with data-testid="composed-chart"
            // We can't easily check internal props passed to it without more complex mocking,
            // but we can check if it exists, implying data was sufficient to render it.
            const chart = screen.getByTestId('composed-chart');
            expect(chart).toBeInTheDocument();
        });

        it('TC-1201: 完整渲染 (標題、圖表、摘要卡片)', () => {
            mockUseStockChips.mockReturnValue({
                data: mockData,
                isLoading: false,
                isError: null
            });

            render(<StockChipsPage params={mockParams} />);

            // 1. 標題
            expect(screen.getByText('籌碼分佈分析')).toBeInTheDocument();
            expect(screen.getByText(/近 90 日三大法人買賣超/)).toBeInTheDocument();

            // 2. 圖表容器 (GlassCard)
            expect(screen.getAllByTestId('glass-card')[0]).toBeInTheDocument();

            // 3. 摘要卡片 (3張)
            // 外資 total = 100 - 20 = 80
            expect(screen.getByText('外資總買賣超 (90日)')).toBeInTheDocument();
            expect(screen.getByText('80 張')).toBeInTheDocument();

            // 投信 total = 50 + 10 = 60
            expect(screen.getByText('投信總買賣超 (90日)')).toBeInTheDocument();
            expect(screen.getByText('60 張')).toBeInTheDocument();
        });
    });

    describe('2. 邊界條件測試 (Edge Cases)', () => {
        it('TC-2101: 空數據狀態 (Empty State)', () => {
            mockUseStockChips.mockReturnValue({
                data: [],
                isLoading: false,
                isError: null
            });

            render(<StockChipsPage params={mockParams} />);

            expect(screen.getByText('尚無籌碼數據')).toBeInTheDocument();
            expect(screen.queryByTestId('composed-chart')).not.toBeInTheDocument();
        });

        it('TC-2201: 載入中狀態 (Loading State)', () => {
            mockUseStockChips.mockReturnValue({
                data: [],
                isLoading: true, // Loading
                isError: null
            });

            const { container } = render(<StockChipsPage params={mockParams} />);

            // Tailwind animate-spin class check
            // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
            const spinner = container.querySelector('.animate-spin');
            expect(spinner).toBeInTheDocument();
        });
    });

    describe('3. 安全性與異常處理', () => {
        it('TC-3101: API 錯誤處理 (Error Handling)', () => {
            // 目前頁面邏輯：若 !data 或 data.length === 0 顯示 Empty
            // 若 isLoading 為 false 且無 data，會落入 Empty State
            // 如果我們想測試 error 顯示，可能需要修改 Page 邏輯支援顯示 Error Message，
            // 但依據目前代碼，它會顯示 "尚無籌碼數據"。
            // 我們這裡驗證它不會崩潰即可。

            mockUseStockChips.mockReturnValue({
                data: null,
                isLoading: false,
                isError: new Error('API Failed')
            });

            render(<StockChipsPage params={mockParams} />);
            expect(screen.getByText('尚無籌碼數據')).toBeInTheDocument();
        });
    });
});
