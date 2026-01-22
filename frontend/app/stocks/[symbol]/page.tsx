"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    TrendingUp,
    BarChart3,
    FileText,
    Settings,
    Layers,
    Home,
    ArrowLeft,
    Building2,
    DollarSign,
    Percent,
    TrendingDown,
} from "lucide-react";
import PriceChart from "@/components/PriceChart";
import ScoreRadarChart from "@/components/ScoreRadarChart";
import { findStockBySymbol } from "@/data/mockStocks";

/**
 * 個股詳情頁面
 * 展示股票價格走勢、公司資訊與 AI 評分
 */

// 側邊欄導航項目組件
const NavItem = ({
    icon: Icon,
    label,
    href,
    active = false,
}: {
    icon: React.ElementType;
    label: string;
    href: string;
    active?: boolean;
}) => (
    <Link href={href}>
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${active
                    ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
        >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </div>
    </Link>
);

// 資訊卡片組件
const InfoCard = ({
    icon: Icon,
    label,
    value,
    color = "text-white",
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color?: string;
}) => (
    <div className="glass p-4 rounded-xl border border-white/10">
        <div className="flex items-center gap-2 mb-2">
            <Icon size={16} className="text-gray-500" />
            <span className="text-sm text-gray-400">{label}</span>
        </div>
        <span className={`text-xl font-bold ${color}`}>{value}</span>
    </div>
);

export default function StockDetailPage() {
    const params = useParams();
    const router = useRouter();
    const symbol = params.symbol as string;

    // 查找股票數據
    const stock = findStockBySymbol(symbol);

    // 股票未找到
    if (!stock) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">
                        找不到股票: {symbol}
                    </h1>
                    <Link
                        href="/stocks"
                        className="text-amber-400 hover:underline"
                    >
                        返回股票列表
                    </Link>
                </div>
            </div>
        );
    }

    // 判斷漲跌
    const isPositive = stock.changePercent > 0;
    const isNegative = stock.changePercent < 0;
    const trendColor = isPositive
        ? "text-emerald-400"
        : isNegative
            ? "text-red-400"
            : "text-gray-400";

    // 模擬 AI 評分數據
    const scoreData = [
        { dimension: "價值", fullMark: 100, score: Math.floor(Math.random() * 30) + 60 },
        { dimension: "成長", fullMark: 100, score: Math.floor(Math.random() * 40) + 50 },
        { dimension: "動能", fullMark: 100, score: Math.floor(Math.random() * 35) + 55 },
        { dimension: "品質", fullMark: 100, score: Math.floor(Math.random() * 25) + 65 },
        { dimension: "籌碼", fullMark: 100, score: Math.floor(Math.random() * 40) + 45 },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* 頂部狀態列 */}
            <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
                <div className="flex items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                            <TrendingUp size={18} className="text-white" />
                        </div>
                        <span className="text-lg font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                            AI QUANT
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-gray-400">AI Worker</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-gray-400">Database</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex pt-14">
                {/* 側邊欄 */}
                <aside className="fixed left-0 top-14 bottom-0 w-56 glass border-r border-white/10 p-4 overflow-y-auto">
                    <nav className="space-y-2">
                        <NavItem icon={Home} label="總覽 (Overview)" href="/" />
                        <NavItem
                            icon={Layers}
                            label="籌碼分析 (Chips)"
                            href="/chips"
                        />
                        <NavItem
                            icon={TrendingUp}
                            label="市場動態"
                            href="/stocks"
                            active
                        />
                        <NavItem
                            icon={BarChart3}
                            label="演化分析"
                            href="/evolution"
                        />
                        <NavItem icon={FileText} label="決策報告" href="/ai" />
                        <NavItem
                            icon={Settings}
                            label="系統設定"
                            href="/settings"
                        />
                    </nav>
                </aside>

                {/* 主內容區 */}
                <main className="flex-1 ml-56 p-8">
                    {/* 返回按鈕與標題 */}
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => router.back()}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-white">
                                    {stock.symbol}
                                </h1>
                                <span className="px-2 py-1 text-xs rounded-full bg-white/10 text-gray-400">
                                    {stock.market === "TW" ? "台股" : "美股"}
                                </span>
                            </div>
                            <p className="text-gray-400">{stock.name}</p>
                        </div>
                    </div>

                    {/* 價格與漲跌幅 */}
                    <div className="glass p-6 rounded-xl border border-white/10 mb-8">
                        <div className="flex items-end gap-4">
                            <span className="text-4xl font-bold text-white">
                                {stock.market === "TW"
                                    ? stock.price.toLocaleString("zh-TW")
                                    : `$${stock.price.toFixed(2)}`}
                            </span>
                            <div
                                className={`flex items-center gap-2 text-lg font-semibold ${trendColor}`}
                            >
                                {isPositive ? (
                                    <TrendingUp size={20} />
                                ) : isNegative ? (
                                    <TrendingDown size={20} />
                                ) : null}
                                <span>
                                    {isPositive ? "+" : ""}
                                    {stock.changePercent.toFixed(2)}%
                                </span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            最後更新：{new Date().toLocaleDateString("zh-TW")}
                        </p>
                    </div>

                    {/* 主要內容網格 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* 左側：價格走勢圖 (佔 2 欄) */}
                        <div className="lg:col-span-2">
                            <PriceChart
                                symbol={stock.symbol}
                                data={stock.priceHistory}
                                height={350}
                            />
                        </div>

                        {/* 右側：AI 評分雷達圖 */}
                        <div>
                            <ScoreRadarChart
                                symbol={stock.symbol}
                                data={scoreData}
                                size={280}
                            />
                        </div>
                    </div>

                    {/* 公司資訊卡片 */}
                    <div className="mt-8">
                        <h2 className="text-xl font-bold text-gray-200 mb-4">
                            公司資訊
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            <InfoCard
                                icon={Building2}
                                label="產業"
                                value={stock.info.industry}
                            />
                            <InfoCard
                                icon={DollarSign}
                                label="市值"
                                value={stock.info.marketCap}
                            />
                            <InfoCard
                                icon={Percent}
                                label="本益比"
                                value={stock.info.pe.toFixed(1)}
                                color="text-amber-400"
                            />
                            <InfoCard
                                icon={TrendingUp}
                                label="EPS"
                                value={stock.info.eps.toFixed(2)}
                                color="text-emerald-400"
                            />
                            <InfoCard
                                icon={DollarSign}
                                label="殖利率"
                                value={`${stock.info.dividend}%`}
                                color="text-blue-400"
                            />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
