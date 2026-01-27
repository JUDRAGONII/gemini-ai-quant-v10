'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import {
    createChart,
    ColorType,
    IChartApi,
    ISeriesApi,
    HistogramSeries,
    LineSeries,
    Time,
    CrosshairMode,
} from 'lightweight-charts';
import { motion } from 'framer-motion';

export interface KLinePricePoint {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}

interface TechnicalIndicatorPanelProps {
    data: KLinePricePoint[];
    height?: number;
}

interface IndicatorData {
    dates: string[];
    rsi: number[];
    macd: { macd: number[]; signal: number[]; histogram: number[] };
    ma5: number[];
    ma20: number[];
    ma60: number[];
}

function calculateSMA(prices: number[], period: number): (number | null)[] {
    return prices.map((_, i, arr) => {
        if (i < period - 1) return null;
        const slice = arr.slice(i - period + 1, i + 1);
        return slice.reduce((a, b) => a + b, 0) / period;
    });
}

function calculateRSI(prices: number[], period: number = 14): number[] {
    const changes = prices.map((p, i) => (i === 0 ? 0 : p - prices[i - 1]));
    const gains = changes.map(c => (c > 0 ? c : 0));
    const losses = changes.map(c => (c < 0 ? -c : 0));

    const rsi: number[] = [];

    for (let i = 0; i < prices.length; i++) {
        if (i < period) {
            rsi.push(50);
            continue;
        }
        const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
        const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        rsi.push(100 - 100 / (1 + rs));
    }
    return rsi;
}

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

