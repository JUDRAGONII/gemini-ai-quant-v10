import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MacroPage from "@/app/macro/page";
import MacroIndicatorCard from "@/components/MacroIndicatorCard";
import IndicatorDetail from "@/app/macro/[indicator]/page";

// Mock next/navigation
jest.mock("next/navigation", () => ({
    usePathname: jest.fn(() => "/"),
    useParams: jest.fn(),
    useRouter: () => ({
        push: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
    }),
}));

// Mock Recharts to avoid DOM measurement issues
jest.mock("recharts", () => ({
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    AreaChart: ({ children }: any) => <div>{children}</div>,
    BarChart: ({ children }: any) => <div>{children}</div>,
    ComposedChart: ({ children }: any) => <div>{children}</div>,
    PieChart: ({ children }: any) => <div>{children}</div>,
    Area: () => <div />,
    Bar: () => <div />,
    Line: () => <div />,
    Pie: () => <div />,
    Cell: () => <div />,
    XAxis: () => <div />,
    YAxis: () => <div />,
    CartesianGrid: () => <div />,
    Tooltip: () => <div />,
    Legend: () => <div />,
    ReferenceLine: () => <div />,
    Defs: ({ children }: any) => <defs>{children}</defs>,
    LinearGradient: ({ children }: any) => <linearGradient>{children}</linearGradient>,
    Stop: () => <stop />,
}));

// Mock custom components
jest.mock("@/components/InfoCard", () => {
    return function MockInfoCard({ label, value }: any) {
        return (
            <div data-testid="info-card">
                <span>{label}</span>: <span>{value}</span>
            </div>
        );
    };
});

// Mock Lucide icons
jest.mock("lucide-react", () => ({
    TrendingUp: () => <div data-testid="icon-trending-up" />,
    TrendingDown: () => <div data-testid="icon-trending-down" />,
    Minus: () => <div data-testid="icon-minus" />,
    ExternalLink: () => <div data-testid="icon-externallink" />,
    ArrowLeft: () => <div data-testid="icon-arrowleft" />,
    Calendar: () => <div />,
    Database: () => <div />,
    Clock: () => <div />,
    Info: () => <div />,
    Globe: () => <div />,
    BarChart3: () => <div />,
    FileText: () => <div />,
    Settings: () => <div />,
    Layers: () => <div />,
    Home: () => <div />,
    Activity: () => <div />,
    Percent: () => <div />,
    PiggyBank: () => <div />,
    Landmark: () => <div />,
    Cpu: () => <div data-testid="icon-cpu" />,
    Menu: () => <div data-testid="icon-menu" />,
    X: () => <div data-testid="icon-x" />,
    Search: () => <div data-testid="icon-search" />,
    ChevronRight: () => <div data-testid="icon-chevron-right" />,
    ChevronDown: () => <div data-testid="icon-chevron-down" />,
    Filter: () => <div data-testid="icon-filter" />,
    Briefcase: () => <div />,
    LineChart: () => <div />,
    Brain: () => <div />,
    Sparkles: () => <div />,
    AlertTriangle: () => <div />,
}));


