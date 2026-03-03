"use client";

import React from "react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ComposedChart,
    Line,
} from "recharts";
import { Wallet, TrendingUp, TrendingDown, Percent } from "lucide-react";
import { useChipsData } from "@/hooks/useChipsData";
import { Bilingual } from "@/components/ui/Bilingual";

/**
 * 融資融券詳細頁
 * - 融資餘額走勢圖 (Area Chart)
 * - 融券餘額 vs 增減 (Bar Chart)
 * - 券資比趨勢 (Line Chart)
 */

// 統計卡片組件
const StatCard = ({
    label,
    value,
    change,
    icon: Icon,
    color,
}: {
    label: React.ReactNode;
    value: string | number;
    change?: number;
    icon: React.ElementType;
    color: string;
}) => {
    const isPositive = change && change > 0;
    const changeColor = isPositive ? "text-red-400" : "text-green-400";
    const changeSign = isPositive ? "+" : "";

    return (
        <div className="glass p-5 rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400 font-medium">{label}</span>
                <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
                    <Icon size={18} />
                </div>
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            {change !== undefined && (
                <div className={`text-sm ${changeColor} mt-1`}>
                    {changeSign}{change.toLocaleString()}
                </div>
            )}
        </div>
    );
};

// 自定義 Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass p-3 rounded-lg border border-white/20 text-sm">
                <p className="text-gray-400 mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} style={{ color: entry.color }}>
                        {entry.name}: {entry.value.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function MarginPage() {
    const { chipsData, isLoading, isError } = useChipsData("2330", 30); // 預設台積電

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    if (isError || chipsData.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center text-red-400">
                <Bilingual zh="無法載入資料" en="Failed to load data" />
            </div>
        );
    }

    // 取得最新數據
    const latestData = chipsData[chipsData.length - 1];

    return (
        <div className="space-y-8">
            {/* 統計卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label={<Bilingual zh="融資餘額" en="Margin Balance" mode="inline" />}
                    value={`${(latestData.margin_balance / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} 億`}
                    change={latestData.margin_change}
                    icon={Wallet}
                    color="text-cyan-400"
                />
                <StatCard
                    label={<Bilingual zh="融券餘額" en="Short Balance" mode="inline" />}
                    value={`${latestData.short_balance.toLocaleString()} 張`}
                    change={latestData.short_change}
                    icon={TrendingDown}
                    color="text-pink-400"
                />
                <StatCard
                    label={<Bilingual zh="券資比" en="Short Ratio" mode="inline" />}
                    value={`${latestData.short_ratio.toFixed(2)}%`}
                    icon={Percent}
                    color="text-amber-400"
                />
                <StatCard
                    label={<Bilingual zh="收盤價" en="Close Price" mode="inline" />}
                    value={`${latestData.price}`}
                    icon={TrendingUp}
                    color="text-emerald-400"
                />
            </div>

            {/* 融資餘額走勢圖 */}
            <div className="glass p-6 rounded-xl border border-white/10">
                <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                    <Wallet size={20} className="text-cyan-400" />
                    <Bilingual zh="融資餘額走勢 (30 日)" en="Margin Balance Trend (30 Days)" mode="inline" />
                </h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chipsData}>
                            <defs>
                                <linearGradient id="marginGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="date" tick={{ fill: "#6B7280", fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                            <YAxis yAxisId="left" tick={{ fill: "#6B7280", fontSize: 11 }} domain={["auto", "auto"]} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fill: "#6B7280", fontSize: 11 }} domain={['auto', 'auto']} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="margin_balance"
                                name="融資餘額 (Margin)"
                                stroke="#06B6D4"
                                strokeWidth={2}
                                fill="url(#marginGradient)"
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="price"
                                name="股價 (Price)"
                                stroke="#F59E0B"
                                strokeWidth={2}
                                dot={false}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 融券餘額與增減 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 融券餘額走勢 */}
                <div className="glass p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                        <TrendingDown size={20} className="text-pink-400" />
                        <Bilingual zh="融券餘額走勢" en="Short Balance Trend" mode="inline" />
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chipsData}>
                                <defs>
                                    <linearGradient id="shortGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="date" tick={{ fill: "#6B7280", fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                                <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} domain={['auto', 'auto']} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="short_balance"
                                    name="融券餘額 (Short)"
                                    stroke="#EC4899"
                                    strokeWidth={2}
                                    fill="url(#shortGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 券資比趨勢 */}
                <div className="glass p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                        <Percent size={20} className="text-amber-400" />
                        <Bilingual zh="券資比趨勢" en="Short Ratio Trend" mode="inline" />
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chipsData}>
                                <defs>
                                    <linearGradient id="ratioGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="date" tick={{ fill: "#6B7280", fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                                <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} domain={["auto", "auto"]} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="short_ratio"
                                    name="券資比 (%)"
                                    stroke="#F59E0B"
                                    strokeWidth={2}
                                    fill="url(#ratioGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
