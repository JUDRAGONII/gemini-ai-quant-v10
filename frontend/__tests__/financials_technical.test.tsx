import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StockFinancialsPage from '../app/stocks/[symbol]/financials/page';
import StockTechnicalPage from '../app/stocks/[symbol]/technical/page';
// Import hooks to be mocked
import useSWR from 'swr';
import { useStockDetail } from '../hooks/useStockDetail';

// -----------------------------------------------------------------------------
// Mock Data Definitions
// -----------------------------------------------------------------------------

const mockFinancialData = {
    symbol: 'AAPL',
    annual: [
        { fiscal_date: '2025-09-27', revenue: 400000000000, net_income: 100000000000, eps: 6.5, free_cash_flow: 90000000000, gross_margin: '45.00', net_margin: '25.00' },
        { fiscal_date: '2024-09-28', revenue: 390000000000, net_income: 95000000000, eps: 6.1, free_cash_flow: 85000000000, gross_margin: '44.00', net_margin: '24.00' },
    ],
    quarterly: [
        { fiscal_date: '2025-12-31', revenue: 120000000000, net_income: 35000000000, eps: 1.5, gross_margin: '42.00', net_margin: '22.00' },
        { fiscal_date: '2025-09-30', revenue: 90000000000, net_income: 25000000000 },
    ],
    lastUpdated: '2026-01-27T00:00:00Z'
};

const generatePriceSeries = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
        time: 1700000000 + i * 86400,
        date: `2025-01-${String(i + 1).padStart(2, '0')}`,
        open: 150 + i,
        high: 155 + i,
        low: 145 + i,
        close: 152 + i,
        volume: 1000000
    }));
};

const mockTechnicalDataRaw = {
    metadata: { symbol: 'AAPL', name: 'Apple Inc.', market: 'NASDAQ', is_active: true },
    summary_stats: { pe_ratio: 30, pb_ratio: 10, dividend_yield: 0.5, roe: 25, last_price: 152 },
    price_series: generatePriceSeries(70)
};

// -----------------------------------------------------------------------------
// Mocks
// -----------------------------------------------------------------------------

jest.mock('next/navigation', () => ({
    useParams: () => ({ symbol: 'AAPL' }),
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
    usePathname: () => '/stocks/AAPL/financials',
}));

jest.mock('recharts', () => {
    const OriginalModule = jest.requireActual('recharts');
    return {
        ...OriginalModule,
        ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
    };
});

jest.mock('swr', () => ({
    __esModule: true,
    default: jest.fn()
}));

jest.mock('../hooks/useStockDetail', () => ({
    useStockDetail: jest.fn()
}));

global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) })) as jest.Mock;

// -----------------------------------------------------------------------------
// Test Suite
// -----------------------------------------------------------------------------

describe('Financials & Technical Pages Verification', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('3.1 基礎路徑 (Happy Path) - Financials', () => {
        beforeEach(() => {
            (useSWR as jest.Mock).mockReturnValue({
                data: mockFinancialData,
                error: null,
                isLoading: false,
                isValidating: false
            });
        });

        it('TC-1100: 美股財報頁面訪問', async () => {
            render(<StockFinancialsPage />);
            expect(screen.getByText(/財務報表/i)).toBeInTheDocument();
            expect(screen.getByText(/AAPL/i)).toBeInTheDocument();
        });

        it('TC-1101: 關鍵財務指標卡片顯示', async () => {
            render(<StockFinancialsPage />);
            await waitFor(() => expect(screen.getByText(/最新季度 EPS/i)).toBeInTheDocument());
            expect(screen.getByText('1.50')).toBeInTheDocument();
        });

        it('TC-1102: 季度營收/淨利趨勢圖渲染', async () => {
            render(<StockFinancialsPage />);
            expect(screen.getAllByTestId('responsive-container').length).toBeGreaterThan(0);
        });

        it('TC-1103: 財務報表明細表', async () => {
            render(<StockFinancialsPage />);
            // Use findByText to allow for animation/loading time
            const tableHeader = await screen.findByText(/年度明細/i, {}, { timeout: 3000 });
            expect(tableHeader).toBeInTheDocument();
            expect(screen.getByText('2025-09-27')).toBeInTheDocument();
        });
    });

    describe('3.2 基礎路徑 (Happy Path) - Technical', () => {
        beforeEach(() => {
            (useStockDetail as jest.Mock).mockReturnValue({
                data: mockTechnicalDataRaw,
                loading: false,
                error: null
            });
        });

        it('TC-1200: 技術分析頁面訪問', async () => {
            render(<StockTechnicalPage />);
            expect(screen.getByText(/技術分析/i)).toBeInTheDocument();
        });

        it('TC-1202: K線圖與均線疊加', async () => {
            render(<StockTechnicalPage />);
            expect(screen.getAllByTestId('responsive-container').length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('3.4 安全性驗證 (Security & RLS)', () => {
        it('TC-3100: 匿名 (Anon) 權限讀取財報 - Frontend Handling', async () => {
            (useSWR as jest.Mock).mockReturnValue({
                data: mockFinancialData,
                error: null,
                isLoading: false,
                isValidating: false
            });
            render(<StockFinancialsPage />);
            expect(screen.getByText(/最新季度 EPS/i)).toBeInTheDocument();
        });

        it('TC-3101: 寫入權限阻擋/錯誤處理 - 模擬錯誤處理', async () => {
            (useSWR as jest.Mock).mockReturnValue({
                data: null,
                error: { message: 'Forbidden' },
                isLoading: false,
                isValidating: false
            });
            render(<StockFinancialsPage />);
            expect(screen.getByText(/無財報數據/i)).toBeInTheDocument();
        });
    });

});