export const TechnicalIndicatorPanel: React.FC<TechnicalIndicatorPanelProps> = ({
    data,
    height = 200,
}) => {
    const rsiContainerRef = useRef<HTMLDivElement>(null);
    const macdContainerRef = useRef<HTMLDivElement>(null);
    const rsiChartRef = useRef<IChartApi | null>(null);
    const macdChartRef = useRef<IChartApi | null>(null);

    const indicatorData = useMemo((): IndicatorData | null => {
        if (!data || data.length === 0) return null;

        const closes = data.map(p => p.close);
        const dates = data.map(p => {
            const date = new Date(p.time * 1000);
            return `${date.getMonth() + 1}/${date.getDate()}`;
        });

        const ma5 = calculateSMA(closes, 5).map(v => v ?? 0);
        const ma20 = calculateSMA(closes, 20).map(v => v ?? 0);
        const ma60 = calculateSMA(closes, 60).map(v => v ?? 0);
        const rsi = calculateRSI(closes, 14);
    const macd = calculateMACD(closes);

    return { dates, rsi, macd: { macd: macd.macdLine, signal: macd.signalLine, histogram: macd.histogram }, ma5, ma20, ma60 };
    }, [data]);

    const latestValues = useMemo(() => {
        if (!indicatorData) return null;
        const len = indicatorData.rsi.length;
        return {
            rsi: indicatorData.rsi[len - 1],
            macd: indicatorData.macd.histogram[len - 1],
            ma5: indicatorData.ma5[len - 1],
            ma20: indicatorData.ma20[len - 1],
            ma60: indicatorData.ma60[len - 1],
        };
    }, [indicatorData]);

    useEffect(() => {
        if (!indicatorData || !rsiContainerRef.current || !macdContainerRef.current) return;

        const rsiChart = createChart(rsiContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#9CA3AF',
                fontSize: 11,
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
            },
            width: rsiContainerRef.current.clientWidth,
            height: height,
            timeScale: { visible: false },
            rightPriceScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            crosshair: { mode: CrosshairMode.Normal },
        });

        const macdChart = createChart(macdContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#9CA3AF',
                fontSize: 11,
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
            },
            width: macdContainerRef.current.clientWidth,
            height: height,
            timeScale: { visible: false },
            rightPriceScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            crosshair: { mode: CrosshairMode.Normal },
        });

        rsiChartRef.current = rsiChart;
        macdChartRef.current = macdChart;

        const rsiSeries = rsiChart.addSeries(LineSeries, {
            color: '#8B5CF6',
            lineWidth: 2,
        });

        const macdLineSeries = macdChart.addSeries(LineSeries, {
            color: '#F59E0B',
            lineWidth: 1,
        });
        const signalSeries = macdChart.addSeries(LineSeries, {
            color: '#EF4444',
            lineWidth: 1,
        });
        const histogramSeries = macdChart.addSeries(HistogramSeries, {
            color: '#6366F1',
        });

        const rsiData = indicatorData.rsi.map((v, i) => ({
            time: i as Time,
            value: v,
        }));
        rsiSeries.setData(rsiData);

        const macdData = indicatorData.macd.macd.map((v, i) => ({
            time: i as Time,
            value: v,
        }));
        macdLineSeries.setData(macdData);

        const signalData = indicatorData.macd.signal.map((v, i) => ({
            time: i as Time,
            value: v,
        }));
        signalSeries.setData(signalData);

        const histogramData = indicatorData.macd.histogram.map((v, i) => ({
            time: i as Time,
            value: v,
            color: v >= 0 ? 'rgba(38, 166, 154, 0.6)' : 'rgba(239, 83, 80, 0.6)',
        }));
        histogramSeries.setData(histogramData);

        const rsiScale = rsiChart.priceScale('');
        if (rsiScale) rsiScale.applyOptions({ scaleMargins: { top: 0.1, bottom: 0 } });
        const macdScale = macdChart.priceScale('');
        if (macdScale) macdScale.applyOptions({ scaleMargins: { top: 0.15, bottom: 0.1 } });

        const handleResize = () => {
            if (rsiContainerRef.current) {
                rsiChart.applyOptions({ width: rsiContainerRef.current.clientWidth });
            }
            if (macdContainerRef.current) {
                macdChart.applyOptions({ width: macdContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            rsiChart.remove();
            macdChart.remove();
        };
    }, [indicatorData, height]);

    if (!indicatorData || !latestValues) {
        return (
            <div className="p-8 text-center text-gray-400">
                無法計算技術指標，數據不足
            </div>
        );
    }

    const rsiStatus = latestValues.rsi > 70 ? 'overbought' : latestValues.rsi < 30 ? 'oversold' : 'neutral';
    const macdStatus = latestValues.macd > 0 ? 'bullish' : 'bearish';
    const maStatus = latestValues.ma5 > latestValues.ma20 ? 'bullish' : 'bearish';

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`rounded-2xl p-5 flex items-center gap-4 backdrop-blur-sm border ${
                        rsiStatus === 'overbought'
                            ? 'bg-red-500/10 border-red-500/20 text-red-400'
                            : rsiStatus === 'oversold'
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-white/5 border-white/10 text-gray-300'
                    }`}
                >
                    <div className={`p-3 rounded-xl ${
                        rsiStatus === 'overbought'
                            ? 'bg-red-500/20'
                            : rsiStatus === 'oversold'
                            ? 'bg-green-500/20'
                            : 'bg-white/10'
                    }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs font-medium opacity-70 uppercase">RSI (14)</p>
                        <p className="text-xl font-mono font-bold">{latestValues.rsi.toFixed(2)}</p>
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`rounded-2xl p-5 flex items-center gap-4 backdrop-blur-sm border ${
                        macdStatus === 'bullish'
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}
                >
                    <div className={`p-3 rounded-xl ${
                        macdStatus === 'bullish' ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs font-medium opacity-70 uppercase">MACD 柱狀</p>
                        <p className="text-xl font-mono font-bold">{latestValues.macd.toFixed(4)}</p>
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`rounded-2xl p-5 flex items-center gap-4 backdrop-blur-sm border ${
                        maStatus === 'bullish'
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}
                >
                    <div className={`p-3 rounded-xl ${
                        maStatus === 'bullish' ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs font-medium opacity-70 uppercase">MA20 趨勢</p>
                        <p className="text-xl font-mono font-bold">{maStatus === 'bullish' ? '多頭排列' : '空頭排列'}</p>
                    </div>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm"
            >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    RSI 相對強弱指標
                </h3>
                <div ref={rsiContainerRef} className="w-full" />

                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-0.5 bg-purple-500" />
                        <span>RSI(14)</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-4 h-px bg-red-500" style={{ borderStyle: 'dashed' }} />
                        <span>70 (超買)</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-4 h-px bg-green-500" style={{ borderStyle: 'dashed' }} />
                        <span>30 (超賣)</span>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm"
            >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    MACD 平滑異同移動平均線
                </h3>
                <div ref={macdContainerRef} className="w-full" />

                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-0.5 bg-amber-500" />
                        <span>MACD (12,26,9)</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-0.5 bg-red-500" />
                        <span>Signal</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-indigo-500" style={{ borderRadius: '2px' }} />
                        <span>柱狀圖</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default TechnicalIndicatorPanel;
