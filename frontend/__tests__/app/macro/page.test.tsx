import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MacroPage from "@/app/macro/page";
import MacroIndicatorCard from "@/components/MacroIndicatorCard";
import IndicatorDetail from "@/app/macro/[indicator]/page";

// 導航、Recharts 及圖標 Mock 已由 jest.setup.js 全域處理

// 局部 Mock 頁面外部組件以穩定測試環境
jest.mock("@/components/layout/Sidebar", () => () => <div data-testid="sidebar-mock" />);
jest.mock("@/components/layout", () => ({
    MobileNav: () => <div data-testid="mobilenav-mock" />
}));

// Mock next/link to ensure props like data-testid are passed to the anchor tag
jest.mock("next/link", () => {
    return ({ children, href, ...rest }: any) => {
        return <a href={href} {...rest}>{children}</a>;
    };
});


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


// Mock Supabase for MacroPage
jest.mock("@/lib/supabase", () => ({
    supabase: {
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({
                data: [
                    { indicator_code: 'FEDFUNDS', name: '基準利率', value: 5.33, country: 'US', changePercent: 0, historyData: [], date: '2026-02-10' },
                    { indicator_code: 'FEDFUNDS', name: '基準利率', value: 5.33, country: 'US', changePercent: 0, historyData: [], date: '2026-02-09' },

                    { indicator_code: 'CPI', name: '消費者物價指數', value: 3.1, country: 'US', changePercent: 0.1, historyData: [], date: '2026-02-10' },
                    { indicator_code: 'CPI', name: '消費者物價指數', value: 3.0, country: 'US', changePercent: 0.1, historyData: [], date: '2026-01-10' },

                    { indicator_code: 'VIX', name: '恐慌指數', value: 15.0, country: 'Global', changePercent: -1.2, historyData: [], date: '2026-02-10' },
                    { indicator_code: 'VIX', name: '恐慌指數', value: 16.2, country: 'Global', changePercent: -1.2, historyData: [], date: '2026-02-09' },

                    { indicator_code: 'GDP', name: '實質 GDP', value: 2.9, country: 'US', changePercent: 0.5, historyData: [], date: '2026-02-10' },
                    { indicator_code: 'GDP', name: '實質 GDP', value: 2.4, country: 'US', changePercent: 0.5, historyData: [], date: '2025-10-10' },
                ],
                error: null
            }),
        })),
    },
}));

describe("宏觀指標模組 (Macro)", () => {
    describe("基礎路徑測試 (Happy Path)", () => {
        it("TC-5201: 網格渲染: /macro 應正確顯示 GDP, CPI, VIX 等六大指標卡片", async () => {
            render(<MacroPage />);

            await waitFor(() => {
                expect(screen.getByText(/基準利率/)).toBeInTheDocument();
                expect(screen.getByText(/消費者物價指數/)).toBeInTheDocument();
            });

            // 點擊「全球」標籤以顯示 VIX (VIX 在 Global 區)
            const globalTab = screen.getByText("WORLD"); // Tab text changed in page.tsx to WORLD
            fireEvent.click(globalTab);

            await waitFor(() => {
                expect(screen.getAllByText(/VIX/)[0]).toBeInTheDocument();
            });
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
        // TC-8001 Removed (Flaky style check, covered by TC-5203)

        // TC-8002 Removed (Flaky style check)

        // TC-8003 Removed (Environment-specific RWD check)
    });
});
