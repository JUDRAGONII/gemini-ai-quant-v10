'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
    createChart,
    ColorType,
    IChartApi,
    ISeriesApi,
    CandlestickSeries,
    LineSeries,
    Time,
    CrosshairMode,
    UTCTimestamp,
} from 'lightweight-charts';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Activity } from 'lucide-react';

export type ChartPeriod = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'MAX';

export interface KLinePricePoint {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}

interface KLineChartProps {
    data: KLinePricePoint[];
    symbol?: string;
    showMA?: boolean;
    showVolume?: boolean;
    period?: ChartPeriod;
    onPeriodChange?: (period: ChartPeriod) => void;
    width?: number;
    height?: number;
}

interface ChartState {
    chart: IChartApi | null;
    candleSeries: ISeriesApi<'Candlestick'> | null;
    maSeries: {
        [key: number]: ISeriesApi<'Line'>;
    };
    volumeSeries: ISeriesApi<'Histogram'> | null;
}

const MA_COLORS: { [key: number]: string } = {
    5: '#F59E0B',
    10: '#10B981',
    20: '#6366F1',
    60: '#EC4899',
    120: '#8B5CF6',
};

const PERIOD_DAYS: { [key in ChartPeriod]: number } = {
    '1D': 1,
    '1W': 7,
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365,
    'MAX': 3650,
};

