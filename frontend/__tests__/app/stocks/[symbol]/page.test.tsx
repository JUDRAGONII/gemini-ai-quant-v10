/**
 * @file page.test.tsx
 * @description StockDetailPage 元件測試
 * @updated 2026-01-30 - 更新以匹配 Phase 8 新 UI (返回鈕、AI指標)
 */
import { render, screen } from "@testing-library/react";
import StockDetailPage from "@/app/stocks/[symbol]/page";
import "@testing-library/jest-dom";

// Mock framer-motion
jest.mock("framer-motion", () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
}));

// Mock KLineChart (Canvas-based, cannot render in JSDOM)
jest.mock("@/components/Chart/KLineChart", () => ({
    KLineChart: () => <div data-testid="stock-chart">MockKLineChart</div>,
    ChartPeriod: "1Y",
}));

// Mock TechnicalIndicatorPanel
jest.mock("@/components/Chart/TechnicalIndicatorPanel", () => ({
    TechnicalIndicatorPanel: () => <div data-testid="tech-panel">MockTechnicalIndicatorPanel</div>,
}));

// Mock AIPredictionIndicator
jest.mock("@/components/AI/AIPredictionIndicator", () => ({
    AIPredictionIndicator: ({ alpha, winRate }: any) => (
        <div data-testid="ai-indicator">
            MockAIPrediction: {alpha}, {winRate}
        </div>
    ),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
    TrendingUp: () => <svg data-testid="icon-trending-up" />,
    BarChart3: () => <svg data-testid="icon-bar-chart" />,
    PieChart: () => <svg data-testid="icon-pie-chart" />,
    Activity: () => <svg data-testid="icon-activity" />,
    ArrowLeft: () => <svg data-testid="icon-arrow-left" />,
    Calendar: () => <svg data-testid="icon-calendar" />,
    BrainCircuit: () => <svg data-testid="icon-brain" />,
    AlertCircle: () => <svg data-testid="icon-alert" />,
}));

// Mock next/link
jest.mock("next/link", () => {
    return ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    );
});

// Mock useStockDetail hook
const mockUseStockDetail = jest.fn();
jest.mock("@/hooks/useStockDetail", () => ({
    useStockDetail: (...args: any[]) => mockUseStockDetail(...args),
}));

// Mock useAIPrediction hook
const mockUseAIPrediction = jest.fn();
jest.mock("@/hooks/useAIPrediction", () => ({
    useAIPrediction: (...args: any[]) => mockUseAIPrediction(...args),
}));

describe("StockDetailPage 元件測試", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("TC-1601: 載入中狀態應顯示 Spinner", () => {
        mockUseStockDetail.mockReturnValue({
            data: null,
            loading: true,
            error: null,
        });
        mockUseAIPrediction.mockReturnValue({ data: null, loading: false });

        render(<StockDetailPage params={{ symbol: "2330" }} />);

        const spinner = document.querySelector(".animate-spin");
        expect(spinner).toBeInTheDocument();
    });

    it("TC-1602: 錯誤狀態應顯示錯誤訊息", () => {
        mockUseStockDetail.mockReturnValue({
            data: null,
            loading: false,
            error: "Network error",
        });
        mockUseAIPrediction.mockReturnValue({ data: null, loading: false });

        render(<StockDetailPage params={{ symbol: "INVALID" }} />);

        expect(screen.getByText("無法載入數據")).toBeInTheDocument();
        expect(screen.getByText("Network error")).toBeInTheDocument();
    });

    it("TC-1603: 成功載入應渲染圖表與統計卡片", () => {
        mockUseStockDetail.mockReturnValue({
            data: {
                metadata: { symbol: "2330", name: "台積電", market: "TW" },
                summary_stats: {
                    pe_ratio: 20.5,
                    pb_ratio: 3.5,
                    dividend_yield: 2.1,
                    roe: 25.3,
                },
                price_series: [],
            },
            loading: false,
            error: null,
        });
        mockUseAIPrediction.mockReturnValue({
            data: { predicted_5d_alpha: 0.05, win_rate: 0.65 },
            loading: false
        });

        render(<StockDetailPage params={{ symbol: "2330" }} />);

        // Chart should be rendered
        expect(screen.getByTestId("stock-chart")).toBeInTheDocument();
        expect(screen.getByTestId("ai-indicator")).toBeInTheDocument();

        // Stats cards should show values
        expect(screen.getByText("本益比 (PE)")).toBeInTheDocument();
        expect(screen.getByText("20.50x")).toBeInTheDocument();

        // Market info should be displayed in the Overview card
        expect(screen.getByText(/此標的隸屬於 TW 市場/)).toBeInTheDocument();

        // Header should no longer be in Page (moved to layout)
        // Back button should no longer be in Page (moved to layout)

        // Should show the new AI Insights tip
        expect(screen.getByText(/切換頂部/)).toBeInTheDocument();
        expect(screen.getByText(/AI 決策報告/)).toBeInTheDocument();
    });

    it("TC-1604: 無資料狀態應顯示預設錯誤訊息", () => {
        mockUseStockDetail.mockReturnValue({
            data: null,
            loading: false,
            error: null,
        });
        mockUseAIPrediction.mockReturnValue({ data: null, loading: false });

        render(<StockDetailPage params={{ symbol: "9999" }} />);

        expect(screen.getByText("無法載入數據")).toBeInTheDocument();
        expect(screen.getByText("找不到此標的資訊")).toBeInTheDocument();
    });
});
