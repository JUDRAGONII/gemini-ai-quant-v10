import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useMonitorData } from '@/hooks/useMonitorData';
import { supabase } from '@/lib/supabase';
import MonitorPage from '@/app/admin/monitor/page';

// Mock Dependencies
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    usePathname: jest.fn(() => '/admin/monitor'),
}));

jest.mock('@/hooks/useMonitorData', () => ({
    useMonitorData: jest.fn(),
}));

jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({ data: [], error: null }),
        })),
    },
}));

describe('MonitorPage V2 Integration', () => {
    const mockRouter = {
        push: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (useMonitorData as jest.Mock).mockReturnValue({
            stats: {
                tw_equity: 100,
                us_equity: 200,
                tw_macro: 50,
                us_macro: 60,
                realtime: 1000,
                fx: 10,
                economic_calendar: 5,
                factors: 150,
                genes: 20
            },
            isLoading: false,
            refresh: jest.fn(),
        });

        // Mock localStorage
        Storage.prototype.getItem = jest.fn((key) => {
            if (key === 'dev_mode') return 'true';
            return null;
        });
    });

    describe('基礎功能驗證', () => {
        it('TC-1101: 應正確載入 9 大分類卡片', async () => {
            render(<MonitorPage />);

            const categories = [
                '台灣行情', '美國行情', '台灣宏觀', '美國宏觀',
                '即時報價', '匯率行情', '經濟日曆', '多因子評分', '演化基因'
            ];

            for (const cat of categories) {
                expect(screen.getByText(cat)).toBeInTheDocument();
            }
        });



        it('TC-1103: 切換分類應觸發數據重新抓取', async () => {
            render(<MonitorPage />);

            const usButton = screen.getByText('美國行情');
            fireEvent.click(usButton);

            await waitFor(() => {
                expect(supabase.from).toHaveBeenCalled();
            });
        });
    });

    describe('安全性驗證', () => {
        it('TC-3101: 若 dev_mode 不為 true 應跳轉回首頁', () => {
            (Storage.prototype.getItem as jest.Mock).mockReturnValue('false');
            render(<MonitorPage />);
            expect(mockRouter.push).toHaveBeenCalledWith('/');
        });
    });
});
