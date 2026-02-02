'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStockDetail } from '@/hooks/useStockDetail';
import { KLineChart, ChartPeriod, KLinePricePoint } from '@/components/Chart/KLineChart';
import { TechnicalIndicatorPanel } from '@/components/Chart/TechnicalIndicatorPanel';
import { AIPredictionIndicator } from '@/components/AI/AIPredictionIndicator';
import { useAIPrediction } from '@/hooks/useAIPrediction';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, PieChart, Activity, Calendar, ArrowLeft } from 'lucide-react';

export default function StockDetailPage({ params }: { params: { symbol: string } }) {
    const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('1Y');
    const { data, loading, error } = useStockDetail(params.symbol);
    const aiPrediction = useAIPrediction(params.symbol);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-400">無法載入數據</h1>
                <p className="mt-2 text-gray-400">{error || '找不到此標的資訊'}</p>
                <div className="mt-6">
                    <Link href="/stocks" className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                        返回市場中心
                    </Link>
                </div>
            </div>
        );
    }

    const { metadata, summary_stats, price_series } = data;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* 頂部導航與返回按鈕 */}
            <div className="flex items-center justify-between">
                <Link
                    href="/stocks"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">返回行情中心</span>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <h2 className="text-xl font-bold text-white">{metadata.market}</h2>
                        <span className="text-[10px] text-gray-500 font-mono tracking-widest">{params.symbol}</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                        <TrendingUp size={20} className="text-indigo-400" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-1 overflow-hidden backdrop-blur-sm">
                        <KLineChart
                            data={price_series.map(p => ({
                                time: typeof p.time === 'number' ? p.time : new Date(p.time).getTime() / 1000,
                                open: p.open,
                                high: p.high,
                                low: p.low,
                                close: p.close,
                                volume: p.volume,
                            }))}
                            symbol={params.symbol}
                            showMA={true}
                            showVolume={true}
                            period={chartPeriod}
                            onPeriodChange={setChartPeriod}
                        />
                    </div>

                    {/* 額外描述卡片 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm"
                        >
                            <h3 className="text-lg font-semibold mb-3 flex items-center">
                                <Activity className="w-5 h-5 mr-2 text-indigo-400" /> 標的概覽
                            </h3>
                            <p className="text-gray-400 leading-relaxed text-sm">
                                此標的隸屬於 {metadata.market} 市場，目前系統已對接歷史行情數據與多因子量化評分。
                                建議搭配「AI 投資報告」進行深度辯證。
                            </p>
                        </motion.div>

                        <AIPredictionIndicator
                            alpha={aiPrediction.data?.predicted_5d_alpha || 0}
                            winRate={aiPrediction.data?.win_rate || 0}
                            loading={aiPrediction.loading}
                        />
                    </div>

                    <TechnicalIndicatorPanel
                        data={price_series.map(p => ({
                            time: typeof p.time === 'number' ? p.time : new Date(p.time).getTime() / 1000,
                            open: p.open,
                            high: p.high,
                            low: p.low,
                            close: p.close,
                            volume: p.volume,
                        }))}
                    />
                </div>

                {/* Right: Stats Section */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">關鍵指標 (Factors)</h3>

                    <StatsCard
                        title="本益比 (PE)"
                        value={summary_stats.pe_ratio}
                        icon={<BarChart3 className="w-5 h-5" />}
                        suffix="x"
                    />
                    <StatsCard
                        title="股價淨值比 (PB)"
                        value={summary_stats.pb_ratio}
                        icon={<PieChart className="w-5 h-5" />}
                        suffix="x"
                    />
                    <StatsCard
                        title="殖利率 (Yield)"
                        value={summary_stats.dividend_yield}
                        icon={<TrendingUp className="w-5 h-5" />}
                        suffix="%"
                    />
                    <StatsCard
                        title="股東權益報酬率 (ROE)"
                        value={summary_stats.roe}
                        icon={<Activity className="w-5 h-5" />}
                        suffix="%"
                    />

                    {/* 操作按鈕 */}
                    <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                        啟動 AI 深度辯證
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon, suffix = '' }: { title: string, value: number | null, icon: React.ReactNode, suffix?: string }) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4 transition-colors hover:bg-white/10"
        >
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                {icon}
            </div>
            <div>
                <p className="text-xs font-medium text-gray-500 uppercase">{title}</p>
                <p className="text-xl font-mono font-bold text-white">
                    {value ? `${value.toFixed(2)}${suffix}` : 'N/A'}
                </p>
            </div>
        </motion.div>
    );
}
