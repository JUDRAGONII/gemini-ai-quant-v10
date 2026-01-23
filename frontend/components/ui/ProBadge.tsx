"use client";

/**
 * ProBadge - 高質感狀態標籤組件
 * @description 支援多種狀態配色與動態脈衝效果
 * @version 1.0.0 (Phase 4.4 Pro Max)
 */

import React from "react";

type BadgeStatus = "success" | "warning" | "error" | "info" | "neutral";
type BadgeSize = "sm" | "md";

interface ProBadgeProps {
    children: React.ReactNode;
    /** 狀態類型 */
    status?: BadgeStatus;
    /** 尺寸 */
    size?: BadgeSize;
    /** 是否顯示脈衝動畫 (適用於 online 狀態) */
    pulse?: boolean;
    /** 額外的 className */
    className?: string;
}

const statusStyles: Record<BadgeStatus, string> = {
    success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    error: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    info: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    neutral: "bg-slate-500/20 text-gray-400 border-slate-500/30",
};

const sizeStyles: Record<BadgeSize, string> = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
};

export function ProBadge({
    children,
    status = "neutral",
    size = "md",
    pulse = false,
    className = "",
}: ProBadgeProps) {
    return (
        <span
            className={`
                inline-flex items-center gap-1.5
                rounded-full border font-medium
                ${statusStyles[status]}
                ${sizeStyles[size]}
                ${className}
            `}
        >
            {pulse && (
                <span
                    className={`
                        w-2 h-2 rounded-full animate-pulse
                        ${status === "success" ? "bg-emerald-400" : ""}
                        ${status === "warning" ? "bg-amber-400" : ""}
                        ${status === "error" ? "bg-rose-400" : ""}
                        ${status === "info" ? "bg-cyan-400" : ""}
                        ${status === "neutral" ? "bg-gray-400" : ""}
                    `}
                    aria-hidden="true"
                />
            )}
            {children}
        </span>
    );
}

export default ProBadge;