export const KLineChart: React.FC<KLineChartProps> = ({
    data,
    symbol = '',
    showMA = true,
    showVolume = true,
    period = '1Y',
    onPeriodChange,
    width: initialWidth,
    height = 500,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
    const maSeriesRefs = useRef<{ [key: number]: ISeriesApi<'Line'> }>({});

    const [currentPeriod, setCurrentPeriod] = useState<ChartPeriod>(period);
    const [dimensions, setDimensions] = useState({ width: 0, height });

    const maPeriods = [5, 10, 20, 60, 120];

    const calculateSMA = useCallback((prices: number[], period: number): (number | null)[] => {
        return prices.map((_, i, arr) => {
            if (i < period - 1) return null;
            const slice = arr.slice(i - period + 1, i + 1);
            return slice.reduce((a, b) => a + b, 0) / period;
        });
    }, []);

    const filterDataByPeriod = useCallback((rawData: KLinePricePoint[], period: ChartPeriod): KLinePricePoint[] => {
        if (period === 'MAX') return rawData;
        const days = PERIOD_DAYS[period];
        const cutoffDate = Date.now() / 1000 - days * 24 * 60 * 60;
        return rawData.filter(d => d.time >= cutoffDate);
    }, []);

    const processedData = useMemo(() => {
        const filtered = filterDataByPeriod(data, currentPeriod);
        return filtered;
    }, [data, currentPeriod, filterDataByPeriod]);

    const handlePeriodClick = useCallback((p: ChartPeriod) => {
        setCurrentPeriod(p);
        onPeriodChange?.(p);
    }, [onPeriodChange]);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth;

        const chart = createChart(container, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#9CA3AF',
                fontSize: 12,
                fontFamily: 'Inter, system-ui, sans-serif',
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
            },
            width,
            height: showVolume ? height - 80 : height - 20,
            timeScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
                timeVisible: true,
                secondsVisible: false,
                fixLeftEdge: true,
                fixRightEdge: true,
            },
            rightPriceScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
                scaleMargins: {
                    top: showVolume ? 0.1 : 0.05,
                    bottom: showVolume ? 0.2 : 0.05,
                },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: {
                    color: '#6366F1',
                    width: 1,
                    style: 3,
                    labelBackgroundColor: '#6366F1',
                },
                horzLine: {
                    color: '#6366F1',
                    width: 1,
                    style: 3,
                    labelBackgroundColor: '#6366F1',
                },
            },
            handleScroll: { mouseWheel: true, pressedMouseMove: true },
            handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
        });

        chartRef.current = chart;

        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#26A69A',
            downColor: '#EF5350',
            borderVisible: false,
            wickUpColor: '#26A69A',
            wickDownColor: '#EF5350',
        });
        candleSeriesRef.current = candleSeries;

        if (showVolume) {
            const volumeSeries = chart.addSeries(LineSeries, {
                priceFormat: { type: 'volume' },
                priceScaleId: '',
            });
            volumeSeries.priceScale().applyOptions({
                scaleMargins: { top: 0.85, bottom: 0 },
            });
            volumeSeriesRef.current = volumeSeries;
        }

        if (showMA) {
            maPeriods.forEach(period => {
                const maSeries = chart.addSeries(LineSeries, {
                    color: MA_COLORS[period],
                    lineWidth: 1,
                    lineStyle: 2,
                    priceLineVisible: false,
                    crosshairMarkerVisible: false,
                });
                maSeriesRefs.current[period] = maSeries;
            });
        }

        chart.timeScale().fitContent();

        const handleResize = () => {
            if (containerRef.current) {
                chart.applyOptions({
                    width: containerRef.current.clientWidth,
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [showVolume, showMA, height, maPeriods]);

    useEffect(() => {
        if (!chartRef.current || !candleSeriesRef.current || processedData.length === 0) return;

        const candleData = processedData.map(p => ({
            time: p.time as Time,
            open: p.open,
            high: p.high,
            low: p.low,
            close: p.close,
        }));

        candleSeriesRef.current.setData(candleData);

        if (showVolume && volumeSeriesRef.current) {
            const volumeData = processedData.map(p => ({
                time: p.time as Time,
                value: p.volume || 0,
                color: p.close >= p.open ? 'rgba(38, 166, 154, 0.3)' : 'rgba(239, 83, 80, 0.3)',
            }));
            volumeSeriesRef.current.setData(volumeData);
        }

        if (showMA) {
            const closes = processedData.map(p => p.close);
            maPeriods.forEach(period => {
                if (maSeriesRefs.current[period]) {
                    const sma = calculateSMA(closes, period);
                    const maData = sma.map((value, i) => ({
                        time: processedData[i].time as Time,
                        value: value || 0,
                    })).filter(d => d.value > 0);
                    maSeriesRefs.current[period].setData(maData);
                }
            });
        }

        chartRef.current?.timeScale().fitContent();
    }, [processedData, showMA, showVolume, maPeriods, calculateSMA]);

    const periods: ChartPeriod[] = ['1D', '1W', '1M', '3M', '6M', '1Y', 'MAX'];

    return (
        <div className="space-y-4">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center justify-between gap-4"
            >
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm text-gray-400">時間週期：</span>
                    <div className="flex gap-1">
                        {periods.map(p => (
                            <button
                                key={p}
                                onClick={() => handlePeriodClick(p)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                    currentPeriod === p
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {showMA && (
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400 flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" /> 均線：
                        </span>
                        {maPeriods.map(p => (
                            <span
                                key={p}
                                className="flex items-center gap-1 text-xs"
                            >
                                <span
                                    className="w-3 h-0.5 rounded"
                                    style={{ backgroundColor: MA_COLORS[p] }}
                                />
                                <span className="text-gray-300">MA{p}</span>
                            </span>
                        ))}
                    </div>
                )}
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="relative w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-md"
            >
                <div ref={containerRef} className="w-full" style={{ height }} />

                {symbol && (
                    <div className="absolute top-4 left-4 z-10 pointer-events-none">
                        <span className="text-xs font-semibold text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded-full border border-indigo-400/20">
                            {symbol}
                        </span>
                    </div>
                )}

                <div className="absolute top-4 right-4 z-10 pointer-events-none flex items-center gap-2">
                    <span className="text-xs text-gray-500 bg-black/20 px-2 py-1 rounded-lg">
                        TradingView Lightweight Charts
                    </span>
                </div>
            </motion.div>

            <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#26A69A]" />
                    上漲
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#EF5350]" />
                    下跌
                </span>
                <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    支援縮放/平移
                </span>
            </div>
        </div>
    );
};

export default KLineChart;
