"use client";

/**
 * MobileNav - 行動端響應式導航組件
 * @description 提供頂部導航條與側邊抽屜 (Drawer)，確保 Mobile/Tablet 端的流暢體驗
 * @version 1.0.0 (Phase 4.4 Pro Max RWD)
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    Menu,
    X,
    Activity,
    TrendingUp,
    BarChart3,
    FileText,
    Settings,
    Cpu,
    Layers,
} from "lucide-react";

interface NavLinkProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick?: () => void;
}

/**
 * 導航連結項目
 */
function NavLink({ href, icon, label, active = false, onClick }: NavLinkProps) {
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
            <span className="font-medium text-base">{label}</span>
        </Link>
    );
}

/**
 * Mobile 導航主組件
 */
export function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentPath, setCurrentPath] = useState("/");

    // 取得當前路徑
    useEffect(() => {
        if (typeof window !== "undefined") {
            setCurrentPath(window.location.pathname);
        }
    }, []);

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
        { href: "/", icon: <Activity />, label: "總覽 (Overview)" },
        { href: "/chips", icon: <Layers />, label: "籌碼分析 (Chips)" },
        { href: "/stocks", icon: <TrendingUp />, label: "市場動態" },
        { href: "/macro", icon: <BarChart3 />, label: "宏觀指標" },
        { href: "/ai/ranking", icon: <FileText />, label: "決策報告" },
        { href: "/settings", icon: <Settings />, label: "系統設定" },
    ];

    return (
        <>
            {/* Sticky Top Bar - 僅在 Mobile/Tablet 顯示 */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 
                              bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
                <div className="flex items-center justify-between px-4 py-3">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 cursor-pointer">
                        <Cpu size={24} className="text-cyan-400" />
                        <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                            AI QUANT
                        </span>
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
                    <span className="text-lg font-bold text-white">選單</span>
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
                <nav className="p-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.href}
                            href={item.href}
                            icon={item.icon}
                            label={item.label}
                            active={currentPath === item.href ||
                                (item.href !== "/" && currentPath.startsWith(item.href))}
                            onClick={closeDrawer}
                        />
                    ))}
                </nav>

                {/* Version Info */}
                <div className="absolute bottom-4 left-4 right-4 text-center">
                    <p className="text-xs text-gray-500 font-mono">
                        AI 投資分析儀 V10.0
                    </p>
                </div>
            </aside>

            {/* Spacer for fixed header - 僅在 Mobile/Tablet 上添加 */}
            <div className="lg:hidden h-14" aria-hidden="true" />
        </>
    );
}

export default MobileNav;
