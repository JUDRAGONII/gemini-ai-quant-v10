"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    TrendingUp,
    BarChart3,
    FileText,
    Settings,
    Layers,
    Home,
    ArrowLeft,
    Wallet,
    Building2,
    PieChart,
} from "lucide-react";

/**
 * 籌碼分析 Layout
 * 包含共用導航與 Tab 切換
 * - 總覽: /chips
 * - 融資融券: /chips/margin
 * - 三大法人: /chips/institutional
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
                    ? "bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-400 border border-pink-500/30"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
        >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </div>
    </Link>
);

// Tab 導航項目組件
const TabItem = ({
    icon: Icon,
    label,
    href,
    isActive,
}: {
    icon: React.ElementType;
    label: string;
    href: string;
    isActive: boolean;
}) => (
    <Link href={href}>
        <div
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 cursor-pointer ${isActive
                    ? "bg-gradient-to-r from-pink-500/30 to-rose-500/30 text-white border border-pink-500/40 shadow-lg shadow-pink-500/10"
                    : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white"
                }`}
        >
            <Icon size={18} />
            <span>{label}</span>
        </div>
    </Link>
);

export default function ChipsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // 定義 Tab 項目
    const tabs = [
        { icon: Layers, label: "總覽", href: "/chips" },
        { icon: Wallet, label: "融資融券", href: "/chips/margin" },
        { icon: Building2, label: "三大法人", href: "/chips/institutional" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* 頂部狀態列 */}
            <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
                <div className="flex items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                            <TrendingUp size={18} className="text-white" />
                        </div>
                        <span className="text-lg font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
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
                            active
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
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-rose-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-3">
                            <PieChart size={32} className="text-pink-400" />
                            主力籌碼透視
                        </h1>
                        <p className="text-gray-400 mt-2">
                            追蹤外資、投信與主力大戶的資金流向，掌握市場多空力道。
                        </p>
                    </div>

                    {/* Tab 導航 */}
                    <div className="flex gap-3 mb-8">
                        {tabs.map((tab) => (
                            <TabItem
                                key={tab.href}
                                icon={tab.icon}
                                label={tab.label}
                                href={tab.href}
                                isActive={pathname === tab.href}
                            />
                        ))}
                    </div>

                    {/* 子頁面內容 */}
                    {children}
                </main>
            </div>
        </div>
    );
}
