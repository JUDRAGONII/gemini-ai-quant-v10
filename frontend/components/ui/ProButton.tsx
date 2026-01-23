"use client";

/**
 * ProButton - 高質感漸層按鈕組件
 * @description 支援 Loading 狀態、多種變體與 Icon 整合
 * @version 1.0.0 (Phase 4.4 Pro Max)
 */

import React from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ProButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    /** 按鈕變體 */
    variant?: ButtonVariant;
    /** 按鈕尺寸 */
    size?: ButtonSize;
    /** 是否處於載入狀態 */
    isLoading?: boolean;
    /** 左側圖標 */
    leftIcon?: React.ReactNode;
    /** 右側圖標 */
    rightIcon?: React.ReactNode;
    /** 是否佔滿寬度 */
    fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: `
        bg-gradient-to-br from-cyan-500 to-blue-600
        hover:from-cyan-400 hover:to-blue-500
        hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]
        text-white font-semibold
        border border-cyan-400/30
    `,
    secondary: `
        bg-slate-800/80 hover:bg-slate-700/80
        text-gray-200 hover:text-white
        border border-white/10 hover:border-white/20
    `,
    ghost: `
        bg-transparent hover:bg-white/5
        text-gray-400 hover:text-white
        border border-transparent hover:border-white/10
    `,
    danger: `
        bg-gradient-to-br from-rose-500 to-red-600
        hover:from-rose-400 hover:to-red-500
        hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]
        text-white font-semibold
        border border-rose-400/30
    `,
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-sm rounded-lg",
    md: "px-4 py-2 text-base rounded-xl",
    lg: "px-6 py-3 text-lg rounded-xl",
};

export function ProButton({
    children,
    variant = "primary",
    size = "md",
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    className = "",
    ...props
}: ProButtonProps) {
    const isDisabled = disabled || isLoading;

    return (
        <button
            className={`
                inline-flex items-center justify-center gap-2
                transition-all duration-300 ease-out
                cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                ${variantStyles[variant]}
                ${sizeStyles[size]}
                ${fullWidth ? "w-full" : ""}
                ${className}
            `}
            disabled={isDisabled}
            {...props}
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
                leftIcon
            )}
            <span>{children}</span>
            {!isLoading && rightIcon}
        </button>
    );
}

export default ProButton;
