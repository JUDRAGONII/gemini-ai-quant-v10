'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, BrainCircuit, LayoutGrid, Zap, Globe } from 'lucide-react';
import DecisionAssistant from '@/components/AI/DecisionAssistant';
import TacticalPlanner from '@/components/Dashboard/TacticalPlanner';
import CorrelationChart from '@/components/Dashboard/CorrelationChart';
import { Bilingual } from '@/components/ui/Bilingual';

export default function InsightsPage() {
    const [ticker, setTicker] = useState('2330');
    const [searchInput, setSearchInput] = useState('2330');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setTicker(searchInput.toUpperCase());
    };

    return (
        <div className="min-h-screen bg-[#050505] text-slate-200 pb-20">
            {/* 頂部標題與搜尋 */}
            <div className="relative border-b border-white/5 bg-black/20 backdrop-blur-md px-8 py-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-purple-500 font-bold tracking-widest text-xs uppercase">
                            <BrainCircuit className="w-4 h-4" />
                            <span>Cognition MS3 / V10.0</span>
                        </div>
                        <Bilingual
                            zh="AI 智力決策中心"
                            en="AI Insights Center"
                            mode="stacked"
                            zhClassName="text-4xl font-black text-white tracking-tight"
                            enClassName="text-xs font-medium text-purple-500/60 uppercase tracking-[0.2em] font-mono mt-1"
                        />
                        <Bilingual
                            zh="透過多代理人辯證與滯後相關性，捕捉市場深層邏輯。"
                            en="Capturing deep market logic through multi-agent dialectic and lag correlation analysis."
                            mode="stacked"
                            zhClassName="text-slate-400 text-sm italic"
                            enClassName="text-[10px] text-slate-600 font-mono mt-0.5"
                        />
                    </div>

                    <form onSubmit={handleSearch} className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none group-focus-within:text-purple-500 transition-colors">
                            <Search className="w-5 h-5 text-slate-500" />
                        </div>
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="搜尋標的 (如: 2330 / Search Ticker)..."
                            className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 w-full md:w-[320px] text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-bold placeholder:text-slate-600 text-sm"
                        />
                    </form>
                </div>
            </div>

            {/* Bento Grid V3 佈局系統 */}
            <main className="max-w-7xl mx-auto p-8 lg:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* 左側主體 (8 columns) */}
                    <div className="lg:col-span-8 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <DecisionAssistant ticker={ticker} />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8"
                        >
                            <CorrelationChart base={`STOCK:${ticker}`} target="FX:USD/TWD" lag={1} />
                            <CorrelationChart base={`STOCK:${ticker}`} target="MACRO:CPI" lag={0} />
                        </motion.div>
                    </div>

                    {/* 右側側邊欄 (4 columns) */}
                    <div className="lg:col-span-4 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <TacticalPlanner />
                        </motion.div>

                        <div className="p-6 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-white/5 rounded-2xl">
                            <h4 className="flex flex-col gap-1 mb-6">
                                <div className="flex items-center gap-2 text-indigo-400">
                                    <Zap className="w-4 h-4" />
                                    <span className="text-sm font-bold uppercase tracking-widest">快速過濾器</span>
                                </div>
                                <span className="text-[9px] text-indigo-500/60 font-mono tracking-widest uppercase ml-6">Quick Filters</span>
                            </h4>
                            <div className="space-y-2">
                                {[
                                    { zh: '美股領先相關性', en: 'US Lead Correl' },
                                    { zh: '台幣匯率敏感度', en: 'TWD FX Sensitivity' },
                                    { zh: '宏觀流動性對沖', en: 'Macro Liquidity' },
                                    { zh: 'AI 辯證歷史', en: 'AI Debate History' }
                                ].map((tag) => (
                                    <button
                                        key={tag.zh}
                                        className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group"
                                    >
                                        <Bilingual
                                            zh={tag.zh}
                                            en={tag.en}
                                            mode="stacked"
                                            zhClassName="text-xs font-bold text-slate-400 group-hover:text-white transition-colors"
                                            enClassName="text-[8px] opacity-30 group-hover:opacity-50 transition-opacity uppercase tracking-widest mt-0.5"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* 底部裝飾 */}
            <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50 blur-sm pointer-events-none" />
        </div>
    );
}
