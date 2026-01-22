"use client";

import React from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

/**
 * 價格走勢圖組件
 * 使用 Recharts AreaChart 繪製股價歷史走勢
 */

interface PriceDataPoint {
    /** 日期 (YYYY-MM-DD) */
    date: string;
    /** 收盤價 */
    close: number;
    /** 開盤價 (選填) */
    open?: number;
    /** 最高價 (選填) */
    high?: number;
    /** 最低價 (選填) */
    low?: number;
    /** 成交量 (選填) */
    volume?: number;
}

interface PriceChartProps {
    /** 股票代碼 */
    symbol: string;
    /** 價格數據陣列 */
    data: PriceDataPoint[];
    /** 圖表高度 (預設 300px) */
    height?: number;
    /** 主色調 */
    color?: string;
    /** 是否顯示成交量 */
    showVolume?: boolean;
}

export default function PriceChart({
    symbol,
    data,
    height = 300,
    color = "#F59E0B", // Amber (主色)
    showVolume = false,
}: PriceChartProps) {
    // 計算價格範圍 (用於 Y 軸 domain)
    const prices = data.map((d) => d.close);
    const minPrice = Math.min(...prices) * 0.98; // 留 2% 邊距
    const maxPrice = Math.max(...prices) * 1.02;

    // 判斷整體趨勢 (第一筆 vs 最後一筆)
    const isUptrend =
        data.length > 1 && data[data.length - 1].close > data[0].close;
    const trendColor = isUptrend ? "#10B981" : "#EF4444";

    // 格式化 X 軸日期
    const formatXAxis = (dateStr: string) => {
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    // 格式化 Tooltip 價格
    const formatTooltipValue = (value: number) => {
        return value.toLocaleString("zh-TW", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    // 自定義 Tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload as PriceDataPoint;
            return (
                <div className="glass p-3 rounded-lg border border-white/20 text-sm">
                    <p className="text-gray-400 mb-2">{label}</p>
                    <div className="space-y-1">
                        <div className="flex justify-between gap-4">
                            <span className="text-gray-500">收盤</span>
                            <span className="text-white font-mono">
                                {formatTooltipValue(dataPoint.close)}
                            </span>
                        </div>
                        {dataPoint.open && (
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">開盤</span>
                                <span className="text-gray-300 font-mono">
                                    {formatTooltipValue(dataPoint.open)}
                                </span>
                            </div>
                        )}
                        {dataPoint.high && (
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">最高</span>
                                <span className="text-green-400 font-mono">
                                    {formatTooltipValue(dataPoint.high)}
                                </span>
                            </div>
                        )}
                        {dataPoint.low && (
                            <div className="flex justify-between gap-4">
                                <span className="text-gray-500">最低</span>
                                <span className="text-red-400 font-mono">
                                    {formatTooltipValue(dataPoint.low)}
                                </span>
                            </div>
                        )}
                        {showVolume && dataPoint.volume && (
                            <div className="flex justify-between gap-4 pt-1 border-t border-white/10">
                                <span className="text-gray-500">成交量</span>
                                <span className="text-gray-300 font-mono">
                                    {(dataPoint.volume / 1000).toFixed(0)}K
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div
            className="glass p-6 rounded-xl border border-white/10"
            style={{ height: height + 48 }}
        >
            {/* 標題區 */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-200">
                    {symbol} 價格走勢
                </h3>
                <span className="text-xs text-gray-500 font-mono">
                    {data.length} 個交易日
                </span>
            </div>

            {/* 圖表區 */}
            <div style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient
                                id={`priceGradient-${symbol}`}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor={trendColor}
                                    stopOpacity={0.4}
                                />
                                <stop
                                    offset="95%"
                                    stopColor={trendColor}
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#333"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatXAxis}
                            tick={{ fill: "#6B7280", fontSize: 11 }}
                            axisLine={{ stroke: "#333" }}
                            tickLine={false}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            domain={[minPrice, maxPrice]}
                            orientation="right"
                            tick={{ fill: "#6B7280", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => v.toFixed(0)}
                            width={50}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="close"
                            stroke={trendColor}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill={`url(#priceGradient-${symbol})`}
                            animationDuration={1000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
