import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StockFinancialsPage from '../app/stocks/[symbol]/financials/page';
import useSWR from 'swr';

// Mock Config
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

global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) })) as jest.Mock;

const mockFinancialData = {
    symbol: 'AAPL',
    annual: [{ fiscal_date: '2025-09-27', revenue: 400000000000, net_income: 100000000000, eps: 6.5, free_cash_flow: 90000000000, gross_margin: '45.00', net_margin: '25.00' }],
    quarterly: [{ fiscal_date: '2025-12-31', revenue: 120000000000, net_income: 35000000000, eps: 1.5, gross_margin: '42.00', net_margin: '22.00' }],
    lastUpdated: '2026-01-27T00:00:00Z'
};

describe('DEBUG - Financials Page', () => {
    beforeEach(() => {
        (useSWR as jest.Mock).mockReturnValue({
            data: mockFinancialData,
            error: null,
            isLoading: false,
            isValidating: false
        });
    });

    it('TC-1101 DEBUG: 關鍵財務指標卡片顯示', async () => {
        const { debug } = render(<StockFinancialsPage />);
        debug(); // Print DOM to console
        expect(screen.getByText(/最新季度 EPS/i)).toBeInTheDocument();
    });
});
