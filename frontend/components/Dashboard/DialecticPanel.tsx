'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ShieldCheck, TrendingUp, AlertTriangle, TrendingDown } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface AgentOpinion {
    name: string;
    opinion: string;
    reason: string;
}

interface DialecticData {
    ticker: string;
    consensus: string;
    conviction: number;
    agents: AgentOpinion[];
    updated_at: string;
}

export default function DialecticPanel({ ticker = '2330' }: { ticker?: string }) {
    const { data, error, isLoading } = useSWR<DialecticData>(
        ticker ? `/api/v1/insights/dialectic/${ticker}` : null,
        fetcher
    );

    if (error) return <div className="p-4 text-red-500 bg-red-900/20 rounded-xl">載入 AI 辯證數據失敗</div>;
    if (isLoading || !data) return <div className="p-8 text-center animate-pulse">AI 正在辯證中...</div>;

    const getOpinionIcon = (opinion: string) => {
        if (opinion.includes('多') || opinion.includes('Bull')) return <TrendingUp className="w-4 h-4 text-green-400" />;
        if (opinion.includes('空') || opinion.includes('Bear')) return <TrendingDown className="w-4 h-4 text-red-400" />;
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    };

    return (
        <div className="relative group overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:border-purple-500/50 shadow-2xl">
            {/* 背景裝飾 */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white tracking-wider">AI 辯證引擎</h3>
                        <p className="text-xs text-slate-400">Multi-Agent Debate Consensus</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-slate-500 mb-1">共識信心度</div>
                    <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${data.conviction * 100}%` }}
                                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                            />
                        </div>
                        <span className="text-sm font-mono text-indigo-400">{(data.conviction * 100).toFixed(0)}%</span>
                    </div>
                </div>
            </div>

            {/* 共識核心 */}
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-xl border border-purple-500/20">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-purple-400" />
                    <div>
                        <span className="text-xs text-purple-300 uppercase font-semibold">最終決策共識</span>
                        <div className="text-xl font-black text-white">{data.consensus}</div>
                    </div>
                </div>
            </div>

            {/* 辯證細節 */}
            <div className="space-y-4">
                {data.agents.map((agent, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors"
                    >
                        <div className="mt-1">{getOpinionIcon(agent.opinion)}</div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-bold text-slate-200">{agent.name}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${agent.opinion.includes('多') ? 'bg-green-500/10 text-green-400' :
                                    agent.opinion.includes('空') ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'
                                    }`}>{agent.opinion}</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed">{agent.reason}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span>TICKER: {data.ticker} / {new Date(data.updated_at).toLocaleTimeString()}</span>
                <span className="animate-pulse">● LIVE INSIGHTS</span>
            </div>
        </div>
    );
}
