import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PortfolioDetailPage from '../app/portfolios/[id]/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        refresh: jest.fn(),
    }),
    useParams: () => ({ id: '1' }),
}));

// Mock global fetch
global.fetch = jest.fn() as jest.Mock;

describe('PortfolioDetailPage Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default mock for detail page
        (global.fetch as jest.Mock).mockImplementation((url, options) => {
            console.log('Fetch URL:', url);
            // Get Portfolio
            if (url.includes('/api/portfolios/1') && (!options || options.method === 'GET')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        id: '1', name: '測試組合', description: 'Desc', currency: 'USD', created_at: '2026-01-28',
                        holdings: [
                            { id: '101', portfolio_id: '1', stock_code: 'AAPL', stock_name: 'Apple', buy_price: 150, shares: 10, commission: 0, tax: 0, buy_date: '2026-01-28' }
                        ]
                    }),
                });
            }
            // Get Holdings
            if (url.includes('/api/holdings') && url.includes('portfolio_id=1') && !options) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([
                        { id: '101', portfolio_id: '1', symbol: 'AAPL', quantity: 10, avg_price: 150, current_price: 155, created_at: '2026-01-28' }
                    ]),
                });
            }
            // Performance or others
            return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
        });
    });

    it('TC-1803: 查詢投資組合詳情', async () => {
        render(<PortfolioDetailPage />);

        await waitFor(() => {
            screen.debug();
            expect(screen.getByText('測試組合')).toBeInTheDocument();
            expect(screen.getByText('AAPL')).toBeInTheDocument();
            expect(screen.getByText('150')).toBeInTheDocument(); // avg price
        });
    });

    it('TC-1811: 新增持股', async () => {
        (global.fetch as jest.Mock).mockImplementation((url, options) => {
            if (url.includes('/api/holdings') && options?.method === 'POST') {
                return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
            }
            // Default GETs
            if (url.includes('/api/portfolios') || url.includes('/api/holdings')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ id: '1', name: '測試組合', holdings: [] }),
                });
            }
            return Promise.resolve({ ok: true });
        });

        render(<PortfolioDetailPage />);

        // Find Add Holding button which opens modal/form
        // Assuming there is a button "新增持股"
        const addBtn = await screen.findByRole('button', { name: /新增持股/i });
        fireEvent.click(addBtn);

        // Fill form
        const symbolInput = screen.getByPlaceholderText(/代碼/i);
        fireEvent.change(symbolInput, { target: { value: 'TSLA' } });

        const qtyInput = screen.getByPlaceholderText(/股數/i);
        fireEvent.change(qtyInput, { target: { value: '5' } });

        const priceInput = screen.getByPlaceholderText(/均價/i);
        fireEvent.change(priceInput, { target: { value: '200' } });

        // Submit
        const submitBtn = screen.getByRole('button', { name: /確認|新增/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/holdings'),
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining('TSLA')
                })
            );
        });
    });

    it('TC-1812: 移除持股', async () => {
        (global.fetch as jest.Mock).mockImplementation((url, options) => {
            if (url.includes('/api/holdings') && options?.method === 'DELETE') {
                return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
            }
            // Get Holdings
            if (url.includes('/api/holdings') && !options) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([
                        { id: '101', portfolio_id: '1', symbol: 'TO_DELETE', quantity: 10, avg_price: 100, current_price: 110 }
                    ]),
                });
            }
            // Get Portfolio
            if (url.includes('/api/portfolios')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        id: '1', name: '測試組合',
                        holdings: [
                            { id: '101', portfolio_id: '1', symbol: 'TO_DELETE', quantity: 10, avg_price: 100, current_price: 110, buy_price: 100, shares: 10, commission: 0, tax: 0 }
                        ]
                    }),
                });
            }
            return Promise.resolve({ ok: true });
        });

        // Mock confirm
        window.confirm = jest.fn(() => true);

        render(<PortfolioDetailPage />);

        const row = await screen.findByText('TO_DELETE');
        expect(row).toBeInTheDocument();

        // Find delete button involved with this row
        // Assuming row is in a table or list
        // Try finding closest buttons
        const deleteBtn = screen.getAllByRole('button').find(b => b.innerHTML.includes('trash') || b.textContent?.includes('刪除'));
        // Or if aria-label is missing, we might fail.
        // Let's assume there is a delete button.
        if (deleteBtn) {
            fireEvent.click(deleteBtn);
        } else {
            // Fallback: try finding by icon class or something
            const trashIcon = document.querySelector('.lucide-trash-2');
            if (trashIcon) {
                fireEvent.click(trashIcon.parentElement!);
            }
        }

        await waitFor(() => {
            expect(window.confirm).toHaveBeenCalled();
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/holdings'),
                expect.objectContaining({ method: 'DELETE' })
            );
        });
    });
});
