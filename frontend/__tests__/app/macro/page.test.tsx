import React from "react";
import { render, screen } from "@testing-library/react";
import MacroPage from "@/app/macro/page";
import MacroIndicatorCard from "@/components/MacroIndicatorCard";
import IndicatorDetail from "@/app/macro/[indicator]/page";

// Mock next/navigation
jest.mock("next/navigation", () => ({
    usePathname: jest.fn(),
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
    AreaChart: ({ children }: any) => <svg>{children}</svg>,
    BarChart: ({ children }: any) => <svg>{children}</svg>,
    ComposedChart: ({ children }: any) => <svg>{children}</svg>,
    PieChart: ({ children }: any) => <svg>{children}</svg>,
    Area: () => <g />,
    Bar: () => <g />,
    Line: () => <g />,
    Pie: () => <g />,
    Cell: () => <g />,
    XAxis: () => <g />,
    YAxis: () => <g />,
    CartesianGrid: () => <g />,
    Tooltip: () => <div />,
    Legend: () => <div />,
    ReferenceLine: () => <g />,
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
}));

describe("å®è??‡æ?æ¨¡ç? (Macro)", () => {
    describe("?ºç?è·¯å?æ¸¬è©¦ (Happy Path)", () => {
        it("TC-5201: ç¶²æ ¼æ¸²æ?: /macro ?‰æ­£ç¢ºé¡¯ç¤?GDP, CPI, VIX ç­‰å…­å¤§æ?æ¨™å¡??, () => {
            render(<MacroPage />);
            expect(screen.getByText(/GDP/)).toBeInTheDocument();
            expect(screen.getByText(/CPI/)).toBeInTheDocument();
            expect(screen.getByText(/VIX/)).toBeInTheDocument();
        });

        it("TC-5202: ?‡æ??¡ç??§å®¹: MacroIndicatorCard ?‰é¡¯ç¤ºæ??°å€¼ã€è??–ç???Sparkline", () => {
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
            // Use regex to handle potential formatting (commas, spacing)
            expect(screen.getByText(/27.36/)).toBeInTheDocument();
            expect(screen.getByText(new RegExp(indicator.unit))).toBeInTheDocument();
            expect(screen.getByText(/\+2.80%/)).toBeInTheDocument();
            expect(screen.getByTestId("icon-trending-up")).toBeInTheDocument();
        });

        it("TC-5203: ?¡ç?å°Žèˆª: é»žæ??‡æ??¡ç??‰å??ªè‡³ /macro/[code]", () => {
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

        it("TC-7103: Warning: ?é¢å¿…é??…å«?Œæ¨¡?¬æ•¸?šå?ç¤ºã€ä?é¡¯çœ¼è­¦å?å­—æ¨£", () => {
            render(<MacroPage />);
            expect(screen.getByText(/æ­¤é??¢ç›®?ä½¿?¨æ¨¡?¬æ•¸?šå?ç¤?)).toBeInTheDocument();
        });

        it("TC-7101 (Mock Data): ç¢ºè? mockMacro ?¸æ?çµæ?ç¬¦å? Recharts è¦æ?", () => {
            const { MACRO_INDICATORS } = require("@/data/mockMacro");
            MACRO_INDICATORS.forEach((indicator: any) => {
                expect(indicator).toHaveProperty("historyData");
                expect(Array.isArray(indicator.historyData)).toBe(true);
                expect(indicator.historyData[0]).toHaveProperty("value");
            });
        });

        it("TC-7102 (Hydration): é©—è?å®è?è©³æ??æ¸²?“æ?æ¨™å??´å?ç¨±è?ä»?¢¼", () => {
            const { useParams } = require("next/navigation");
            useParams.mockReturnValue({ indicator: "cpi" });
            render(<IndicatorDetail />);

            expect(screen.getByText(/CPI/)).toBeInTheDocument();
            expect(screen.getByText(/æ¶ˆè²»?…ç‰©?¹æ???)).toBeInTheDocument();
        });

        it("TC-6103 (Chart): ?‰è??†ç„¡?¸æ??–æ•¸?šé??Žå??‚ç??–è¡¨?ç?é¡¯ç¤º", () => {
            // Render card with empty sparkline
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
            // Should render without crashing
            expect(screen.getByText(/NULL/)).toBeInTheDocument();
            expect(screen.getByText(/Empty/)).toBeInTheDocument();
        });
    });

    describe("?•æ?è·¯ç”±æ¸¬è©¦", () => {
        it("TC-5204: è©³æ??æ¸²?? /macro/[indicator] ?‰é¡¯ç¤ºæ?æ¨™å??´æ?è¿°è? 30 ?¥èµ°??, () => {
            const { useParams } = require("next/navigation");
            useParams.mockReturnValue({ indicator: "gdp" });

            render(<IndicatorDetail />);

            // Match actual translation in data
            expect(screen.getByText(/?‹å…§?Ÿç”¢ç¸½å€?)).toBeInTheDocument();
            expect(screen.getByText(/?¸æ?ä¾†æ?/)).toBeInTheDocument();
        });

        it("TC-5205: æ­·å²è¡¨æ ¼: ?‡æ?è©³æ??æ?é¡¯ç¤ºæ­·å²?¸æ?è¡¨æ ¼", () => {
            const { useParams } = require("next/navigation");
            useParams.mockReturnValue({ indicator: "cpi" });

            render(<IndicatorDetail />);

            expect(screen.getByText(/æ­·å²?¸æ?/)).toBeInTheDocument();
            expect(screen.queryAllByRole("row").length).toBeGreaterThan(5);
        });

        it("TC-6201: Route: è¨ªå??¡æ??‡æ?ä»?¢¼ (e.g., /macro/unknown) ?‰é¡¯ç¤ºã€Œæ‰¾ä¸åˆ°?‡æ??è???, () => {
            const { useParams } = require("next/navigation");
            useParams.mockReturnValue({ indicator: "unknown" });

            render(<IndicatorDetail />);

            expect(screen.getByText(/?¾ä??°æ?æ¨?)).toBeInTheDocument();
        });

        it("TC-6101 (Macro): ?¶æ?æ¨™ä»£ç¢¼ç‚ºå°å¯«??(e.g., /macro/gdp)ï¼Œæ??½æ­£ç¢ºè??¥ä¸¦æ¸²æ?", () => {
            const { useParams } = require("next/navigation");
            useParams.mockReturnValue({ indicator: "gdp" });

            render(<IndicatorDetail />);
            expect(screen.getByText(/GDP/)).toBeInTheDocument();
            expect(screen.getByText(/?‹å…§?Ÿç”¢ç¸½å€?)).toBeInTheDocument();
        });

        it("TC-6102 (Indicator): ?‰è??†è??–ç???0 ?‚ç?è¶¨å‹¢é¡¯ç¤º (é¡¯ç¤º Minus ?–æ?)", () => {
            const { useParams } = require("next/navigation");
            useParams.mockReturnValue({ indicator: "fedfunds" }); // FEDFUNDS has 0% change in mockMacro

            render(<IndicatorDetail />);
            // Should show 0.00%
            expect(screen.getByText(/0.00%/)).toBeInTheDocument();
            // Should show minus icon
            expect(screen.getByTestId("icon-minus")).toBeInTheDocument();
        });
    });

    describe("?¯è¨ª?æ€§è? UI/UX", () => {
        it("TC-8001 (Pointer): ?‡æ??¡ç??‰å…·??cursor-pointer", () => {
            render(<MacroPage />);
            // Find a card link and its content div
            const links = screen.getAllByRole("link");
            links.forEach(link => {
                expect(link.firstChild).toHaveClass("cursor-pointer");
            });
        });

        it("TC-8002 (Hover): ?‡æ??¡ç??‰å…·?‰æ‡¸?œç™¼??(Glow) æ¨??", () => {
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
            // Check for border transition or specific glass-morphism classes
            const card = screen.getByRole("link").firstChild;
            expect(card).toHaveClass("hover:border-white/30");
        });

        it("TC-8003 (RWD): ?¨è??•ç«¯å¯¬åº¦ä¸‹ï??‡æ?ç¶²æ ¼?‰æ­£ç¢ºé?ç½?Grid æ¬„ä?", () => {
            const { container } = render(<MacroPage />);
            const grid = container.querySelector(".grid");
            expect(grid).toHaveClass("grid-cols-1"); // Mobile first
            expect(grid).toHaveClass("lg:grid-cols-3"); // Desktop
        });
    });
});
