import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AISearchPage from '@/app/ai/search/page';

// Mock Fetch
global.fetch = jest.fn();

// Mock Bilingual
jest.mock('@/components/ui/Bilingual', () => ({
    __esModule: true,
    Bilingual: ({ zh, en }: any) => <span data-testid="mock-bilingual">{zh} | {en}</span>,
}));

// Mock useRouter
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

describe('AISearchPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    const mockSearchResults = {
        results: [
            {
                id: '1',
                stock_code: '2330',
                stock_name: '台積電',
                title: '台積電2026展望',
                content: '預期在 AI 晶片代工上取得領先...',
                similarity: 0.85,
                report_date: '2026-03-01',
                report_type: '外資報告'
            },
            {
                id: '2',
                stock_code: '2317',
                stock_name: '鴻海',
                title: '伺服器代工優勢',
                content: '鴻海在伺服器供應鏈中依然穩健...',
                similarity: 0.65,
                report_date: '2026-02-28',
                report_type: '法人報告'
            }
        ]
    };

    it('TC-8001: 確保 UI 骨架與輸入框正確 Render', () => {
        render(<AISearchPage />);
        // 驗證標題
        expect(screen.getByText('AI 語義搜尋中心 | Semantic Knowledge Hub')).toBeInTheDocument();
        // 驗證輸入框佔位符
        expect(screen.getByPlaceholderText('請輸入問題，例如：半導體產業未來的成長動能為何？')).toBeInTheDocument();
    });

    it('TC-8002: 輸入搜尋詞後觸發 fetch，並正確顯示結果', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockSearchResults,
        });

        render(<AISearchPage />);
        const input = screen.getByPlaceholderText('請輸入問題，例如：半導體產業未來的成長動能為何？');
        const searchButton = screen.getByRole('button', { name: /搜尋 \| SEARCH/i });

        fireEvent.change(input, { target: { value: 'AI 發展趨勢' } });
        fireEvent.click(searchButton);

        // 應見到 Spinner 與 Loading 文字
        expect(screen.getByText('正在搜尋知識庫... | Searching knowledge base...')).toBeInTheDocument();

        // 驗證 fetch call
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/rag/search', expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ query: 'AI 發展趨勢', limit: 10 })
            }));
        });

        // 驗證結果與卡片渲染
        await waitFor(() => {
            expect(screen.getByText('找到 | Found')).toBeInTheDocument();
            expect(screen.getByText('2')).toBeInTheDocument(); // results length
            expect(screen.getByText('台積電2026展望')).toBeInTheDocument();
            expect(screen.getByText('伺服器代工優勢')).toBeInTheDocument();
        });

        // 分別驗證兩個卡片的相似度
        expect(screen.getByText('85%')).toBeInTheDocument();
        expect(screen.getByText('65%')).toBeInTheDocument();
    });

    it('TC-8003: 測試 找不到結果 (Empty State) 的觸發', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ results: [] }),
        });

        render(<AISearchPage />);
        const input = screen.getByPlaceholderText('請輸入問題，例如：半導體產業未來的成長動能為何？');
        const searchButton = screen.getByRole('button', { name: /搜尋 \| SEARCH/i });

        fireEvent.change(input, { target: { value: '沒有這家公司的資料' } });
        fireEvent.click(searchButton);

        await waitFor(() => {
            expect(screen.getByText('沒有找到相關結果 | No related results found')).toBeInTheDocument();
        });
    });

    it('TC-8004: 測試 API Error 狀態顯示', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: 'Database connection failed' }),
        });

        render(<AISearchPage />);
        const input = screen.getByPlaceholderText('請輸入問題，例如：半導體產業未來的成長動能為何？');
        const searchButton = screen.getByRole('button', { name: /搜尋 \| SEARCH/i });

        fireEvent.change(input, { target: { value: '引發錯誤的搜尋' } });
        fireEvent.click(searchButton);

        await waitFor(() => {
            expect(screen.getByText('Database connection failed')).toBeInTheDocument();
        });
    });

    it('TC-8005: 測試搜尋紀錄 (Local Storage) 之更新與渲染', async () => {
        // Mock successful fetch logic to bypass
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ results: [] }),
        });

        const { container } = render(<AISearchPage />);
        const input = screen.getByPlaceholderText('請輸入問題，例如：半導體產業未來的成長動能為何？');
        const searchButton = screen.getByRole('button', { name: /搜尋 \| SEARCH/i });

        // Submit first search
        fireEvent.change(input, { target: { value: '查詢紀錄一' } });
        fireEvent.click(searchButton);

        await waitFor(() => {
            const saved = JSON.parse(localStorage.getItem('rag_recent_searches') || '[]');
            expect(saved[0].query).toBe('查詢紀錄一');
        });

        // Click X to clear input
        const clearBtnSVG = container.querySelector('.lucide-x');
        if (clearBtnSVG && clearBtnSVG.closest('button')) {
            fireEvent.click(clearBtnSVG.closest('button')!);
        }

        // Add explicit value clearing to ensure the input registers empty
        fireEvent.change(input, { target: { value: '' } });
        fireEvent.focus(input);

        // Should show 'Recent Searches' box
        await waitFor(() => {
            expect(screen.getByText('最近搜尋 | Recent Searches')).toBeInTheDocument();
            expect(screen.getByText('查詢紀錄一')).toBeInTheDocument();
        });
    });
});
