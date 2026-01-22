import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../../app/page';

// -----------------------------------------------------------------------------
// Mocks
// -----------------------------------------------------------------------------

// 1. Mock Child Components to isolate Page logic
jest.mock('../../components/MacroChart', () => {
    return function MockMacroChart({ title, data, color }: any) {
        return (
            <div data-testid="macro-chart">
                <span data-testid="chart-title">{title}</span>
                <span data-testid="chart-data-count">{data.length}</span>
                <span data-testid="chart-color">{color}</span>
            </div>
        );
    };
});

// 2. Mock Lucide Icons (Optional, but acts as a safeguard against render issues)
jest.mock('lucide-react', () => ({
    Activity: () => <svg data-testid="icon-activity" />,
    TrendingUp: () => <svg data-testid="icon-trending-up" />,
    BarChart3: () => <svg data-testid="icon-bar-chart" />,
    FileText: () => <svg data-testid="icon-file-text" />,
    Settings: () => <svg data-testid="icon-settings" />,
    Cpu: () => <svg data-testid="icon-cpu" />,
    Layers: () => <svg data-testid="icon-layers" />, // Added for Chips Link
}));

// 3. Mock Supabase Client
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();
const mockLimit = jest.fn();

// Chainable Mock Implementation
const mockSupabaseChain = {
    select: mockSelect,
    eq: mockEq,
    order: mockOrder,
    limit: mockLimit,
};

mockSelect.mockReturnValue(mockSupabaseChain);
mockEq.mockReturnValue(mockSupabaseChain);
mockOrder.mockReturnValue(mockSupabaseChain);
// limit is the end of the chain in our specific usage, returning { data, error }
mockLimit.mockResolvedValue({ data: [], error: null });

jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: jest.fn(() => mockSupabaseChain)
    }
}));

describe('Dashboard 頁面整合測試', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Sidebar 導航列渲染: 應正確顯示導航連結', async () => {
        // Setup default empty return
        mockLimit.mockResolvedValue({ data: [], error: null });

        // Act: Resolve the async Server Component
        const ui = await Home();
        render(ui);

        // Assert
        expect(screen.getByText('總覽 (Overview)')).toBeInTheDocument();
        expect(screen.getByText('籌碼分析 (Chips)')).toBeInTheDocument();
        expect(screen.getByText('市場動態')).toBeInTheDocument();
        expect(screen.getByText('演化分析')).toBeInTheDocument();
        expect(screen.getByText('決策報告')).toBeInTheDocument();
        expect(screen.getByText('系統設定')).toBeInTheDocument();
        expect(screen.getByTestId('icon-cpu')).toBeInTheDocument(); // Logo icon
    });

    it('Sidebar 連結: 驗證籌碼分析指向正確路徑', async () => {
        mockLimit.mockResolvedValue({ data: [], error: null });
        const ui = await Home();
        render(ui);

        const chipsLink = screen.getByText('籌碼分析 (Chips)').closest('a');
        expect(chipsLink).toHaveAttribute('href', '/chips');
    });

    it('系統狀態徽章: 應顯示 Online 狀態', async () => {
        mockLimit.mockResolvedValue({ data: [], error: null });
        const ui = await Home();
        render(ui);

        expect(screen.getByText('AI Worker')).toBeInTheDocument();
        expect(screen.getByText('Database')).toBeInTheDocument();
    });

    it('宏觀數據區塊: 應渲染 3 個 MacroChart 卡片', async () => {
        // Setup: Mock data for 3 separate calls (GDP, CPI, VIX) + Reports
        // The implementation calls Promise.all([GDP, CPI, VIX, Reports])
        // We need to ensure mockLimit returns appropriate data for each call.
        // Or we can just return standard data for all calls since the component keys off array length mainly.

        const fakeData = [{ value: 100, reference_date: '2023-01-01' }];
        mockLimit.mockResolvedValue({ data: fakeData, error: null });

        const ui = await Home();
        render(ui);

        // Assert: 3 Charts should be rendered
        const charts = screen.getAllByTestId('macro-chart');
        expect(charts).toHaveLength(3); // GDP, CPI, VIX

        // Verify specifics
        expect(screen.getByText('GDP Growth')).toBeInTheDocument();
        expect(screen.getByText('CPI (Inflation)')).toBeInTheDocument();
        expect(screen.getByText('VIX Volatility')).toBeInTheDocument();
    });

    it('AI 報告區塊: 若無報告應顯示佔位符', async () => {
        // Setup: Last call (Reports) returns empty
        mockLimit.mockResolvedValue({ data: [], error: null });

        const ui = await Home();
        render(ui);

        expect(screen.getByText('暫無 AI 報告生成。請檢查 ETL 排程。')).toBeInTheDocument();
    });

    it('AI 報告區塊: 若有報告應渲染 ReportCard', async () => {
        // Setup: Mock specific returns based on call order is tricky with shared mock.
        // But since we use the same chain, we can mock via .mockImplementationOnce if needed.
        // However, Promise.all order is strictly defined in source.
        // Let's rely on the fact that Reports is the 4th call.

        const mockReport = {
            id: '123',
            stock_code: 'AAPL',
            report_date: '2023-10-01',
            summary: 'Analysis Summary'
        };

        mockLimit
            .mockResolvedValueOnce({ data: [], error: null }) // GDP
            .mockResolvedValueOnce({ data: [], error: null }) // CPI
            .mockResolvedValueOnce({ data: [], error: null }) // VIX
            .mockResolvedValueOnce({ data: [mockReport], error: null }); // Reports

        const ui = await Home();
        render(ui);

        // Assert
        expect(screen.getByText('AAPL')).toBeInTheDocument();
        expect(screen.getByText('Analysis Summary')).toBeInTheDocument();
        // Should NOT show placeholder
        expect(screen.queryByText('暫無 AI 報告生成。請檢查 ETL 排程。')).not.toBeInTheDocument();
    });

    it('安全性測試: Supabase 斷線應容錯', async () => {
        // Setup: Return error
        mockLimit.mockResolvedValue({ data: null, error: { message: 'Connection Error' } });

        // Suppress console.error for clean test output
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        try {
            const ui = await Home();
            render(ui);

            // It should render "empty" state (length 0 arrays), but NOT crash.
            // Charts will receive empty data -> MacroChart handles it (checked in Unit Test) or renders 0 points.
            const charts = screen.getAllByTestId('macro-chart');
            expect(charts).toHaveLength(3);
            expect(screen.getByText('暫無 AI 報告生成。請檢查 ETL 排程。')).toBeInTheDocument();
        } finally {
            consoleSpy.mockRestore();
        }
    });

});
