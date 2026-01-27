'use client';

import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, CandlestickSeries, CandlestickData, Time } from 'lightweight-charts';

interface PricePoint {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

interface StockChartProps {
    data: PricePoint[];
    colors?: {
        backgroundColor?: string;
        lineColor?: string;
        textColor?: string;
        areaTopColor?: string;
        areaBottomColor?: string;
    };
}

/**
 * StockChart 組件 (UI/UX Pro Max 版)
 * 特色：高品質渲染、玻璃擬態適配、自動 RWD
 * 兼容：lightweight-charts v5.x
 */
export const StockChart: React.FC<StockChartProps> = ({
    data,
    colors: {
        backgroundColor = 'transparent',
        textColor = '#d1d5db',
    } = {},
}) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartApiRef = useRef<IChartApi | null>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        // 1. 初始化圖表實體
        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: backgroundColor },
                textColor,
                fontSize: 12,
                fontFamily: 'Inter, sans-serif',
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
            timeScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
                timeVisible: true,
                secondsVisible: false,
            },
            rightPriceScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            crosshair: {
                mode: 0, // CrosshairMode.Normal
                vertLine: {
                    color: '#6366f1',
                    width: 1,
                    style: 3, // LineStyle.Dashed
                    labelBackgroundColor: '#6366f1',
                },
                horzLine: {
                    color: '#6366f1',
                    width: 1,
                    style: 3,
                    labelBackgroundColor: '#6366f1',
                },
            },
        });

        // 2. 建立 K 線序列 (v5 統一 API)
        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#26A69A',
            downColor: '#EF5350',
            borderVisible: false,
            wickUpColor: '#26A69A',
            wickDownColor: '#EF5350',
        });

        // 轉換數據格式為 v5 要求的格式
        const formattedData: CandlestickData<Time>[] = data.map((p) => ({
            time: p.time as Time,
            open: p.open,
            high: p.high,
            low: p.low,
            close: p.close,
        }));

        candlestickSeries.setData(formattedData);

        chartApiRef.current = chart;

        // 3. 適應容器寬度
        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        // 4. 自動縮放以顯示所有數據
        chart.timeScale().fitContent();

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [data, backgroundColor, textColor]);

    return (
        <div className="relative w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-md p-4">
            <div ref={chartContainerRef} className="w-full" />
            <div className="absolute top-6 left-6 z-10 pointer-events-none">
                <span className="text-xs font-medium text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded-full border border-indigo-400/20">
                    TradingView Data Engine
                </span>
            </div>
        </div>
    );
};
