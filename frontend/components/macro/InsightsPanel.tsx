"use client";

import React from "react";
import { useInsights } from "@/hooks/useInsights";
import { GlassCard } from "@/components/ui/GlassCard";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp, Activity, Info, AlertCircle } from "lucide-react";
import { Bilingual } from "@/components/ui/Bilingual";

interface InsightsPanelProps {
    assetA?: string;
    assetB?: string;
    windowSize?: number;
}

export default function InsightsPanel({
    assetA = "STOCK:2330",
    assetB = "MACRO:DXY",
    windowSize = 20
}: InsightsPanelProps) {
    const { insights, isLoading, error } = useInsights(assetA, assetB, windowSize);

    if (isLoading) {
        return (
            <GlassCard data-testid="insights-skeleton" className="p-6 h-[400px] flex flex-col items-center justify-center animate-pulse bg-white/5">
                <Activity className="w-8 h-8 text-blue-500/50 mb-4 animate-spin" />
                <span className="text-sm text-slate-500 tracking-widest"><Bilingual zh="跨資產關聯分析中..." en="ANALYZING CROSS-ASSET CORRELATION..." /></span>
            </GlassCard>
        );
    }

    if (error) {
        return (
            <GlassCard className="p-6 h-[400px] flex flex-col items-center justify-center border-rose-500/20 bg-rose-500/5">
                <AlertCircle className="w-10 h-10 text-rose-500 mb-4" />
                <span className="text-sm text-rose-400 font-medium"><Bilingual zh="分析失敗" en="Analysis Failed" /></span>
                <span className="text-xs text-rose-500/60 mt-2">{error.toString()}</span>
            </GlassCard>
        );
    }

    const { series, summary, pair } = insights || {};
    const chartData = series || [];

    return (
        <GlassCard className="p-6 overflow-hidden border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-lg font-bold text-white tracking-tight"><Bilingual zh="跨資產關聯分析" en="Cross-Asset Correlation" /></h3>
                        <div className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                            Pearson Correlation
                        </div>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                        <Info className="w-3 h-3" />
                        <Bilingual
                            zh={`分析 ${pair?.[0] || assetA} 與 ${pair?.[1] || assetB} 之動態相關性 (Window: ${windowSize}D)`}
                            en={`Dynamic correlation between ${pair?.[0] || assetA} & ${pair?.[1] || assetB} (Window: ${windowSize}D)`}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <div className={`text-2xl font-black font-mono tracking-tighter ${summary?.status.includes('Strong') ? 'text-rose-400' : 'text-emerald-400'
                            }`}>
                            {summary?.current.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest leading-none">
                            <Bilingual zh={summary?.status === 'Strong Positive' ? '強正相關' : summary?.status === 'Strong Negative' ? '強負相關' : summary?.status === 'Moderate Positive' ? '中度正相關' : summary?.status === 'Moderate Negative' ? '中度負相關' : summary?.status} en={summary?.status} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-[250px] w-full" data-testid="insights-chart">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorCorr" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                        <XAxis
                            dataKey="date"
                            hide
                        />
                        <YAxis
                            domain={[-1, 1]}
                            ticks={[-1, -0.5, 0, 0.5, 1]}
                            stroke="#ffffff30"
                            fontSize={10}
                            tickCount={5}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '8px' }}
                            itemStyle={{ color: '#22d3ee' }}
                            labelStyle={{ color: '#94a3b8', fontSize: '10px' }}
                        />
                        <ReferenceLine y={0} stroke="#ffffff20" strokeDasharray="3 3" />
                        <Area
                            type="monotone"
                            dataKey="correlation"
                            stroke="#22d3ee"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorCorr)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-600">
                <div className="flex items-center gap-4">
                    <span>MEAN: {summary?.mean.toFixed(2)}</span>
                    <span>RANGE: -1.0 ~ +1.0</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                    <Bilingual zh="即時引擎運作中" en="REAL-TIME ENGINE ACTIVE" />
                </div>
            </div>
        </GlassCard>
    );
}
