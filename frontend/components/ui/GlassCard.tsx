"use client";

/**
 * GlassCard - 進階 Glassmorphism 容器組件
 * @description 核心 UI 原子組件，具備多層模糊、動態發光邊框
 * @version 1.0.0 (Phase 4.4 Pro Max)
 */

import React from "react";

interface GlassCardProps {
    children: React.ReactNode;
    /** 是否啟用 Hover 發光效果 */
    glow?: boolean;
    /** 額外的 className */
    className?: string;
    /** 點擊事件 */
    onClick?: () => void;
    /** 是否作為 link 容器 (啟用 cursor-pointer) */
    interactive?: boolean;
}

export function GlassCard({
    children,
    glow = false,
    className = "",
    onClick,
    interactive = false,
}: GlassCardProps) {
    const baseStyles = `
        relative overflow-hidden rounded-2xl
        bg-slate-900/40 backdrop-blur-xl
        border border-white/10
        shadow-2xl
        transition-all duration-300 ease-out
    `;

    const glowStyles = glow
        ? `
            hover:border-cyan-500/50
            hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]
        `
        : "hover:border-white/20";

    const interactiveStyles = interactive || onClick ? "cursor-pointer" : "";

    return (
        <div
            className={`${baseStyles} ${glowStyles} ${interactiveStyles} ${className}`}
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {/* 頂部漸層光暈 */}
            {glow && (
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px 
                               bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
                    aria-hidden="true"
                />
            )}
            {children}
        </div>
    );
}

export default GlassCard;
