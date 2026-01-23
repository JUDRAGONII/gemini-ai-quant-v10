"use client";

/**
 * ProToggle - 高質感切換開關組件
 * @description 具備平滑滑動特效與 A11y 支援
 * @version 1.0.0 (Phase 4.4 Pro Max)
 */

import React from "react";

interface ProToggleProps {
    /** 是否開啟 */
    checked: boolean;
    /** 切換事件 */
    onChange: (checked: boolean) => void;
    /** 標籤文字 */
    label?: string;
    /** 是否禁用 */
    disabled?: boolean;
    /** 額外的 className */
    className?: string;
}

export function ProToggle({
    checked,
    onChange,
    label,
    disabled = false,
    className = "",
}: ProToggleProps) {
    const handleToggle = () => {
        if (!disabled) {
            onChange(!checked);
        }
    };

    return (
        <label
            className={`
                inline-flex items-center gap-3 
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                ${className}
            `}
        >
            <button
                role="switch"
                aria-checked={checked}
                aria-label={label}
                disabled={disabled}
                onClick={handleToggle}
                className={`
                    relative w-11 h-6 rounded-full
                    transition-all duration-300 ease-out
                    focus:outline-none focus:ring-2 focus:ring-cyan-500/30
                    ${checked
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                        : "bg-slate-700"
                    }
                `}
            >
                {/* 滑動圓點 */}
                <span
                    className={`
                        absolute top-0.5 left-0.5
                        w-5 h-5 rounded-full
                        bg-white shadow-lg
                        transition-transform duration-300 ease-out
                        ${checked ? "translate-x-5" : "translate-x-0"}
                    `}
                    aria-hidden="true"
                />
            </button>
            {label && (
                <span className="text-sm text-gray-300">{label}</span>
            )}
        </label>
    );
}

export default ProToggle;
