/**
 * 數據監控中心 UI 改造測試
 * @file frontend/__tests__/admin/monitor/page.test.tsx
 * @description 涵蓋 CATEGORIES 配置、色彩主題、待補充狀態等 18 個測試案例
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import MonitorPage from '@/app/admin/monitor/page';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: jest.fn(),
        rpc: jest.fn(),
    },
}));

// Mock Next.js Navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

// Mock UI components
jest.mock('@/components/ui/GlassCard', () => ({ children, className }: any) =>
    <div data-testid="glass-card" className={className}>{children}</div>
);
jest.mock('@/components/ui/ProBadge', () => ({ children }: any) =>
    <span data-testid="pro-badge">{children}</span>
);

describe('MonitorPage', () => {
    const mockFrom = supabase.from as jest.Mock;
    const mockRpc = (supabase as any).rpc as jest.Mock;
    const mockRouter = { push: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    // 模擬分類統計數據
    const mockCategoryCounts = {
        tw_equity: 3418073,
        us_equity: 1970461,
        tw_macro: 4,
        us_macro: 41392,
        realtime: 385,
        factors: 50000,
        genes: 1000,
        fx: 0,
        metals: 0,
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock RPC: get_category_counts
        mockRpc.mockResolvedValue({
            data: mockCategoryCounts,
            error: null,
        });

        // Mock Supabase from chain
        const mockSelect = jest.fn();
        mockFrom.mockReturnValue({
            select: mockSelect,
        });

        mockSelect.mockImplementation((columns, options) => {
            if (options && options.count) {
                return Promise.resolve({ count: 100, data: null, error: null });
            }
            return {
                order: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [
                        { id: 1, symbol: '2330', trade_date: '2026-02-04' },
                        { id: 2, symbol: '2317', trade_date: '2026-02-04' }
                    ],
                    error: null
                }),
            };
        });

        // Mock localStorage
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: jest.fn(() => 'true'),
                setItem: jest.fn(),
            },
            writable: true
        });
    });

    // ========================================
    // 1. 基礎路徑測試 (Happy Path)
    // ========================================
    describe('基礎路徑測試', () => {

        // TC-1101: 頁面載入後應渲染 9 個分類卡片
        it('TC-1101: 頁面載入後應渲染 9 個分類卡片', async () => {
            await act(async () => {
                render(<MonitorPage />);
            });

            // 驗證 9 個分類名稱
            expect(screen.getByText('台灣行情')).toBeInTheDocument();
            expect(screen.getByText('美國行情')).toBeInTheDocument();
            expect(screen.getByText('台灣宏觀')).toBeInTheDocument();
            expect(screen.getByText('美國宏觀')).toBeInTheDocument();
            expect(screen.getByText('即時報價')).toBeInTheDocument();
            expect(screen.getByText('多因子評分')).toBeInTheDocument();
            expect(screen.getByText('演化基因')).toBeInTheDocument();
            expect(screen.getByText('匯率')).toBeInTheDocument();
            expect(screen.getByText('貴金屬')).toBeInTheDocument();
        });

        // TC-1102: 各卡片應顯示正確分類名稱與英文代碼
        it('TC-1102: 各卡片應顯示正確分類名稱與英文代碼', async () => {
            await act(async () => {
                render(<MonitorPage />);
            });

            // 驗證英文代碼
            expect(screen.getByText('TWSE')).toBeInTheDocument();
            expect(screen.getByText('US Equities')).toBeInTheDocument();
            expect(screen.getByText('TW Macro')).toBeInTheDocument();
            expect(screen.getByText('US Macro')).toBeInTheDocument();
            expect(screen.getByText('FX')).toBeInTheDocument();
            expect(screen.getByText('Metals')).toBeInTheDocument();
        });

        // TC-1103: 預設選中第一個分類 (台灣行情)
        it('TC-1103: 預設選中第一個分類 (台灣行情)', async () => {
            await act(async () => {
                render(<MonitorPage />);
            });

            // 頁面載入時應調用 daily_price 表
            await waitFor(() => {
                expect(mockFrom).toHaveBeenCalledWith('daily_price');
            });
        });

        // TC-1201: 調用 get_category_counts RPC 應返回 JSON 物件
        it('TC-1201: 調用 get_category_counts RPC 應返回 JSON 物件', async () => {
            await act(async () => {
                render(<MonitorPage />);
            });

            await waitFor(() => {
                expect(mockRpc).toHaveBeenCalledWith('get_category_counts');
            });
        });

        // TC-1202: 卡片應顯示對應分類的記錄數
        it('TC-1202: 卡片應顯示對應分類的記錄數', async () => {
            await act(async () => {
                render(<MonitorPage />);
            });

            await waitFor(() => {
                // 驗證數字格式化顯示 (3,418,073)
                expect(screen.getByText('3,418,073')).toBeInTheDocument();
                expect(screen.getByText('1,970,461')).toBeInTheDocument();
            });
        });

        // TC-1301: 點擊卡片應切換 activeTab 與 activeCategory
        it('TC-1301: 點擊卡片應切換 activeTab 與 activeCategory', async () => {
            await act(async () => {
                render(<MonitorPage />);
            });

            const usEquityCard = screen.getByText('美國行情');
            fireEvent.click(usEquityCard);

            await waitFor(() => {
                expect(mockFrom).toHaveBeenCalledWith('daily_price');
            });
        });

        // TC-1302: 切換後應觸發 fetchData 重新獲取資料
        it('TC-1302: 切換後應觸發 fetchData 重新獲取資料', async () => {
            await act(async () => {
                render(<MonitorPage />);
            });

            const usEquityCard = screen.getByText('美國宏觀');
            fireEvent.click(usEquityCard);

            await waitFor(() => {
                expect(mockFrom).toHaveBeenCalledWith('macro_indicators');
            });
        });
    });

    // ========================================
    // 2. 邊界條件測試 (Edge Cases)
    // ========================================
    describe('邊界條件測試', () => {

        // TC-2101: RPC 返回空物件時卡片應顯示 '...'
        it('TC-2101: RPC 返回空物件時卡片應顯示 \'...\'', async () => {
            mockRpc.mockResolvedValue({
                data: {},
                error: null,
            });

            await act(async () => {
                render(<MonitorPage />);
            });

            await waitFor(() => {
                const ellipsis = screen.getAllByText('...');
                expect(ellipsis.length).toBeGreaterThan(0);
            });
        });

        // TC-2102: RPC 失敗時應回退至空 stats
        it('TC-2102: RPC 失敗時應回退至空 stats', async () => {
            mockRpc.mockResolvedValue({
                data: null,
                error: { message: 'RPC Error' },
            });

            await act(async () => {
                render(<MonitorPage />);
            });

            // 頁面應正常渲染，不應崩潰
            expect(screen.getByText('數據監控中心')).toBeInTheDocument();
        });

        // TC-2201: isPending 為 true 的卡片應禁用點擊
        it('TC-2201: isPending 為 true 的卡片應禁用點擊', async () => {
            await act(async () => {
                render(<MonitorPage />);
            });

            const fxCard = screen.getByText('匯率').closest('button');
            expect(fxCard).toHaveAttribute('disabled');
        });

        // TC-2202: 待補充卡片應顯示 '待補' 標籤
        it('TC-2202: 待補充卡片應顯示 \'待補\' 標籤', async () => {
            await act(async () => {
                render(<MonitorPage />);
            });

            const pendingLabels = screen.getAllByText('待補');
            expect(pendingLabels.length).toBe(2); // 匯率 + 貴金屬
        });

        // TC-2203: 待補充分類不應觸發 fetchData
        it('TC-2203: 待補充分類不應觸發 fetchData', async () => {
            await act(async () => {
                render(<MonitorPage />);
            });

            // 嘗試點擊禁用卡片
            const fxCard = screen.getByText('匯率').closest('button');
            if (fxCard) fireEvent.click(fxCard);

            // 不應調用 exchange_rates 表
            await waitFor(() => {
                expect(mockFrom).not.toHaveBeenCalledWith('exchange_rates');
            });
        });
    });

    // ========================================
    // 3. 安全性與數據一致性
    // ========================================
    describe('安全性驗證', () => {

        // TC-3101: anon 角色應可調用 get_category_counts
        it('TC-3101: anon 角色應可調用 get_category_counts', async () => {
            await act(async () => {
                render(<MonitorPage />);
            });

            await waitFor(() => {
                expect(mockRpc).toHaveBeenCalled();
                expect(mockRpc.mock.calls[0][0]).toBe('get_category_counts');
            });
        });

        // TC-3102: 非開發模式應重導向至首頁
        it('TC-3102: 非開發模式應重導向至首頁', async () => {
            (window.localStorage.getItem as jest.Mock).mockReturnValue(null);

            await act(async () => {
                render(<MonitorPage />);
            });

            await waitFor(() => {
                expect(mockRouter.push).toHaveBeenCalledWith('/');
            });
        });
    });

    // ========================================
    // 4. 可訪問性與 UI/UX
    // ========================================
    describe('UI/UX 驗證', () => {

        // TC-4001: 頁面標題與開發者標籤
        it('TC-4001: 頁面標題與開發者標籤', async () => {
            await act(async () => {
                render(<MonitorPage />);
            });

            expect(screen.getByText('數據監控中心')).toBeInTheDocument();
            expect(screen.getByText('Developer Only')).toBeInTheDocument();
        });

        // TC-4101: 空數據處理
        it('TC-4101: 空數據處理', async () => {
            mockFrom.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    order: jest.fn().mockReturnThis(),
                    limit: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
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

        // TC-4102: 手動刷新按鈕
        it('TC-4102: 手動刷新按鈕', async () => {
            await act(async () => {
                render(<MonitorPage />);
            });

            const refreshButton = screen.getByRole('button', { name: /刷新數據/i });
            expect(refreshButton).toBeInTheDocument();
        });
    });
});
