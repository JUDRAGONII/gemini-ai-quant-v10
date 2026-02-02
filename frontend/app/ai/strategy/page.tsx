'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useBacktest } from '@/hooks/useBacktest';
import { StrategyMetricsGrid } from '@/components/AI/StrategyMetricsGrid';
import { Search, Play, Settings2, LineChart, ShieldCheck, AlertCircle } from 'lucide-react';
import PortfolioPerformanceChart from '@/components/Chart/PortfolioPerformanceChart';

export default function StrategyHubPage() {
    const [symbol, setSymbol] = useState('2330');
    const [threshold, setThreshold] = useState(0.005);
    const { data, loading, error, runBacktest } = useBacktest();

    const handleRun = () => {
        if (symbol) runBacktest(symbol, threshold);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 tracking-tighter">
                        智慧策略看板 <span className="text-indigo-500">Strategy Hub</span>
                    </h1>
                    <p className="text-gray-400 mt-2 flex items-center">
                        <ShieldCheck className="w-4 h-4 mr-2 text-indigo-400" />
                        基於 AI 預測核心與全向量化回測引擎的策略驗證中心
                    </p>
                </div>
            </section>

            {/* Control Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1 w-full space-y-2">
                        <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">標的搜尋 (Symbol)</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                value={symbol}
                                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                                placeholder="輸入代碼 (如: 2330)"
                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-white font-mono"
                            />
                        </div>
                    </div>

                    <div className="w-full md:w-32 space-y-2">
                        <label className="text-[10px] font-bold uppercase text-gray-500 ml-1">預測閾值</label>
                        <input
                            type="number"
                            step="0.001"
                            value={threshold}
                            onChange={(e) => setThreshold(parseFloat(e.target.value))}
                            className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-white font-mono"
                        />
                    </div>

                    <button
                        onClick={handleRun}
                        disabled={loading}
                        className="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Play className="w-4 h-4 mr-2 fill-current" />
                                執行回測
                            </>
                        )}
                    </button>
                </div>

                <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 rounded-3xl p-6 flex items-center justify-between group overflow-hidden relative">
                    <div className="space-y-1 relative z-10">
                        <p className="text-[10px] font-bold uppercase text-indigo-300">系統狀態</p>
                        <h4 className="text-xl font-bold text-white">AI Engine v2.0</h4>
                        <p className="text-xs text-indigo-200/60">千萬級數據運算已就緒</p>
                    </div>
                    <div className="p-4 bg-white/10 rounded-2xl relative z-10">
                        <Settings2 className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-500" />
                    </div>
                    {/* Decal */}
                    <LineChart className="absolute -right-8 -bottom-8 w-32 h-32 text-white/5 -rotate-12" />
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    錯誤: {error}
                </div>
            )}

            {/* Results Section */}
            {data && (
                <div className="space-y-6">
                    <StrategyMetricsGrid metrics={data.metrics} />

                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold flex items-center">
                                <LineChart className="w-5 h-5 mr-2 text-indigo-400" /> 策略權益曲線 (Equity Curve)
                            </h3>
                            <div className="flex gap-2 text-[10px] font-mono">
                                <span className="flex items-center px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20">NET EQUITY</span>
                            </div>
                        </div>
                        <div className="h-[400px] w-full">
                            <PortfolioPerformanceChart
                                data={data.charts.equity.map(p => ({
                                    date: p.date,
                                    total_value: p.value * 100, // Normalized to 100 base
                                    total_cost: 100,
                                    return_amount: (p.value - 1) * 100,
                                    return_rate: (p.value - 1) * 100
                                }))}
                                period="1Y"
                                onPeriodChange={() => { }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {!data && !loading && (
                <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem]">
                    <div className="p-6 bg-white/5 rounded-full mb-4">
                        <LineChart className="w-12 h-12 text-gray-700" />
                    </div>
                    <p className="text-gray-500 font-medium text-lg">尚未執行策略驗證</p>
                    <p className="text-gray-600 text-sm mt-1">輸入股票代碼並點擊執行，獲取 AI 實戰分析報告</p>
                </div>
            )}
        </div>
    );
}
