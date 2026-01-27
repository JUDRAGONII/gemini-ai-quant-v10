import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StockFinancialsPage from '../app/stocks/[symbol]/financials/page';
import useSWR from 'swr';

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
    annual: [
        { fiscal_date: '2025-09-27', revenue: 400000000000, net_income: 100000000000, eps: 6.5, free_cash_flow: 90000000000, gross_margin: '45.00', net_margin: '25.00' },
    ],
    quarterly: [],
    lastUpdated: '2026-01-27T00:00:00Z'
};

describe('DEBUG - Table Isolation', () => {
    beforeEach(() => {
        (useSWR as jest.Mock).mockReturnValue({
            data: mockFinancialData,
            error: null,
            isLoading: false,
            isValidating: false
        });
    });

    it('TC-1103: 財務報表明細表 (Isolated)', async () => {
        const { debug } = render(<StockFinancialsPage />);
        // Wait for potential animation
        await waitFor(() => expect(screen.getByText(/財務報表/)).toBeInTheDocument());

        const tableHeader = await screen.findByText('年度明細', {}, { timeout: 3000 });
        expect(tableHeader).toBeInTheDocument();

        debug();
    });
});
