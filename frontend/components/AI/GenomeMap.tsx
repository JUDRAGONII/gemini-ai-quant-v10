"use client";

import React from "react";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import { GlassCard } from "../ui/GlassCard";
import { Bilingual } from "../ui/Bilingual";

const GENE_LABELS = [
    { zh: "價值權重", en: "VALUE WT" },
    { zh: "成長權重", en: "GROWTH WT" },
    { zh: "品質權重", en: "QUALITY WT" },
    { zh: "動能權重", en: "MOMENTUM WT" },
    { zh: "波動權重", en: "VOL WT" },
    { zh: "均線交叉", en: "MA CROSS" },
    { zh: "RSI 閾值", en: "RSI THRESH" },
    { zh: "MACD 信號", en: "MACD SIG" },
    { zh: "布林帶 K", en: "BB K" },
    { zh: "VIX 避險", en: "VIX HEDGE" },
    { zh: "停損比例", en: "STOP LOSS" },
    { zh: "停利比例", en: "TAKE PROFIT" },
    { zh: "持有天數", en: "HOLD DAYS" },
    { zh: "再平衡頻率", en: "REBAL FREQ" },
    { zh: "突變率", en: "MUT RATE" },
    { zh: "族群規模", en: "POP SIZE" },
    { zh: "選擇壓力", en: "SEL PRESS" },
    { zh: "交叉機率", en: "CX PROB" },
    { zh: "演化速率", en: "EVO SPEED" },
    { zh: "學習率", en: "LEARN RATE" },
    { zh: "記憶衰減", en: "MEM DECAY" },
    { zh: "Alpha 衰減", en: "ALPHA DECAY" },
    { zh: "Beta 敏感", en: "BETA SENS" },
    { zh: "Gamma 調整", en: "GAMMA ADJ" },
    { zh: "Theta 衰減", en: "THETA DECAY" },
    { zh: "Delta 中性", en: "DELTA NEUT" },
];

interface GenomeMapProps {
    genome: number[];
}

export const GenomeMap: React.FC<GenomeMapProps> = ({ genome }) => {
    const data = GENE_LABELS.map((label, idx) => ({
        subject: label.zh,
        subjectEn: label.en,
        value: genome?.[idx] ? genome[idx] * 100 : 0,
        fullMark: 100,
    }));

    return (
        <div className="w-full h-[400px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={(props) => {
                            const { x, y, payload } = props;
                            const item = data.find(d => d.subject === payload.value);
                            return (
                                <g transform={`translate(${x},${y})`}>
                                    <text
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        className="fill-slate-400 text-[8px] font-bold"
                                    >
                                        {payload.value}
                                    </text>
                                    <text
                                        y={10}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        className="fill-slate-600 text-[6px] font-mono uppercase"
                                    >
                                        {item?.subjectEn}
                                    </text>
                                </g>
                            );
                        }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Genome"
                        dataKey="value"
                        stroke="#8B5CF6"
                        fill="#8B5CF6"
                        fillOpacity={0.3}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(15, 23, 42, 0.9)",
                            borderColor: "#334155",
                            borderRadius: "8px",
                            fontSize: "12px",
                        }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};
