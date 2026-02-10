'use client';

import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { Activity, Info } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface CorrelationData {
    pair: string[];
    window: number;
    lag: number;
    series: { date: string; value: number }[];
    summary: {
        current: number;
        mean: number;
        status: string;
    };
}

export default function CorrelationChart({
    base = 'STOCK:2330',
    target = 'FX:USD/TWD',
    window = 30,
    lag = 1
}: {
    base?: string,
    target?: string,
    window?: number,
    lag?: number
}) {
    const { data, error, isLoading } = useSWR<CorrelationData>(
        `/api/v1/insights/correlation?base=${base}&target=${target}&window=${window}&lag=${lag}`,
        fetcher
    );

    if (error) return <div className="p-4 text-red-500 bg-red-900/20 rounded-xl border border-red-500/20">載入相關性圖表失敗</div>;
    if (isLoading || !data) return <div className="h-[300px] flex items-center justify-center animate-pulse text-slate-500 font-mono">CALCULATING CORRELATION MATRIX...</div>;

    // 防禦性解析：確保 summary 及其子屬性存在
    const summary = data.summary ?? { current: 0, mean: 0, status: 'N/A' };

    return (
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden relative group">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-lg shadow-lg shadow-emerald-900/20">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white tracking-widest uppercase">跨資產滯後分析</h3>
                        <p className="text-[10px] text-slate-500 font-mono">{base} ↔ {target} (Lag: {lag})</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[20px] font-black text-emerald-400 font-mono tracking-tighter">
                        {(summary.current ?? 0).toFixed(4)}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{summary.status}</div>
                </div>
            </div>

            <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.series}>
                        <defs>
                            <linearGradient id="colorCorr" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis
                            dataKey="date"
                            hide
                        />
                        <YAxis
                            domain={[-1, 1]}
                            stroke="#475569"
                            fontSize={10}
                            tickFormatter={(val) => val.toFixed(1)}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#000000dd', border: '1px solid #ffffff10', borderRadius: '8px', fontSize: '10px' }}
                            itemStyle={{ color: '#10b981' }}
                            labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                        />
                        <ReferenceLine y={0} stroke="#ffffff10" dashOffset={4} />
                        <ReferenceLine y={summary.mean ?? 0} stroke="#10b981" strokeDasharray="5 5" label={{ value: '均值', position: 'right', fill: '#10b98155', fontSize: 10 }} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#10b981"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorCorr)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-500 bg-white/5 p-2 rounded-lg border border-white/5">
                <Info className="w-3 h-3 text-emerald-500/50" />
                <span>滯後天數越大代表領先性越強。當前視窗: {data.window ?? window} 天。</span>
            </div>
        </div>
    );
}
