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
import { MOCK_MARGIN_DATA } from "@/data/mockMargin";

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
    label: string;
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
    // 取得最新與前一日數據
    const latestData = MOCK_MARGIN_DATA[MOCK_MARGIN_DATA.length - 1];
    const prevData = MOCK_MARGIN_DATA[MOCK_MARGIN_DATA.length - 2];

    return (
        <div className="space-y-8">
            {/* 統計卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="融資餘額"
                    value={`${(latestData.marginBalance / 1000).toFixed(1)} 億`}
                    change={latestData.marginChange}
                    icon={Wallet}
                    color="text-cyan-400"
                />
                <StatCard
                    label="融券餘額"
                    value={`${latestData.shortBalance.toLocaleString()} 張`}
                    change={latestData.shortChange}
                    icon={TrendingDown}
                    color="text-pink-400"
                />
                <StatCard
                    label="券資比"
                    value={`${latestData.shortRatio}%`}
                    icon={Percent}
                    color="text-amber-400"
                />
                <StatCard
                    label="收盤價"
                    value={`${latestData.price}`}
                    icon={TrendingUp}
                    color="text-emerald-400"
                />
            </div>

            {/* 融資餘額走勢圖 */}
            <div className="glass p-6 rounded-xl border border-white/10">
                <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                    <Wallet size={20} className="text-cyan-400" />
                    融資餘額走勢 (30 日)
                </h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={MOCK_MARGIN_DATA}>
                            <defs>
                                <linearGradient id="marginGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="date" tick={{ fill: "#6B7280", fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                            <YAxis yAxisId="left" tick={{ fill: "#6B7280", fontSize: 11 }} domain={["auto", "auto"]} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fill: "#6B7280", fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="marginBalance"
                                name="融資餘額"
                                stroke="#06B6D4"
                                strokeWidth={2}
                                fill="url(#marginGradient)"
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="price"
                                name="股價"
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
                        融券餘額走勢
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={MOCK_MARGIN_DATA}>
                                <defs>
                                    <linearGradient id="shortGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="date" tick={{ fill: "#6B7280", fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                                <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="shortBalance"
                                    name="融券餘額"
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
                        券資比趨勢
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={MOCK_MARGIN_DATA}>
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
                                    dataKey="shortRatio"
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

            {/* 數據說明 */}
            <div className="glass p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <p className="text-amber-400/80 text-sm text-center">
                    ⚠️ 此頁面使用模擬數據展示，待 Crawler 擴充後接入真實融資融券資料。
                </p>
            </div>
        </div>
    );
}
