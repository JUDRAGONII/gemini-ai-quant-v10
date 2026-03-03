/**
 * @file stock_optimization.test.tsx
 * @description 驗證 Phase 8.7 的個股詳情佈局優化與 AI 報告標籤整合
 * @date 2026-02-02
 */
import { render, screen, fireEvent } from "@testing-library/react";
import StockDetailLayout from "@/app/stocks/[symbol]/layout";
import StockDetailPage from "@/app/stocks/[symbol]/page";
import StockReportPage from "@/app/stocks/[symbol]/report/page";
import ScoreRadarChart from "@/components/ScoreRadarChart";
import "@testing-library/jest-dom";
import React from 'react';

// Mock Bilingual
jest.mock('@/components/ui/Bilingual', () => ({
    __esModule: true,
    Bilingual: ({ zh, en }: any) => <span data-testid="mock-bilingual">{zh} | {en}</span>,
}));

// Mock ESM modules
jest.mock("react-markdown", () => ({
    __esModule: true,
    default: ({ children }: any) => <div>{children}</div>,
}));
jest.mock("remark-gfm", () => ({
    __esModule: true,
    default: () => { },
}));

// --- Mocks ---

// Mock next/navigation
const mockPush = jest.fn();
const mockPathname = jest.fn();
jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: mockPush }),
    usePathname: () => mockPathname(),
    useParams: () => ({ symbol: "2330" }),
}));

// Mock useStockDetail hook
const mockUseStockDetail = jest.fn();
jest.mock("@/hooks/useStockDetail", () => ({
    useStockDetail: (symbol: string) => mockUseStockDetail(symbol),
}));

// Mock useAIPrediction hook
const mockUseAIPrediction = jest.fn();
jest.mock("@/hooks/useAIPrediction", () => ({
    useAIPrediction: (symbol: string) => mockUseAIPrediction(symbol),
}));

// Mock useSWR
const mockUseSWR = jest.fn();
jest.mock("swr", () => ({
    __esModule: true,
    default: (key: string) => mockUseSWR(key),
}));

// Mock Components
jest.mock("@/components/Chart/KLineChart", () => ({
    KLineChart: () => <div data-testid="k-line-chart" />
}));
jest.mock("@/components/Chart/TechnicalIndicatorPanel", () => ({
    TechnicalIndicatorPanel: () => <div data-testid="tech-panel" />
}));
jest.mock("@/components/AI/AIPredictionIndicator", () => ({
    AIPredictionIndicator: () => <div data-testid="ai-indicator" />
}));

// Mock Recharts for ScoreRadarChart
jest.mock("recharts", () => ({
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    RadarChart: ({ children }: any) => <svg data-testid="radar-chart">{children}</svg>,
    PolarGrid: () => <g />,
    PolarAngleAxis: () => <g />,
    PolarRadiusAxis: () => <g />,
    Radar: () => <g />,
    Legend: () => <div />,
    Tooltip: () => <div />,
}));

// --- Test Suites ---

