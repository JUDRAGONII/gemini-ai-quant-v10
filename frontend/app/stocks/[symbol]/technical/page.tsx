'use client';

/**
 * @page StockTechnicalPage
 * @description 技術分析子頁面 - 展示 MA/RSI/MACD 等技術指標
 * @route /stocks/[symbol]/technical
 */

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useStockDetail } from '@/hooks/useStockDetail';
import { motion } from 'framer-motion';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, BarChart, Bar, ReferenceLine
} from 'recharts';
import { Activity, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

// 計算簡單移動平均線 (SMA)
function calculateSMA(data: number[], period: number): (number | null)[] {
    return data.map((_, i, arr) => {
        if (i < period - 1) return null;
        const slice = arr.slice(i - period + 1, i + 1);
        return slice.reduce((a, b) => a + b, 0) / period;
    });
}

// 計算 RSI (Relative Strength Index)
function calculateRSI(prices: number[], period: number = 14): (number | null)[] {
    const changes = prices.map((p, i) => (i === 0 ? 0 : p - prices[i - 1]));
    const gains = changes.map(c => (c > 0 ? c : 0));
    const losses = changes.map(c => (c < 0 ? -c : 0));

    const rsi: (number | null)[] = [];

    for (let i = 0; i < prices.length; i++) {
        if (i < period) {
            rsi.push(null);
            continue;
        }
        const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
        const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        rsi.push(100 - 100 / (1 + rs));
    }
    return rsi;
}

// 計算 MACD
function calculateMACD(prices: number[], fast = 12, slow = 26, signal = 9) {
    const ema = (data: number[], period: number): number[] => {
        const k = 2 / (period + 1);
        const result: number[] = [data[0]];
        for (let i = 1; i < data.length; i++) {
            result.push(data[i] * k + result[i - 1] * (1 - k));
        }
        return result;
    };

    const emaFast = ema(prices, fast);
    const emaSlow = ema(prices, slow);
    const macdLine = emaFast.map((v, i) => v - emaSlow[i]);
    const signalLine = ema(macdLine, signal);
    const histogram = macdLine.map((v, i) => v - signalLine[i]);

    return { macdLine, signalLine, histogram };
}

// 指標卡片
function IndicatorCard({ title, value, status, icon }: {
    title: string;
    value: string | number;
    status: 'bullish' | 'bearish' | 'neutral';
    icon: React.ReactNode;
}) {
    const statusColors = {
        bullish: 'text-green-400 bg-green-500/10 border-green-500/20',
        bearish: 'text-red-400 bg-red-500/10 border-red-500/20',
        neutral: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
    };

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className={`rounded-2xl p-5 flex items-center gap-4 backdrop-blur-sm cursor-pointer transition-colors border ${statusColors[status]}`}
        >
            <div className={`p-3 rounded-xl ${statusColors[status]}`}>
                {icon}
            </div>
            <div>
                <p className="text-xs font-medium text-gray-500 uppercase">{title}</p>
                <p className="text-xl font-mono font-bold">{value}</p>
            </div>
        </motion.div>
    );
}

