import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import MonitorPage from '@/app/admin/monitor/page';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: jest.fn(),
    },
}));

// Mock Next.js Navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

// Mock UI components
jest.mock('@/components/ui/GlassCard', () => ({ children, className }: any) => <div data-testid="glass-card" className={className}>{children}</div>);
jest.mock('@/components/ui/ProBadge', () => ({ children }: any) => <span data-testid="pro-badge">{children}</span>);

describe('MonitorPage', () => {
    const mockFrom = supabase.from as jest.Mock;
    const mockRouter = { push: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup generic Supabase mock chain
        const mockSelect = jest.fn();
        mockFrom.mockReturnValue({
            select: mockSelect,
        });

        // Default mock implementation for fetching stats and data
        // Case 1: Fetching stats (limit not called)
        // Case 2: Fetching data (order -> limit called)
        mockSelect.mockImplementation((columns, options) => {
            if (options && options.count) {
                // This is for Stats: .select('*', { count: 'exact', head: true })
                return Promise.resolve({ count: 100, data: null, error: null });
            }
            return {
                order: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue({
                    data: [
                        { id: 1, name: 'Test Data 1', created_at: '2023-01-01' },
                        { id: 2, name: 'Test Data 2', created_at: '2023-01-02' }
                    ],
                    error: null
                })
            }
        });

        // Mock localStorage
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: jest.fn(() => 'true'), // Default to dev mode
                setItem: jest.fn(),
            },
            writable: true
        });
    });

    // TC-1101: 頁面完整渲染
    it('TC-1101: 頁面完整渲染', async () => {
        await act(async () => {
            render(<MonitorPage />);
        });

        expect(screen.getByText('數據監控中心')).toBeInTheDocument();
        expect(screen.getByText('Developer Only')).toBeInTheDocument();
        // Tabs
        expect(screen.getByText('行情數據')).toBeInTheDocument();
        expect(screen.getByText('宏觀指標')).toBeInTheDocument();
    });

    // TC-1102: 數據載入狀態
    it('TC-1102: 數據載入狀態', async () => {
        // We can't easily catch the loading spinner in the final state, 
        // but we can verify data eventually loads
        await act(async () => {
            render(<MonitorPage />);
        });
        await waitFor(() => {
            expect(screen.getByText('Test Data 1')).toBeInTheDocument();
        });
    });

    // TC-1103: 表格交互 (Tab Switching)
    it('TC-1103: 表格交互', async () => {
        await act(async () => {
            render(<MonitorPage />);
        });

        const microTab = screen.getByText('宏觀指標');
        fireEvent.click(microTab);

        // Verify supbase was called with new table name
        // Initial calls for stats (4 tables) + 1 call for initial data (daily_price)
        // After click: +1 call for macro_indicators
        await waitFor(() => {
            expect(mockFrom).toHaveBeenCalledWith('macro_indicators');
        });
    });

    // TC-2101: 非開發模式阻擋
    it('TC-2101: 非開發模式阻擋', async () => {
        // Setup Not Dev Mode
        (window.localStorage.getItem as jest.Mock).mockReturnValue(null);

        await act(async () => {
            render(<MonitorPage />);
        });

        // Should redirect or show access denied
        // Based on implementation plan, we expect checking logic
        // Since we know code is missing this, we expect this test to FAIL initially
        await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith('/');
            // Or expect(screen.getByText('Access Denied')).toBeInTheDocument();
        });
    });

    // TC-2201: 空數據處理
    it('TC-2201: 空數據處理', async () => {
        mockFrom.mockReturnValue({
            select: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            })
        });

        await act(async () => {
            render(<MonitorPage />);
        });

        await waitFor(() => {
            expect(screen.getByText('此資料表目前尚無數據')).toBeInTheDocument();
        });
    });
});