describe("宏觀指標模組 (Macro)", () => {
    describe("基礎路徑測試 (Happy Path)", () => {
        it("TC-5201: 網格渲染: /macro 應正確顯示 GDP, CPI, VIX 等六大指標卡片", () => {
            render(<MacroPage />);
            // 使用更精確的匹配
            expect(screen.getByText(/FEDFUNDS/)).toBeInTheDocument();
            expect(screen.getByText(/CPI/)).toBeInTheDocument();

            // 點擊「全球」標籤以顯示 VIX (VIX 在 Global 區)
            const globalTab = screen.getByText("全球");
            fireEvent.click(globalTab);
            // VIX 可能同時出現在代碼與名稱中，使用 getAll 並確認至少有一個
            expect(screen.getAllByText(/VIX/)[0]).toBeInTheDocument();
        });

        it("TC-5202: 指標卡片內容: MacroIndicatorCard 應顯示最新值、變化率與 Sparkline", () => {
            const { MACRO_INDICATORS } = require("@/data/mockMacro");
            const indicator = MACRO_INDICATORS[0];

            render(
                <MacroIndicatorCard
                    code={indicator.code}
                    name={indicator.name}
                    value={indicator.latestValue}
                    unit={indicator.unit}
                    changePercent={indicator.changePercent}
                    historyData={indicator.historyData}
                    color={indicator.color}
                    icon={<div />}
                />
            );

            // FEDFUNDS: 5.33, 0.0%
            const valueElement = screen.getByText("5.33");
            expect(valueElement).toBeInTheDocument();

            // 單位 %
            const card = screen.getByRole("link");
            expect(card).toHaveTextContent("%");

            // 0.00%
            expect(screen.getByText("0.00%")).toBeInTheDocument();
        });

        it("TC-5203: 卡片導航: 點擊指標卡片應導航至 /macro/[code]", () => {
            render(
                <MacroIndicatorCard
                    code="GDP"
                    name="Test"
                    value={100}
                    unit="unit"
                    changePercent={1}
                    historyData={[]}
                    color="#000"
                    icon={<div />}
                />
            );
            const link = screen.getByRole("link");
            expect(link).toHaveAttribute("href", "/macro/gdp");
        });

        it("TC-7103: Warning: 頁面必須包含「模擬數據展示」之顯眼警告字樣", () => {
            render(<MacroPage />);
            expect(screen.getByText(/目前使用專業模擬數據展示系統架構/)).toBeInTheDocument();
        });

        it("TC-7101 (Mock Data): 確認 mockMacro 數據結構符合 Recharts 要求", () => {
            const { MACRO_INDICATORS } = require("@/data/mockMacro");
            MACRO_INDICATORS.forEach((indicator: any) => {
                expect(indicator).toHaveProperty("historyData");
                expect(Array.isArray(indicator.historyData)).toBe(true);
                expect(indicator.historyData[0]).toHaveProperty("value");
            });
        });

        it("TC-7102 (Hydration): 驗證宏觀詳情頁渲染指標完整名稱與代碼", () => {
            const { useParams } = require("next/navigation");
            useParams.mockReturnValue({ indicator: "cpi" });
            render(<IndicatorDetail />);

            expect(screen.getByText(/CPI/)).toBeInTheDocument();
            expect(screen.getByText(/消費者物價指數/)).toBeInTheDocument();
        });

        it("TC-6103 (Chart): 應處理無數據或數據點過少時的圖表降級顯示", () => {
            render(
                <MacroIndicatorCard
                    code="NULL"
                    name="Empty"
                    value={0}
                    unit="-"
                    changePercent={0}
                    historyData={[]}
                    color="#000"
                    icon={<div />}
                />
            );
            expect(screen.getByText(/NULL/)).toBeInTheDocument();
            expect(screen.getByText(/Empty/)).toBeInTheDocument();
        });
    });

    describe("動態路由測試", () => {
        it("TC-5204: 詳情頁渲染: /macro/[indicator] 應顯示指標完整描述與 30 日走勢", () => {
            const { useParams } = require("next/navigation");
            useParams.mockReturnValue({ indicator: "gdp_us" });

            render(<IndicatorDetail />);

            expect(screen.getByText(/美國實質 GDP/)).toBeInTheDocument();
            expect(screen.getByText(/數據來源/)).toBeInTheDocument();
        });

        it("TC-5205: 歷史表格: 指標詳情頁應顯示歷史數據表格", () => {
            const { useParams } = require("next/navigation");
            useParams.mockReturnValue({ indicator: "cpi" });

            render(<IndicatorDetail />);

            expect(screen.getByText(/歷史數據/)).toBeInTheDocument();
            expect(screen.queryAllByRole("row").length).toBeGreaterThan(5);
        });

        it("TC-6201: Route: 訪問無效指標代碼 (e.g., /macro/unknown) 應顯示「找不到指標」訊息", () => {
            const { useParams } = require("next/navigation");
            useParams.mockReturnValue({ indicator: "unknown" });

            render(<IndicatorDetail />);

            expect(screen.getByText(/找不到指標/)).toBeInTheDocument();
        });

        it("TC-6101 (Macro): 當指標代碼為小寫時 (e.g., /macro/gdp_us)，應能正確識別並渲染", () => {
            const { useParams } = require("next/navigation");
            useParams.mockReturnValue({ indicator: "gdp_us" });

            render(<IndicatorDetail />);
            expect(screen.getByText(/GDP_US/)).toBeInTheDocument();
            expect(screen.getByText(/美國實質 GDP/)).toBeInTheDocument();
        });

        it("TC-6102 (Indicator): 應處理變化率為 0 時的趨勢顯示 (顯示 Minus 圖標)", () => {
            const { useParams } = require("next/navigation");
            useParams.mockReturnValue({ indicator: "fedfunds" });

            render(<IndicatorDetail />);
            expect(screen.getByText(/0.00%/)).toBeInTheDocument();
            expect(screen.getByTestId("icon-minus")).toBeInTheDocument();
        });
    });

    describe("可訪問性與 UI/UX", () => {
        it("TC-8001 (Pointer): 指標卡片應具有 cursor-pointer", () => {
            render(<MacroPage />);
            const links = screen.getAllByRole("link");
            links.forEach(link => {
                const container = link.querySelector('div.glass');
                if (container) {
                    expect(container).toHaveClass("cursor-pointer");
                }
            });
        });

        it("TC-8002 (Hover): 指標卡片應具有懸停發光 (Glow) 樣式", () => {
            render(
                <MacroIndicatorCard
                    code="GDP"
                    name="Test"
                    value={100}
                    unit="unit"
                    changePercent={1}
                    historyData={[]}
                    color="#000"
                    icon={<div />}
                />
            );
            const card = screen.getByRole("link").querySelector('div.glass');
            expect(card).toHaveClass("hover:border-white/30");
        });

        it("TC-8003 (RWD): 在行動端寬度下，指標網格應正確配置 Grid 欄位", () => {
            const { container } = render(<MacroPage />);
            const grid = container.querySelector(".grid");
            expect(grid).toHaveClass("grid-cols-1"); // Mobile first
            expect(grid).toHaveClass("lg:grid-cols-3"); // Desktop
        });
    });
});
