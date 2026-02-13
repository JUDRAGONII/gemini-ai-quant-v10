// [REBUILD_TRIGGER: 2026-02-12T14:28:00]
// [REBUILD_TRIGGER: 2026-02-12T14:28:00]
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Bilingual } from '@/components/ui/Bilingual';
import { Network } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

interface EvolutionData {
    generation: number;
    avg_fitness: number;
    max_fitness: number;
}

interface EvolutionTrendWidgetProps {
    data: EvolutionData[];
}

export const EvolutionTrendWidget: React.FC<EvolutionTrendWidgetProps> = ({ data }) => {
    return (
        <Card className="h-full bg-slate-900/50 border-slate-800 backdrop-blur-sm flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Bilingual zh="演化趨勢" en="EVOLUTION TREND" mode="inline">
                        <Network className="w-4 h-4 text-purple-400" />
                    </Bilingual>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-[150px] p-0 relative">
                <div className="absolute inset-0 pb-2 pr-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                            <XAxis
                                dataKey="generation"
                                stroke="#64748b"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                interval="preserveStartEnd"
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
                            <Area
                                type="monotone"
                                dataKey="max_fitness"
                                stroke="#8B5CF6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorMax)"
                            />
                            <Area
                                type="monotone"
                                dataKey="avg_fitness"
                                stroke="#0EA5E9"
                                strokeWidth={2}
                                fill="transparent"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
