'use client';

/**
 * @page StockFinancialsPage
 * @description 美股財務報表頁面 - 展示季報/年報數據與趨勢圖
 * @route /stocks/[symbol]/financials
 */

import React from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { TrendingUp, DollarSign, Percent, Activity } from 'lucide-react';

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then(res => res.json());

// 統計卡片組件
function StatCard({ title, value, suffix = '', icon }: {
    title: string;
    value: string | number | null;
    suffix?: string;
    icon: React.ReactNode;
}) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4 backdrop-blur-sm cursor-pointer transition-colors hover:bg-white/10"
        >
            <div className="p-3 bg-green-500/10 rounded-xl text-green-400 border border-green-500/20">
                {icon}
            </div>
            <div>
                <p className="text-xs font-medium text-gray-500 uppercase">{title}</p>
                <p className="text-xl font-mono font-bold text-white">
                    {value !== null && value !== undefined ? `${value}${suffix}` : 'N/A'}
                </p>
            </div>
        </motion.div>
    );
}

// 格式化大數字 (億/兆)
function formatLargeNumber(num: number | null): string {
    if (num === null || num === undefined) return 'N/A';
    if (Math.abs(num) >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    return num.toLocaleString();
}

export default function StockFinancialsPage() {
    const params = useParams();
    const symbol = params?.symbol as string;

    const { data, error, isLoading } = useSWR(
        symbol ? `/api/stocks/${symbol}/financials` : null,
        fetcher
    );

    // Loading State
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
            </div>
        );
    }

    // Error State
    if (error || !data || (data.annual?.length === 0 && data.quarterly?.length === 0)) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-400">無財報數據</h1>
                <p className="mt-2 text-gray-400">
                    找不到 {symbol} 的財務報表。請確認標的是否為美股，或稍後再試。
                </p>
            </div>
        );
    }

    // 取最新季報作為 Summary
    const latestQuarter = data.quarterly?.[0];
    const latestAnnual = data.annual?.[0];

    // 準備圖表數據 (反轉為時間正序)
    const quarterlyChartData = [...(data.quarterly || [])].reverse().map((q: any) => ({
        date: q.fiscal_date?.slice(0, 7), // YYYY-MM
        營收: q.revenue ? q.revenue / 1e9 : 0,
        淨利: q.net_income ? q.net_income / 1e9 : 0,
    }));

    const annualChartData = [...(data.annual || [])].reverse().map((a: any) => ({
        year: a.fiscal_date?.slice(0, 4),
        EPS: a.eps,
        毛利率: parseFloat(a.gross_margin) || 0,
        淨利率: parseFloat(a.net_margin) || 0,
    }));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold mb-2">📊 財務報表</h2>
                <p className="text-gray-400 text-sm">
                    {symbol} 近 5 年年報與近 8 季季報數據 (來源: FMP)
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="最新季度營收"
                    value={formatLargeNumber(latestQuarter?.revenue)}
                    icon={<DollarSign className="w-5 h-5" />}
                />
                <StatCard
                    title="最新季度 EPS"
                    value={latestQuarter?.eps?.toFixed(2)}
                    icon={<TrendingUp className="w-5 h-5" />}
                />
                <StatCard
                    title="毛利率"
                    value={latestQuarter?.gross_margin}
                    suffix="%"
                    icon={<Percent className="w-5 h-5" />}
                />
                <StatCard
                    title="淨利率"
                    value={latestQuarter?.net_margin}
                    suffix="%"
                    icon={<Activity className="w-5 h-5" />}
                />
            </div>

            {/* Quarterly Revenue & Net Income Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm"
            >
                <h3 className="text-lg font-semibold mb-4">季度營收與淨利趨勢 (單位: Billion USD)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={quarterlyChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                        />
                        <Legend />
                        <Bar dataKey="營收" fill="#10B981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="淨利" fill="#6366F1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Annual Margin & EPS Trend */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm"
            >
                <h3 className="text-lg font-semibold mb-4">年度盈利能力趨勢</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={annualChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="year" stroke="#9CA3AF" />
                        <YAxis yAxisId="left" stroke="#9CA3AF" />
                        <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                        />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="EPS" stroke="#F59E0B" strokeWidth={2} dot />
                        <Line yAxisId="right" type="monotone" dataKey="毛利率" stroke="#10B981" strokeWidth={2} dot />
                        <Line yAxisId="right" type="monotone" dataKey="淨利率" stroke="#6366F1" strokeWidth={2} dot />
                    </LineChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Data Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm overflow-x-auto"
            >
                <h3 className="text-lg font-semibold mb-4">年度明細</h3>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/10 text-gray-400">
                            <th className="py-3 text-left">年度</th>
                            <th className="py-3 text-right">營收</th>
                            <th className="py-3 text-right">淨利</th>
                            <th className="py-3 text-right">EPS</th>
                            <th className="py-3 text-right">毛利率</th>
                            <th className="py-3 text-right">淨利率</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.annual?.map((row: any) => (
                            <tr key={row.fiscal_date} className="border-b border-white/5 hover:bg-white/5">
                                <td className="py-3">{row.fiscal_date?.slice(0, 4)}</td>
                                <td className="py-3 text-right font-mono">{formatLargeNumber(row.revenue)}</td>
                                <td className="py-3 text-right font-mono">{formatLargeNumber(row.net_income)}</td>
                                <td className="py-3 text-right font-mono">{row.eps?.toFixed(2) || 'N/A'}</td>
                                <td className="py-3 text-right font-mono">{row.gross_margin || 'N/A'}%</td>
                                <td className="py-3 text-right font-mono">{row.net_margin || 'N/A'}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </div>
    );
}
