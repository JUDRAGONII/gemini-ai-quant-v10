/**
 * @file page.test.tsx
 * @description StockDetailPage 元件測試
 * @updated 2026-01-27 - 完全重寫以匹配實際元件實作
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
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
    TrendingUp: () => <svg data-testid="icon-trending-up" />,
    BarChart3: () => <svg data-testid="icon-bar-chart" />,
    PieChart: () => <svg data-testid="icon-pie-chart" />,
    Activity: () => <svg data-testid="icon-activity" />,
}));

// Mock useStockDetail hook - 關鍵：返回 loading 而非 isLoading
const mockUseStockDetail = jest.fn();
jest.mock("@/hooks/useStockDetail", () => ({
    useStockDetail: (...args: any[]) => mockUseStockDetail(...args),
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

        render(<StockDetailPage params={{ symbol: "2330" }} />);

        // Component shows a spinner div with specific classes when loading
        const spinner = document.querySelector(".animate-spin");
        expect(spinner).toBeInTheDocument();
    });

    it("TC-1602: 錯誤狀態應顯示錯誤訊息", () => {
        mockUseStockDetail.mockReturnValue({
            data: null,
            loading: false,
            error: "Network error",
        });

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

        render(<StockDetailPage params={{ symbol: "2330" }} />);

        // Chart should be rendered
        expect(screen.getByTestId("stock-chart")).toBeInTheDocument();

        // Stats cards should show values
        expect(screen.getByText("本益比 (PE)")).toBeInTheDocument();
        expect(screen.getByText("20.50x")).toBeInTheDocument();

        // Market info should be displayed
        expect(screen.getByText(/TW 市場/)).toBeInTheDocument();

        // Action button should be present
        expect(screen.getByText("啟動 AI 深度辯證")).toBeInTheDocument();
    });

    it("TC-1604: 無資料狀態應顯示預設錯誤訊息", () => {
        mockUseStockDetail.mockReturnValue({
            data: null,
            loading: false,
            error: null,
        });

        render(<StockDetailPage params={{ symbol: "9999" }} />);

        expect(screen.getByText("無法載入數據")).toBeInTheDocument();
        expect(screen.getByText("找不到此標的資訊")).toBeInTheDocument();
    });
});
