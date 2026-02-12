"use client";

import React from "react";
import { GlassCard } from "../ui/GlassCard";
import { Bilingual } from "../ui/Bilingual";
import { Shield, Info, AlertTriangle, Activity } from "lucide-react";

interface GreeksData {
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
}

interface GreeksMonitorProps {
    data: GreeksData;
    isLoading?: boolean;
}

export const GreeksMonitor: React.FC<GreeksMonitorProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return (
            <GlassCard className="h-[280px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Activity className="animate-spin text-blue-400" size={32} />
                    <Bilingual zh="計算風險矩陣中..." en="Calculating Risk Matrix..." enClassName="text-[10px] text-slate-500 font-mono" />
                </div>
            </GlassCard>
        );
    }

    const greeks = [
        {
            label: "Delta",
            value: data.delta,
            descEn: "Price Sensitivity",
            descZh: "價格敏感度",
            info: "標的價格變動 1% 時，評分或價值的預期變動量。",
            color: data.delta > 1.5 ? "bg-rose-500/20 text-rose-400 border-rose-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
        },
        {
            label: "Gamma",
            value: data.gamma,
            descEn: "Curvature",
            descZh: "加速敏感度",
            info: "價格變動的二階效應，反映風險暴露的加速程度。",
            color: "bg-blue-500/20 text-blue-400 border-blue-500/30"
        },
        {
            label: "Theta",
            value: data.theta,
            descEn: "Time Decay",
            descZh: "時間衰減",
            info: "隨時間推移，策略領先優勢或評分的流失速度。",
            color: "bg-amber-500/20 text-amber-400 border-amber-500/30"
        },
        {
            label: "Vega",
            value: data.vega,
            descEn: "Vol Sensitivity",
            descZh: "波動敏感度",
            info: "市場波動率變動 1% 時，標的受到的衝擊程度。",
            color: data.vega > 0.5 ? "bg-rose-500/20 text-rose-400 border-rose-500/30" : "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
        },
    ];

    return (
        <GlassCard className="p-5 overflow-hidden">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Shield className="text-blue-400" size={20} />
                        <Bilingual zh="法人級風險矩陣" en="Professional Risk Matrix" />
                    </h3>
                    <Bilingual zh="敏感度曝險與 Greeks 模擬" en="Sensitivity Exposure & Greeks Simulation" enClassName="text-[10px] text-slate-500 font-mono" />
                </div>
                <div className="px-2 py-1 bg-blue-500/10 rounded border border-blue-500/20 text-[10px] text-blue-400 font-mono">
                    V10.0 ENGINE
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {greeks.map((item) => (
                    <div key={item.label} className={`p-4 rounded-xl border transition-all hover:scale-[1.02] cursor-help ${item.color} group relative`}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                            <Info size={12} className="opacity-50" />
                        </div>
                        <div className="text-2xl font-mono font-bold">
                            {item.value > 0 ? "+" : ""}{item.value.toFixed(3)}
                        </div>
                        <div className="mt-2 text-[10px] opacity-70 leading-tight">
                            <Bilingual zh={item.descZh} en={item.descEn} />
                        </div>

                        {/* Simple Tooltip Implementation */}
                        <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-900 border border-slate-700 rounded-lg text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                            {item.info}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 p-3 bg-white/5 rounded-lg border border-white/10 flex items-center gap-3">
                <AlertTriangle className="text-amber-400 shrink-0" size={16} />
                <div className="text-[11px] leading-tight text-slate-400">
                    <Bilingual
                        zh="當前 Delta 曝險正常。注意市場波動率若快速上升，Vega 指標可能觸發停損預警。"
                        en="Current Delta exposure is normal. If volatility spikes, Vega may trigger stop-loss alerts."
                    />
                </div>
            </div>
        </GlassCard>
    );
};
