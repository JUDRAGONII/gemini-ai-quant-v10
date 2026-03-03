"use client";

import React, { useState } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Bilingual } from "@/components/ui/Bilingual";

interface PerformanceDataPoint {
    date: string;
    total_value: number;
    total_cost: number;
    return_amount: number;
    return_rate: number;
}

interface PortfolioPerformanceChartProps {
    data: PerformanceDataPoint[];
    height?: number;
    showReturnRate?: boolean;
    period: string;
    onPeriodChange: (period: string) => void;
}

const PERIODS = [
    { value: '1W', label: <Bilingual zh="1週" en="1W" /> },
    { value: '1M', label: <Bilingual zh="1月" en="1M" /> },
    { value: '3M', label: <Bilingual zh="3月" en="3M" /> },
    { value: '6M', label: <Bilingual zh="6月" en="6M" /> },
    { value: '1Y', label: <Bilingual zh="1年" en="1Y" /> },
];

export default function PortfolioPerformanceChart({
    data,
    height = 300,
    showReturnRate = true,
    period,
    onPeriodChange,
}: PortfolioPerformanceChartProps) {
    const formatXAxis = (dateStr: string) => {
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    const formatTooltipValue = (value: number) => {
        return value.toLocaleString("zh-TW", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        });
    };

    const latestData = data[data.length - 1];
    const isPositive = latestData && latestData.return_rate >= 0;
    const chartColor = isPositive ? "#10B981" : "#EF4444";

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload as PerformanceDataPoint;
            return (
                <div className="glass p-3 rounded-lg border border-white/20 text-sm">
                    <p className="text-gray-400 mb-2">{label}</p>
                    <div className="space-y-1">
                        <div className="flex justify-between gap-4">
                            <span className="text-gray-500"><Bilingual zh="總價值" en="Total Value" /></span>
                            <span className="text-white font-mono">
                                {formatTooltipValue(dataPoint.total_value)}
                            </span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-gray-500"><Bilingual zh="總成本" en="Total Cost" /></span>
                            <span className="text-gray-300 font-mono">
                                {formatTooltipValue(dataPoint.total_cost)}
                            </span>
                        </div>
                        <div className="flex justify-between gap-4 pt-1 border-t border-white/10">
                            <span className="text-gray-500"><Bilingual zh="報酬金額" en="Return" /></span>
                            <span className={`font-mono ${dataPoint.return_amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {dataPoint.return_amount >= 0 ? '+' : ''}{formatTooltipValue(dataPoint.return_amount)}
                            </span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-gray-500"><Bilingual zh="報酬率" en="Return Rate" /></span>
                            <span className={`font-mono ${dataPoint.return_rate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {dataPoint.return_rate >= 0 ? '+' : ''}{dataPoint.return_rate.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div
            className="glass p-6 rounded-xl border border-white/10"
            style={{ height: height + 80 }}
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-200"><Bilingual zh="績效走勢" en="Performance Trend" /></h3>
                <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                    {PERIODS.map((p) => (
                        <button
                            key={p.value}
                            onClick={() => onPeriodChange(p.value)}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${period === p.value
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {latestData && (
                <div className="flex gap-6 mb-4">
                    <div>
                        <p className="text-sm text-gray-500"><Bilingual zh="總價值" en="Total Value" /></p>
                        <p className="text-xl font-bold text-white font-mono">
                            {latestData.total_value.toLocaleString("zh-TW")}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500"><Bilingual zh="報酬金額" en="Return" /></p>
                        <p className={`text-xl font-bold font-mono ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}{latestData.return_amount.toLocaleString("zh-TW")}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500"><Bilingual zh="報酬率" en="Return Rate" /></p>
                        <p className={`text-xl font-bold font-mono ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}{latestData.return_rate.toFixed(2)}%
                        </p>
                    </div>
                </div>
            )}

            <div style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient
                                id="portfolioGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor={chartColor}
                                    stopOpacity={0.4}
                                />
                                <stop
                                    offset="95%"
                                    stopColor={chartColor}
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
                            orientation="right"
                            tick={{ fill: "#6B7280", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => v.toLocaleString()}
                            width={80}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey={showReturnRate ? "return_rate" : "total_value"}
                            stroke={chartColor}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#portfolioGradient)"
                            animationDuration={1000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
