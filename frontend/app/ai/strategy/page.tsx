'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, Target, Search, Loader2, BrainCircuit, TrendingUp, Info, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIPredictionIndicator } from '@/components/AI/AIPredictionIndicator';
import { StrategyMetricsGrid } from '@/components/AI/StrategyMetricsGrid';
import { Bilingual } from '@/components/ui/Bilingual';
import PortfolioPerformanceChart from '@/components/Chart/PortfolioPerformanceChart';
import { useBacktest } from '@/hooks/useBacktest';
import { useAIPrediction } from '@/hooks/useAIPrediction';

const BASE_CAPITAL = 1000000;

export default function StrategyHubPage() {
    const [symbol, setSymbol] = useState('2330');
    const [inputSymbol, setInputSymbol] = useState('2330');
    const [period, setPeriod] = useState('1Y');
    const [threshold, setThreshold] = useState(0.005); // 0.5% default

    const { data: backtestData, loading: backtestLoading, error: backtestError, runBacktest } = useBacktest();
    const { data: predictionData, loading: predictionLoading } = useAIPrediction(symbol);

    useEffect(() => {
        runBacktest(symbol, threshold);
    }, [symbol, threshold, runBacktest]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputSymbol.trim()) {
            setSymbol(inputSymbol.toUpperCase().trim());
        }
    };

    const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setThreshold(parseFloat(e.target.value));
    };

    const triggerBacktest = () => {
        runBacktest(symbol, threshold);
    };

    // Transform and normalize data
    const chartData = useMemo(() => {
        if (!backtestData?.charts?.equity) return [];
        return backtestData.charts.equity.map(point => {
            const total_value = point.value * BASE_CAPITAL;
            return {
                date: point.date,
                total_value,
                total_cost: BASE_CAPITAL,
                return_amount: total_value - BASE_CAPITAL,
                return_rate: (point.value - 1) * 100
            };
        });
    }, [backtestData]);

    // Apply period filtering
    const filteredChartData = useMemo(() => {
        if (!chartData.length) return [];
        if (period === '1Y') return chartData;

        const lastPoint = chartData[chartData.length - 1];
        const lastDate = new Date(lastPoint.date);
        let cutoff = new Date(lastDate);

        if (period === '1W') cutoff.setDate(cutoff.getDate() - 7);
        else if (period === '1M') cutoff.setMonth(cutoff.getMonth() - 1);
        else if (period === '3M') cutoff.setMonth(cutoff.getMonth() - 3);
        else if (period === '6M') cutoff.setMonth(cutoff.getMonth() - 6);

        return chartData.filter(d => new Date(d.date) >= cutoff);
    }, [chartData, period]);

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <section className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <Bilingual
                            zh="智慧策略看板"
                            en="Strategy Hub"
                            mode="stacked"
                            zhClassName="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 tracking-tighter uppercase"
                            enClassName="text-sm font-medium text-emerald-500/60 uppercase tracking-widest mt-1"
                        />
                        <div className="text-gray-400 mt-4 flex items-center text-sm font-medium">
                            <ShieldCheck className="w-4 h-4 mr-2 text-emerald-400" />
                            <Bilingual
                                zh="基於 AI 預測核心與全向量化回測引擎的策略驗證中心"
                                en="Strategy verification center based on AI prediction engine and vectorized backtesting system."
                                mode="stacked"
                                zhClassName="text-gray-300"
                                enClassName="text-[10px] text-gray-500 italic mt-0.5"
                            />
                        </div>
                    </div>

                    <form onSubmit={handleSearch} className="relative w-full md:w-64 group">
                        <input
                            type="text"
                            value={inputSymbol}
                            onChange={(e) => setInputSymbol(e.target.value)}
                            placeholder="輸入股票代號 (如: 2330)"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-white font-bold placeholder-gray-600 transition-all"
                        />
                        <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                            <Search className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* AI Forecast Card */}
                <div className="lg:col-span-1">
                    <AIPredictionIndicator
                        alpha={predictionData?.predicted_5d_alpha || 0}
                        winRate={predictionData?.win_rate || 0}
                        loading={predictionLoading}
                    />
                </div>

                {/* Strategy Config & Status */}
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md relative overflow-hidden group">
                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
                                <BrainCircuit className="w-8 h-8 text-emerald-400" />
                            </div>
                            <div>
                                <Bilingual
                                    zh="當前分析標的"
                                    en="ACTIVE ASSET"
                                    mode="stacked"
                                    zhClassName="text-[10px] font-bold text-emerald-500 uppercase tracking-wider"
                                    enClassName="text-[8px] font-mono tracking-widest opacity-50"
                                />
                                <h2 className="text-3xl font-black text-white flex items-baseline gap-3">
                                    {symbol}
                                    <Bilingual
                                        zh="分析引擎已就緒"
                                        en="Engine Ready"
                                        mode="inline"
                                        zhClassName="text-sm font-medium text-gray-500"
                                        enClassName="text-[10px] uppercase tracking-widest opacity-30 ml-1"
                                    />
                                </h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/5">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold text-gray-200 flex items-center gap-2">
                                        策略 Alpha 閾值: <span className="text-emerald-400 font-mono">{(threshold * 100).toFixed(1)}%</span>
                                    </label>
                                    <div className="group/info relative">
                                        <Info className="w-4 h-4 text-gray-500 cursor-help" />
                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 p-3 bg-gray-900 border border-white/20 rounded-xl text-[10px] text-gray-300 opacity-0 group-hover/info:opacity-100 transition-opacity z-20 pointer-events-none shadow-2xl">
                                            此閾值定義了 AI 觸發買入信號的最小預測收益率。較高的閾值意味著更嚴謹的篩選，反之則更激進。
                                        </div>
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min="0.001"
                                    max="0.05"
                                    step="0.001"
                                    value={threshold}
                                    onChange={handleThresholdChange}
                                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                                    <span>0.1% (激進)</span>
                                    <span>5.0% (極保守)</span>
                                </div>
                            </div>

                            <div className="flex flex-col justify-end">
                                <button
                                    onClick={triggerBacktest}
                                    disabled={backtestLoading}
                                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 disabled:cursor-not-allowed text-black font-black rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                >
                                    {backtestLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Zap className="w-5 h-5 fill-current" />
                                    )}
                                    <Bilingual
                                        zh="執行回測分析"
                                        en="RUN BACKTEST"
                                        mode="stacked"
                                        zhClassName="text-sm font-black"
                                        enClassName="text-[8px] tracking-[0.2em]"
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Chart Section */}
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
                <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                    <h2 className="text-xl font-bold flex items-center gap-3 text-white">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        <Bilingual
                            zh="策略績效回測"
                            en="Backtest Results"
                            mode="inline"
                            zhClassName="text-xl font-bold"
                            enClassName="text-[10px] font-mono tracking-widest opacity-40 uppercase ml-2"
                        />
                    </h2>
                </div>
                <div className="p-8">
                    {backtestLoading && !backtestData ? (
                        <div className="h-[400px] flex items-center justify-center">
                            <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                        </div>
                    ) : backtestError ? (
                        <div className="h-[400px] flex items-center justify-center text-rose-400 font-medium">
                            {backtestError}
                        </div>
                    ) : (
                        <PortfolioPerformanceChart
                            data={filteredChartData}
                            height={400}
                            period={period}
                            onPeriodChange={setPeriod}
                        />
                    )}
                </div>
            </div>

            {/* Metrics Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 ml-4">
                    <Target className="w-4 h-4" />
                    <Bilingual
                        zh="策略關鍵指標"
                        en="KPI METRICS"
                        mode="inline"
                        zhClassName="text-sm font-bold"
                        enClassName="text-[10px] tracking-widest ml-1"
                    />
                </h3>
                <AnimatePresence mode="wait">
                    {backtestData && (
                        <StrategyMetricsGrid metrics={backtestData.metrics} />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
