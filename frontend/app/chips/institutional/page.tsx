"use client";

import React from "react";
import {
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
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { Building2, TrendingUp, TrendingDown, Users } from "lucide-react";
import { useChipsData } from "@/hooks/useChipsData";
import { Bilingual } from "@/components/ui/Bilingual";

/**
 * 三大法人詳細頁
 * - 外資/投信/自營商買超趨勢 (Stacked Bar)
 * - 各法人持股比例 (Pie Chart)
 */

// 統計卡片組件
const StatCard = ({
    label,
    value,
    icon: Icon,
    color,
    bgColor,
}: {
    label: React.ReactNode;
    value: string | number;
    icon: React.ElementType;
    color: string;
    bgColor: string;
}) => {
    const numValue = typeof value === "number" ? value : parseFloat(value);
    const isPositive = numValue >= 0;
    const sign = isPositive ? "+" : "";
    const textColor = isPositive ? "text-red-400" : "text-green-400";

    return (
        <div className="glass p-5 rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400 font-medium">{label}</span>
                <div className={`p-2 rounded-lg ${bgColor} ${color}`}>
                    <Icon size={18} />
                </div>
            </div>
            <div className={`text-2xl font-bold ${textColor}`}>
                {sign}{typeof value === "number" ? (value / 100000000).toLocaleString(undefined, { maximumFractionDigits: 1 }) : value} 億
            </div>
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
                        {entry.name}: {entry.value >= 0 ? "+" : ""}{entry.value.toLocaleString()} 億
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Pie Chart 自定義 Label
const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name,
}: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor={x > cx ? "start" : "end"}
            dominantBaseline="central"
            fontSize={12}
        >
            {`${(percent * 100).toFixed(1)}%`}
        </text>
    );
};

export default function InstitutionalPage() {
    const { chipsData, isLoading, isError } = useChipsData("2330", 30); // 預設台積電

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
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

    // 計算最新數據
    const latestData = chipsData[chipsData.length - 1];

    // 計算近7日累計 (安全截取最多7日)
    const last7Days = chipsData.slice(-7);
    const sum7 = {
        foreign: last7Days.reduce((acc, d) => acc + d.foreign, 0),
        trust: last7Days.reduce((acc, d) => acc + d.trust, 0),
        dealer: last7Days.reduce((acc, d) => acc + d.dealer, 0),
    };

    // 計算持股比例概況 (用近 30 日累積變化示意)
    const totalPos = Math.max(0, sum7.foreign) + Math.max(0, sum7.trust) + Math.max(0, sum7.dealer);
    const mockOwnership = totalPos === 0 ? [
        { name: "外資", value: 33, color: "#06B6D4" },
        { name: "投信", value: 33, color: "#EC4899" },
        { name: "自營商", value: 34, color: "#F59E0B" }
    ] : [
        { name: "外資", value: Math.max(0, sum7.foreign), color: "#06B6D4" },
        { name: "投信", value: Math.max(0, sum7.trust), color: "#EC4899" },
        { name: "自營商", value: Math.max(0, sum7.dealer), color: "#F59E0B" }
    ];

    return (
        <div className="space-y-8">
            {/* 統計卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label={<Bilingual zh="外資買賣超 (今日)" en="Foreign Net (Today)" mode="inline" />}
                    value={latestData.foreign}
                    icon={Building2}
                    color="text-cyan-400"
                    bgColor="bg-cyan-500/10"
                />
                <StatCard
                    label={<Bilingual zh="投信買賣超 (今日)" en="Trust Net (Today)" mode="inline" />}
                    value={latestData.trust}
                    icon={TrendingUp}
                    color="text-pink-400"
                    bgColor="bg-pink-500/10"
                />
                <StatCard
                    label={<Bilingual zh="自營商買賣超 (今日)" en="Dealer Net (Today)" mode="inline" />}
                    value={latestData.dealer}
                    icon={TrendingDown}
                    color="text-amber-400"
                    bgColor="bg-amber-500/10"
                />
                <StatCard
                    label={<Bilingual zh="三大法人合計 (今日)" en="Total Net (Today)" mode="inline" />}
                    value={latestData.total_institutional}
                    icon={Users}
                    color="text-emerald-400"
                    bgColor="bg-emerald-500/10"
                />
            </div>

            {/* 法人買賣超趨勢 (Stacked Bar + Price Line) */}
            <div className="glass p-6 rounded-xl border border-white/10">
                <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                    <Building2 size={20} className="text-cyan-400" />
                    <Bilingual zh="三大法人買賣超趨勢 (30 日)" en="Institutional Flow Trend (30 Days)" mode="inline" />
                </h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chipsData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis
                                dataKey="date"
                                tick={{ fill: "#6B7280", fontSize: 11 }}
                                tickFormatter={(v) => v.slice(5)}
                            />
                            <YAxis
                                yAxisId="left"
                                tick={{ fill: "#6B7280", fontSize: 11 }}
                                tickFormatter={(v) => `${(v / 100000000).toFixed(0)}億`}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tick={{ fill: "#6B7280", fontSize: 11 }}
                                domain={['auto', 'auto']}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar
                                yAxisId="left"
                                dataKey="foreign"
                                name="外資 (Foreign)"
                                stackId="a"
                                fill="#06B6D4"
                                radius={[2, 2, 0, 0]}
                            />
                            <Bar
                                yAxisId="left"
                                dataKey="trust"
                                name="投信 (Trust)"
                                stackId="a"
                                fill="#EC4899"
                                radius={[2, 2, 0, 0]}
                            />
                            <Bar
                                yAxisId="left"
                                dataKey="dealer"
                                name="自營商 (Dealer)"
                                stackId="a"
                                fill="#F59E0B"
                                radius={[2, 2, 0, 0]}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="price"
                                name="股價 (Price)"
                                stroke="#10B981"
                                strokeWidth={2}
                                dot={false}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 下半部：近 7 日統計 + 持股比例圓餅圖 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 近 7 日累計 */}
                <div className="glass p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4">
                        <Bilingual zh="近 7 日累計買賣超" en="7-Day Cumulative Net Flow" mode="inline" />
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <span className="text-cyan-400 font-medium"><Bilingual zh="外資" en="Foreign" mode="inline" /></span>
                            <span className={`font-bold ${sum7.foreign >= 0 ? "text-red-400" : "text-green-400"}`}>
                                {sum7.foreign >= 0 ? "+" : ""}{sum7.foreign.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <span className="text-pink-400 font-medium"><Bilingual zh="投信" en="Trust" mode="inline" /></span>
                            <span className={`font-bold ${sum7.trust >= 0 ? "text-red-400" : "text-green-400"}`}>
                                {sum7.trust >= 0 ? "+" : ""}{sum7.trust.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <span className="text-amber-400 font-medium"><Bilingual zh="自營商" en="Dealer" mode="inline" /></span>
                            <span className={`font-bold ${sum7.dealer >= 0 ? "text-red-400" : "text-green-400"}`}>
                                {sum7.dealer >= 0 ? "+" : ""}{sum7.dealer.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 法人持股比例圓餅圖 */}
                <div className="glass p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                        <Users size={20} className="text-emerald-400" />
                        <Bilingual zh="法人動能佔比 (近7日)" en="Institutional Momentum Ratio (7D)" mode="inline" />
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={mockOwnership}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomLabel}
                                    outerRadius={100}
                                    innerRadius={50}
                                    dataKey="value"
                                    animationDuration={800}
                                >
                                    {mockOwnership.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Legend
                                    verticalAlign="bottom"
                                    formatter={(value, entry: any) => (
                                        <span className="text-gray-400">{value}</span>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
