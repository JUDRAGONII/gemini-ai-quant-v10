"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    Layers,
    TrendingUp,
    BarChart3,
    FileText,
    Settings,
    Activity,
    Cpu,
    Search,
    Sparkles,
    Briefcase,
    BrainCircuit,
    Shield
} from "lucide-react";
import { AlertBadge } from "../Market/AlertBadge";
import { Bilingual } from "../ui/Bilingual";

/**
 * 統一側邊欄組件 (Unified Sidebar)
 * 符合 UI/UX Pro Max 規範: Glassmorphism, Micro-animations, Active States
 */

const MENU_ITEMS = [
    { zh: "首頁面板", en: "Overview", href: "/", icon: Home, matchExact: true },
    { zh: "智力洞察", en: "Insights", href: "/ai/insights", icon: BrainCircuit },
    { zh: "風險監控", en: "Risk Monitor", href: "/ai/risk", icon: Shield },
    { zh: "籌碼分析", en: "Chips", href: "/chips", icon: Layers },
    { zh: "市場動態", en: "Market", href: "/stocks", icon: TrendingUp },
    { zh: "投資組合", en: "Portfolios", href: "/portfolios", icon: Briefcase },
    { zh: "宏觀指標", en: "Macro", href: "/macro", icon: Activity },
    { zh: "演化分析", en: "Evolution", href: "/evolution", icon: BarChart3 },
    { zh: "智慧策略", en: "Strategy", href: "/ai/strategy", icon: Sparkles },
    { zh: "AI 搜尋", en: "Search", href: "/ai/search", icon: Search },
    { zh: "智慧排名", en: "Ranking", href: "/ai/ranking", icon: FileText },
];

function NavItem({
    item,
    isActive,
}: {
    item: typeof MENU_ITEMS[0];
    isActive: boolean;
}) {
    const Icon = item.icon;

    return (
        <Link href={item.href} className="block group">
            <div
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 overflow-hidden ${isActive
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 shadow-[0_0_20px_rgba(6,182,212,0.15)] border border-cyan-500/30 text-cyan-400"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
            >
                {/* Active Indicator Bar */}
                {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-blue-500 shadow-[0_0_10px_#06b6d4]"></div>
                )}

                <Icon
                    size={20}
                    className={`transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"
                        }`}
                />
                <Bilingual
                    zh={item.zh}
                    en={item.en}
                    mode="stacked"
                    zhClassName="font-bold tracking-tight text-sm"
                    enClassName="text-[9px] uppercase opacity-40 font-mono tracking-widest"
                />

                {/* Hover Glow Effect */}
                {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                )}
            </div>
        </Link>
    );
}

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 glass border-r border-white/5 p-5 flex flex-col z-40 bg-[#0a0a0a]/50 backdrop-blur-xl">
            {/* Logo Section */}
            <div className="flex items-center justify-between px-2 mb-10 mt-2">
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Cpu size={24} className="text-white" data-testid="icon-cpu" />
                        <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse"></div>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent tracking-wider">
                            AI QUANT
                        </h1>
                        <p className="text-[10px] text-cyan-500/60 font-mono tracking-widest uppercase">
                            Pro V10.0
                        </p>
                    </div>
                </div>

                {/* 警示中心入口 */}
                <AlertBadge />
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                {MENU_ITEMS.map((item) => {
                    // 判斷 Active 狀態
                    const isActive = item.matchExact
                        ? pathname === item.href
                        : pathname.startsWith(item.href);

                    return <NavItem key={item.href} item={item} isActive={isActive} />;
                })}
            </nav>

            {/* Bottom Section */}
            <div className="mt-auto pt-6 border-t border-white/5 space-y-2">
                <NavItem
                    item={{ zh: "系統設定", en: "Settings", href: "/settings", icon: Settings, matchExact: false }}
                    isActive={pathname.startsWith("/settings")}
                />

                {/* User Info / Status (Optional) */}
                <div className="mt-4 px-4 py-3 rounded-lg bg-white/5 border border-white/5 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></div>
                    <span className="text-xs text-gray-500 font-mono">System Online</span>
                </div>
            </div>
        </aside>
    );
}
