/**
 * Phase 4.4 MobileNav 響應式導航測試
 * @description 驗證 Mobile 導航組件的 RWD 行為與 A11y
 * @version 1.2.0 (Complete Coverage)
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock next/navigation
jest.mock("next/navigation", () => ({
    usePathname: () => "/",
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

// Mock next/link
jest.mock("next/link", () => {
    return ({ children, href, onClick, className }: { children: React.ReactNode; href: string; onClick?: () => void; className?: string }) => (
        <a href={href} onClick={onClick} className={className}>{children}</a>
    );
});

// Mock lucide-react
jest.mock("lucide-react", () => ({
    Menu: () => <span data-testid="menu-icon">Menu</span>,
    X: () => <span data-testid="close-icon">X</span>,
    Activity: () => <span>Activity</span>,
    TrendingUp: () => <span>TrendingUp</span>,
    BarChart3: () => <span>BarChart3</span>,
    FileText: () => <span>FileText</span>,
    Settings: () => <span>Settings</span>,
    Cpu: () => <span>Cpu</span>,
    Layers: () => <span>Layers</span>,
}));

import { MobileNav } from "@/components/layout/MobileNav";

describe("MobileNav 響應式導航 (Phase 4.4 RWD)", () => {
    describe("基礎渲染 (TC-1XXX)", () => {
        it("TC-1404: 應正確渲染頂部 Header 與漢堡按鈕", () => {
            render(<MobileNav />);
            expect(screen.getByText(/AI QUANT/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/開啟選單/i)).toBeInTheDocument();
        });
    });

    describe("UX 交互 (TC-4XXX)", () => {
        it("TC-4402: MobileNav Header 應具備 lg:hidden 以在 Desktop 隱藏", () => {
            const { container } = render(<MobileNav />);
            const header = container.querySelector("header");
            expect(header).toHaveClass("lg:hidden");
        });

        it("TC-4403: Drawer 開啟時應設置 body overflow hidden", () => {
            render(<MobileNav />);
            const menuButton = screen.getByLabelText(/開啟選單/i);
            fireEvent.click(menuButton);
            expect(document.body.style.overflow).toBe("hidden");

            const closeButton = screen.getByLabelText(/關閉選單/i);
            fireEvent.click(closeButton);
            expect(document.body.style.overflow).toBe("");
        });

        it("TC-4404: 漢堡按鈕 Touch Target 應 >= 44px", () => {
            render(<MobileNav />);
            const menuButton = screen.getByLabelText(/開啟選單/i);
            expect(menuButton).toHaveClass("min-w-[44px]");
            expect(menuButton).toHaveClass("min-h-[44px]");
        });

        it("TC-4401: Drawer 內的導航連結應具有 cursor-pointer", () => {
            render(<MobileNav />);
            fireEvent.click(screen.getByLabelText(/開啟選單/i));
            const settingsLink = screen.getByRole("link", { name: /系統設定/i });
            expect(settingsLink).toHaveClass("cursor-pointer");
        });

        it("TC-4405: 點擊 Overlay 應關閉 Drawer", () => {
            const { container } = render(<MobileNav />);
            fireEvent.click(screen.getByLabelText(/開啟選單/i));

            // 使用類名或特定的 DOM 層次來避開 spacer
            const overlay = container.querySelector(".bg-black\\/60");
            if (overlay) {
                fireEvent.click(overlay);
            }
            expect(document.body.style.overflow).toBe("");
        });
    });
});
