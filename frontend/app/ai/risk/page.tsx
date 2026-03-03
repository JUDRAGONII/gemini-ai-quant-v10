"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Bilingual } from "@/components/ui/Bilingual";
import { GreeksMonitor } from "@/components/AI/GreeksMonitor";
import { PsychologyHub } from "@/components/AI/PsychologyHub";
import { useRiskMatrix } from "@/hooks/useRiskMatrix";
import { Search, Loader2, BarChart, AlertCircle } from "lucide-react";
import { ProInput } from "@/components/ui/ProInput";
import { ProButton } from "@/components/ui/ProButton";

const BARRA_TRANSLATIONS: Record<string, string> = {
    "size": "規模",
    "value": "價值",
    "momentum": "動能",
    "volatility": "波動率",
    "growth": "成長",
    "liquidity": "流動性",
    "leverage": "槓桿",
    "quality": "品質",
    "yield": "殖利率",
    "dividend_yield": "股息率",
    "earnings_yield": "盈餘率",
    "residual_volatility": "殘差波動"
};

export default function RiskManagementPage() {
    const [ticker, setTicker] = useState("2330");
    const [searchInput, setSearchInput] = useState("2330");
    const { riskData, isLoading } = useRiskMatrix(ticker);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.trim()) {
            setTicker(searchInput.toUpperCase());
        }
    };

    return (
        <div className="space-y-6 lg:space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] text-blue-400 font-bold tracking-widest uppercase">
                            <Bilingual zh="法人級" en="INSTITUTIONAL GRADE" mode="inline" enClassName="ml-1 opacity-60" />
                        </div>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black tracking-tighter bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                        <Bilingual zh="法人級風險風控系統" en="Risk Management Terminal" />
                    </h1>
                    <div className="text-slate-400 mt-2 text-sm max-w-2xl">
                        <Bilingual
                            zh="提供即時 Greeks 敏感度矩陣、Barra 風格因子分解與極端壓力測試場景模擬。"
                            en="Real-time Greeks sensitivity matrix, Barra style factor attribution, and extreme stress test simulation."
                        />
                    </div>
                </div>

                <form onSubmit={handleSearch} className="flex items-center gap-4">
                    <ProInput
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="搜尋標的 (如: 2330 / Search Ticker)"
                        leftIcon={<Search size={16} />}
                        className="w-48"
                    />
                    <ProButton
                        type="submit"
                        zh="分析"
                        en="Analyze"
                        isLoading={isLoading}
                        className="h-[46px] cursor-pointer"
                    >
                        分析
                    </ProButton>
                </form>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                {/* Left Column: Greeks & Stress Tests */}
                <div className="xl:col-span-2 space-y-6 lg:space-y-8">
                    <GreeksMonitor data={riskData?.greeks || { delta: 0, gamma: 0, theta: 0, vega: 0 }} isLoading={isLoading} />

                    <GlassCard className="p-6">
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-white">
                            <BarChart className="text-cyan-400" size={20} />
                            <Bilingual zh="極端壓力測試場景" en="Extreme Stress Test Scenarios" />
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {isLoading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="h-24 bg-white/5 animate-pulse rounded-xl" />
                                ))
                            ) : (
                                riskData?.stress_tests.map((test, idx) => (
                                    <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">{test.scenario}</div>
                                        <div className={`text-2xl font-mono font-bold ${test.impact_pct < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                            {test.impact_pct}%
                                        </div>
                                        <div className="mt-2 text-[10px] text-slate-400">
                                            <Bilingual zh="預估恢復" en="Est. Recovery" mode="inline" enClassName="ml-1 opacity-50" />: {test.recovery_days} <Bilingual zh="天" en="Days" mode="inline" enClassName="ml-0.5 opacity-50" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </GlassCard>
                </div>

                {/* Right Column: Psychology & Barra */}
                <div className="space-y-6 lg:space-y-8">
                    <PsychologyHub biases={riskData?.behavioral_biases || []} isLoading={isLoading} />

                    <GlassCard className="p-6">
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-white">
                            <AlertCircle className="text-amber-400" size={20} />
                            <Bilingual zh="Barra 風格曝險分解" en="Barra Style Exposure" />
                        </h3>

                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-slate-500" /></div>
                            ) : (
                                Object.entries(riskData?.barra_decomposition || {}).map(([key, val]) => (
                                    <div key={key} className="flex justify-between items-center text-sm">
                                        <span className="capitalize text-slate-400">
                                            <Bilingual zh={BARRA_TRANSLATIONS[key.toLowerCase()] || key} en={key} mode="inline" />
                                        </span>
                                        <div className="flex items-center gap-3 flex-1 ml-6">
                                            <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 rounded-full"
                                                    style={{ width: `${Math.min(Number(val) * 200, 100)}%` }}
                                                />
                                            </div>
                                            <span className="font-mono font-bold w-12 text-right">{(Number(val) * 100).toFixed(1)}%</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
