"use client";

/**
 * FactorRadarChart — 18 因子雷達圖 (Phase 13.2)
 * 
 * 設計語言：Glassmorphism + 霓虹光暈 + Framer Motion 動態進場
 * 支援 4 維度 (VQGM) 聚合展示與 18 因子細分切換
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import { Bilingual } from "@/components/ui/Bilingual";

// === 型別定義 ===
interface FactorItem {
    key: string;
    zh: string;
    en: string;
    score: number;
}

interface DimensionItem {
    key: string;
    zh: string;
    en: string;
    score: number;
    factors: FactorItem[];
}

interface GradeInfo {
    label: string;
    color: string;
    description: string;
}

interface FactorRadarChartProps {
    symbol: string;
    dimensions?: DimensionItem[];
    factors?: FactorItem[];
    compositeScore?: number;
    grade?: GradeInfo;
}

// === 維度顏色映射 ===
const DIMENSION_COLORS: Record<string, string> = {
    value: "#F59E0B",    // 琥珀金
    growth: "#10B981",   // 翡翠綠
    quality: "#8B5CF6",  // 紫羅蘭
    momentum: "#3B82F6", // 寶石藍
};

// === 組件 ===
export default function FactorRadarChart({
    symbol,
    dimensions = [],
    factors = [],
    compositeScore = 0,
    grade,
}: FactorRadarChartProps) {
    const [viewMode, setViewMode] = useState<"dimension" | "detail">("dimension");
    const [selectedDim, setSelectedDim] = useState<string | null>(null);

    // 雷達圖數據
    const radarData = viewMode === "dimension"
        ? dimensions.map((d) => ({
            subject: d.zh,
            subjectEn: d.en,
            score: d.score,
            fullMark: 100,
        }))
        : (selectedDim
            ? dimensions.find(d => d.key === selectedDim)?.factors || []
            : factors
        ).map((f) => ({
            subject: f.zh,
            subjectEn: f.en,
            score: f.score,
            fullMark: 100,
        }));

    const radarColor = viewMode === "dimension"
        ? "#06b6d4"
        : DIMENSION_COLORS[selectedDim || "value"] || "#06b6d4";

    // 自訂 Tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.length) return null;
        const data = payload[0].payload;
        return (
            <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
                <Bilingual
                    zh={data.subject}
                    en={data.subjectEn}
                    mode="stacked"
                    zhClassName="font-bold text-white text-sm"
                    enClassName="text-[10px] text-slate-500 uppercase font-mono tracking-tighter"
                />
                <p className="text-cyan-400 text-lg font-black mt-1">{data.score}</p>
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative bg-gradient-to-br from-[#0d1117] to-[#161b22] border border-white/5 rounded-2xl p-6 overflow-hidden"
        >
            {/* 背景光暈 */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* 標題列 */}
            <div className="relative flex items-center justify-between mb-4">
                <div>
                    <Bilingual
                        zh="VQGM 全維度評分"
                        en="VQGM Multi-Factor Radar"
                        mode="stacked"
                        zhClassName="text-lg font-black text-white tracking-tight"
                        enClassName="text-[10px] text-slate-500 font-mono tracking-widest uppercase"
                    />
                </div>

                {/* 綜合評分徽章 */}
                {grade && (
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black shadow-lg"
                            style={{
                                background: `${grade.color}20`,
                                color: grade.color,
                                boxShadow: `0 0 20px ${grade.color}30`
                            }}
                        >
                            {grade.label}
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-black text-white">{compositeScore.toFixed(1)}</p>
                            <Bilingual
                                zh={grade.description}
                                en="RANKING GRADE"
                                mode="stacked"
                                zhClassName="text-[10px] text-slate-500"
                                enClassName="text-[8px] text-slate-600 font-mono tracking-tighter uppercase"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* 模式切換 */}
            <div className="relative flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
                <button
                    onClick={() => { setViewMode("dimension"); setSelectedDim(null); }}
                    className={`px-3 py-1.5 rounded-xl border transition-all flex-shrink-0 ${viewMode === "dimension"
                        ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-400"
                        : "bg-white/5 border-white/10 text-slate-500 hover:text-white"
                        }`}
                >
                    <Bilingual
                        zh="四維度總覽"
                        en="QUAD OVERVIEW"
                        mode="stacked"
                        zhClassName="text-xs font-bold"
                        enClassName="text-[8px] font-mono tracking-tighter"
                    />
                </button>
                {dimensions.map((d) => (
                    <button
                        key={d.key}
                        onClick={() => { setViewMode("detail"); setSelectedDim(d.key); }}
                        className={`px-3 py-1.5 rounded-xl border transition-all flex-shrink-0 ${viewMode === "detail" && selectedDim === d.key
                            ? "border-opacity-30 text-white"
                            : "bg-white/5 border-white/10 text-slate-500 hover:text-white"
                            }`}
                        style={
                            viewMode === "detail" && selectedDim === d.key
                                ? { background: `${DIMENSION_COLORS[d.key]}20`, borderColor: `${DIMENSION_COLORS[d.key]}50`, color: DIMENSION_COLORS[d.key] }
                                : {}
                        }
                    >
                        <Bilingual
                            zh={d.zh}
                            en={d.en.toUpperCase()}
                            mode="stacked"
                            zhClassName="text-xs font-bold"
                            enClassName="text-[8px] font-mono tracking-tighter"
                        />
                    </button>
                ))}
            </div>

            {/* 雷達圖 */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`${viewMode}-${selectedDim}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                >
                    <ResponsiveContainer width="100%" height={280}>
                        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                            <PolarGrid stroke="#333" strokeDasharray="3 3" />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={(props) => {
                                    const { x, y, payload } = props;
                                    const item = radarData.find(d => d.subject === payload.value);
                                    return (
                                        <g transform={`translate(${x},${y})`}>
                                            <text
                                                textAnchor="middle"
                                                dominantBaseline="central"
                                                className="fill-slate-400 text-[10px] font-bold"
                                            >
                                                {payload.value}
                                            </text>
                                            <text
                                                y={12}
                                                textAnchor="middle"
                                                dominantBaseline="central"
                                                className="fill-slate-600 text-[7px] font-mono uppercase"
                                            >
                                                {item?.subjectEn}
                                            </text>
                                        </g>
                                    );
                                }}
                            />
                            <PolarRadiusAxis
                                angle={90}
                                domain={[0, 100]}
                                tick={{ fill: "#475569", fontSize: 9 }}
                                axisLine={false}
                            />
                            <Radar
                                dataKey="score"
                                stroke={radarColor}
                                fill={radarColor}
                                fillOpacity={0.15}
                                strokeWidth={2}
                                animationDuration={800}
                                dot={{ r: 4, fill: radarColor }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                        </RadarChart>
                    </ResponsiveContainer>
                </motion.div>
            </AnimatePresence>

            {/* 底部維度數值列 */}
            {viewMode === "dimension" && (
                <div className="grid grid-cols-4 gap-3 mt-2">
                    {dimensions.map((d) => (
                        <div
                            key={d.key}
                            className="text-center p-2 rounded-lg bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                            onClick={() => { setViewMode("detail"); setSelectedDim(d.key); }}
                        >
                            <p className="text-[10px] font-mono text-slate-500 uppercase">{d.en}</p>
                            <p className="text-lg font-black" style={{ color: DIMENSION_COLORS[d.key] }}>
                                {d.score.toFixed(1)}
                            </p>
                            <p className="text-[10px] text-slate-400">{d.zh}</p>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
