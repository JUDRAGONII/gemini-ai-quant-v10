"use client";

import React from "react";
import { DollarSign, TrendingUp, Layers, BarChart } from "lucide-react";
import ChipChart from "@/components/ChipChart";
import { MOCK_CHIPS_DATA } from "@/data/mockChips";
import { Bilingual } from "@/components/ui/Bilingual";
import { useChipsData } from "@/hooks/useChipsData";

/**
 * 籌碼分析 - 總覽頁
 * 展示法人動向與股價趨勢的組合圖表
 */

// 統計卡片組件
function StatCard({
    labelZh,
    labelEn,
    value,
    icon,
    color,
    isPrice = false,
}: {
    labelZh: string;
    labelEn: string;
    value: number;
    icon: React.ReactElement;
    color: string;
    isPrice?: boolean;
}) {
    const isPositive = value > 0;
    const sign = isPositive && !isPrice ? "+" : "";
    const displayValue = isPrice
        ? value.toFixed(1)
        : `${sign}${value.toLocaleString()}`;
    const valueColor = isPrice
        ? "text-white"
        : isPositive
            ? "text-red-400"
            : "text-green-400"; // TW Stock Color

    return (
        <div className="glass p-5 rounded-xl border border-white/5 flex items-center justify-between hover:bg-white/5 transition cursor-pointer">
            <div>
                <Bilingual
                    zh={labelZh}
                    en={labelEn}
                    mode="stacked"
                    zhClassName="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1"
                    enClassName="text-[8px] opacity-40 uppercase tracking-widest font-mono"
                />
                <p className={`text-2xl font-bold font-mono ${valueColor}`}>
                    {displayValue}
                </p>
            </div>
            <div className={`p-3 rounded-full bg-white/5 ${color}`}>
                {React.cloneElement(icon, { size: 24 })}
            </div>
        </div>
    );
}

// 圖例項目
function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${color}`}></span>
            <span className="text-gray-400">{label}</span>
        </div>
    );
}

export default function ChipsOverviewPage() {
    const { chipsData, isLoading, isError } = useChipsData("2330", 30); // 預設台積電

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    if (isError || chipsData.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center text-red-400">
                <Bilingual zh="無法載入籌碼數據" en="Failed to load chips data" />
            </div>
        );
    }

    const lastDay = chipsData[chipsData.length - 1];

    return (
        <div className="space-y-8">
            {/* 統計卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    labelZh="外資買賣超"
                    labelEn="FOREIGN"
                    value={lastDay.foreign}
                    icon={<DollarSign />}
                    color="text-cyan-400"
                />
                <StatCard
                    labelZh="投信買賣超"
                    labelEn="TRUST"
                    value={lastDay.trust}
                    icon={<TrendingUp />}
                    color="text-pink-400"
                />
                <StatCard
                    labelZh="融資餘額"
                    labelEn="MARGIN"
                    value={lastDay.margin_balance}
                    icon={<Layers />}
                    color="text-yellow-400"
                />
                <StatCard
                    labelZh="收盤價"
                    labelEn="CLOSE"
                    value={lastDay.price}
                    icon={<BarChart />}
                    color="text-emerald-400"
                    isPrice
                />
            </div>

            {/* 主圖表區塊 */}
            <div className="glass p-6 md:p-8 rounded-2xl border border-white/5 relative overflow-hidden">
                {/* 背景光暈 */}
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                    <BarChart className="text-pink-500" />
                    <Bilingual
                        zh="法人動向 vs 股價趨勢"
                        en="Institutional Flow vs Price Trend"
                        mode="inline"
                        zhClassName="text-xl font-bold"
                        enClassName="text-[10px] opacity-30 uppercase tracking-widest font-mono ml-2"
                    />
                </h2>

                <ChipChart data={chipsData} />

                <div className="mt-6 flex justify-center space-x-8 text-sm">
                    <LegendItem color="bg-cyan-500" label="外資買盤 (Foreign)" />
                    <LegendItem color="bg-pink-500" label="投信佈局 (Trust)" />
                    <LegendItem color="bg-yellow-500" label="股價走勢 (Price)" />
                </div>
            </div>
        </div>
    );
}

