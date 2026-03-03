import React from "react";
import { render, screen } from "@testing-library/react";
import MarginPage from "@/app/chips/margin/page";
import InstitutionalPage from "@/app/chips/institutional/page";
import ChipsPage from "@/app/chips/page";

jest.mock("@/hooks/useChipsData", () => ({
    useChipsData: () => ({
        chipsData: [
            {
                date: "2024-03-01",
                price: 700,
                foreign: 100000000,
                trust: 50000000,
                dealer: 20000000,
                total_institutional: 170000000,
                margin_balance: 50000,
                margin_change: 1000,
                short_balance: 1000,
                short_change: -100,
                short_ratio: 5.5
            }
        ],
        isLoading: false,
        isError: false
    })
}));

jest.mock("@/components/ui/Bilingual", () => ({
    Bilingual: ({ zh }: { zh: string }) => <span>{zh}</span>
}));

// Mock Recharts
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
    // Add SVG sub-components used in margin page
    Defs: ({ children }: any) => <defs>{children}</defs>,
    LinearGradient: ({ children }: any) => <linearGradient>{children}</linearGradient>,
    Stop: () => <stop />,
}));

// Mock custom components
jest.mock("@/components/ChipChart", () => {
    return function MockChipChart() {
        return <div data-testid="chip-chart">Mock Chip Chart</div>;
    };
});

// Mock Lucide icons
jest.mock("lucide-react", () => ({
    Wallet: () => <div />,
    TrendingUp: () => <div />,
    TrendingDown: () => <div />,
    Percent: () => <div />,
    Building2: () => <div />,
    Users: () => <div />,
    Info: () => <div />,
    ChevronUp: () => <div />,
    ChevronDown: () => <div />,
    DollarSign: () => <div />,
    Layers: () => <div />,
    BarChart: () => <div />,
}));

describe("籌碼分析模組 (Chips - Pages)", () => {
    describe("融資融券頁面 (Margin)", () => {
        it("TC-5104: 融資頁數據: chips/margin 應渲染融資走勢與券資比圖表", () => {
            render(<MarginPage />);
            expect(screen.getAllByText(/融資餘額/)[0]).toBeInTheDocument();
            expect(screen.getAllByText(/融券餘額/)[0]).toBeInTheDocument();
            expect(screen.getAllByText(/券資比/)[0]).toBeInTheDocument();
        });
    });

    describe("三大法人頁面 (Institutional)", () => {
        it("TC-5105: 法人頁數據: chips/institutional 應渲染法人買賣超堆疊圖", () => {
            render(<InstitutionalPage />);
            expect(screen.getByText(/三大法人買賣超趨勢/)).toBeInTheDocument();
            // Use getAllByText because labels appear in multiple places (cards, list, etc.)
            expect(screen.getAllByText(/外資/)[0]).toBeInTheDocument();
            expect(screen.getAllByText(/投信/)[0]).toBeInTheDocument();
            expect(screen.getAllByText(/自營商/)[0]).toBeInTheDocument();
        });
    });

    describe("籌碼總覽頁 (Overview)", () => {
        it("TC-5106: 統計卡片: 籌碼總覽頁應顯示外資、投信與融資之統計卡片", () => {
            render(<ChipsPage />);
            expect(screen.getByText(/法人動向/)).toBeInTheDocument();
            expect(screen.getAllByText(/外資買賣超/)[0]).toBeInTheDocument();
            expect(screen.getAllByText(/投信買賣超/)[0]).toBeInTheDocument();
            expect(screen.getAllByText(/融資餘額/)[0]).toBeInTheDocument();
        });
    });
});
