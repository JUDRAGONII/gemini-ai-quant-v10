"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    TrendingUp,
    Layers,
    PieChart,
    Wallet,
    Building2,
    Activity
} from "lucide-react";
import { MobileNav } from "@/components/layout";
import { Bilingual } from "@/components/ui/Bilingual";

/**
 * 籌碼分析 Layout
 * 包含共用導航與 Tab 切換
 * - 總覽: /chips
 * - 融資融券: /chips/margin
 * - 三大法人: /chips/institutional
 */

import Sidebar from "@/components/layout/Sidebar";

// Tab 導航項目組件
const TabItem = ({
    icon: Icon,
    labelZh,
    labelEn,
    href,
    isActive,
}: {
    icon: React.ElementType;
    labelZh: string;
    labelEn: string;
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
            <Bilingual zh={labelZh} en={labelEn} mode="inline" enClassName="ml-1 opacity-70 text-sm" />
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
        { icon: Layers, labelZh: "總覽", labelEn: "Overview", href: "/chips" },
        { icon: Wallet, labelZh: "融資融券", labelEn: "Margin & Short", href: "/chips/margin" },
        { icon: Building2, labelZh: "三大法人", labelEn: "Institutional", href: "/chips/institutional" },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-gray-100 font-sans selection:bg-cyan-500/30">
            {/* Mobile Navigation (Sticky Top + Drawer) */}
            <MobileNav />

            {/* Sidebar (Unified) */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            <div className="flex">
                {/* 主內容區 */}
                <main className="flex-1 ml-0 lg:ml-64 p-4 lg:p-8">
                    {/* 頁面標題與狀態欄 (In-page Header) */}
                    <header className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-rose-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-3">
                                <PieChart size={32} className="text-pink-400" />
                                <Bilingual zh="主力籌碼透視" en="Institutional Chips Insight" mode="inline" />
                            </h1>
                            <p className="text-gray-400 mt-2">
                                <Bilingual
                                    zh="追蹤外資、投信與主力大戶的資金流向，掌握市場多空力道。"
                                    en="Track the capital flow of foreign investors, investment trusts, and major players."
                                />
                            </p>
                        </div>
                        <div className="flex space-x-4">
                            <StatusBadge label="AI Worker" status="online" />
                            <StatusBadge label="Database" status="online" />
                        </div>
                    </header>

                    {/* Tab 導航 */}
                    <div className="flex gap-3 mb-8">
                        {tabs.map((tab) => (
                            <TabItem
                                key={tab.href}
                                icon={tab.icon}
                                labelZh={tab.labelZh}
                                labelEn={tab.labelEn}
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

// --- Helper Components ---
function StatusBadge({ label, status }: { label: string, status: 'online' | 'offline' }) {
    return (
        <div className="glass px-3 py-1.5 rounded-full flex items-center space-x-2 border border-white/10">
            <span className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="text-xs font-medium text-gray-300">{label}</span>
        </div>
    );
}
