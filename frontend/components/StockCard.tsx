"use client";

import React from "react";
import Link from "next/link";
import {
    AreaChart,
    Area,
    ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * 股票卡片元件
 * 顯示股票代碼、名稱、現價、漲跌幅及迷你走勢圖
 */

interface StockCardProps {
    /** 股票代碼 */
    symbol: string;
    /** 股票名稱 */
    name: string;
    /** 現價 */
    price: number;
    /** 漲跌幅 (百分比) */
    changePercent: number;
    /** 迷你走勢數據 (最近 7-14 天收盤價) */
    sparklineData?: { value: number }[];
    /** 市場類型 (TW: 台股, US: 美股) */
    market?: "TW" | "US";
}

export default function StockCard({
    symbol,
    name,
    price,
    changePercent,
    sparklineData = [],
    market = "TW",
}: StockCardProps) {
    // 判斷漲跌狀態
    const isPositive = changePercent > 0;
    const isNegative = changePercent < 0;
    const isNeutral = changePercent === 0;

    // 動態顏色
    const trendColor = isPositive
        ? "#10B981" // Green
        : isNegative
            ? "#EF4444" // Red
            : "#6B7280"; // Gray

    // 格式化價格 (台股無小數點，美股兩位小數)
    const formatPrice = (val: number) => {
        if (market === "TW") {
            return val.toLocaleString("zh-TW", { maximumFractionDigits: 2 });
        }
        return val.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
        });
    };

    // 格式化漲跌幅
    const formatChange = (val: number) => {
        const sign = val > 0 ? "+" : "";
        return `${sign}${val.toFixed(2)}%`;
    };

    return (
        <Link href={`/stocks/${symbol}`}>
            <div className="glass p-5 rounded-xl border border-white/10 hover:border-white/30 transition-all duration-300 cursor-pointer group">
                {/* 頂部：代碼與市場標籤 */}
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <span className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                            {symbol}
                        </span>
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-400">
                            {market === "TW" ? "台股" : "美股"}
                        </span>
                    </div>
                    {/* 趨勢指示圖標 */}
                    <div
                        className="p-1.5 rounded-lg"
                        style={{ backgroundColor: `${trendColor}20` }}
                    >
                        {isPositive && (
                            <TrendingUp size={16} color={trendColor} />
                        )}
                        {isNegative && (
                            <TrendingDown size={16} color={trendColor} />
                        )}
                        {isNeutral && <Minus size={16} color={trendColor} />}
                    </div>
                </div>

                {/* 股票名稱 */}
                <p className="text-sm text-gray-400 mb-4 truncate">{name}</p>

                {/* 迷你走勢圖 */}
                {sparklineData.length > 0 ? (
                    <div className="h-12 mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={sparklineData}>
                                <defs>
                                    <linearGradient
                                        id={`sparkline-${symbol}`}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor={trendColor}
                                            stopOpacity={0.3}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor={trendColor}
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={trendColor}
                                    strokeWidth={1.5}
                                    fill={`url(#sparkline-${symbol})`}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div data-testid="empty-sparkline" className="h-12 mb-4 flex items-center justify-center border border-dashed border-white/5 rounded-lg">
                        <span className="text-xs text-gray-600">暫無趨勢數據</span>
                    </div>
                )}

                {/* 底部：價格與漲跌幅 */}
                <div className="flex justify-between items-end">
                    <span className="text-2xl font-bold text-white">
                        {formatPrice(price)}
                    </span>
                    <span
                        className={`text-sm font-semibold px-2 py-1 rounded ${isPositive ? "text-emerald-400" : isNegative ? "text-rose-400" : "text-gray-400"
                            }`}
                        style={{
                            backgroundColor: `${trendColor}20`,
                        }}
                    >
                        {formatChange(changePercent)}
                    </span>
                </div>
            </div>
        </Link>
    );
}
