"use client";

import React, { useState, useMemo } from "react";
import {
    TrendingUp,
    Globe,
    Percent,
    Activity,
    PiggyBank,
    Landmark,
    Search,
    Filter,
    Gem,
    Globe2,
    Calendar,
    ArrowUpRight,
    SearchIcon,
    Flame,
    Zap,
    Cpu,
} from "lucide-react";
import { Bilingual } from "@/components/ui/Bilingual";
import useSWR from "swr";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout";
import { GlassCard } from "@/components/ui/GlassCard";
import { EconomicCalendar } from "@/components/macro/EconomicCalendar";
import { MacroIndicatorCard } from "@/components/macro/MacroIndicatorCard";
import InsightsPanel from "@/components/macro/InsightsPanel";

// 指標配置映射
const INDICATOR_CONFIG: Record<string, { name: string, nameEn: string, color: string, category: string, unit: string }> = {
    GDP: { name: "實質 GDP 年增率", nameEn: "Real GDP Growth", color: "blue", category: "經濟成長", unit: "%" },
    CPI: { name: "消費者物價指數", nameEn: "CPI YoY", color: "rose", category: "通貨膨脹", unit: "Index" },
    VIX: { name: "恐慌指數", nameEn: "VIX Volatility Index", color: "amber", category: "市場情緒", unit: "pts" },
    GOLD: { name: "黃金現貨", nameEn: "Gold Price", color: "amber", category: "大宗商品", unit: "USD/oz" },
    DXY: { name: "美元指數", nameEn: "US Dollar Index", color: "blue", category: "金融匯率", unit: "pts" },
    UNRATE: { name: "失業率", nameEn: "Unemployment Rate", color: "violet", category: "勞動市場", unit: "%" },
    FEDFUNDS: { name: "基準利率", nameEn: "Fed Funds Rate", color: "emerald", category: "政策利率", unit: "%" },
};

// 指標圖標
const INDICATOR_ICONS: Record<string, any> = {
    GDP: Globe, UNRATE: Percent, CPI: TrendingUp, VIX: Activity,
    FEDFUNDS: Landmark, GOLD: Gem, DXY: Globe2,
};

const macroFetcher = async () => {
    const { data, error } = await supabase
        .from('macro_indicators')
        .select('*')
        .order('reference_date', { ascending: false });

    if (error) throw error;
    const latestMap: Record<string, any> = {};
    data.forEach(item => {
        if (!latestMap[item.indicator_code]) {
            latestMap[item.indicator_code] = item;
        }
    });
    return Object.values(latestMap);
};

