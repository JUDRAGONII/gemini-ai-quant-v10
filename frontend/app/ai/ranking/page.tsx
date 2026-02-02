"use client";

// Force dynamic rendering to avoid build-time data fetching errors in CI
export const dynamic = 'force-dynamic';

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    BarChart3,
    Trophy,
    Filter,
    RefreshCw,
    Award,
    Target,
    FileText
} from "lucide-react";
import RankingTable from "@/components/RankingTable";
import ScoreRadarChart from "@/components/ScoreRadarChart";
import { mockRankingData, generateRankingData } from "@/data/mockRanking";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";

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
    <div className="glass p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all">
        <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</span>
            <Icon size={18} className={color} />
        </div>
        <span className={`text-3xl font-black ${color} tracking-tighter`}>{value}</span>
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
            { dimension: "價值", fullMark: 100, score: selectedStock.valueScore },
            { dimension: "成長", fullMark: 100, score: selectedStock.growthScore },
            { dimension: "動能", fullMark: 100, score: selectedStock.momentumScore },
            { dimension: "品質", fullMark: 100, score: selectedStock.qualityScore },
            { dimension: "籌碼", fullMark: 100, score: selectedStock.chipScore },
        ]
        : [];

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <section className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 tracking-tighter uppercase">
                            智慧排名決策 <span className="text-sm font-medium text-amber-500/60 uppercase tracking-widest ml-2">AI Quantitative Ranking</span>
                        </h1>
                        <p className="text-gray-400 mt-2 flex items-center text-sm font-medium">
                            <Target className="w-4 h-4 mr-2 text-amber-400" />
                            基於多維度 AI 評分模型與即時行情，篩選全市場最佳投資標的
                            <span className="text-[10px] opacity-30 ml-2 uppercase font-mono italic">Strategic Scoring Engine v2.0</span>
                        </p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-6 py-3 bg-amber-500/10 text-amber-400 rounded-xl hover:bg-amber-500/20 transition-all disabled:opacity-50 cursor-pointer border border-amber-500/20 font-bold active:scale-95 shadow-lg shadow-amber-500/5 text-sm"
                    >
                        <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                        {isRefreshing ? "刷新中..." : "重新評分 RE-RANK"}
                    </button>
                </div>
            </section>

            {/* 統計卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="開發平均分 AVG" value={stats.avgScore} icon={BarChart3} color="text-amber-400" />
                <StatCard label="高分標的 HIGH" value={stats.highScoreCount} icon={Trophy} color="text-emerald-400" />
                <StatCard label="強勢品種 BULL" value={stats.positiveChangeCount} icon={Award} color="text-green-400" />
                <StatCard label="全庫標的 TOTAL" value={stats.totalCount} icon={Filter} color="text-blue-400" />
            </div>

            {/* 主要內容網格 */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* 排行表格 */}
                <div className="lg:col-span-3">
                    <GlassCard className="!rounded-[2.5rem] overflow-hidden border-white/5">
                        <div className="p-6 border-b border-white/5 bg-white/[0.01]">
                            <h2 className="text-xl font-bold flex items-center gap-3">
                                <FileText className="w-5 h-5 text-indigo-400" />
                                評分排行榜 <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">Global Ranking</span>
                            </h2>
                        </div>
                        <RankingTable
                            data={rankingData}
                            pageSize={10}
                            onRowClick={(item) => setSelectedStock(item)}
                        />
                    </GlassCard>
                </div>

                {/* 側邊：雷達圖 */}
                <div className="space-y-6">
                    <GlassCard className="p-6 !rounded-[2rem] border-amber-500/10 bg-amber-500/[0.02]">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
                            標的透視 <span className="text-[10px] text-amber-500 uppercase tracking-widest">Detail</span>
                        </h3>
                        {selectedStock && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <span className="text-2xl font-black text-white">{selectedStock.name}</span>
                                    <p className="text-amber-400 font-mono text-sm">{selectedStock.symbol}</p>
                                </div>
                                <ScoreRadarChart
                                    symbol={selectedStock.symbol}
                                    data={radarData}
                                    customScore={selectedStock.compositeScore}
                                />
                                <div className="pt-4">
                                    <button
                                        onClick={() => router.push(`/stocks/${selectedStock.symbol}/report`)}
                                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <FileText size={16} />
                                        查看 AI 投資報告
                                    </button>
                                </div>
                            </div>
                        )}
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}

// --- StatusBadge Helper (Not used in new layout but kept for ref if needed) ---
function StatusBadge({ label, status }: { label: string, status: 'online' | 'offline' }) {
    return (
        <div className="glass px-3 py-1.5 rounded-full flex items-center space-x-2 border border-white/10">
            <span className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="text-xs font-medium text-gray-300">{label}</span>
        </div>
    );
}
