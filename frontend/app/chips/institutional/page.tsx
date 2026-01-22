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
import { MOCK_INSTITUTIONAL_DATA, MOCK_OWNERSHIP_DATA } from "@/data/mockMargin";

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
    label: string;
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
                {sign}{typeof value === "number" ? value.toLocaleString() : value} 億
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
    // 計算最新數據
    const latestData = MOCK_INSTITUTIONAL_DATA[MOCK_INSTITUTIONAL_DATA.length - 1];

    // 計算近7日累計
    const last7Days = MOCK_INSTITUTIONAL_DATA.slice(-7);
    const sum7 = {
        foreign: last7Days.reduce((acc, d) => acc + d.foreign, 0),
        trust: last7Days.reduce((acc, d) => acc + d.trust, 0),
        dealer: last7Days.reduce((acc, d) => acc + d.dealer, 0),
    };

    return (
        <div className="space-y-8">
            {/* 統計卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="外資買賣超 (今日)"
                    value={latestData.foreign}
                    icon={Building2}
                    color="text-cyan-400"
                    bgColor="bg-cyan-500/10"
                />
                <StatCard
                    label="投信買賣超 (今日)"
                    value={latestData.trust}
                    icon={TrendingUp}
                    color="text-pink-400"
                    bgColor="bg-pink-500/10"
                />
                <StatCard
                    label="自營商買賣超 (今日)"
                    value={latestData.dealer}
                    icon={TrendingDown}
                    color="text-amber-400"
                    bgColor="bg-amber-500/10"
                />
                <StatCard
                    label="三大法人合計 (今日)"
                    value={latestData.total}
                    icon={Users}
                    color="text-emerald-400"
                    bgColor="bg-emerald-500/10"
                />
            </div>

            {/* 法人買賣超趨勢 (Stacked Bar + Price Line) */}
            <div className="glass p-6 rounded-xl border border-white/10">
                <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                    <Building2 size={20} className="text-cyan-400" />
                    三大法人買賣超趨勢 (30 日)
                </h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={MOCK_INSTITUTIONAL_DATA}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis
                                dataKey="date"
                                tick={{ fill: "#6B7280", fontSize: 11 }}
                                tickFormatter={(v) => v.slice(5)}
                            />
                            <YAxis
                                yAxisId="left"
                                tick={{ fill: "#6B7280", fontSize: 11 }}
                                label={{ value: "億元", angle: -90, position: "insideLeft", fill: "#6B7280" }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tick={{ fill: "#6B7280", fontSize: 11 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar
                                yAxisId="left"
                                dataKey="foreign"
                                name="外資"
                                stackId="a"
                                fill="#06B6D4"
                                radius={[2, 2, 0, 0]}
                            />
                            <Bar
                                yAxisId="left"
                                dataKey="trust"
                                name="投信"
                                stackId="a"
                                fill="#EC4899"
                                radius={[2, 2, 0, 0]}
                            />
                            <Bar
                                yAxisId="left"
                                dataKey="dealer"
                                name="自營商"
                                stackId="a"
                                fill="#F59E0B"
                                radius={[2, 2, 0, 0]}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="price"
                                name="股價"
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
                        近 7 日累計買賣超
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <span className="text-cyan-400 font-medium">外資</span>
                            <span className={`font-bold ${sum7.foreign >= 0 ? "text-red-400" : "text-green-400"}`}>
                                {sum7.foreign >= 0 ? "+" : ""}{sum7.foreign.toLocaleString()} 億
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <span className="text-pink-400 font-medium">投信</span>
                            <span className={`font-bold ${sum7.trust >= 0 ? "text-red-400" : "text-green-400"}`}>
                                {sum7.trust >= 0 ? "+" : ""}{sum7.trust.toLocaleString()} 億
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <span className="text-amber-400 font-medium">自營商</span>
                            <span className={`font-bold ${sum7.dealer >= 0 ? "text-red-400" : "text-green-400"}`}>
                                {sum7.dealer >= 0 ? "+" : ""}{sum7.dealer.toLocaleString()} 億
                            </span>
                        </div>
                    </div>
                </div>

                {/* 法人持股比例圓餅圖 */}
                <div className="glass p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                        <Users size={20} className="text-emerald-400" />
                        法人持股比例
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={MOCK_OWNERSHIP_DATA}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomLabel}
                                    outerRadius={100}
                                    innerRadius={50}
                                    dataKey="value"
                                    animationDuration={800}
                                >
                                    {MOCK_OWNERSHIP_DATA.map((entry, index) => (
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

            {/* 數據說明 */}
            <div className="glass p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <p className="text-amber-400/80 text-sm text-center">
                    ⚠️ 此頁面使用模擬數據展示，待 Crawler 擴充後接入真實三大法人買賣超資料。
                </p>
            </div>
        </div>
    );
}
