"use client";

import React from "react";
import { GlassCard } from "../ui/GlassCard";
import { Bilingual } from "../ui/Bilingual";
import { Brain, Heart, Lightbulb, TrendingUp } from "lucide-react";

interface BehavioralBias {
    type: string;
    confidence: number;
    suggestion: string;
}

interface PsychologyHubProps {
    biases: BehavioralBias[];
    isLoading?: boolean;
}

export const PsychologyHub: React.FC<PsychologyHubProps> = ({ biases, isLoading }) => {
    if (isLoading) {
        return (
            <GlassCard className="h-[280px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Brain className="animate-pulse text-purple-400" size={32} />
                    <Bilingual zh="偏誤分析中..." en="Analyzing Biases..." enClassName="text-[10px] text-slate-500 font-mono" />
                </div>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="p-5">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Brain className="text-purple-400" size={20} />
                        <Bilingual zh="行為心理教練" en="Behavioral Psychology Hub" />
                    </h3>
                    <Bilingual zh="AI 偏誤偵測與交易決策優化" en="AI Bias Detection & UX Optimization" enClassName="text-[10px] text-slate-500 font-mono" />
                </div>
                <div className="p-1 px-2 bg-purple-500/10 rounded-full border border-purple-500/20 flex items-center gap-1.5">
                    <Heart className="text-purple-400 fill-purple-400/20" size={10} />
                    <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Psych-AI</span>
                </div>
            </div>

            <div className="space-y-4">
                {biases.map((bias, idx) => (
                    <div key={idx} className="relative group">
                        <div className="flex justify-between items-end mb-1.5">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-4 bg-purple-500 rounded-full" />
                                <span className="text-sm font-bold text-slate-200">{bias.type}</span>
                            </div>
                            <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-1.5 rounded">
                                DETECTION: {(bias.confidence * 100).toFixed(0)}%
                            </span>
                        </div>

                        {/* Custom Progress Bar */}
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-purple-500 rounded-full"
                                style={{ width: `${bias.confidence * 100}%` }}
                            />
                        </div>

                        <div className="mt-2.5 p-3 rounded-lg bg-slate-900/50 border border-white/5 group-hover:border-purple-500/30 transition-colors">
                            <div className="flex gap-2.5">
                                <Lightbulb className="text-amber-400 shrink-0 mt-0.5" size={14} />
                                <p className="text-[11px] leading-relaxed text-slate-400 italic">
                                    "{bias.suggestion}"
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TrendingUp className="text-emerald-400" size={16} />
                    <Bilingual zh="計畫穩定度" en="Plan Stability Score" enClassName="text-[10px] text-slate-500 font-mono" />
                </div>
                <div className="text-xl font-mono font-bold text-emerald-400">92.4</div>
            </div>
        </GlassCard>
    );
};
