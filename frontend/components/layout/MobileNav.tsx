"use client";

/**
 * MobileNav - 行動端響應式導航組件
 * @description 提供頂部導航條與側邊抽屜 (Drawer)，確保 Mobile/Tablet 端的流暢體驗
 * @version 1.1.0 (Phase 8 Sync)
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Menu,
    X,
    Home,
    Activity,
    TrendingUp,
    BarChart3,
    FileText,
    Settings,
    Cpu,
    Layers,
    Briefcase,
    Sparkles,
    Search,
    BrainCircuit
} from "lucide-react";
import { Bilingual } from "../ui/Bilingual";

interface NavLinkProps {
    href: string;
    icon: React.ReactNode;
    zh: string;
    en: string;
    active?: boolean;
    onClick?: () => void;
}

/**
 * 導航連結項目
 */
function NavLink({ href, icon, zh, en, active = false, onClick }: NavLinkProps) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`
                flex items-center gap-3 px-4 py-3.5 rounded-xl
                transition-all duration-200 min-h-[44px]
                ${active
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }
                cursor-pointer
            `}
        >
            {React.cloneElement(icon as React.ReactElement, {
                size: 22,
                className: "flex-shrink-0"
            })}
            <Bilingual
                zh={zh}
                en={en}
                mode="stacked"
                zhClassName="font-medium text-base"
                enClassName="text-[9px] uppercase opacity-40 font-mono tracking-widest"
            />
        </Link>
    );
}

/**
 * Mobile 導航主組件
 */
export function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // 關閉 Drawer 時鎖定背景滾動
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const closeDrawer = () => setIsOpen(false);

    const navItems = [
        { href: "/", icon: <Home />, zh: "總覽", en: "Overview" },
        { href: "/ai/insights", icon: <BrainCircuit />, zh: "智力洞察", en: "Insights" },
        { href: "/chips", icon: <Layers />, zh: "籌碼分析", en: "Chips" },
        { href: "/stocks", icon: <TrendingUp />, zh: "市場動態", en: "Market" },
        { href: "/portfolios", icon: <Briefcase />, zh: "投資組合", en: "Portfolios" },
        { href: "/macro", icon: <Activity />, zh: "宏觀指標", en: "Macro" },
        { href: "/evolution", icon: <BarChart3 />, zh: "演化分析", en: "Evolution" },
        { href: "/ai/strategy", icon: <Sparkles />, zh: "智慧策略", en: "Strategy" },
        { href: "/ai/search", icon: <Search />, zh: "AI 搜尋", en: "Semantic" },
        { href: "/ai/ranking", icon: <FileText />, zh: "決策報告", en: "Reports" },
        { href: "/settings", icon: <Settings />, zh: "系統設定", en: "Settings" },
    ];

    return (
        <>
            {/* Sticky Top Bar - 僅在 Mobile/Tablet 顯示 */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 
                              bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
                <div className="flex items-center justify-between px-4 py-3">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 cursor-pointer">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                            <Cpu size={18} className="text-white" />
                        </div>
                        <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">AI QUANT</span>
                    </Link>

                    {/* Hamburger Button */}
                    <button
                        onClick={() => setIsOpen(true)}
                        className="p-2 rounded-lg bg-white/5 border border-white/10 
                                   hover:bg-white/10 transition-colors cursor-pointer
                                   min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="開啟選單"
                        aria-expanded={isOpen}
                    >
                        <Menu size={24} className="text-white" />
                    </button>
                </div>
            </header>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    onClick={closeDrawer}
                    aria-hidden="true"
                />
            )}

            {/* Slide-over Drawer */}
            <aside
                className={`
                    lg:hidden fixed top-0 right-0 z-50 
                    h-full w-72 max-w-[80vw]
                    bg-slate-950/95 backdrop-blur-xl border-l border-white/10
                    transform transition-transform duration-300 ease-out
                    ${isOpen ? "translate-x-0" : "translate-x-full"}
                `}
                aria-label="行動端導航選單"
            >
                {/* Drawer Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <Bilingual zh="選單" en="Menu" mode="inline" zhClassName="text-lg font-bold text-white" enClassName="text-xs uppercase opacity-40 font-mono tracking-widest" />
                    <button
                        onClick={closeDrawer}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 
                                   transition-colors cursor-pointer
                                   min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="關閉選單"
                    >
                        <X size={24} className="text-white" />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="p-4 space-y-1 h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.href}
                            href={item.href}
                            icon={item.icon}
                            zh={item.zh}
                            en={item.en}
                            active={pathname === item.href ||
                                (item.href !== "/" && pathname.startsWith(item.href))}
                            onClick={closeDrawer}
                        />
                    ))}
                </nav>

                {/* Version Info */}
                <div className="absolute bottom-4 left-4 right-4 text-center">
                    <p className="text-[10px] text-gray-500 font-mono tracking-widest">
                        AI QUANT PRO V10.0
                    </p>
                </div>
            </aside>

            {/* Spacer for fixed header - 僅在 Mobile/Tablet 上添加 */}
            <div className="lg:hidden h-14" aria-hidden="true" />
        </>
    );
}

export default MobileNav;
