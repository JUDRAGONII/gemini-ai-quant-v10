"use client";

import React from "react";
import { Dna, FlaskConical, Play } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Bilingual } from "@/components/ui/Bilingual";
import { EvolutionVisualizer } from "@/components/AI/EvolutionVisualizer";

export default function EvolutionPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-gray-100 font-sans selection:bg-cyan-500/30">
            {/* Mobile Navigation (Sticky Top + Drawer) */}
            <MobileNav />

            {/* Sidebar (Unified) */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            <div className="flex">
                {/* Main Content */}
                <main className="flex-1 ml-0 lg:ml-64 p-4 lg:p-8 text-white">
                    {/* 頁面標題與狀態欄 (In-page Header) */}
                    <header className="flex justify-between items-start mb-8">
                        <div>
                            <Bilingual
                                zh="演化運算分析"
                                en="Evolutionary Engine"
                                mode="stacked"
                                zhClassName="text-3xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3"
                                enClassName="text-xs font-medium text-slate-500 uppercase tracking-[0.3em] font-mono mt-1"
                            >
                                <Dna size={32} className="text-violet-400" />
                            </Bilingual>
                            <div className="mt-2">
                                <Bilingual
                                    zh="基於 DEAP 框架的遺傳演算法策略優化引擎"
                                    en="Genetic algorithm strategy optimization engine based on DEAP framework."
                                    mode="stacked"
                                    zhClassName="text-gray-300 text-sm"
                                    enClassName="text-[10px] text-gray-500 italic mt-0.5"
                                />
                            </div>
                        </div>
                        <div className="flex space-x-4">
                            <StatusBadge label="AI Worker" status="online" />
                            <StatusBadge label="Database" status="online" />
                        </div>
                    </header>

                    {/* Evolution Visualizer Section */}
                    <div className="mt-8">
                        <EvolutionVisualizer />
                    </div>
                </main>
            </div>
        </div>
    );
}

// --- Helper Components ---
function StatusBadge({ label, status }: { label: string, status: 'online' | 'offline' }) {
    return (
        <div className="glass px-3 py-1.5 rounded-full flex items-center space-x-2 border border-white/10">
            <span className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <Bilingual
                zh={label}
                en={status.toUpperCase()}
                mode="inline"
                zhClassName="text-xs font-medium text-gray-300"
                enClassName="text-[8px] font-mono tracking-tighter opacity-40 ml-1"
            />
        </div>
    );
}
