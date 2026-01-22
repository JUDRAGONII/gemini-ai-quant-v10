import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ReportPage from '../../../../app/ai/[id]/page';

// -----------------------------------------------------------------------------
// Mocks
// -----------------------------------------------------------------------------

// 1. Mock Supabase
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();

const mockSupabaseChain = {
    select: mockSelect,
    eq: mockEq,
    single: mockSingle,
};

mockSelect.mockReturnValue(mockSupabaseChain);
mockEq.mockReturnValue(mockSupabaseChain);

jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: jest.fn(() => mockSupabaseChain) // Fix: use .from()
    }
}));

// 2. Mock React Markdown & Plugins (to avoid ESM issues in Jest)
jest.mock('react-markdown', () => ({ children }: any) => <div data-testid="markdown-content">{children}</div>);
jest.mock('remark-gfm', () => () => { });

// 3. Mock Lucide Icons
jest.mock('lucide-react', () => ({
    ArrowLeft: () => <svg data-testid="icon-arrow-left" />,
    Calendar: () => <svg data-testid="icon-calendar" />,
    FileText: () => <svg data-testid="icon-file-text" />,
    Tag: () => <svg data-testid="icon-tag" />,
    Share2: () => <svg data-testid="icon-share" />,
}));

describe('AI Report Detail Page (Integration)', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('正常渲染: 應顯示標題、摘要與 Markdown 內容', async () => {
        // Setup Success Response
        const mockReport = {
            id: '123',
            stock_code: 'AAPL',
            report_date: '2023-10-01',
            summary: 'Summary Text',
            full_content: '# Analysis\n**Bullish**\n- Point 1',
            created_at: '2023-10-01T12:00:00Z'
        };
        mockSingle.mockResolvedValue({ data: mockReport, error: null });

        // Act
        const ui = await ReportPage({ params: { id: '123' } });
        render(ui);

        // Assert
        expect(screen.getByText('多空辯論分析報告')).toBeInTheDocument();
        expect(screen.getByText('AAPL')).toBeInTheDocument();
        expect(screen.getByText('Summary Text')).toBeInTheDocument();
        expect(screen.getByTestId('markdown-content')).toHaveTextContent('# Analysis');
    });

    it('404 處理: 查無報告應顯示錯誤訊息', async () => {
        // Setup Empty Response
        mockSingle.mockResolvedValue({ data: null, error: { message: 'Not Found' } });

        // Act
        const ui = await ReportPage({ params: { id: '999' } });
        render(ui);

        // Assert
        expect(screen.getByText('Report Not Found')).toBeInTheDocument();
        expect(screen.getByText('Return Home')).toBeInTheDocument();
    });
});
