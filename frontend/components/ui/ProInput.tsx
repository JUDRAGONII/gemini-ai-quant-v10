"use client";

/**
 * ProInput - 高質感輸入框組件
 * @description 具備動態 Focus Border、Label 動畫與密碼遮照
 * @version 1.0.0 (Phase 4.4 Pro Max)
 */

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface ProInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
    /** 輸入框標籤 */
    label?: string;
    /** 錯誤訊息 */
    error?: string;
    /** 是否為密碼輸入框 (啟用顯示/隱藏切換) */
    isPassword?: boolean;
    /** 左側圖標 */
    leftIcon?: React.ReactNode;
}

export function ProInput({
    label,
    error,
    isPassword = false,
    leftIcon,
    className = "",
    type,
    id,
    ...props
}: ProInputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || `input-${label?.replace(/\s/g, "-").toLowerCase()}`;

    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
        <div className="space-y-1.5">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-gray-300"
                >
                    {label}
                </label>
            )}
            <div className="relative group">
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors">
                        {leftIcon}
                    </div>
                )}
                <input
                    id={inputId}
                    type={inputType}
                    className={`
                        w-full px-4 py-2.5 rounded-xl
                        bg-slate-800/60 backdrop-blur-sm
                        border border-white/10
                        text-white placeholder-gray-500
                        transition-all duration-300 ease-out
                        focus:outline-none focus:border-cyan-500/50
                        focus:ring-2 focus:ring-cyan-500/20
                        focus:shadow-[0_0_15px_rgba(34,211,238,0.15)]
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${leftIcon ? "pl-10" : ""}
                        ${isPassword ? "pr-10" : ""}
                        ${error ? "border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/20" : ""}
                        ${className}
                    `}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 
                                   text-gray-500 hover:text-gray-300 
                                   transition-colors cursor-pointer"
                        aria-label={showPassword ? "隱藏密碼" : "顯示密碼"}
                    >
                        {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                        ) : (
                            <Eye className="w-4 h-4" />
                        )}
                    </button>
                )}
            </div>
            {error && (
                <p className="text-sm text-rose-400" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

export default ProInput;
