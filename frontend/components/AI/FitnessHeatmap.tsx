"use client";

import React from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";
import { EvolutionRecord } from "../../hooks/useEvolution";

interface FitnessHeatmapProps {
    history: EvolutionRecord[];
}

export const FitnessHeatmap: React.FC<FitnessHeatmapProps> = ({ history }) => {
    return (
        <div className="w-full h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={history}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis
                        dataKey="generation"
                        stroke="#64748b"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        label={{ value: 'GENERATION', position: 'insideBottom', offset: -5, fontSize: 8, fill: '#475569' }}
                    />
                    <YAxis
                        stroke="#64748b"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(15, 23, 42, 0.9)",
                            borderColor: "#334155",
                            borderRadius: "8px",
                            fontSize: "12px",
                            color: "#fff"
                        }}
                        itemStyle={{ color: "#fff" }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    <Area
                        type="monotone"
                        dataKey="max_fitness"
                        name="最佳適應度 (BEST FITNESS)"
                        stroke="#8B5CF6"
                        fillOpacity={1}
                        fill="url(#colorMax)"
                    />
                    <Area
                        type="monotone"
                        dataKey="avg_fitness"
                        name="平均適應度 (AVG FITNESS)"
                        stroke="#0EA5E9"
                        fillOpacity={1}
                        fill="url(#colorAvg)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