export default function StockTechnicalPage() {
    const params = useParams();
    const symbol = params?.symbol as string;
    const { data, loading, error } = useStockDetail(symbol);

    // 計算技術指標
    const technicalData = useMemo(() => {
        if (!data?.price_series || data.price_series.length === 0) return null;

        const closes = data.price_series.map((p: any) => p.close);
        const dates = data.price_series.map((p: any) => {
            const timeVal = p.time || p.date || Date.now() / 1000;
            const date = new Date(typeof timeVal === 'number' ? timeVal * 1000 : timeVal);
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${month}-${day}`;
        });

        const ma5 = calculateSMA(closes, 5);
        const ma20 = calculateSMA(closes, 20);
        const ma60 = calculateSMA(closes, 60);
        const rsi = calculateRSI(closes, 14);
        const macd = calculateMACD(closes);

        // 組合圖表數據 (最近 60 天)
        const chartData = dates.slice(-60).map((date: string, i: number) => {
            const idx = closes.length - 60 + i;
            return {
                date,
                close: closes[idx],
                MA5: ma5[idx]?.toFixed(2),
                MA20: ma20[idx]?.toFixed(2),
                MA60: ma60[idx]?.toFixed(2),
                RSI: rsi[idx]?.toFixed(2),
                MACD: macd.macdLine[idx]?.toFixed(4),
                Signal: macd.signalLine[idx]?.toFixed(4),
                Histogram: macd.histogram[idx]?.toFixed(4),
            };
        });

        // 最新指標值
        const latestRSI = rsi[rsi.length - 1];
        const latestMACD = macd.histogram[macd.histogram.length - 1];

        return {
            chartData,
            latestRSI,
            latestMACD,
            latestClose: closes[closes.length - 1],
            latestMA5: ma5[ma5.length - 1],
            latestMA20: ma20[ma20.length - 1],
        };
    }, [data]);

    // Loading
    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500" />
            </div>
        );
    }

    // Error
    if (error || !data || !technicalData) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-400">無法計算技術指標</h1>
                <p className="mt-2 text-gray-400">
                    找不到 {symbol} 的價格數據，無法進行技術分析。
                </p>
            </div>
        );
    }

    // 判斷趨勢
    const rsiStatus = technicalData.latestRSI
        ? technicalData.latestRSI > 70 ? 'bearish' : technicalData.latestRSI < 30 ? 'bullish' : 'neutral'
        : 'neutral';
    const macdStatus = technicalData.latestMACD
        ? technicalData.latestMACD > 0 ? 'bullish' : 'bearish'
        : 'neutral';
    const maStatus = technicalData.latestClose && technicalData.latestMA20
        ? technicalData.latestClose > technicalData.latestMA20 ? 'bullish' : 'bearish'
        : 'neutral';

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold mb-2">📈 技術分析</h2>
                <p className="text-gray-400 text-sm">
                    {symbol} 近 60 日技術指標 (前端即時計算)
                </p>
            </div>

            {/* Indicator Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <IndicatorCard
                    title="RSI (14)"
                    value={technicalData.latestRSI?.toFixed(2) || 'N/A'}
                    status={rsiStatus}
                    icon={<Activity className="w-5 h-5" />}
                />
                <IndicatorCard
                    title="MACD 柱狀"
                    value={technicalData.latestMACD?.toFixed(4) || 'N/A'}
                    status={macdStatus}
                    icon={<BarChart3 className="w-5 h-5" />}
                />
                <IndicatorCard
                    title="MA20 趨勢"
                    value={maStatus === 'bullish' ? '多頭排列' : '空頭排列'}
                    status={maStatus}
                    icon={maStatus === 'bullish' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                />
            </div>

            {/* Price + MA Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm"
            >
                <h3 className="text-lg font-semibold mb-4">股價與均線 (MA5 / MA20 / MA60)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={technicalData.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" domain={['auto', 'auto']} />
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                        <Legend />
                        <Line type="monotone" dataKey="close" name="收盤價" stroke="#fff" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="MA5" stroke="#F59E0B" strokeWidth={1} dot={false} />
                        <Line type="monotone" dataKey="MA20" stroke="#10B981" strokeWidth={1} dot={false} />
                        <Line type="monotone" dataKey="MA60" stroke="#6366F1" strokeWidth={1} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </motion.div>

            {/* RSI Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm"
            >
                <h3 className="text-lg font-semibold mb-4">RSI 相對強弱指標</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={technicalData.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                        <ReferenceLine y={70} stroke="#EF4444" strokeDasharray="3 3" label="超買" />
                        <ReferenceLine y={30} stroke="#10B981" strokeDasharray="3 3" label="超賣" />
                        <Area type="monotone" dataKey="RSI" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                    </AreaChart>
                </ResponsiveContainer>
            </motion.div>

            {/* MACD Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm"
            >
                <h3 className="text-lg font-semibold mb-4">MACD 指標</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={technicalData.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
                        <Legend />
                        <ReferenceLine y={0} stroke="#9CA3AF" />
                        <Bar dataKey="Histogram" name="柱狀圖" fill="#6366F1" />
                        <Line type="monotone" dataKey="MACD" name="MACD" stroke="#F59E0B" />
                        <Line type="monotone" dataKey="Signal" name="訊號線" stroke="#EF4444" />
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>
        </div>
    );
}
