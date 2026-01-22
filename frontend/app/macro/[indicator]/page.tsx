"use client";

// Force dynamic rendering
export const dynamic = "force-dynamic";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import {
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    Minus,
    Calendar,
    Database,
    Clock,
    Info,
} from "lucide-react";
import { findIndicatorByCode, MACRO_INDICATORS } from "@/data/mockMacro";

/**
 * 宏觀指標詳情頁
 * 展示單一指標的完整走勢圖與歷史數據表格
 */

// 自定義 Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass p-3 rounded-lg border border-white/20 text-sm">
                <p className="text-gray-400 mb-1">{label}</p>
                <p className="text-white font-bold">
                    {payload[0].value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

// 資訊卡片組件
const InfoCard = ({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) => (
    <div className="glass p-4 rounded-xl border border-white/10 flex items-center gap-4">
        <div className="p-2 rounded-lg bg-white/5">
            <Icon size={20} className="text-gray-400" />
        </div>
        <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">
                {label}
            </p>
            <p className="text-white font-medium">{value}</p>
        </div>
    </div>
);

export default function MacroIndicatorDetailPage() {
    const params = useParams();
    const router = useRouter();
    const code = params.indicator as string;

    // 查找指標數據
    const indicator = findIndicatorByCode(code);

    // 若找不到指標，顯示錯誤訊息
    if (!indicator) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">
                        找不到指標
                    </h1>
                    <p className="text-gray-400 mb-6">
                        指標代碼「{code}」不存在或尚未支援。
                    </p>
                    <Link
                        href="/macro"
                        className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
                    >
                        返回指標列表
                    </Link>
                </div>
            </div>
        );
    }

    // 計算漲跌狀態
    const isPositive = indicator.changePercent > 0;
    const isNegative = indicator.changePercent < 0;
    const trendColor = isPositive
        ? "#10B981"
        : isNegative
            ? "#EF4444"
            : "#6B7280";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-20">
            {/* 導航 */}
            <nav className="glass sticky top-0 z-50 border-b border-white/10 backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center space-x-2 text-gray-400 hover:text-white transition cursor-pointer"
                    >
                        <ArrowLeft size={20} />
                        <span>返回</span>
                    </button>
                    <div className="flex items-center space-x-2">
                        <span
                            className="font-bold tracking-wider"
                            style={{ color: indicator.color }}
                        >
                            {indicator.code}
                        </span>
                        <div className="w-px h-4 bg-gray-700 mx-2"></div>
                        <span className="text-xs text-gray-500">
                            MACRO INDICATOR
                        </span>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-4 mt-8">
                {/* 頁面標題 */}
                <header className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${indicator.color}20` }}
                        >
                            <TrendingUp size={20} style={{ color: indicator.color }} />
                        </div>
                        <div>
                            <h1
                                className="text-3xl font-bold"
                                style={{ color: indicator.color }}
                            >
                                {indicator.name}
                            </h1>
                            <p className="text-gray-500 text-sm">
                                {indicator.fullName}
                            </p>
                        </div>
                    </div>
                    <p className="text-gray-400 mt-4 max-w-3xl">
                        {indicator.description}
                    </p>
                </header>

                {/* 當前值與變化 */}
                <div className="glass p-6 rounded-xl border border-white/10 mb-8">
                    <div className="flex flex-wrap items-end gap-8">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">最新數值</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-bold text-white">
                                    {indicator.latestValue.toLocaleString()}
                                </span>
                                <span className="text-xl text-gray-400">
                                    {indicator.unit}
                                </span>
                            </div>
                        </div>
                        <div
                            className="flex items-center gap-2 text-lg font-semibold px-4 py-2 rounded-lg"
                            style={{
                                backgroundColor: `${trendColor}20`,
                                color: trendColor,
                            }}
                        >
                            {isPositive && <TrendingUp size={20} />}
                            {isNegative && <TrendingDown size={20} />}
                            {!isPositive && !isNegative && <Minus size={20} />}
                            {indicator.changePercent > 0 ? "+" : ""}
                            {indicator.changePercent.toFixed(2)}%
                        </div>
                    </div>
                </div>

                {/* 資訊卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <InfoCard
                        icon={Clock}
                        label="更新頻率"
                        value={indicator.frequency}
                    />
                    <InfoCard
                        icon={Database}
                        label="數據來源"
                        value={indicator.source}
                    />
                    <InfoCard
                        icon={Calendar}
                        label="最後更新"
                        value={new Date().toLocaleDateString("zh-TW")}
                    />
                </div>

                {/* 走勢圖 */}
                <div className="glass p-6 rounded-xl border border-white/10 mb-8">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp size={20} style={{ color: indicator.color }} />
                        歷史走勢 (30 日)
                    </h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={indicator.historyData}>
                                <defs>
                                    <linearGradient
                                        id={`gradient-${indicator.code}`}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor={indicator.color}
                                            stopOpacity={0.3}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor={indicator.color}
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#333"
                                />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: "#6B7280", fontSize: 11 }}
                                    tickFormatter={(v) => v.slice(5)}
                                />
                                <YAxis
                                    tick={{ fill: "#6B7280", fontSize: 11 }}
                                    domain={["auto", "auto"]}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={indicator.color}
                                    strokeWidth={2}
                                    fill={`url(#gradient-${indicator.code})`}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 歷史數據表格 */}
                <div className="glass p-6 rounded-xl border border-white/10">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Info size={20} className="text-gray-400" />
                        歷史數據
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4 text-gray-500 font-medium">
                                        日期
                                    </th>
                                    <th className="text-right py-3 px-4 text-gray-500 font-medium">
                                        數值
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {indicator.historyData
                                    .slice()
                                    .reverse()
                                    .slice(0, 10)
                                    .map((row: any, index: number) => (
                                        <tr
                                            key={row.date}
                                            className="border-b border-white/5 hover:bg-white/5 transition"
                                        >
                                            <td className="py-3 px-4 text-gray-400">
                                                {row.date}
                                            </td>
                                            <td className="py-3 px-4 text-white text-right font-mono">
                                                {row.value.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 模擬數據警告 */}
                <div className="mt-8 glass p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                    <p className="text-amber-400/80 text-sm text-center">
                        ⚠️ 此頁面使用模擬數據展示，待 Supabase 整合後接入真實資料。
                    </p>
                </div>
            </main>
        </div>
    );
}
