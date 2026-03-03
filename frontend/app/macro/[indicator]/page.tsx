"use client";

// Force dynamic rendering
export const dynamic = "force-dynamic";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { supabase } from "@/lib/supabase";
import { Bilingual } from "@/components/ui/Bilingual";
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
    Activity
} from "lucide-react";

import InfoCard from "@/components/InfoCard";

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

// 靜態配置檔以彌補資料庫未涵蓋的欄位
const INDICATOR_MAP: Record<string, any> = {
    GDP: { nameEn: "Real GDP Growth", nameZh: "實質 GDP 年增率", unit: "%", color: "#3B82F6", freq: "季", source: "FRED" },
    CPI: { nameEn: "CPI YoY", nameZh: "消費者物價指數", unit: "Index", color: "#F43F5E", freq: "月", source: "FRED" },
    VIX: { nameEn: "VIX Volatility Index", nameZh: "恐慌指數", unit: "pts", color: "#F59E0B", freq: "日", source: "CBOE" },
    GOLD: { nameEn: "Gold Price", nameZh: "黃金現貨", unit: "USD/oz", color: "#F59E0B", freq: "日", source: "LBMA" },
    DXY: { nameEn: "US Dollar Index", nameZh: "美元指數", unit: "pts", color: "#3B82F6", freq: "日", source: "ICE" },
    UNRATE: { nameEn: "Unemployment Rate", nameZh: "失業率", unit: "%", color: "#8B5CF6", freq: "月", source: "BLS" },
    FEDFUNDS: { nameEn: "Fed Funds Rate", nameZh: "基準利率", unit: "%", color: "#10B981", freq: "月", source: "FED" },
};

const fetchIndicatorData = async (code: string) => {
    const { data, error } = await supabase
        .from('macro_indicators')
        .select('*')
        .eq('indicator_code', code.toUpperCase())
        .order('reference_date', { ascending: true }); // 取歷史由舊到新畫圖

    if (error) throw error;
    if (!data || data.length === 0) return null;

    // 取得最新一輪數值與前一天的資料點進行波動率計算
    const sortedDesc = [...data].reverse();
    const latestValue = sortedDesc[0].value;
    const previousValue = sortedDesc.length > 1 ? sortedDesc[1].value : latestValue;
    const changePercent = previousValue !== 0 ? ((latestValue - previousValue) / Math.abs(previousValue)) * 100 : 0;

    // Mapping format for Chart
    const historyData = data.map(d => ({
        date: d.reference_date,
        value: d.value
    }));

    return {
        code: code.toUpperCase(),
        latestValue,
        changePercent,
        historyData,
        ...INDICATOR_MAP[code.toUpperCase()]
    };
};

export default function MacroIndicatorDetailPage() {
    const params = useParams();
    const router = useRouter();
    const code = params.indicator as string;

    const { data: indicator, isLoading } = useSWR(`macro_detail_${code}`, () => fetchIndicatorData(code));

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
                <Activity className="w-8 h-8 text-blue-500 animate-spin" />
                <span className="text-slate-500 font-mono text-sm tracking-widest"><Bilingual zh="正在載入指標數據..." en="LOADING INDICATOR DATA..." /></span>
            </div>
        );
    }

    // 若找不到指標，顯示錯誤訊息
    if (!indicator) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">
                        <Bilingual zh="找不到指標" en="Indicator Not Found" />
                    </h1>
                    <p className="text-gray-400 mb-6">
                        <Bilingual zh={`指標代碼「${code}」目前無關聯資料或尚未支援。`} en={`Indicator code '${code}' is currently unavailable or unsupported.`} />
                    </p>
                    <Link
                        href="/macro"
                        className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
                    >
                        <Bilingual zh="返回指標列表" en="Return to Macro" />
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
                        <span><Bilingual zh="返回" en="Back" /></span>
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
                                <Bilingual zh={indicator.nameZh} en={indicator.nameEn} />
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">
                                {indicator.source} DATA ENGINE
                            </p>
                        </div>
                    </div>
                    <p className="text-gray-400 mt-4 max-w-3xl">
                        <Bilingual
                            zh={`此頁面展示 ${indicator.nameZh} 歷年的數據關聯與走勢，作為 AI 量化模型參考基準。`}
                            en={`This page visualizes the historical correlation and trend of ${indicator.nameEn} as a reference baseline for AI Quant models.`}
                        />
                    </p>
                </header>

                {/* 當前值與變化 */}
                <div className="glass p-6 rounded-xl border border-white/10 mb-8 bg-slate-900/40">
                    <div className="flex flex-wrap items-end gap-8">
                        <div>
                            <p className="text-[10px] font-mono tracking-widest text-slate-500 mb-1 uppercase"><Bilingual zh="最新數值" en="LATEST VALUE" /></p>
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
                        label={<Bilingual zh="更新頻率" en="FREQUENCY" />}
                        value={indicator.freq}
                    />
                    <InfoCard
                        icon={Database}
                        label={<Bilingual zh="數據來源" en="DATA SOURCE" />}
                        value={indicator.source}
                    />
                    <InfoCard
                        icon={Calendar}
                        label={<Bilingual zh="最新日期" en="LATEST DATE" />}
                        value={indicator.historyData && indicator.historyData.length > 0 ? indicator.historyData[indicator.historyData.length - 1].date : '---'}
                    />
                </div>

                {/* 走勢圖 */}
                <div className="glass p-6 rounded-xl border border-white/10 mb-8 bg-slate-900/40">
                    <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                        <TrendingUp size={20} style={{ color: indicator.color }} />
                        <Bilingual zh="歷史走勢" en="Historical Trend" />
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
                <div className="glass p-6 rounded-xl border border-white/10 bg-slate-900/40">
                    <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                        <Info size={18} className="text-gray-400" />
                        <Bilingual zh="歷史數據" en="Historical Data" />
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4 text-slate-500 font-mono tracking-widest text-[10px] uppercase">
                                        <Bilingual zh="日期" en="DATE" />
                                    </th>
                                    <th className="text-right py-3 px-4 text-slate-500 font-mono tracking-widest text-[10px] uppercase">
                                        <Bilingual zh="數值" en="VALUE" />
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

                {/* 數據狀態標籤 */}
                <div className="mt-8 glass py-2 px-4 rounded border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                    <p className="text-emerald-400/80 text-[10px] uppercase tracking-widest font-mono">
                        <Bilingual zh="已連線至 SUPABASE 實體庫" en="LIVE CONNECTION ACTIVATED" />
                    </p>
                </div>
            </main>
        </div>
    );
}
