'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useStockChips } from '@/hooks/useStockChips';
import { motion } from 'framer-motion';
import {
    ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { Building2, TrendingUp, TrendingDown, Users, Loader2 } from 'lucide-react';

const INSTITUTIONAL_COLORS = {
    foreign: '#06B6D4',
    trust: '#EC4899',
    dealer: '#F59E0B',
};

const StatCard = ({
    label,
    value,
    icon: Icon,
    color,
}: {
    label: string;
    value: number;
    icon: React.ElementType;
    color: string;
}) => {
    const isPositive = value >= 0;
    const textColor = isPositive ? 'text-red-400' : 'text-green-400';

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="glass p-5 rounded-xl border border-white/10"
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400 font-medium">{label}</span>
                <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
                    <Icon size={18} />
                </div>
            </div>
            <div className={`text-2xl font-bold ${textColor}`}>
                {isPositive ? '+' : ''}{value.toLocaleString()} 張
            </div>
        </motion.div>
    );
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass p-3 rounded-lg border border-white/20 text-sm">
                <p className="text-gray-400 mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} style={{ color: entry.color }}>
                        {entry.name}: {entry.value >= 0 ? '+' : ''}{entry.value.toLocaleString()} 張
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function StockInstitutionalPage() {
    const params = useParams();
    const symbol = params?.symbol as string;
    const [days, setDays] = useState(30);
    const { data, isLoading, isError } = useStockChips(symbol, days);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (isError || data.length === 0) {
        return (
            <div className="p-8 text-center">
                <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-400">尚無法人買賣超數據</h2>
                <p className="text-sm text-gray-500 mt-2">此股票暫無三大法人買賣超資料</p>
            </div>
        );
    }

    const latest = data[data.length - 1];

    const recentData = data.slice(-7);
    const summary = {
        foreign: recentData.reduce((acc, d) => acc + d.foreign_inv, 0),
        trust: recentData.reduce((acc, d) => acc + d.investment_trust, 0),
        dealer: recentData.reduce((acc, d) => acc + d.dealer, 0),
    };

    const pieData = [
        { name: '外資', value: Math.abs(summary.foreign), color: INSTITUTIONAL_COLORS.foreign },
        { name: '投信', value: Math.abs(summary.trust), color: INSTITUTIONAL_COLORS.trust },
        { name: '自營商', value: Math.abs(summary.dealer), color: INSTITUTIONAL_COLORS.dealer },
    ].filter(d => d.value > 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        <Building2 className="w-6 h-6 text-cyan-400" />
                        三大法人買賣超
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {symbol} 近 {days} 日三大法人買賣超與股價走勢
                    </p>
                </div>
                <div className="flex gap-2">
                    {[30, 60, 90].map(d => (
                        <button
                            key={d}
                            onClick={() => setDays(d)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${days === d
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            {d} 天
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="外資買賣超"
                    value={latest.foreign_inv}
                    icon={Building2}
                    color="text-cyan-400"
                />
                <StatCard
                    label="投信買賣超"
                    value={latest.investment_trust}
                    icon={TrendingUp}
                    color="text-pink-400"
                />
                <StatCard
                    label="自營商買賣超"
                    value={latest.dealer}
                    icon={TrendingDown}
                    color="text-amber-400"
                />
                <StatCard
                    label="三大法人合計"
                    value={latest.total}
                    icon={Users}
                    color="text-emerald-400"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 rounded-xl border border-white/10"
            >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-cyan-400" />
                    三大法人買賣超趨勢
                </h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis
                                dataKey="time"
                                tick={{ fill: '#6B7280', fontSize: 11 }}
                                tickFormatter={(v) => {
                                    const date = new Date(v * 1000);
                                    return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                                }}
                            />
                            <YAxis
                                yAxisId="left"
                                tick={{ fill: '#6B7280', fontSize: 11 }}
                                label={{ value: '買賣超 (張)', angle: -90, position: 'insideLeft', fill: '#6B7280' }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tick={{ fill: '#6B7280', fontSize: 11 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar
                                yAxisId="left"
                                dataKey="foreign_inv"
                                name="外資"
                                fill={INSTITUTIONAL_COLORS.foreign}
                                stackId="a"
                            />
                            <Bar
                                yAxisId="left"
                                dataKey="investment_trust"
                                name="投信"
                                fill={INSTITUTIONAL_COLORS.trust}
                                stackId="a"
                            />
                            <Bar
                                yAxisId="left"
                                dataKey="dealer"
                                name="自營商"
                                fill={INSTITUTIONAL_COLORS.dealer}
                                stackId="a"
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="price"
                                name="股價"
                                stroke="#10B981"
                                strokeWidth={2}
                                dot={false}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass p-6 rounded-xl border border-white/10"
                >
                    <h3 className="text-lg font-semibold mb-4">近 7 日累計買賣超</h3>
                    <div className="space-y-4">
                        {[
                            { key: 'foreign', label: '外資', color: 'text-cyan-400' },
                            { key: 'trust', label: '投信', color: 'text-pink-400' },
                            { key: 'dealer', label: '自營商', color: 'text-amber-400' },
                        ].map(({ key, label, color }) => {
                            const value = summary[key as keyof typeof summary];
                            return (
                                <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                    <span className={`font-medium ${color}`}>{label}</span>
                                    <span className={`font-bold ${value >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                                        {value >= 0 ? '+' : ''}{value.toLocaleString()} 張
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass p-6 rounded-xl border border-white/10"
                >
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-400" />
                        法人買賣超比例
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number | undefined) => `${value?.toLocaleString() || 0} 張`}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
