"use client";

import React, { useState, useEffect } from "react";
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

interface ScoreData {
    dimension: string;
    fullMark: number;
    score: number;
}

interface ScoreRadarChartProps {
    symbol: string;
    data: ScoreData[];
    size?: number;
    color?: string;
    showLegend?: boolean;
    showAnimation?: boolean;
    comparisonData?: ScoreData[];
    customScore?: number; // Optional weighted score from parent
}

const DIMENSION_COLORS: Record<string, string> = {
    "價值": "#F59E0B",
    "成長": "#10B981",
    "動能": "#3B82F6",
    "品質": "#8B5CF6",
    "籌碼": "#EC4899",
};

export default function ScoreRadarChart({
    symbol,
    data,
    size = 280,
    color = "#F59E0B",
    showLegend = true,
    showAnimation = true,
    comparisonData,
    customScore,
}: ScoreRadarChartProps) {
    const [isAnimating, setIsAnimating] = useState(true);
    const [hoveredDimension, setHoveredDimension] = useState<string | null>(null);

    useEffect(() => {
        if (showAnimation) {
            const timer = setTimeout(() => setIsAnimating(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [showAnimation]);

    const displayScore = customScore !== undefined
        ? customScore
        : (data.length > 0
            ? Math.round(data.reduce((sum, d) => sum + d.score, 0) / data.length)
            : 0);

    const getGrade = (score: number) => {
        if (score >= 80) return { label: "S", color: "#10B981", bg: "bg-green-500/20" };
        if (score >= 70) return { label: "A", color: "#22C55E", bg: "bg-emerald-500/20" };
        if (score >= 60) return { label: "B", color: "#F59E0B", bg: "bg-amber-500/20" };
        if (score >= 50) return { label: "C", color: "#EAB308", bg: "bg-yellow-500/20" };
        return { label: "D", color: "#EF4444", bg: "bg-red-500/20" };
    };

    const grade = getGrade(displayScore);

    const chartData = data.map((d, i) => ({
        ...d,
        comparison: comparisonData?.[i]?.score || 0,
        fullMark: 100,
    }));

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload as ScoreData & { comparison?: number };

            return (
                <div className="glass p-3 rounded-lg border border-white/20 text-sm min-w-[140px]">
                    <div className="flex items-center gap-2 mb-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                        />
                        <span className="text-gray-400">{dataPoint.dimension}</span>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <span className="text-gray-500">得分</span>
                            <span className="font-bold" style={{ color }}>
                                {dataPoint.score}
                            </span>
                        </div>
                        {dataPoint.comparison !== undefined && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">比較</span>
                                <span className="font-bold text-gray-400">
                                    {dataPoint.comparison}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="glass p-5 rounded-xl border border-white/10">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="text-sm font-semibold text-gray-400">
                        AI 多維評分
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">{symbol}</p>
                </div>
                <div className={`px-3 py-1 rounded-lg ${grade.bg} text-center`}>
                    <span className="text-2xl font-bold" style={{ color: grade.color }}>
                        {grade.label}
                    </span>
                    <p className="text-xs text-gray-500">{displayScore} 分</p>
                </div>
            </div>

            <div style={{ height: size }}>
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                        <PolarGrid stroke="#333" />
                        <PolarAngleAxis
                            dataKey="dimension"
                            tick={{ fill: "#9CA3AF", fontSize: 12 }}
                            onMouseEnter={(e: any) => setHoveredDimension(e.value)}
                            onMouseLeave={() => setHoveredDimension(null)}
                        />
                        <PolarRadiusAxis
                            angle={90}
                            domain={[0, 100]}
                            tick={{ fill: "#6B7280", fontSize: 10 }}
                            axisLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Radar
                            name="score"
                            dataKey="score"
                            stroke={color}
                            strokeWidth={2}
                            fill={color}
                            fillOpacity={isAnimating ? 0 : 0.3}
                            animationDuration={showAnimation ? 1000 : 0}
                        />
                        {comparisonData && (
                            <Radar
                                name="comparison"
                                dataKey="comparison"
                                stroke="#6B7280"
                                strokeWidth={1}
                                fill="#6B7280"
                                fillOpacity={0.1}
                                animationDuration={showAnimation ? 1000 : 0}
                            />
                        )}
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {showLegend && (
                <div className="mt-4 grid grid-cols-5 gap-2">
                    {data.map((d) => {
                        const score = d.score;
                        const barWidth = score;

                        return (
                            <div
                                key={d.dimension}
                                className="transition-all hover:scale-105"
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span
                                        className="text-xs text-gray-400"
                                        style={{ color: DIMENSION_COLORS[d.dimension] }}
                                    >
                                        {d.dimension}
                                    </span>
                                    <span className="text-xs font-mono text-gray-300">
                                        {d.score}
                                    </span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-1.5">
                                    <div
                                        className="h-1.5 rounded-full transition-all duration-500"
                                        style={{
                                            width: `${barWidth}%`,
                                            backgroundColor: DIMENSION_COLORS[d.dimension],
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {comparisonData && (
                <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        <span>當前標的</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-500" />
                        <span>產業平均</span>
                    </div>
                </div>
            )}
        </div>
    );
}
