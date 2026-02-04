import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ScreenerView } from '@/components/Screener/ScreenerView';
import { SWRConfig } from 'swr';

// Mock API responses
const mockStocks = [
    { stock_code: '2330', name: '台積電', price: 600, change_percent: 1.2, ai_score: 95, volume: 10000 },
    { stock_code: '2317', name: '鴻海', price: 150, change_percent: -0.5, ai_score: 85, volume: 5000 },
];

const mockFetch = jest.fn((url) => {
    if (url.includes('/api/v1/screener/screen')) {
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ status: 'success', data: mockStocks, count: 2 }),
        });
    }
    return Promise.reject(new Error('Unknown API'));
});

global.fetch = mockFetch as any;

describe('Screener 模組全面性測試', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const customRender = (ui: React.ReactElement) => {
        return render(
            <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
                {ui}
            </SWRConfig>
        );
    };

    it('TC-1101: 驗證選股器頁面能正確渲染 API 回傳數據', async () => {
        customRender(<ScreenerView />);

        // 等待載入遮罩消失
        await waitFor(() => {
            expect(screen.queryByText('大數據分析中...')).not.toBeInTheDocument();
        }, { timeout: 3000 });

        // 檢查表格內容
        await waitFor(() => {
            expect(screen.getByText(/台積電/)).toBeInTheDocument();
            expect(screen.getByText(/2330/)).toBeInTheDocument();
        });
    });

    it('TC-4301: 驗證過濾面板輸入交互觸發重新抓取', async () => {
        customRender(<ScreenerView />);

        await waitFor(() => {
            expect(screen.queryByText('大數據分析中...')).not.toBeInTheDocument();
        });

        // 清除初始渲染產生的 fetch 調用紀錄
        mockFetch.mockClear();

        // 尋找價格範圍輸入框
        const minPriceInput = screen.getByPlaceholderText('最低');

        // 模擬輸入
        fireEvent.change(minPriceInput, { target: { value: '200' } });

        // 驗證 SWR 是否因為 Key (filters) 變動而再次調用 fetch
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalled();
        });
    });
});