export default function MacroPage() {
    const { data: indicators, isLoading } = useSWR('macro_indicators_latest', macroFetcher);
    const [activeTab, setActiveTab] = useState<"TW" | "US" | "Global">("US");
    const [searchQuery, setSearchQuery] = useState("");

    const groupedIndicators = useMemo(() => {
        if (!indicators) return {};
        const filtered = indicators.filter(ind => {
            const config = INDICATOR_CONFIG[ind.indicator_code];
            if (!config) return false;
            const matchesTab = (activeTab === "Global") || (ind.country === activeTab);
            const matchesSearch = config.name.includes(searchQuery) || ind.indicator_code.includes(searchQuery);
            return matchesTab && matchesSearch;
        });
        const groups: Record<string, any[]> = {};
        filtered.forEach(ind => {
            const config = INDICATOR_CONFIG[ind.indicator_code];
            if (!groups[config.category]) groups[config.category] = [];
            groups[config.category].push({ ...ind, ...config });
        });
        return groups;
    }, [indicators, activeTab, searchQuery]);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30">
            <MobileNav />
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            <div className="flex">
                <main className="flex-1 ml-0 lg:ml-64 p-4 lg:p-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-inner">
                                    <Globe className="w-6 h-6 text-blue-400" />
                                </div>
                                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-blue-500/60 font-mono">
                                    Global Macro Insights V3
                                </span>
                            </div>
                            <Bilingual
                                zh="宏觀大數據導航"
                                en="Macro Data Navigator"
                                mode="stacked"
                                zhClassName="text-4xl font-black bg-gradient-to-r from-white via-white to-slate-500 bg-clip-text text-transparent tracking-tighter"
                                enClassName="text-[10px] uppercase tracking-[0.3em] font-black text-slate-500/60 font-mono mt-1"
                            />
                            <p className="text-slate-500 text-sm max-w-xl leading-relaxed">
                                匯聚全球頂尖經濟引擎數據。透過
                                <span className="text-blue-400/80 font-bold mx-1">Pearson Correlation</span>
                                算法捕捉跨資產動態，驅動精準 AI 量化路徑。
                            </p>
                        </div>

                        <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
                            {(["TW", "US", "Global"] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-2 rounded-xl text-xs font-bold transition-all duration-500 ${activeTab === tab
                                        ? "bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-105 z-10"
                                        : "text-slate-500 hover:text-slate-300"
                                        }`}
                                >
                                    {tab === "TW" ? "TAIWAN" : tab === "US" ? "USA" : "WORLD"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bento Grid V3 Layout */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-12">

                        {/* 1. Quick Stats Header Widgets (Top Row) */}
                        <div className="xl:col-span-3">
                            <SmallStatCard title="US GDP" value="2.9%" trend="up" icon={Flame} color="emerald" />
                        </div>
                        <div className="xl:col-span-3">
                            <SmallStatCard title="CORE CPI" value="3.1%" trend="down" icon={Zap} color="rose" />
                        </div>
                        <div className="xl:col-span-3">
                            <SmallStatCard title="FED RATE" value="5.25%" trend="stable" icon={Cpu} color="blue" />
                        </div>
                        <div className="xl:col-span-3 relative group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <SearchIcon className="w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="FAST SEARCH..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full h-full min-h-[72px] bg-slate-900/40 border border-white/5 rounded-2xl pl-12 pr-4 text-xs font-mono focus:outline-none focus:border-blue-500/40 transition-all placeholder:text-slate-700"
                            />
                        </div>

                        {/* 2. Main Analysis Section (Middle Row) */}
                        <div className="xl:col-span-8">
                            <InsightsPanel assetA="STOCK:2330" assetB="MACRO:DXY" windowSize={30} />
                        </div>

                        <div className="xl:col-span-4 flex flex-col gap-6">
                            <div className="flex-1">
                                <section className="h-full">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                            <Calendar className="w-4 h-4" /> 經濟日曆
                                        </h2>
                                        <div className="h-px flex-1 bg-white/5 mx-4" />
                                    </div>
                                    <EconomicCalendar />
                                </section>
                            </div>
                        </div>

                        {/* 3. Indicators Grid (Bottom Section) */}
                        <div className="xl:col-span-12 mt-4">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/5" />
                                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">
                                    Deep Indicators Grid
                                </h2>
                                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/5" />
                            </div>

                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                        <div key={i} className="h-44 bg-white/5 rounded-3xl animate-pulse" />
                                    ))}
                                </div>
                            ) : Object.entries(groupedIndicators).map(([category, indicators]) => (
                                <div key={category} className="mb-12">
                                    <h3 className="text-xs font-mono text-blue-500/60 mb-6 flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                                        {category.toUpperCase()} GROUP
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {indicators.map((indicator) => (
                                            <MacroIndicatorCard
                                                key={indicator.indicator_code}
                                                code={indicator.indicator_code}
                                                name={
                                                    <Bilingual
                                                        zh={indicator.name}
                                                        en={indicator.nameEn}
                                                        mode="stacked"
                                                        zhClassName="text-xs font-bold text-slate-300 group-hover:text-white transition-colors"
                                                        enClassName="text-[8px] opacity-40 group-hover:opacity-60 transition-opacity uppercase tracking-tighter"
                                                    />
                                                }
                                                value={indicator.value}
                                                unit={indicator.unit}
                                                color={indicator.color}
                                                icon={INDICATOR_ICONS[indicator.indicator_code]}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Badges */}
                    <div className="grid md:grid-cols-3 gap-4 pt-10 border-t border-white/5">
                        <BadgeTile icon={Globe} label="DATA ENGINE" value="FRED LIVE" color="blue" />
                        <BadgeTile icon={Cpu} label="AI STATUS" value="V10.0 ACTIVE" color="emerald" />
                        <BadgeTile icon={Zap} label="LATENCY" value="23ms" color="amber" />
                    </div>
                </main>
            </div>
        </div>
    );
}

function SmallStatCard({ title, value, trend, icon: Icon, color }: any) {
    const colorClass = color === 'rose' ? 'text-rose-400' : color === 'emerald' ? 'text-emerald-400' : 'text-blue-400';
    return (
        <GlassCard className="p-5 flex items-center justify-between border-white/5 h-full group">
            <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">{title}</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black font-mono tracking-tighter text-slate-200">{value}</span>
                    <span className={`text-[10px] font-bold ${colorClass}`}>
                        {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '●'}
                    </span>
                </div>
            </div>
            <div className={`p-2 rounded-xl bg-slate-800/50 group-hover:scale-110 transition-transform ${colorClass}`}>
                <Icon size={18} />
            </div>
        </GlassCard>
    );
}

function BadgeTile({ icon: Icon, label, value, color }: any) {
    const textColor = color === 'blue' ? 'text-blue-400' : color === 'emerald' ? 'text-emerald-400' : 'text-amber-400';
    return (
        <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.02] border border-white/5 rounded-2xl">
            <Icon size={14} className={textColor} />
            <div className="flex flex-col">
                <span className="text-[9px] text-slate-600 font-black uppercase tracking-tighter">{label}</span>
                <span className="text-[11px] text-slate-400 font-bold">{value}</span>
            </div>
        </div>
    );
}
