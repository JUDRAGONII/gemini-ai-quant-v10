import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AlertToast } from '@/components/Market/AlertToast';
import { AlertBadge } from '@/components/Market/AlertBadge';
import { useAlerts } from '@/hooks/useAlerts';

// Mock useAlerts Hook
jest.mock('@/hooks/useAlerts', () => ({
    useAlerts: jest.fn(),
}));

// Mock framer-motion to avoid animation delays
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('市場警示組件全面性測試', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('TC-4501: 驗證 AlertToast 渲染警示內容 (UX 驗證)', () => {
        const mockAlert: any = {
            id: '1',
            stock_code: '2330',
            alert_title: '價格飆漲: 2330',
            alert_description: '台積電 價格大漲 達 5.5%',
            alert_level: 'critical',
            triggered_at: new Date().toISOString(),
            is_read: false,
            is_dismissed: false,
            created_at: new Date().toISOString(),
        };

        render(<AlertToast alert={mockAlert} onClose={() => { }} />);

        expect(screen.getByText(/2330/)).toBeInTheDocument();
        expect(screen.getByText(/台積電/)).toBeInTheDocument();
        expect(screen.getByText(/價格大漲/)).toBeInTheDocument();
    });

    it('TC-4501: 驗證 AlertBadge 顯示未讀數', async () => {
        // 模擬 Hook 回傳未讀數
        (useAlerts as jest.Mock).mockReturnValue({
            unreadCount: 5,
            alerts: [],
            isLoading: false,
        });

        render(<AlertBadge />);

        expect(screen.getByText('5')).toBeInTheDocument();
    });
});
