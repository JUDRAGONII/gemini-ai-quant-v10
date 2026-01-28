'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useStockMargin } from '@/hooks/useStockMargin';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ComposedChart, Line, ReferenceLine, Legend
} from 'recharts';
import { Wallet, TrendingUp, TrendingDown, Percent, Loader2 } from 'lucide-react';

const StatCard = ({
    label,
    value,
    change,
    icon: Icon,
    color,
}: {
    label: string;
    value: string | number;
    change?: number;
    icon: React.ElementType;
    color: string;
}) => {
    const isPositive = change && change > 0;
    const changeColor = isPositive ? 'text-red-400' : 'text-green-400';
    const changeSign = isPositive ? '+' : '';

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
            <div className="text-2xl font-bold text-white">{value}</div>
            {change !== undefined && (
                <div className={`text-sm ${changeColor} mt-1`}>
                    {changeSign}{change.toFixed(2)}%
                </div>
            )}
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
                        {entry.name}: {entry.value?.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function StockMarginPage() {
    const params = useParams();
    const symbol = params?.symbol as string;
    const [days, setDays] = useState(30);
    const { data, statistics, isLoading, isError } = useStockMargin(symbol, days);

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
                <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-400">尚無融資融券數據</h2>
                <p className="text-sm text-gray-500 mt-2">此股票暫無融資融券資料</p>
            </div>
        );
    }

    const latest = data[data.length - 1];
    const prev = data[data.length - 2];

    const formatCurrency = (value: number) => {
        if (value >= 100000000) return `${(value / 100000000).toFixed(1)} 億`;
        if (value >= 10000) return `${(value / 10000).toFixed(0)} 萬`;
        return value.toLocaleString();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        <Wallet className="w-6 h-6 text-cyan-400" />
                        融資融券分析
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {symbol} 近 {days} 日融資融券變化
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
                    label="融資餘額"
                    value={formatCurrency(latest.margin_balance)}
                    change={statistics?.margin_change_5d}
                    icon={Wallet}
                    color="text-cyan-400"
                />
                <StatCard
                    label="融券餘額"
                    value={formatCurrency(latest.short_balance)}
                    change={statistics?.short_change_5d}
                    icon={TrendingDown}
                    color="text-pink-400"
                />
                <StatCard
                    label="融資使用率"
                    value={`${latest.margin_utilization.toFixed(1)}%`}
                    icon={Percent}
                    color="text-amber-400"
                />
                <StatCard
                    label="收盤價"
                    value={latest.price.toFixed(2)}
                    icon={TrendingUp}
                    color="text-emerald-400"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 rounded-xl border border-white/10"
            >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-cyan-400" />
                    融資餘額走勢
                </h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data}>
                            <defs>
                                <linearGradient id="marginGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                                </linearGradient>
                            </defs>
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
                                tickFormatter={(v) => formatCurrency(v)}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tick={{ fill: '#6B7280', fontSize: 11 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="margin_balance"
                                name="融資餘額"
                                stroke="#06B6D4"
                                strokeWidth={2}
                                fill="url(#marginGradient)"
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="price"
                                name="股價"
                                stroke="#F59E0B"
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
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <TrendingDown className="w-5 h-5 text-pink-400" />
                        融券餘額走勢
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="shortGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: '#6B7280', fontSize: 10 }}
                                    tickFormatter={(v) => {
                                        const date = new Date(v * 1000);
                                        return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                                    }}
                                />
                                <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} tickFormatter={(v) => formatCurrency(v)} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="short_balance"
                                    name="融券餘額"
                                    stroke="#EC4899"
                                    strokeWidth={2}
                                    fill="url(#shortGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass p-6 rounded-xl border border-white/10"
                >
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Percent className="w-5 h-5 text-amber-400" />
                        券資比趨勢
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="ratioGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: '#6B7280', fontSize: 10 }}
                                    tickFormatter={(v) => {
                                        const date = new Date(v * 1000);
                                        return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                                    }}
                                />
                                <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} domain={[0, 'auto']} />
                                <Tooltip content={<CustomTooltip />} />
                                <ReferenceLine y={20} stroke="#EF4444" strokeDasharray="3 3" label="警戒線" />
                                <Area
                                    type="monotone"
                                    dataKey="margin_utilization"
                                    name="券資比 (%)"
                                    stroke="#F59E0B"
                                    strokeWidth={2}
                                    fill="url(#ratioGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass p-6 rounded-xl border border-white/10"
            >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    融資融券變化
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.slice(-30)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis
                                dataKey="date"
                                tick={{ fill: '#6B7280', fontSize: 10 }}
                                tickFormatter={(v) => {
                                    const date = new Date(v * 1000);
                                    return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                                }}
                            />
                            <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="margin_net" name="融資增減" fill="#06B6D4" />
                            <Bar dataKey="short_net" name="融券增減" fill="#EC4899" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
}
