import { render, screen, fireEvent } from "@testing-library/react";
import StockDetailPage from "@/app/stocks/[symbol]/page";
import "@testing-library/jest-dom";

// Mock Components
jest.mock("@/components/Chart/StockChart", () => ({
    __esModule: true,
    StockChart: () => <div data-testid="price-chart" />
}));
jest.mock("@/components/ScoreRadarChart", () => ({
    __esModule: true,
    default: () => <div data-testid="score-radar-chart" />
}));

jest.mock("lucide-react", () => ({
    ArrowLeft: () => <div data-testid="icon-arrow-left" />,
    TrendingUp: () => <div />,
    TrendingDown: () => <div />,
    DollarSign: () => <div />,
    Activity: () => <div />,
    BarChart3: () => <div />,
    FileText: () => <div />,
    Settings: () => <div />,
    Layers: () => <div />,
    Home: () => <div />,
    Building2: () => <div />,
    Percent: () => <div />,
}));

// Mock Data
jest.mock("@/data/mockStocks", () => ({
    findStockBySymbol: (symbol: string) => {
        if (symbol === "2330") return {
            symbol: "2330", name: "台積電", price: 580, changePercent: 1.5, market: "TW",
            info: { industry: "Semi", marketCap: "15T", pe: 20, eps: 30, dividend: 2 },
            priceHistory: []
        };
        if (symbol === "AAPL" || symbol === "aapl") return {
            symbol: "AAPL", name: "Apple", price: 180, changePercent: -0.5, market: "US",
            info: { industry: "Tech", marketCap: "3T", pe: 30, eps: 6, dividend: 0.5 },
            priceHistory: []
        };
        return null;
    }
}));

// Mock Navigation
const mockBack = jest.fn();
const mockUseParams = jest.fn();
jest.mock("next/navigation", () => ({
    useParams: () => mockUseParams(),
    useRouter: () => ({ back: mockBack }),
}));

// Mock Hook
jest.mock("@/hooks/useStockDetail", () => ({
    useStockDetail: (symbol: string) => {
        if (symbol === "2330") return {
            data: {
                metadata: { symbol: "2330", name: "台積電", market: "TW" },
                summary_stats: { pe_ratio: 20, pb_ratio: 3.5, dividend_yield: 2, roe: 30 },
                price_series: []
            },
            isLoading: false, error: null
        };
        if (symbol === "AAPL" || symbol === "aapl") return {
            data: {
                metadata: { symbol: "AAPL", name: "Apple", market: "US" },
                summary_stats: { pe_ratio: 30, pb_ratio: 15, dividend_yield: 0.5, roe: 45 },
                price_series: []
            },
            isLoading: false, error: null
        };
        return { data: null, isLoading: false, error: true };
    }
}));

describe("StockDetailPage 整合測試", () => {
    beforeEach(() => {
        mockUseParams.mockReturnValue({ symbol: "2330" });
    });

    it("TC-1601: /stocks/[symbol] 應正確載入個股數據", () => {
        render(<StockDetailPage params={{ symbol: '2330' }} />);
        expect(screen.getByText("2330")).toBeInTheDocument();
        expect(screen.getByText("台積電")).toBeInTheDocument();
        expect(screen.getByTestId("price-chart")).toBeInTheDocument();
    });

    it("TC-1602: 不存在的 symbol 應顯示「找不到股票」訊息", () => {
        mockUseParams.mockReturnValue({ symbol: "9999" });
        render(<StockDetailPage params={{ symbol: '9999' }} />);
        expect(screen.getByText("找不到股票: 9999")).toBeInTheDocument();
    });

    it("TC-1603: 返回按鈕應正確導航至上一頁", () => {
        render(<StockDetailPage params={{ symbol: '2330' }} />);
        const backBtn = screen.getByTestId("icon-arrow-left").closest("button");
        fireEvent.click(backBtn!);
        expect(mockBack).toHaveBeenCalled();
    });

    it("TC-2203: URL 中的 symbol 應處理大小寫不一致", () => {
        mockUseParams.mockReturnValue({ symbol: "aapl" });
        render(<StockDetailPage params={{ symbol: 'aapl' }} />);
        expect(screen.getByText("Apple")).toBeInTheDocument();
    });
});
