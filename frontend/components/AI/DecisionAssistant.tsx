"use client";

/**
 * DecisionAssistant — AI CIO 決策助手主面板 (Phase 13.2)
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
            {/* 區塊標題 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
                        <BrainCircuit className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight">
                            AI 決策助手
                        </h2>
                        <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                            CIO Decision Assistant / {ticker}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleRefresh}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all text-slate-400 hover:text-cyan-400"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    重新分析
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
                            <p className="text-slate-500 text-sm">正在載入 18 因子評分...</p>
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
                            <p className="text-slate-500 text-sm font-bold">尚無 18 因子評分資料</p>
                            <p className="text-[10px] text-slate-600 mt-1 font-mono">
                                執行 trigger-calculation 以計算評分
                            </p>
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
