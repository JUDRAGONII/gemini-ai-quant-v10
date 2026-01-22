"use client";

import React from "react";
import Link from "next/link";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react";

/**
 * 宏觀指標卡片組件
 * 顯示指標名稱、最新值、變化率、迷你走勢圖
 * 點擊可跳轉至詳情頁
 */

interface MacroIndicatorCardProps {
    /** 指標代碼 (e.g., GDP, CPI) */
    code: string;
    /** 指標名稱 */
    name: string;
    /** 最新值 */
    value: number;
    /** 單位 */
    unit: string;
    /** 較前期變化 (百分比) */
    changePercent: number;
    /** 迷你走勢數據 (最近 7-14 天) */
    sparklineData: { value: number }[];
    /** 主色調 */
    color: string;
    /** 圖標 */
    icon: React.ReactNode;
}

export default function MacroIndicatorCard({
    code,
    name,
    value,
    unit,
    changePercent,
    sparklineData,
    color,
    icon,
}: MacroIndicatorCardProps) {
    // 判斷漲跌狀態
    const isPositive = changePercent > 0;
    const isNegative = changePercent < 0;

    // 動態顏色 (根據漲跌)
    const trendColor = isPositive
        ? "#10B981" // Green
        : isNegative
            ? "#EF4444" // Red
            : "#6B7280"; // Gray

    // 格式化變化率
    const formatChange = (val: number) => {
        const sign = val > 0 ? "+" : "";
        return `${sign}${val.toFixed(2)}%`;
    };

    return (
        <Link href={`/macro/${code.toLowerCase()}`}>
            <div className="glass p-5 rounded-xl border border-white/10 hover:border-white/30 transition-all duration-300 cursor-pointer group relative overflow-hidden">
                {/* 背景光暈 */}
                <div
                    className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"
                    style={{ backgroundColor: color }}
                />

                {/* 頂部：圖標與代碼 */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        <div
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: `${color}20` }}
                        >
                            {icon}
                        </div>
                        <div>
                            <span
                                className="text-sm font-bold group-hover:opacity-80 transition-opacity"
                                style={{ color }}
                            >
                                {code}
                            </span>
                            <p className="text-xs text-gray-500">{name}</p>
                        </div>
                    </div>
                    <ExternalLink
                        size={14}
                        className="text-gray-600 group-hover:text-gray-400 transition-colors"
                    />
                </div>

                {/* 中間：迷你走勢圖 */}
                <div className="h-12 mb-3">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sparklineData}>
                            <defs>
                                <linearGradient
                                    id={`sparkline-${code}`}
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor={color}
                                        stopOpacity={0.3}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor={color}
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={color}
                                strokeWidth={1.5}
                                fill={`url(#sparkline-${code})`}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* 底部：數值與變化率 */}
                <div className="flex justify-between items-end">
                    <div>
                        <span className="text-2xl font-bold text-white">
                            {value.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-400 ml-1">
                            {unit}
                        </span>
                    </div>
                    <div
                        className="flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded"
                        style={{
                            backgroundColor: `${trendColor}20`,
                            color: trendColor,
                        }}
                    >
                        {isPositive && <TrendingUp size={14} />}
                        {isNegative && <TrendingDown size={14} />}
                        {!isPositive && !isNegative && <Minus size={14} />}
                        {formatChange(changePercent)}
                    </div>
                </div>
            </div>
        </Link>
    );
}
