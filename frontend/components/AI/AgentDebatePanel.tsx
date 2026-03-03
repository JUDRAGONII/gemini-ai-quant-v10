"use client";

/**
 * AgentDebatePanel — 多代理人辯論卡片 (Phase 13.2)
 * 
 * 設計語言：霓虹邊框 (綠=多頭 / 橙=空頭) + 信心進度條 + 論點列表
 */

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Sparkles, AlertTriangle, Shield, Zap } from "lucide-react";
import { Bilingual } from "@/components/ui/Bilingual";

// === 型別定義 ===
interface AgentData {
    name: string;
    role: "bull" | "bear";
    opinion: string;
    confidence: number;
    arguments: string[];
}

interface DialecticResult {
    ticker: string;
    consensus: string;
    conviction: number;
    rationale: string;
    key_factor: string;
    agents: AgentData[];
    updated_at: string;
    cached: boolean;
}

interface AgentDebatePanelProps {
    data: DialecticResult | null;
    isLoading?: boolean;
}

// === 樣式映射 ===
const AGENT_STYLES: Record<string, {
    gradient: string;
    border: string;
    glow: string;
    icon: React.ElementType;
    accent: string;
}> = {
    bull: {
        gradient: "from-emerald-900/30 to-green-900/20",
        border: "border-emerald-500/30",
        glow: "shadow-[0_0_20px_rgba(16,185,129,0.1)]",
        icon: TrendingUp,
        accent: "#10B981",
    },
    bear: {
        gradient: "from-orange-900/30 to-red-900/20",
        border: "border-orange-500/30",
        glow: "shadow-[0_0_20px_rgba(249,115,22,0.1)]",
        icon: TrendingDown,
        accent: "#F97316",
    },
};

// === 組件 ===
export default function AgentDebatePanel({ data, isLoading }: AgentDebatePanelProps) {
    if (isLoading) {
        return (
            <div className="bg-gradient-to-br from-[#0d1117] to-[#161b22] border border-white/5 rounded-2xl p-8 animate-pulse">
                <div className="h-6 bg-white/10 rounded w-1/3 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-48 bg-white/5 rounded-xl" />
                    <div className="h-48 bg-white/5 rounded-xl" />
                </div>
            </div>
        );
    }

    if (!data) return null;

    const verdictColor = data.consensus.includes("多") || data.consensus.includes("好")
        ? "#10B981"
        : data.consensus.includes("空") || data.consensus.includes("風險")
            ? "#EF4444"
            : "#F59E0B";

    return (
        <div className="relative bg-gradient-to-br from-[#0d1117] to-[#161b22] border border-white/5 rounded-2xl p-6 overflow-hidden">
            {/* 背景裝飾 */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-orange-500 opacity-60" />

            {/* 標題 */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <Bilingual
                        zh="AI 辯證共識"
                        en="AI Dialectic Consensus"
                        mode="stacked"
                        zhClassName="text-lg font-black text-white tracking-tight flex items-center gap-2"
                        enClassName="text-[10px] text-slate-500 font-mono tracking-widest uppercase"
                    >
                        <Sparkles className="w-5 h-5 text-purple-400" />
                    </Bilingual>
                </div>

                {/* 最終判決 */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.5 }}
                    className="flex items-center gap-3"
                >
                    <div
                        className="px-4 py-2 rounded-xl font-black text-lg border"
                        style={{
                            color: verdictColor,
                            borderColor: `${verdictColor}40`,
                            background: `${verdictColor}10`,
                            boxShadow: `0 0 15px ${verdictColor}20`,
                        }}
                    >
                        {data.consensus}
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black text-white">
                            {(data.conviction * 100).toFixed(0)}%
                        </p>
                        <Bilingual
                            zh="信心度"
                            en="CONFIDENCE"
                            mode="stacked"
                            zhClassName="text-[10px] text-slate-500"
                            enClassName="text-[8px] text-slate-600 font-mono tracking-tighter uppercase"
                        />
                    </div>
                </motion.div>
            </div>

            {/* CIO 綜合判決 */}
            {data.rationale && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-6 p-4 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border border-purple-500/20 rounded-xl"
                >
                    <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-purple-200 font-bold">{data.rationale}</p>
                            {data.key_factor && (
                                <p className="text-[11px] text-purple-400/60 mt-1 flex items-center gap-1">
                                    <Zap className="w-3 h-3" />
                                    <Bilingual zh="關鍵因素：" en="KEY FACTOR: " mode="inline" zhClassName="font-bold" enClassName="uppercase opacity-60" />
                                    {data.key_factor}
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* 多空雙方卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.agents.map((agent, idx) => {
                    const style = AGENT_STYLES[agent.role] || AGENT_STYLES.bull;
                    const Icon = style.icon;

                    return (
                        <motion.div
                            key={agent.role}
                            initial={{ opacity: 0, x: agent.role === "bull" ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: idx * 0.15 }}
                            className={`relative bg-gradient-to-br ${style.gradient} ${style.border} ${style.glow} border rounded-xl p-5 overflow-hidden`}
                        >
                            {/* Agent 標題 */}
                            <div className="flex items-center gap-2 mb-3">
                                <Icon className="w-5 h-5" style={{ color: style.accent }} />
                                <span className="font-black text-white text-sm">{agent.name}</span>
                                <span
                                    className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                                    style={{
                                        color: style.accent,
                                        background: `${style.accent}15`,
                                    }}
                                >
                                    {agent.opinion}
                                </span>
                            </div>

                            {/* 信心進度條 */}
                            <div className="mb-3">
                                <div className="flex justify-between items-center mb-1">
                                    <Bilingual
                                        zh="信心度"
                                        en="CONVICTION"
                                        mode="inline"
                                        zhClassName="text-[10px] text-slate-500 font-mono"
                                        enClassName="text-[8px] opacity-40 ml-1"
                                    />
                                    <span className="text-xs font-bold" style={{ color: style.accent }}>
                                        {agent.confidence}%
                                    </span>
                                </div>
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${agent.confidence}%` }}
                                        transition={{ duration: 1, delay: 0.5 + idx * 0.2 }}
                                        className="h-full rounded-full"
                                        style={{ background: style.accent }}
                                    />
                                </div>
                            </div>

                            {/* 論點列表 */}
                            <ul className="space-y-2">
                                {agent.arguments.map((arg, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: -5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.7 + i * 0.1 }}
                                        className="flex items-start gap-2 text-xs text-slate-300"
                                    >
                                        <span
                                            className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0"
                                            style={{ background: style.accent }}
                                        />
                                        {arg}
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    );
                })}
            </div>

            {/* 快取指示器 */}
            <div className="mt-4 flex items-center justify-between text-[10px] text-slate-600">
                <span className="font-mono">
                    {data.cached ? (
                        <Bilingual zh="📦 快取資料" en="CACHED" mode="inline" enClassName="ml-1 opacity-50" />
                    ) : (
                        <Bilingual zh="⚡ 即時分析" en="LIVE" mode="inline" enClassName="ml-1 opacity-50" />
                    )}
                </span>
                <span>{new Date(data.updated_at).toLocaleString("zh-TW")}</span>
            </div>
        </div>
    );
}
