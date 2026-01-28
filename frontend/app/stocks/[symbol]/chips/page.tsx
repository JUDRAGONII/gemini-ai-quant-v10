'use client';

import React from 'react';
import { useStockChips } from '@/hooks/useStockChips';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { GlassCard } from '@/components/ui';

export default function StockChipsPage({ params }: { params: { symbol: string } }) {
    const { data, isLoading } = useStockChips(params.symbol);

    if (isLoading) {
        return (
            <div className="w-full h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="w-full h-96 flex items-center justify-center text-muted-foreground">
                尚無籌碼數據
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* 標題區 */}
            <div className="flex flex-col space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">籌碼分佈分析</h2>
                <p className="text-muted-foreground">
                    近 90 日三大法人買賣超與股價走勢對照 (單位：張)
                </p>
            </div>

            {/* 主要圖表區 (Glassmorphism Card) */}
            <GlassCard className="p-6">
                <div className="h-[500px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                            data={data}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis
                                dataKey="time"
                                tick={{ fill: '#888', fontSize: 12 }}
                                tickFormatter={(val) => {
                                    const date = new Date(val * 1000);
                                    return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                                }}
                            />
                            {/* 左軸：法人買賣超 (張) */}
                            <YAxis
                                yAxisId="left"
                                tick={{ fill: '#888', fontSize: 12 }}
                                label={{ value: '買賣超 (張)', angle: -90, position: 'insideLeft', fill: '#888' }}
                            />
                            {/* 右軸：股價 (元) */}
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                domain={['auto', 'auto']}
                                tick={{ fill: '#888', fontSize: 12 }}
                                label={{ value: '股價', angle: 90, position: 'insideRight', fill: '#888' }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                                labelStyle={{ color: '#888' }}
                            />
                            <Legend />

                            {/* 三大法人柱狀圖 */}
                            <Bar yAxisId="left" dataKey="foreign_inv" name="外資" fill="#3b82f6" barSize={20} stackId="a" />
                            <Bar yAxisId="left" dataKey="investment_trust" name="投信" fill="#8b5cf6" barSize={20} stackId="a" />
                            <Bar yAxisId="left" dataKey="dealer" name="自營商" fill="#10b981" barSize={20} stackId="a" />

                            {/* 股價走勢線 */}
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="price"
                                name="收盤價"
                                stroke="#f43f5e"
                                strokeWidth={2}
                                dot={false}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>

            {/* 數據摘要卡片列 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SummaryCard title="外資總買賣超 (90日)" data={data} dataKey="foreign_inv" color="text-blue-500" />
                <SummaryCard title="投信總買賣超 (90日)" data={data} dataKey="investment_trust" color="text-purple-500" />
                <SummaryCard title="自營商總買賣超 (90日)" data={data} dataKey="dealer" color="text-emerald-500" />
            </div>
        </div>
    );
}

function SummaryCard({ title, data, dataKey, color }: { title: string, data: any[], dataKey: string, color: string }) {
    const total = data.reduce((acc, curr) => acc + (curr[dataKey] || 0), 0);
    const isPositive = total > 0;

    return (
        <GlassCard className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            <div className={`text-2xl font-bold mt-2 ${isPositive ? 'text-red-500' : 'text-green-500'}`}>
                {total.toLocaleString('zh-TW', { maximumFractionDigits: 0 })} 張
            </div>
        </GlassCard>
    );
}
