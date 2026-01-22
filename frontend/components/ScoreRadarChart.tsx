"use client";

import React from "react";
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

/**
 * 評分雷達圖組件
 * 使用 Recharts RadarChart 展示多維度評分
 */

interface ScoreData {
    /** 維度名稱 */
    dimension: string;
    /** 滿分 (通常為 100) */
    fullMark: number;
    /** 實際分數 */
    score: number;
}

interface ScoreRadarChartProps {
    /** 股票代碼 */
    symbol: string;
    /** 評分數據陣列 */
    data: ScoreData[];
    /** 圖表尺寸 (預設 280px) */
    size?: number;
    /** 主色調 */
    color?: string;
}

// 預設的維度數據模板
export const DEFAULT_SCORE_DIMENSIONS: ScoreData[] = [
    { dimension: "價值", fullMark: 100, score: 0 },
    { dimension: "成長", fullMark: 100, score: 0 },
    { dimension: "動能", fullMark: 100, score: 0 },
    { dimension: "品質", fullMark: 100, score: 0 },
    { dimension: "籌碼", fullMark: 100, score: 0 },
];

export default function ScoreRadarChart({
    symbol,
    data,
    size = 280,
    color = "#F59E0B", // Amber (主色)
}: ScoreRadarChartProps) {
    // 計算總分 (平均)
    const avgScore =
        data.length > 0
            ? Math.round(
                data.reduce((sum, d) => sum + d.score, 0) / data.length
            )
            : 0;

    // 評級判斷
    const getGrade = (score: number) => {
        if (score >= 80) return { label: "A+", color: "#10B981" };
        if (score >= 70) return { label: "A", color: "#22C55E" };
        if (score >= 60) return { label: "B", color: "#F59E0B" };
        if (score >= 50) return { label: "C", color: "#EAB308" };
        return { label: "D", color: "#EF4444" };
    };

    const grade = getGrade(avgScore);

    // 自定義 Tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload as ScoreData;
            return (
                <div className="glass p-2 rounded-lg border border-white/20 text-sm">
                    <span className="text-gray-400">{dataPoint.dimension}</span>
                    <span
                        className="ml-2 font-bold"
                        style={{ color }}
                    >
                        {dataPoint.score}
                    </span>
                    <span className="text-gray-500"> / 100</span>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="glass p-5 rounded-xl border border-white/10">
            {/* 標題與總分 */}
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-semibold text-gray-400">
                    AI 多維評分
                </h4>
                <div className="flex items-center gap-2">
                    <span
                        className="text-2xl font-bold"
                        style={{ color: grade.color }}
                    >
                        {grade.label}
                    </span>
                    <span className="text-sm text-gray-500">
                        {avgScore} 分
                    </span>
                </div>
            </div>

            {/* 雷達圖 */}
            <div style={{ height: size }}>
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                        cx="50%"
                        cy="50%"
                        outerRadius="75%"
                        data={data}
                    >
                        <PolarGrid stroke="#333" />
                        <PolarAngleAxis
                            dataKey="dimension"
                            tick={{
                                fill: "#9CA3AF",
                                fontSize: 12,
                            }}
                        />
                        <PolarRadiusAxis
                            angle={90}
                            domain={[0, 100]}
                            tick={{ fill: "#6B7280", fontSize: 10 }}
                            axisLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Radar
                            name={symbol}
                            dataKey="score"
                            stroke={color}
                            strokeWidth={2}
                            fill={color}
                            fillOpacity={0.3}
                            animationDuration={800}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* 底部說明 */}
            <div className="text-center text-xs text-gray-500 mt-2">
                基於價值、成長、動能、品質、籌碼五大維度
            </div>
        </div>
    );
}
