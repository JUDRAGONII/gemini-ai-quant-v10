import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import MonitorPage from '@/app/admin/monitor/page';
import { useMonitorData } from '@/hooks/useMonitorData';

// Mock Dependencies
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@/hooks/useMonitorData', () => ({
    useMonitorData: jest.fn(),
}));

// Define mocks outside to share reference
const mockRange = jest.fn().mockResolvedValue({
    data: Array(50).fill({}),
    count: 100,
    error: null
});

const mockChain = {
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: mockRange,
    eq: jest.fn().mockReturnThis(),
};

jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: jest.fn(() => mockChain),
    },
}));

describe('MonitorPage Enhancements', () => {
    const mockRouter = { push: jest.fn() };

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (useMonitorData as jest.Mock).mockReturnValue({
            stats: {
                tw_equity: 100, us_equity: 50, tw_macro: 5, us_macro: 5,
                realtime: 0, fx: 0, economic_calendar: 0, factors: 0, genes: 0
            },
            isLoading: false,
            refresh: jest.fn(),
        });

        // Mock localStorage
        Storage.prototype.getItem = jest.fn((key) => key === 'dev_mode' ? 'true' : null);
    });

    describe('分頁功能 (Pagination)', () => {
        it('TC-M01: 頁面載入時應預設請求第一頁 (0-49)', async () => {
            render(<MonitorPage />);

            await waitFor(() => {
                const rangeSpy = mockRange; // Use the shared mock
                expect(rangeSpy).toHaveBeenCalledWith(0, 49);
            });
        });

        it('TC-M02: 點擊下一頁應請求第二頁 (50-99)', async () => {
            // Mock range response - simplify to always return data
            const rangeMock = jest.fn().mockResolvedValue({
                data: Array(50).fill({}),
                count: 100,
                error: null
            });

            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                range: rangeMock,
                eq: jest.fn().mockReturnThis(),
            });

            render(<MonitorPage />);

            // Wait for initial load
            await waitFor(() => {
                expect(screen.getByText(/PAGE 1/)).toBeInTheDocument();
            });

            // Click Next
            const nextBtn = screen.getByText(/NEXT/);
            fireEvent.click(nextBtn);

            await waitFor(() => {
                expect(rangeMock).toHaveBeenLastCalledWith(50, 99);
                expect(screen.getByText(/PAGE 2/)).toBeInTheDocument();
            });
        });
    });

    describe('Market Type 映射 (Mapping)', () => {
        it('TC-M03: 應將 TWSE 顯示為 TW 🇹🇼', async () => {
            const mockData = [{ id: 1, market_type: 'TWSE' }];
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                range: jest.fn().mockResolvedValue({
                    data: mockData, count: 1, error: null
                }),
                eq: jest.fn().mockReturnThis(),
            });

            render(<MonitorPage />);

            await waitFor(() => {
                expect(screen.getByText('TW 🇹🇼')).toBeInTheDocument();
            });
        });
    });

    describe('客戶端過濾 (Client Side Filter)', () => {
        it('TC-M04: 輸入關鍵字應過濾顯示內容', async () => {
            const mockData = [
                { id: 1, symbol: 'AAPL', name: 'Apple' },
                { id: 2, symbol: 'TSLA', name: 'Tesla' }
            ];

            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                range: jest.fn().mockResolvedValue({
                    data: mockData, count: 2, error: null
                }),
                eq: jest.fn().mockReturnThis(),
            });

            render(<MonitorPage />);

            await waitFor(() => {
                expect(screen.getByText('Apple')).toBeInTheDocument();
            });

            // Filter for TSLA
            const input = screen.getByTestId('filter-input');
            fireEvent.change(input, { target: { value: 'Tesla' } });

            expect(screen.queryByText('Apple')).not.toBeInTheDocument();
            expect(screen.getByText('Tesla')).toBeInTheDocument();
        });
    });
});
