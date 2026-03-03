"use client";

import React from "react";
import { GenomeMap } from "./GenomeMap";
import { FitnessHeatmap } from "./FitnessHeatmap";
import { useEvolution } from "../../hooks/useEvolution";
import { GlassCard } from "../ui/GlassCard";
import { Bilingual } from "../ui/Bilingual";
import { Loader2, AlertCircle } from "lucide-react";

export const EvolutionVisualizer: React.FC = () => {
    const { history, best, isLoading, error } = useEvolution();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                <Bilingual zh="載入演化數據中..." en="LOADING EVOLUTION DATA..." mode="stacked" enClassName="text-[10px] text-slate-500 font-mono" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-red-400 space-y-2">
                <AlertCircle className="w-8 h-8" />
                <Bilingual zh="數據獲取失敗" en="FAILED TO FETCH DATA" mode="stacked" />
            </div>
        );
    }

    if (!history || history.length === 0) {
        return (
            <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5">
                <Bilingual
                    zh="尚無演化歷史數據"
                    en="NO EVOLUTION HISTORY FOUND"
                    mode="stacked"
                    zhClassName="text-xl font-bold text-gray-500"
                    enClassName="text-[10px] text-gray-600 font-mono"
                />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Left: Genome Map */}
            <GlassCard className="p-6">
                <div className="mb-4">
                    <Bilingual
                        zh="最強個體基因圖譜"
                        en="BEST INDIVIDUAL GENOME MAP"
                        mode="stacked"
                        zhClassName="text-lg font-bold text-white flex items-center gap-2"
                        enClassName="text-[10px] text-slate-500 font-mono tracking-widest uppercase"
                    />
                </div>
                {best && <GenomeMap genome={best.best_genome} />}
            </GlassCard>

            {/* Right: Fitness Trends */}
            <GlassCard className="p-6">
                <div className="mb-4">
                    <Bilingual
                        zh="演化適應度遷移規律"
                        en="FITNESS EVOLUTION TRENDS"
                        mode="stacked"
                        zhClassName="text-lg font-bold text-white flex items-center gap-2"
                        enClassName="text-[10px] text-slate-500 font-mono tracking-widest uppercase"
                    />
                </div>
                <FitnessHeatmap history={history} />
            </GlassCard>

            {/* Footer Insight */}
            <div className="xl:col-span-2">
                <GlassCard className="p-4 bg-violet-950/20 border-violet-500/20">
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <Bilingual
                                zh="演化分析洞察"
                                en="EVOLUTIONARY INSIGHTS"
                                mode="inline"
                                zhClassName="font-bold text-violet-200"
                                enClassName="text-[10px] text-violet-400 font-mono ml-2"
                            />
                            <div className="text-sm text-violet-300/80 mt-1">
                                <Bilingual
                                    zh={`當前最佳個體在第 ${best?.generation} 代產出，適應度為 ${best?.max_fitness.toFixed(4)}。基因圖譜顯示系統正朝向穩定獲利與低回撤的參數空間收斂。`}
                                    en={`The current best individual was produced in generation ${best?.generation} with a fitness of ${best?.max_fitness.toFixed(4)}. The genome map shows the system is converging towards a parameter space of stable profitability and low drawdown.`}
                                />
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
