"use client";

// Force dynamic rendering
export const dynamic = "force-dynamic";

import React from "react";
import Link from "next/link";
import {
    TrendingUp,
    BarChart3,
    FileText,
    Settings,
    Layers,
    Home,
    Globe,
    DollarSign,
    Percent,
    Activity,
    PiggyBank,
    Landmark,
} from "lucide-react";
import MacroIndicatorCard from "@/components/MacroIndicatorCard";
import { MACRO_INDICATORS } from "@/data/mockMacro";

/**
 * 宏觀指標主頁
 * 以卡片網格展示六大經濟指標
 */

// 側邊欄導航項目組件
const NavItem = ({
    icon: Icon,
    label,
    href,
    active = false,
}: {
    icon: React.ElementType;
    label: string;
    href: string;
    active?: boolean;
}) => (
    <Link href={href}>
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${active
                    ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
        >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </div>
    </Link>
);

// 指標代碼對應圖標
const INDICATOR_ICONS: Record<string, React.ReactNode> = {
    GDP: <Globe size={18} className="text-cyan-400" />,
    CPI: <TrendingUp size={18} className="text-pink-400" />,
    VIX: <Activity size={18} className="text-amber-400" />,
    UNRATE: <Percent size={18} className="text-violet-400" />,
    FEDFUNDS: <Landmark size={18} className="text-emerald-400" />,
    M2: <PiggyBank size={18} className="text-red-400" />,
};

export default function MacroPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* 頂部狀態列 */}
            <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
                <div className="flex items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                            <TrendingUp size={18} className="text-white" />
                        </div>
                        <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                            AI QUANT
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-gray-400">AI Worker</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-gray-400">Database</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex pt-14">
                {/* 側邊欄 */}
                <aside className="fixed left-0 top-14 bottom-0 w-56 glass border-r border-white/10 p-4 overflow-y-auto">
                    <nav className="space-y-2">
                        <NavItem icon={Home} label="總覽 (Overview)" href="/" />
                        <NavItem
                            icon={Layers}
                            label="籌碼分析 (Chips)"
                            href="/chips"
                        />
                        <NavItem
                            icon={TrendingUp}
                            label="市場動態"
                            href="/stocks"
                        />
                        <NavItem
                            icon={BarChart3}
                            label="宏觀指標"
                            href="/macro"
                            active
                        />
                        <NavItem icon={FileText} label="決策報告" href="/ai" />
                        <NavItem
                            icon={Settings}
                            label="系統設定"
                            href="/settings"
                        />
                    </nav>
                </aside>

                {/* 主內容區 */}
                <main className="flex-1 ml-56 p-8">
                    {/* 頁面標題 */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
                            <Globe size={32} className="text-emerald-400" />
                            宏觀經濟指標
                        </h1>
                        <p className="text-gray-400 mt-2">
                            追蹤全球關鍵經濟指標，掌握市場脈動與政策走向。
                        </p>
                    </div>

                    {/* 指標卡片網格 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {MACRO_INDICATORS.map((indicator) => (
                            <MacroIndicatorCard
                                key={indicator.code}
                                code={indicator.code}
                                name={indicator.name}
                                value={indicator.latestValue}
                                unit={indicator.unit}
                                changePercent={indicator.changePercent}
                                sparklineData={indicator.sparklineData}
                                color={indicator.color}
                                icon={INDICATOR_ICONS[indicator.code]}
                            />
                        ))}
                    </div>

                    {/* 數據來源說明 */}
                    <div className="mt-8 glass p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                        <p className="text-emerald-400/80 text-sm text-center">
                            📊 數據來源：FRED (Federal Reserve Economic Data)、CBOE。更新頻率依指標性質而異。
                        </p>
                    </div>

                    {/* 模擬數據警告 */}
                    <div className="mt-4 glass p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                        <p className="text-amber-400/80 text-sm text-center">
                            ⚠️ 此頁面目前使用模擬數據展示，待 Supabase 整合後接入真實資料。
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
}
