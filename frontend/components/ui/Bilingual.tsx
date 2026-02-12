"use client";

/**
 * Bilingual — 雙語排版通用組件 (Phase 052)
 *
 * 設計語言：主體繁體中文 + 輔助小字英文
 * 支援三種排版模式：
 *   - stacked : 上下分層 (導航、標題)
 *   - inline  : 左右同行 (按鈕、標籤)
 *   - suffix  : 括號後綴 (圖表軸線)
 */

import React from "react";

// === 型別定義 ===
export interface BilingualProps {
    /** 繁體中文文字 */
    zh: string;
    /** 英文文字 */
    en: string;
    /** 排版模式 (預設: stacked) */
    mode?: "stacked" | "inline" | "suffix";
    /** 外層容器 className */
    className?: string;
    /** 中文文字 className (覆寫預設樣式) */
    zhClassName?: string;
    /** 英文文字 className (覆寫預設樣式) */
    enClassName?: string;
    /** 子組件 (用於放置 Icon 等) */
    children?: React.ReactNode;
}

// === 預設樣式 ===
const DEFAULT_ZH = "text-white font-bold";
const DEFAULT_EN = "text-[9px] uppercase tracking-widest font-mono opacity-50";

// === 組件 ===
export function Bilingual({
    zh,
    en,
    mode = "stacked",
    className = "",
    zhClassName,
    enClassName,
    children,
}: BilingualProps) {
    const zhStyle = zhClassName ?? DEFAULT_ZH;
    const enStyle = enClassName ?? DEFAULT_EN;

    // Stacked: 上下分層
    if (mode === "stacked") {
        return (
            <div className={`flex flex-col ${className}`}>
                <div className="flex items-center gap-2">
                    {children}
                    <span className={zhStyle}>{zh}</span>
                </div>
                <span className={`${enStyle} -mt-0.5`}>{en}</span>
            </div>
        );
    }

    // Inline: 左右同行
    if (mode === "inline") {
        return (
            <span className={`inline-flex items-center gap-1.5 ${className}`}>
                {children}
                <span className={zhStyle}>{zh}</span>
                <span className={enStyle}>{en}</span>
            </span>
        );
    }

    // Suffix: 括號後綴
    return (
        <span className={`${zhStyle} ${className}`}>
            {zh}{" "}
            <span className={enStyle}>({en})</span>
        </span>
    );
}

export default Bilingual;
