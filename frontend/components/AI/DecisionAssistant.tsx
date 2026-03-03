"use client";

/**
 * DecisionAssistant — AI CIO 決策助手主面板 (Phase 13.2 → Phase 14.2 雙語化)
 * 
 * 整合 FactorRadarChart + AgentDebatePanel，
 * 透過 SWR 從後端拉取 18 因子評分 + AI 辯證數據。
 */

import React from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import { BrainCircuit, RefreshCw } from "lucide-react";
import FactorRadarChart from "./FactorRadarChart";
import AgentDebatePanel from "./AgentDebatePanel";
import { Bilingual } from "@/components/ui/Bilingual";

// === 共用 Fetcher ===
const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
});

interface DecisionAssistantProps {
    ticker: string;
}

export default function DecisionAssistant({ ticker }: DecisionAssistantProps) {
    // 18 因子評分 API
    const {
        data: scoresData,
        isLoading: scoresLoading,
        mutate: refreshScores,
    } = useSWR(
        ticker ? `/api/v1/analysis/18factor-scores?symbol=${ticker}` : null,
        fetcher,
        { revalidateOnFocus: false, shouldRetryOnError: false }
    );

    // AI 辯證共識 API
    const {
        data: dialecticData,
        isLoading: dialecticLoading,
        mutate: refreshDialectic,
    } = useSWR(
        ticker ? `/api/v1/insights/dialectic/${ticker}` : null,
        fetcher,
        { revalidateOnFocus: false }
    );

    const handleRefresh = () => {
        refreshScores();
        refreshDialectic();
    };

    const hasScoreData = scoresData && scoresData.status !== "no_data";

    return (
        <div className="space-y-6">
            {/* 區塊標題 — 雙語化 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
                        <BrainCircuit className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <Bilingual
                            zh="AI 決策助手"
                            en={`CIO Decision Assistant / ${ticker}`}
                            mode="stacked"
                            zhClassName="text-xl font-black text-white tracking-tight"
                            enClassName="text-[10px] text-slate-500 font-mono tracking-widest uppercase"
                        />
                    </div>
                </div>

                <button
                    onClick={handleRefresh}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all text-slate-400 hover:text-cyan-400 cursor-pointer"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <Bilingual zh="重新分析" en="RE-ANALYZE" mode="inline" enClassName="ml-1 text-[8px] opacity-50" />
                </button>
            </div>

            {/* Bento Grid: 雷達圖 + 辯論面板 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 左：18 因子雷達圖 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {scoresLoading ? (
                        <div className="bg-gradient-to-br from-[#0d1117] to-[#161b22] border border-white/5 rounded-2xl p-8 h-[420px] flex items-center justify-center animate-pulse">
                            <Bilingual
                                zh="正在載入 18 因子評分..."
                                en="Loading 18-Factor Scores..."
                                mode="stacked"
                                zhClassName="text-slate-500 text-sm"
                                enClassName="text-[9px] text-slate-600 font-mono tracking-wider uppercase mt-1"
                            />
                        </div>
                    ) : hasScoreData ? (
                        <FactorRadarChart
                            symbol={ticker}
                            dimensions={scoresData.dimensions || []}
                            factors={scoresData.factors || []}
                            compositeScore={scoresData.composite_score || 0}
                            grade={scoresData.grade}
                        />
                    ) : (
                        <div className="bg-gradient-to-br from-[#0d1117] to-[#161b22] border border-white/5 rounded-2xl p-8 h-[420px] flex flex-col items-center justify-center">
                            <BrainCircuit className="w-12 h-12 text-slate-700 mb-4" />
                            <Bilingual
                                zh="尚無 18 因子評分資料"
                                en="No 18-Factor Score Data Available"
                                mode="stacked"
                                zhClassName="text-slate-500 text-sm font-bold"
                                enClassName="text-[9px] text-slate-600 font-mono tracking-wider uppercase mt-1"
                            />
                            <Bilingual
                                zh="執行分析以計算評分"
                                en="Run analysis to calculate scores"
                                mode="stacked"
                                zhClassName="text-[10px] text-slate-600 mt-2"
                                enClassName="text-[8px] text-slate-700 font-mono mt-0.5"
                            />
                        </div>
                    )}
                </motion.div>

                {/* 右：AI 辯證面板 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                >
                    <AgentDebatePanel
                        data={dialecticData || null}
                        isLoading={dialecticLoading}
                    />
                </motion.div>
            </div>
        </div>
    );
}