describe("Phase 8.7 個股詳情優化測試", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockPathname.mockReturnValue("/stocks/2330");
        mockUseStockDetail.mockReturnValue({
            data: {
                metadata: { symbol: "2330", name: "台積電", market: "TW" },
                summary_stats: { last_price: 1775, pe_ratio: 20, pb_ratio: 5, dividend_yield: 2, roe: 30 },
                price_series: []
            },
            loading: false
        });
        mockUseAIPrediction.mockReturnValue({ data: {}, loading: false });
    });

    describe("Layout & Navigation (Layout 測試)", () => {
        it("TC-1101: 頂部返回按鈕渲染", () => {
            render(<StockDetailLayout params={{ symbol: "2330" }}><div>Content</div></StockDetailLayout>);
            const backBtn = screen.getByText("返回行情中心");
            expect(backBtn).toBeInTheDocument();
            expect(backBtn.closest('a')).toHaveAttribute('href', '/stocks');
        });

        it("TC-1102: AI 決策報告標籤存在性", () => {
            render(<StockDetailLayout params={{ symbol: "2330" }}><div>Content</div></StockDetailLayout>);
            expect(screen.getByText("AI 決策報告")).toBeInTheDocument();
        });

        it("TC-4002: 圖示渲染正確性", () => {
            // 確認包含所有標籤名稱，FileText 是 AI 決策報告的圖示
            render(<StockDetailLayout params={{ symbol: "2330" }}><div>Content</div></StockDetailLayout>);
            expect(screen.getByText("AI 決策報告")).toBeInTheDocument();
            expect(screen.getByText("總覽")).toBeInTheDocument();
            expect(screen.getByText("籌碼分析")).toBeInTheDocument();
        });
    });

    describe("Page Content (總覽頁測試)", () => {
        it("TC-4001: 冗餘按鈕移除", () => {
            render(<StockDetailPage params={{ symbol: "2330" }} />);
            // 不應再能透過 getByText 找到舊版頁面內的返回按鈕 (因為原本叫 "返回行情中心" 的有兩個，現在 Page 內移除了)
            // 這裡我們檢查 Page 內是否渲染了新版的操作提示
            expect(screen.getByText(/切換頂部/)).toBeInTheDocument();
            expect(screen.getByText(/AI 決策報告/)).toBeInTheDocument();

            // 確保原本在 Page 內部的大型返回按鈕 Link 不再存在 (我們通過 Mock Link 分辨)
            // 由於 Layout 也有一個報回行情中心，所以我們檢查 Page 渲染出的內容是否排除了該按鈕
            // 注意：render(<StockDetailPage />) 只會渲染子組件，不含 Layout
            expect(screen.queryByText("返回行情中心")).not.toBeInTheDocument();
        });
    });

    describe("AI Report Tab (報告分頁測試)", () => {
        it("TC-1103: 報告分頁內容加載", () => {
            mockUseSWR.mockReturnValue({
                data: {
                    title: "台積電 AI 分譯報告",
                    report_date: "2026-02-02",
                    summary: "分析摘要文字",
                    full_content: "### 詳細分析內容",
                    composite_score: 85,
                    ai_rating: "強力買進",
                    confidence: "極高",
                    target_price: 1900,
                    stop_profit: 2100,
                    stop_loss: 1650
                },
                error: null,
                isLoading: false
            });

            render(<StockReportPage />);
            expect(screen.getByText("台積電 AI 分譯報告")).toBeInTheDocument();
            expect(screen.getByText("強力買進")).toBeInTheDocument();
            expect(screen.getAllByText("85").length).toBeGreaterThanOrEqual(1);
            expect(screen.getByTestId("radar-chart")).toBeInTheDocument();
        });

        it("TC-2101: 報告數據缺失處理", () => {
            mockUseSWR.mockReturnValue({ data: null, error: null, isLoading: false });
            render(<StockReportPage />);
            expect(screen.getByText("暫無 AI 決策報告")).toBeInTheDocument();
        });
    });

    describe("Data Consistency (評分一致性測試)", () => {
        it("TC-3101: 加權總分同步", () => {
            const radarData = [
                { dimension: "價值", score: 80, fullMark: 100 },
                { dimension: "成長", score: 70, fullMark: 100 },
                { dimension: "動能", score: 60, fullMark: 100 },
                { dimension: "品質", score: 90, fullMark: 100 },
                { dimension: "籌碼", score: 50, fullMark: 100 },
            ];
            // 排行榜計算的加權分是 80，我們傳給 RadarChart
            render(<ScoreRadarChart data={radarData} symbol="NVDA" customScore={80} />);

            // 算術平均為 70，但傳入 customScore 80 應顯示 80
            expect(screen.getByText("分 | pts")).toBeInTheDocument();
            expect(screen.getByText("S")).toBeInTheDocument(); // 80 是 S
        });
    });
});
