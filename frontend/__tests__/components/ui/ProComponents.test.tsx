/**
 * Phase 4.4 原子化 UI 組件單元測試
 * @description 驗證 GlassCard, ProButton, ProToggle, ProBadge 等組件的渲染與交互
 * @version 1.0.0 (Pro Max TDD)
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock lucide-react
jest.mock("lucide-react", () => ({
    Loader2: () => <span data-testid="loader-icon">Loader</span>,
    Eye: () => <span data-testid="eye-icon">Eye</span>,
    EyeOff: () => <span data-testid="eye-off-icon">EyeOff</span>,
}));

// 組件引入
import { GlassCard } from "@/components/ui/GlassCard";
import { ProButton } from "@/components/ui/ProButton";
import { ProToggle } from "@/components/ui/ProToggle";
import { ProBadge } from "@/components/ui/ProBadge";
import { ProInput } from "@/components/ui/ProInput";

describe("原子化 UI 組件測試 (Phase 4.4)", () => {
    describe("GlassCard 組件", () => {
        it("TC-1402: 應正確渲染子元素並套用 Glassmorphism 樣式", () => {
            render(
                <GlassCard>
                    <span>測試內容</span>
                </GlassCard>
            );
            const content = screen.getByText("測試內容");
            expect(content).toBeInTheDocument();

            const card = content.parentElement;
            expect(card).toHaveClass("backdrop-blur-xl");
            expect(card).toHaveClass("bg-slate-900/40");
        });

        it("TC-1402b: 當 glow=true 時應顯示頂部發光元素", () => {
            const { container } = render(
                <GlassCard glow>
                    <span>發光卡片</span>
                </GlassCard>
            );
            // 檢查發光元素存在 (gradient bar)
            const glowElement = container.querySelector('[aria-hidden="true"]');
            expect(glowElement).toBeInTheDocument();
        });

        it("TC-4401: 當 interactive=true 時應具備 cursor-pointer", () => {
            const { container } = render(
                <GlassCard interactive>
                    <span>可點擊卡片</span>
                </GlassCard>
            );
            const card = container.firstChild;
            expect(card).toHaveClass("cursor-pointer");
        });
    });

    describe("ProButton 組件", () => {
        it("TC-1401: 當 isLoading=true 時應顯示 Spinner 並禁用按鈕", () => {
            render(<ProButton isLoading>載入中</ProButton>);
            const button = screen.getByRole("button");

            expect(button).toBeDisabled();
            expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
        });

        it("TC-1401b: 不同 variant 應套用對應的漸層樣式", () => {
            const { rerender } = render(
                <ProButton variant="primary">主要按鈕</ProButton>
            );
            let button = screen.getByRole("button");
            expect(button).toHaveClass("from-cyan-500");

            rerender(<ProButton variant="danger">危險按鈕</ProButton>);
            button = screen.getByRole("button");
            expect(button).toHaveClass("from-rose-500");
        });
    });

    describe("ProToggle 組件", () => {
        it("TC-5402: 點擊切換開關應正確觸發 onChange", () => {
            const handleChange = jest.fn();
            render(
                <ProToggle checked={false} onChange={handleChange} label="測試切換" />
            );

            const toggle = screen.getByRole("switch");
            fireEvent.click(toggle);

            expect(handleChange).toHaveBeenCalledWith(true);
        });

        it("TC-5402b: 當 disabled=true 時點擊不應觸發 onChange", () => {
            const handleChange = jest.fn();
            render(
                <ProToggle checked={false} onChange={handleChange} disabled />
            );

            const toggle = screen.getByRole("switch");
            fireEvent.click(toggle);

            expect(handleChange).not.toHaveBeenCalled();
        });
    });

    describe("ProBadge 組件", () => {
        it("TC-1403: 不同 status 應顯示對應的配色", () => {
            const { rerender } = render(
                <ProBadge status="success">成功</ProBadge>
            );
            let badge = screen.getByText("成功");
            expect(badge).toHaveClass("text-emerald-400");

            rerender(<ProBadge status="error">錯誤</ProBadge>);
            badge = screen.getByText("錯誤");
            expect(badge).toHaveClass("text-rose-400");
        });

        it("TC-1403b: 當 pulse=true 時應顯示脈衝動畫元素", () => {
            const { container } = render(
                <ProBadge status="success" pulse>
                    連線中
                </ProBadge>
            );
            const pulseElement = container.querySelector(".animate-pulse");
            expect(pulseElement).toBeInTheDocument();
        });
    });

    describe("ProInput 組件", () => {
        it("TC-5403: 密碼輸入框應預設為 password 類型", () => {
            render(<ProInput label="密碼" isPassword />);
            const input = screen.getByLabelText("密碼");
            expect(input).toHaveAttribute("type", "password");
        });

        it("TC-5403b: 點擊眼睛圖示應切換為明文顯示", () => {
            render(<ProInput label="API Key" isPassword />);
            const input = screen.getByLabelText("API Key");

            // 初始為 password
            expect(input).toHaveAttribute("type", "password");

            // 點擊切換
            const toggleButton = screen.getByRole("button", { name: /顯示密碼/i });
            fireEvent.click(toggleButton);

            // 應變為 text
            expect(input).toHaveAttribute("type", "text");
        });
    });
});
