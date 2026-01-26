"use client";

// 強制動態渲染
export const dynamic = "force-dynamic";

import React, { useState, useMemo } from "react";
import {
    TrendingUp,
    Globe,
    Percent,
    Activity,
    PiggyBank,
    Landmark,
    Search,
    ChevronRight,
    Filter
} from "lucide-react";
import MacroIndicatorCard from "@/components/MacroIndicatorCard";
import { MACRO_INDICATORS } from "@/data/mockMacro";
import Sidebar from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout";
import { GlassCard } from "@/components/ui/GlassCard";

/**
 * 宏觀指標主頁 (Pro Max 專業重構版)
 * @description 支援台灣、美國、全球分區檢視與類別分組
 */

// 指標代碼對應圖標
const INDICATOR_ICONS: Record<string, React.ReactNode> = {
    GDP: <Globe size={18} className="text-cyan-400" />,
    TW_GDP: <Globe size={18} className="text-emerald-400" />,
    CPI: <TrendingUp size={18} className="text-pink-400" />,
    VIX: <Activity size={18} className="text-amber-400" />,
    UNRATE: <Percent size={18} className="text-violet-400" />,
    FEDFUNDS: <Landmark size={18} className="text-emerald-400" />,
    M2: <PiggyBank size={18} className="text-red-400" />,
    TW_SIGNAL: <Activity size={18} className="text-amber-400" />,
    USD_TWD: <Landmark size={18} className="text-cyan-400" />,
    WTI_OIL: <Activity size={18} className="text-rose-400" />,
    XAU_USD: <TrendingUp size={18} className="text-yellow-400" />,
    DXY: <Globe size={18} className="text-indigo-400" />,
};

export default function MacroPage() {
    const [activeTab, setActiveTab] = useState<"TW" | "US" | "Global">("US");
    const [searchQuery, setSearchQuery] = useState("");

    // 根據標籤與搜尋過濾指標
    const filteredIndicators = useMemo(() => {
        return MACRO_INDICATORS.filter(indicator => {
            const matchesTab = indicator.country === activeTab;
            const matchesSearch =
                indicator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                indicator.code.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesTab && matchesSearch;
        });
    }, [activeTab, searchQuery]);

    // 將過濾後的指標依類別分組
    const groupedIndicators = useMemo(() => {
        const groups: Record<string, typeof MACRO_INDICATORS> = {};
        filteredIndicators.forEach(indicator => {
            if (!groups[indicator.category]) {
                groups[indicator.category] = [];
            }
            groups[indicator.category].push(indicator);
        });
        return groups;
    }, [filteredIndicators]);

    return (
        <div className="min-h-screen bg-slate-950 text-gray-100 font-sans selection:bg-cyan-500/30">
            {/* Mobile Navigation */}
            <MobileNav />

            {/* Sidebar (Unified) */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            <div className="flex">
                {/* 主內容區 */}
                <main className="flex-1 ml-0 lg:ml-64 p-4 lg:p-8">
                    {/* 頁面標題與狀態欄 (In-page Header) */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
                                <Globe size={32} className="text-emerald-400" />
                                宏觀大數據導航
                            </h1>
                            <p className="text-gray-400 mt-2">
                                追蹤全球關鍵經濟指標，掌握市場脈動與政策走向。
                            </p>
                        </div>
                        <div className="flex space-x-4">
                            <StatusBadge label="AI Worker" status="online" />
                            <StatusBadge label="Database" status="online" />
                        </div>
                    </header>

                    {/* 頂部操作列：標籤頁與搜尋 */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        {/* 區域標籤頁 */}
                        <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
                            {(["TW", "US", "Global"] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === tab
                                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                                        : "text-gray-500 hover:text-gray-300"
                                        }`}
                                >
                                    {tab === "TW" ? "台灣" : tab === "US" ? "美國" : "全球"}
                                </button>
                            ))}
                        </div>

                        {/* 搜尋框 */}
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="搜尋指標名稱或代碼..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-emerald-500/40 focus:bg-white/10 transition-all"
                            />
                        </div>
                    </div>

                    {/* 分組指標列表 */}
                    <div className="space-y-12">
                        {Object.entries(groupedIndicators).length > 0 ? (
                            Object.entries(groupedIndicators).map(([category, indicators]) => (
                                <section key={category} className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-4 w-1 bg-emerald-500 rounded-full" />
                                        <h2 className="text-lg font-bold text-gray-200 tracking-wide">{category}</h2>
                                        <span className="text-xs text-gray-500 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                                            {indicators.length}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {indicators.map((indicator) => (
                                            <MacroIndicatorCard
                                                key={indicator.code}
                                                code={indicator.code}
                                                name={indicator.name}
                                                value={indicator.latestValue}
                                                unit={indicator.unit}
                                                changePercent={indicator.changePercent}
                                                historyData={indicator.historyData}
                                                color={indicator.color}
                                                icon={INDICATOR_ICONS[indicator.code] || <Activity size={18} />}
                                            />
                                        ))}
                                    </div>
                                </section>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                <Filter size={48} className="mb-4" />
                                <p>未找到符合條件的指標</p>
                            </div>
                        )}
                    </div>

                    {/* 數據來源與說明 */}
                    <div className="mt-16 grid md:grid-cols-2 gap-4">
                        <GlassCard className="p-4 border-emerald-500/20 bg-emerald-500/5">
                            <p className="text-emerald-400/80 text-sm flex items-center gap-2">
                                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                數據來源：FRED、國發會、主計總處、央行、CBOE。
                            </p>
                        </GlassCard>
                        <GlassCard className="p-4 border-amber-500/20 bg-amber-500/5">
                            <p className="text-amber-400/80 text-sm flex items-center gap-2">
                                <span className="flex h-2 w-2 rounded-full bg-amber-400" />
                                狀態：目前使用專業模擬數據展示系統架構，未來將接入 Supabase 資料庫。
                            </p>
                        </GlassCard>
                    </div>
                </main>
            </div>
        </div>
    );
}

// --- 輔助組件 ---
function StatusBadge({ label, status }: { label: string, status: 'online' | 'offline' }) {
    return (
        <div className="glass px-3 py-1.5 rounded-full flex items-center space-x-2 border border-white/10">
            <span className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="text-xs font-medium text-gray-300">{label}</span>
        </div>
    );
}
