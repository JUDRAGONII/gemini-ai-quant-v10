import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PortfoliosPage from '../app/portfolios/page';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        refresh: jest.fn(),
    }),
}));

// Mock global fetch
global.fetch = jest.fn() as jest.Mock;

describe('PortfoliosPage Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default mock: Return empty list
        (global.fetch as jest.Mock).mockImplementation((url) => {
            if (url.includes('/api/portfolios')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([]),
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({}),
            });
        });
    });

    it('TC-1802-A: 查詢投資組合列表 (空列表顯示)', async () => {
        render(<PortfoliosPage />);
        await waitFor(() => {
            expect(screen.getByText(/尚未建立任何投資組合/i)).toBeInTheDocument();
        });
    });

    it('TC-1802-B: 查詢投資組合列表 (有資料)', async () => {
        const mockPortfolios = [
            { id: '1', name: 'AI 成長組合', description: '高風險', currency: 'USD', created_at: '2026-01-28', is_default: true },
            { id: '2', name: '穩定配息', description: null, currency: 'TWD', created_at: '2026-01-28' }
        ];

        (global.fetch as jest.Mock).mockImplementation((url) => {
            if (url.includes('/api/portfolios')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockPortfolios),
                });
            }
            return Promise.resolve({ ok: true });
        });

        render(<PortfoliosPage />);

        await waitFor(() => {
            expect(screen.getByText('AI 成長組合')).toBeInTheDocument();
            expect(screen.getByText('穩定配息')).toBeInTheDocument();
            // Use getAllByText if '預設' appears multiple times or use more specific selector
            expect(screen.getByText(/DEFAULT/i)).toBeInTheDocument();
        });
    });

    it('TC-1801: 建立投資組合', async () => {
        (global.fetch as jest.Mock).mockImplementation((url, options) => {
            if (url.includes('/api/portfolios') && options?.method === 'POST') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ id: '3', name: '新組合', created_at: '2026-01-28' }),
                });
            }
            // List fetch
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([]),
            });
        });

        render(<PortfoliosPage />);

        // Input name
        const input = await screen.findByPlaceholderText(/組合名稱/);
        fireEvent.change(input, { target: { value: '新組合' } });

        // Click create
        const createBtn = screen.getByRole('button', { name: /建立/ });
        fireEvent.click(createBtn);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/portfolios'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ name: '新組合', description: '' })
                })
            );
        });
    });

    it('TC-1830: 空名稱建立 (按鈕禁用)', async () => {
        render(<PortfoliosPage />);

        const createBtn = await screen.findByRole('button', { name: /建立/ });
        expect(createBtn).toBeDisabled();

        const input = screen.getByPlaceholderText(/組合名稱/);
        fireEvent.change(input, { target: { value: '   ' } }); // Only spaces
        expect(createBtn).toBeDisabled();
    });

    it('TC-1804: 刪除投資組合', async () => {
        const mockPortfolios = [
            { id: '1', name: '待刪組合', created_at: '2026-01-28' }
        ];

        (global.fetch as jest.Mock).mockImplementation((url, options) => {
            // Delete request
            if (url.includes('id=1') && options?.method === 'DELETE') {
                return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
            }
            // Initial list
            if (url.includes('/api/portfolios')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockPortfolios),
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({}),
            });
        });

        // Ensure confirm is mocked
        window.confirm = jest.fn(() => true);

        render(<PortfoliosPage />);

        await waitFor(() => {
            expect(screen.getByText('待刪組合')).toBeInTheDocument();
        });

        // Find delete button - set hidden: true because it has opacity-0 class by default
        const deleteBtn = screen.getByRole('button', { name: '刪除 待刪組合', hidden: true });
        fireEvent.click(deleteBtn);

        await waitFor(() => {
            expect(window.confirm).toHaveBeenCalled();
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/portfolios?id=1'),
                expect.objectContaining({ method: 'DELETE' })
            );
        });
    });
});
