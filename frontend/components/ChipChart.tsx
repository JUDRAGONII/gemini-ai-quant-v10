'use client';

import React from 'react';
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { ChipData } from '@/data/mockChips';

interface ChipChartProps {
    data: ChipData[];
}

export default function ChipChart({ data }: ChipChartProps) {
    return (
        <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <defs>
                        <linearGradient id="colorForeign" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorTrust" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EC4899" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                    <XAxis
                        dataKey="date"
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickLine={false}
                    />
                    {/* Left Axis: Chips Volume */}
                    <YAxis
                        yAxisId="left"
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickFormatter={(val) => `${(val / 1000).toFixed(1)}k`}
                    />
                    {/* Right Axis: Stock Price */}
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#F59E0B"
                        domain={['auto', 'auto']}
                        fontSize={12}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: '1px solid #374151', borderRadius: '8px' }}
                        itemStyle={{ color: '#E5E7EB' }}
                        labelStyle={{ color: '#9CA3AF' }}
                    />
                    <Legend />
                    <ReferenceLine y={0} yAxisId="left" stroke="#6B7280" />

                    {/* Bars for Institutional Investors */}
                    <Bar yAxisId="left" dataKey="foreign_investors" name="外資 (Foreign)" fill="url(#colorForeign)" barSize={20} />
                    <Bar yAxisId="left" dataKey="investment_trust" name="投信 (Trust)" fill="url(#colorTrust)" barSize={20} />

                    {/* Line for Stock Price */}
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="price"
                        name="股價 (Price)"
                        stroke="#F59E0B"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6 }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
