"use client";

// Force dynamic rendering to avoid build-time data fetching errors in CI
export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    TrendingUp,
    BarChart3,
    FileText,
    Settings,
    Layers,
    Home,
    Trophy,
    Filter,
    RefreshCw,
} from "lucide-react";
import RankingTable from "@/components/RankingTable";
import ScoreRadarChart from "@/components/ScoreRadarChart";
import { mockRankingData, generateRankingData } from "@/data/mockRanking";

/**
 * AI 評分排行頁面
 * 展示量化因子評分排行榜與個股雷達圖
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

// 統計卡片組件
const StatCard = ({
    label,
    value,
    icon: Icon,
    color,
}: {
    label: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
}) => (
    <div className="glass p-5 rounded-xl border border-white/10">
        <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">{label}</span>
            <Icon size={18} className={color} />
        </div>
        <span className={`text-2xl font-bold ${color}`}>{value}</span>
    </div>
);

export default function RankingPage() {
    const router = useRouter();
    const [rankingData, setRankingData] = useState(mockRankingData);
    const [selectedStock, setSelectedStock] = useState(rankingData[0]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // 刷新數據
    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            const newData = generateRankingData();
            setRankingData(newData);
            setSelectedStock(newData[0]);
            setIsRefreshing(false);
        }, 800);
    };

    // 計算統計數據
    const stats = useMemo(() => {
        const avgScore =
            rankingData.reduce((sum, s) => sum + s.compositeScore, 0) /
            rankingData.length;
        const highScoreCount = rankingData.filter(
            (s) => s.compositeScore >= 70
        ).length;
        const positiveChangeCount = rankingData.filter(
            (s) => s.changePercent > 0
        ).length;

        return {
            avgScore: avgScore.toFixed(1),
            highScoreCount,
            positiveChangeCount,
            totalCount: rankingData.length,
        };
    }, [rankingData]);

    // 雷達圖數據
    const radarData = selectedStock
        ? [
            {
                dimension: "價值",
                fullMark: 100,
                score: selectedStock.valueScore,
            },
            {
                dimension: "成長",
                fullMark: 100,
                score: selectedStock.growthScore,
            },
            {
                dimension: "動能",
                fullMark: 100,
                score: selectedStock.momentumScore,
            },
            {
                dimension: "品質",
                fullMark: 100,
                score: selectedStock.qualityScore,
            },
            {
                dimension: "籌碼",
                fullMark: 100,
                score: selectedStock.chipScore,
            },
        ]
        : [];

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
                        />
                        <NavItem
                            icon={BarChart3}
                            label="演化分析"
                            href="/evolution"
                        />
                        <NavItem
                            icon={FileText}
                            label="決策報告"
                            href="/ai"
                            active
                        />
                        <NavItem
                            icon={Settings}
                            label="系統設定"
                            href="/settings"
                        />
                    </nav>
                </aside>

                {/* 主內容區 */}
                <main className="flex-1 ml-56 p-8">
                    {/* 頁面標題 */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent flex items-center gap-3">
                                <Trophy size={32} className="text-amber-400" />
                                AI 評分排行榜
                            </h1>
                            <p className="text-gray-400 mt-2">
                                基於量化因子的多維度智能評分
                            </p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            <RefreshCw
                                size={16}
                                className={isRefreshing ? "animate-spin" : ""}
                            />
                            {isRefreshing ? "刷新中..." : "刷新評分"}
                        </button>
                    </div>

                    {/* 統計卡片 */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <StatCard
                            label="平均評分"
                            value={stats.avgScore}
                            icon={BarChart3}
                            color="text-amber-400"
                        />
                        <StatCard
                            label="高分股 (≥70)"
                            value={stats.highScoreCount}
                            icon={Trophy}
                            color="text-emerald-400"
                        />
                        <StatCard
                            label="上漲標的"
                            value={stats.positiveChangeCount}
                            icon={TrendingUp}
                            color="text-green-400"
                        />
                        <StatCard
                            label="分析標的數"
                            value={stats.totalCount}
                            icon={Filter}
                            color="text-blue-400"
                        />
                    </div>

                    {/* 主要內容網格 */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* 排行表格 (佔 3 欄) */}
                        <div className="lg:col-span-3">
                            <RankingTable
                                data={rankingData}
                                pageSize={10}
                                onRowClick={(item) => setSelectedStock(item)}
                            />
                        </div>

                        {/* 側邊：選中股票的雷達圖 */}
                        <div className="space-y-6">
                            {selectedStock && (
                                <>
                                    <ScoreRadarChart
                                        symbol={selectedStock.symbol}
                                        data={radarData}
                                        size={250}
                                    />
                                    <Link
                                        href={`/stocks/${selectedStock.symbol}`}
                                    >
                                        <button className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all cursor-pointer">
                                            查看 {selectedStock.symbol} 詳情
                                        </button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* 說明區塊 */}
                    <div className="mt-8 glass p-6 rounded-xl border border-white/10">
                        <h3 className="text-lg font-semibold text-gray-200 mb-3">
                            評分維度說明
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                            <div>
                                <span className="text-amber-400 font-semibold">
                                    價值
                                </span>
                                <p className="text-gray-500">
                                    PE、PB、股息率
                                </p>
                            </div>
                            <div>
                                <span className="text-emerald-400 font-semibold">
                                    成長
                                </span>
                                <p className="text-gray-500">
                                    營收、EPS 增長率
                                </p>
                            </div>
                            <div>
                                <span className="text-blue-400 font-semibold">
                                    動能
                                </span>
                                <p className="text-gray-500">
                                    短期價格趨勢
                                </p>
                            </div>
                            <div>
                                <span className="text-purple-400 font-semibold">
                                    品質
                                </span>
                                <p className="text-gray-500">
                                    ROE、負債比率
                                </p>
                            </div>
                            <div>
                                <span className="text-rose-400 font-semibold">
                                    籌碼
                                </span>
                                <p className="text-gray-500">
                                    法人買賣超、主力動向
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
