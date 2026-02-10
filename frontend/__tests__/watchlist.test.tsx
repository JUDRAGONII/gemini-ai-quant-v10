import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WatchlistPage from '../app/watchlist/page';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Mock Supabase
jest.mock('@supabase/auth-helpers-nextjs', () => ({
    createClientComponentClient: jest.fn(),
}), { virtual: true });

// Mock SWR or other hooks if used
jest.mock('swr', () => ({
    __esModule: true,
    default: () => ({
        data: [],
        error: null,
        isLoading: false,
        mutate: jest.fn(),
    }),
}));

const mockSupabase = {
    auth: {
        getUser: jest.fn(() => ({
            data: { user: { id: 'test-user-id' } },
        })),
    },
};

(createClientComponentClient as jest.Mock).mockReturnValue(mockSupabase);

// Mock global fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
    })
) as jest.Mock;

describe('WatchlistPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default mock: Return empty list
        (global.fetch as jest.Mock).mockImplementation((url) => {
            if (url.includes('/api/watchlist')) {
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

    it('TC-1400: 訪問自選股頁面', async () => {
        render(<WatchlistPage />);
        await waitFor(() => {
            expect(screen.getByText(/我的自選股/i)).toBeInTheDocument();
        });
    });

    it('TC-1403: 顯示即時報價 (Mock Data)', async () => {
        // Setup mock with data
        (global.fetch as jest.Mock).mockImplementation((url) => {
            if (url.includes('/api/watchlist')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([
                        { id: '1', stock_code: '2330', stock_name: '台積電', created_at: '2026-01-28' }
                    ]),
                });
            }
            if (url.includes('/api/stocks/quotes')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        '2330': {
                            code: '2330',
                            name: '台積電',
                            price: 1000,
                            change: 10,
                            change_percent: 1.0,
                            volume: 50000
                        }
                    }),
                });
            }
            return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
        });

        render(<WatchlistPage />);
        await waitFor(() => {
            expect(screen.getByText('1000.00')).toBeInTheDocument();
            expect(screen.getByText('+1.00%')).toBeInTheDocument();
        });
    });

    it('TC-2412: 空白輸入時新增按鈕應禁用', async () => {
        render(<WatchlistPage />);
        // Find button that contains text "新增"
        await waitFor(() => {
            const addButton = screen.getAllByRole('button').find(btn => btn.textContent?.trim().includes('新增'));
            expect(addButton).toBeInTheDocument();
            expect(addButton).toBeDisabled();
        });
    });

    it('TC-2413: 空自選股列表提示', async () => {
        // Default mock is empty list
        render(<WatchlistPage />);
        await waitFor(() => {
            expect(screen.getByText(/尚未加入任何股票/i)).toBeInTheDocument();
        });
    });

    // TC-3410 移除: 驗證由 Middleware 處理，不在此單元測試範圍

    it('TC-4410: 載入狀態顯示', async () => {
        // Mock slow response
        (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => { }));
        render(<WatchlistPage />);
        // Use findByRole for query robustness if possible, or querySelector
        expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });
});
