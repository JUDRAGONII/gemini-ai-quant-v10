"use client";

// 強制動態渲染，避免 CI 建置時的 Data Fetching 錯誤
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    BarChart3,
    Trophy,
    Filter,
    RefreshCw,
    Award,
    Target,
    FileText,
    Loader2,
    AlertCircle,
} from "lucide-react";
import RankingTable from "@/components/RankingTable";
import ScoreRadarChart from "@/components/ScoreRadarChart";
import { GlassCard } from "@/components/ui/GlassCard";
import { Bilingual } from "@/components/ui/Bilingual";
import { motion } from "framer-motion";

// ====== 型別定義 (TypeScript Interface) ======
interface RankingItem {
    rank: number;
    symbol: string;
    name: string;
    composite_score: number;
    value_score: number;
    growth_score: number;
    quality_score: number;
    momentum_score: number;
    change_percent: number;
    trade_date?: string;
}

// ====== 統計卡片子組件 ======
const StatCard = ({
    label,
    value,
    icon: Icon,
    color,
}: {
    label: React.ReactNode;
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

// ====== 主頁面元件 ======
export default function RankingPage() {
    const router = useRouter();
    const [rankingData, setRankingData] = useState<RankingItem[]>([]);
    const [selectedStock, setSelectedStock] = useState<RankingItem | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 從後端 API 取得排行榜資料
    const fetchRanking = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/v1/analysis/top-scores?limit=50&dimension=composite');
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || '伺服器錯誤');
            }
            const json = await res.json();
            const data: RankingItem[] = json.data || [];
            setRankingData(data);
            if (data.length > 0) {
                setSelectedStock(data[0]);
            }
        } catch (e: any) {
            setError(e.message || '無法載入排行榜');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRanking();
    }, []);

    // 刷新數據
    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchRanking();
        setIsRefreshing(false);
    };

    // 計算統計數據
    const stats = useMemo(() => {
        if (rankingData.length === 0) return { avgScore: '0', highScoreCount: 0, positiveChangeCount: 0, totalCount: 0 };
        const avgScore = rankingData.reduce((sum, s) => sum + s.composite_score, 0) / rankingData.length;
        const highScoreCount = rankingData.filter((s) => s.composite_score >= 70).length;
        const positiveChangeCount = rankingData.filter((s) => s.change_percent > 0).length;
        return {
            avgScore: avgScore.toFixed(1),
            highScoreCount,
            positiveChangeCount,
            totalCount: rankingData.length,
        };
    }, [rankingData]);

    // 雷達圖數據 (對應前端 ScoreRadarChart 介面)
    const radarData = selectedStock
        ? [
            { dimension: "價值", fullMark: 100, score: Math.round(selectedStock.value_score) },
            { dimension: "成長", fullMark: 100, score: Math.round(selectedStock.growth_score) },
            { dimension: "動能", fullMark: 100, score: Math.round(selectedStock.momentum_score) },
            { dimension: "品質", fullMark: 100, score: Math.round(selectedStock.quality_score) },
        ]
        : [];

    // 將 API 回傳格式映射為 RankingTable 所需的 camelCase 格式
    const tableData = rankingData.map((item) => ({
        rank: item.rank,
        symbol: item.symbol,
        name: item.name,
        compositeScore: Math.round(item.composite_score),
        valueScore: Math.round(item.value_score),
        growthScore: Math.round(item.growth_score),
        momentumScore: Math.round(item.momentum_score),
        qualityScore: Math.round(item.quality_score),
        chipScore: 0, // 後端暫無籌碼維度，預設 0
        changePercent: item.change_percent,
    }));

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 頁面標頭 */}
            <section className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 tracking-tighter uppercase">
                            <Bilingual zh="智慧排名決策" en="AI Quantitative Ranking" />
                        </h1>
                        <div className="text-gray-400 mt-2 flex items-center text-sm font-medium">
                            <Target className="w-4 h-4 mr-2 text-amber-400" />
                            <Bilingual
                                zh="基於多維度 AI 評分模型與即時行情，篩選全市場最佳投資標的"
                                en="Filtering top investment targets based on multi-dimensional AI scoring and real-time data"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing || loading}
                        className="flex items-center gap-2 px-6 py-3 bg-amber-500/10 text-amber-400 rounded-xl hover:bg-amber-500/20 transition-all disabled:opacity-50 cursor-pointer border border-amber-500/20 font-bold active:scale-95 shadow-lg shadow-amber-500/5 text-sm"
                    >
                        <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                        <Bilingual zh={isRefreshing ? "刷新中..." : "重新評分"} en={isRefreshing ? "Refreshing..." : "RE-RANK"} />
                    </button>
                </div>
            </section>

            {/* 統計卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label={<Bilingual zh="綜合平均分" en="AVG Score" />} value={stats.avgScore} icon={BarChart3} color="text-amber-400" />
                <StatCard label={<Bilingual zh="高分標的" en="High Score" />} value={stats.highScoreCount} icon={Trophy} color="text-emerald-400" />
                <StatCard label={<Bilingual zh="強勢品種" en="Bullish" />} value={stats.positiveChangeCount} icon={Award} color="text-green-400" />
                <StatCard label={<Bilingual zh="全庫標的" en="Total" />} value={stats.totalCount} icon={Filter} color="text-blue-400" />
            </div>

            {/* 載入中狀態 */}
            {loading && (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                    <span className="ml-3 text-gray-400">
                        <Bilingual zh="正在載入排行榜..." en="Loading rankings..." />
                    </span>
                </div>
            )}

            {/* 錯誤狀態 */}
            {error && !loading && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-xl flex items-center gap-3"
                >
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                </motion.div>
            )}

            {/* 主要內容網格 */}
            {!loading && !error && rankingData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* 排行表格 */}
                    <div className="lg:col-span-3">
                        <GlassCard className="!rounded-[2.5rem] overflow-hidden border-white/5">
                            <div className="p-6 border-b border-white/5 bg-white/[0.01]">
                                <h2 className="text-xl font-bold flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-indigo-400" />
                                    <Bilingual zh="評分排行榜" en="Global Ranking" />
                                </h2>
                            </div>
                            <RankingTable
                                data={tableData}
                                pageSize={10}
                                onRowClick={(item) => {
                                    const original = rankingData.find(r => r.symbol === item.symbol);
                                    if (original) setSelectedStock(original);
                                }}
                            />
                        </GlassCard>
                    </div>

                    {/* 側邊：雷達圖 */}
                    <div className="space-y-6">
                        <GlassCard className="p-6 !rounded-[2rem] border-amber-500/10 bg-amber-500/[0.02]">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
                                <Bilingual zh="標的透視" en="Detail" />
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
                                        customScore={Math.round(selectedStock.composite_score)}
                                    />
                                    <div className="pt-4">
                                        <button
                                            onClick={() => router.push(`/stocks/${selectedStock.symbol}/report`)}
                                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <FileText size={16} />
                                            <Bilingual zh="查看 AI 投資報告" en="View AI Report" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </GlassCard>
                    </div>
                </div>
            )}

            {/* 空資料狀態 */}
            {!loading && !error && rankingData.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center backdrop-blur-sm"
                >
                    <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <div className="text-gray-400 text-lg">
                        <Bilingual zh="尚無排行資料" en="No ranking data available" />
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                        <Bilingual zh="請確認 VQGM 評分已完成計算" en="Please ensure VQGM scoring has been calculated" />
                    </div>
                </motion.div>
            )}
        </div>
    );
}
