/**
 * Phase 8 MobileNav 響應式導航測試
 * @description 驗證 Mobile 導航組件的 RWD 行為與 A11y (Synced with Phase 8)
 * @version 1.3.0
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock next/navigation
jest.mock("next/navigation", () => ({
    usePathname: () => "/",
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

// Mock framer-motion
jest.mock("framer-motion", () => ({
    motion: {
        header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock next/link
jest.mock("next/link", () => {
    return ({ children, href, onClick, className }: { children: React.ReactNode; href: string; onClick?: () => void; className?: string }) => (
        <a href={href} onClick={onClick} className={className}>{children}</a>
    );
});

// Mock lucide-react — 使用 Proxy 模式與 jest.setup.js 一致，避免跨測試汙染
jest.mock("lucide-react", () => {
    const React = require("react");
    const iconCache: Record<string, any> = {};
    return new Proxy({}, {
        get: (target, prop) => {
            if (typeof prop === "string" && /^[A-Z]/.test(prop)) {
                if (!iconCache[prop as string]) {
                    const IconComponent = (props: any) => React.createElement("svg", { ...props, "data-testid": `icon-${prop.toLowerCase()}` });
                    IconComponent.displayName = prop;
                    iconCache[prop as string] = IconComponent;
                }
                return iconCache[prop as string];
            }
            return undefined;
        }
    });
});

import { MobileNav } from "@/components/layout/MobileNav";

describe("MobileNav 響應式導航 (Phase 8)", () => {
    describe("基礎渲染 (TC-1XXX)", () => {
        it("TC-1404: 應正確渲染頂部 Header 與漢堡按鈕", () => {
            render(<MobileNav />);
            // Logo link should contain QUANT
            expect(screen.getByRole("link", { name: /QUANT/i })).toBeInTheDocument();
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
            // Regex updated to handle "(Settings)" suffix
            const settingsLink = screen.getByRole("link", { name: /系統設定/i });
            expect(settingsLink).toHaveClass("cursor-pointer");
        });

        it("TC-4405: 點擊 Overlay 應關閉 Drawer", () => {
            const { container } = render(<MobileNav />);
            fireEvent.click(screen.getByLabelText(/開啟選單/i));

            // Select overlay by class
            const overlay = container.querySelector(".bg-black\\/60");
            if (overlay) {
                fireEvent.click(overlay);
            }
            expect(document.body.style.overflow).toBe("");
        });
    });
});
