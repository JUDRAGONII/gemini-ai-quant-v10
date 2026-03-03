import React from "react";
import { render, screen } from "@testing-library/react";
import ChipsLayout from "@/app/chips/layout";
import { usePathname } from "next/navigation";

// Mock Sidebar 與 MobileNav 以隔離 Layout 測試，避免 Bilingual 組件在 JSDOM 中的編碼干擾
jest.mock('@/components/layout/Sidebar', () => {
    return function MockSidebar() {
        return <nav data-testid="sidebar">Sidebar</nav>;
    };
});

jest.mock('@/components/layout', () => ({
    MobileNav: function MockMobileNav() {
        return <div data-testid="mobile-nav">MobileNav</div>;
    },
}));

describe("籌碼分析模組 (Chips)", () => {
    describe("基礎路徑測試 (Happy Path)", () => {
        it("TC-5101: 佈局渲染: chips/layout.tsx 應正確渲染 Tab 導航列", () => {
            (usePathname as jest.Mock).mockReturnValue("/chips");
            render(
                <ChipsLayout>
                    <div data-testid="children">Content</div>
                </ChipsLayout>
            );

            expect(screen.getByText("主力籌碼透視")).toBeInTheDocument();
            expect(screen.getByText("總覽")).toBeInTheDocument();
            expect(screen.getByText("融資融券")).toBeInTheDocument();
            expect(screen.getByText("三大法人")).toBeInTheDocument();
            expect(screen.getByTestId("children")).toBeInTheDocument();
        });

        it("TC-5102: 導航跳轉 (融資): 點擊「融資融券」Tab 應正確導航至 /chips/margin", () => {
            (usePathname as jest.Mock).mockReturnValue("/chips");
            render(<ChipsLayout><div /></ChipsLayout>);

            const marginLink = screen.getByText("融資融券").closest("a");
            expect(marginLink).toHaveAttribute("href", "/chips/margin");
        });

        it("TC-5103: 導航跳轉 (法人): 點擊「三大法人」Tab 應正確導航至 /chips/institutional", () => {
            (usePathname as jest.Mock).mockReturnValue("/chips");
            render(<ChipsLayout><div /></ChipsLayout>);

            const instLink = screen.getByText("三大法人").closest("a");
            expect(instLink).toHaveAttribute("href", "/chips/institutional");
        });
    });
});
