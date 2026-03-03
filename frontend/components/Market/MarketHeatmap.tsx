"use client";

import React, { useMemo } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { HeatmapNode } from '@/hooks/useHeatmap';
import { Bilingual } from '@/components/ui/Bilingual';

interface MarketHeatmapProps {
    data: HeatmapNode | null;
    height?: number;
}

/**
 * 根據漲跌幅返回對應顏色
 * 紅色 (跌) ↔ 綠色 (漲)
 */
const getColorByChange = (change: number): string => {
    if (change >= 5) return '#16a34a';      // 深綠 (強勢上漲)
    if (change >= 2) return '#22c55e';      // 綠
    if (change >= 0.5) return '#86efac';    // 淺綠
    if (change > -0.5) return '#fef08a';    // 黃 (平盤)
    if (change > -2) return '#fca5a5';      // 淺紅
    if (change > -5) return '#ef4444';      // 紅
    return '#dc2626';                       // 深紅 (強勢下跌)
};

/**
 * 自定義 Treemap 內容
 */
const CustomContent = (props: any) => {
    const { x, y, width, height, name, stock_code, change_percent } = props;

    // 太小的區塊不顯示文字
    if (width < 30 || height < 20) {
        return (
            <g>
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={getColorByChange(change_percent || 0)}
                    stroke="#1f2937"
                    strokeWidth={1}
                />
            </g>
        );
    }

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={getColorByChange(change_percent || 0)}
                stroke="#1f2937"
                strokeWidth={1}
                rx={2}
                ry={2}
                style={{ transition: 'all 0.2s ease' }}
            />
            <text
                x={x + width / 2}
                y={y + height / 2 - 6}
                textAnchor="middle"
                fill="#fff"
                fontSize={width > 60 ? 11 : 9}
                fontWeight={600}
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
            >
                {stock_code || name?.slice(0, 4)}
            </text>
            <text
                x={x + width / 2}
                y={y + height / 2 + 8}
                textAnchor="middle"
                fill="#fff"
                fontSize={width > 60 ? 10 : 8}
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
            >
                {change_percent !== undefined
                    ? `${change_percent > 0 ? '+' : ''}${change_percent.toFixed(1)}%`
                    : ''}
            </text>
        </g>
    );
};

/**
 * 自定義 Tooltip
 */
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
        const data = payload[0].payload;
        return (
            <div className="bg-black/80 backdrop-blur-md border border-white/20 rounded-lg p-3 shadow-xl">
                <p className="font-semibold text-white">{data.name}</p>
                {data.stock_code && (
                    <p className="text-gray-400 text-xs">{data.stock_code}</p>
                )}
                {data.price !== undefined && (
                    <p className="text-gray-300 text-sm mt-1 flex gap-1">
                        <Bilingual zh="價格:" en="Price:" mode="inline" /> ${data.price.toFixed(2)}
                    </p>
                )}
                {data.change_percent !== undefined && (
                    <p className={`text-sm font-medium flex gap-1 ${data.change_percent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        <Bilingual zh="漲跌:" en="Change:" mode="inline" /> {data.change_percent > 0 ? '+' : ''}{data.change_percent.toFixed(2)}%
                    </p>
                )}
                {data.value !== undefined && (
                    <p className="text-gray-400 text-xs mt-1 flex gap-1">
                        <Bilingual zh="成交量:" en="Volume:" mode="inline" /> {(data.value / 1000).toFixed(0)}K
                    </p>
                )}
            </div>
        );
    }
    return null;
};

/**
 * MarketHeatmap - 市場熱力圖組件
 * 使用 Recharts Treemap 呈現全市場漲跌強弱。
 */
export function MarketHeatmap({ data, height = 500 }: MarketHeatmapProps) {
    // 將階層資料展平為 Recharts 所需格式
    const flattenedData = useMemo(() => {
        if (!data || !data.children) return [];

        const result: any[] = [];
        data.children.forEach((sector) => {
            if (sector.children) {
                sector.children.forEach((stock) => {
                    result.push({
                        ...stock,
                        sector: sector.name,
                        size: stock.value || 1
                    });
                });
            }
        });
        return result;
    }, [data]);

    if (!data || flattenedData.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                <p><Bilingual zh="暫無熱力圖資料" en="No heatmap data available" /></p>
            </div>
        );
    }

    return (
        <div className="w-full rounded-xl overflow-hidden border border-white/10 bg-black/20 backdrop-blur-md">
            <ResponsiveContainer width="100%" height={height}>
                <Treemap
                    data={flattenedData}
                    dataKey="size"
                    aspectRatio={4 / 3}
                    stroke="#1f2937"
                    content={<CustomContent />}
                >
                    <Tooltip content={<CustomTooltip />} />
                </Treemap>
            </ResponsiveContainer>
        </div>
    );
}
