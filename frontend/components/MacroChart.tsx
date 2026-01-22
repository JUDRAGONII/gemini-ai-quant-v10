"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface MacroChartProps {
    title: string;
    data: any[];
    dataKey: string;
    color: string;
}

export default function MacroChart({ title, data, dataKey, color }: MacroChartProps) {
    return (
        <div className="glass p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-200">{title}</h3>
                <span className="text-xs text-gray-500 font-mono">
                    Last {data.length} Points
                </span>
            </div>

            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#333"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="reference_date"
                            hide={true} // Cleaner look for mini charts
                        />
                        <YAxis
                            hide={false}
                            orientation="right"
                            tick={{ fill: "#6B7280", fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(0, 0, 0, 0.8)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                borderRadius: "8px",
                                backdropFilter: "blur(4px)",
                            }}
                            labelStyle={{ color: "#9CA3AF" }}
                            itemStyle={{ color: color }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill={`url(#color${dataKey})`}
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {data.length > 0 && (
                <div className="flex justify-between items-end mt-4">
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-400">Current</span>
                        <span className="text-2xl font-bold" style={{ color }}>
                            {Number(data[data.length - 1].value).toLocaleString()}
                        </span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-500">
                            {data[data.length - 1].reference_date}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
