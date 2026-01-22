"use client";

// Force dynamic rendering to avoid build-time data fetching errors in CI
export const dynamic = 'force-dynamic';

import React, { useState } from "react";
import Link from "next/link";
import {
    TrendingUp,
    BarChart3,
    FileText,
    Settings,
    Search,
    Layers,
    Home,
} from "lucide-react";
import StockCard from "@/components/StockCard";
import { mockTWStocks, mockUSStocks } from "@/data/mockStocks";

/**
 * 股票查詢清單頁面
 * 展示台股與美股的股票卡片網格
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
                ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
        >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </div>
    </Link>
);

export default function StocksPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeMarket, setActiveMarket] = useState<"all" | "TW" | "US">(
        "all"
    );

    // 篩選股票
    const filteredStocks = [...mockTWStocks, ...mockUSStocks].filter(
        (stock) => {
            // 市場篩選
            if (activeMarket !== "all" && stock.market !== activeMarket) {
                return false;
            }
            // 搜尋篩選
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    stock.symbol.toLowerCase().includes(query) ||
                    stock.name.toLowerCase().includes(query)
                );
            }
            return true;
        }
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* 頂部狀態列 */}
            <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
                <div className="flex items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                            <TrendingUp size={18} className="text-white" />
                        </div>
                        <span className="text-lg font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
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
                            active
                        />
                        <NavItem
                            icon={BarChart3}
                            label="演化分析"
                            href="/evolution"
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
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                            市場行情總覽
                        </h1>
                        <p className="text-gray-400 mt-2">
                            即時監控台股與美股關鍵標的
                        </p>
                    </div>

                    {/* 搜尋與篩選 */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        {/* 搜尋框 */}
                        <div className="relative flex-1">
                            <Search
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                            />
                            <input
                                type="text"
                                placeholder="搜尋股票代碼或名稱..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                            />
                        </div>

                        {/* 市場篩選 */}
                        <div className="flex gap-2">
                            {[
                                { key: "all", label: "全部" },
                                { key: "TW", label: "台股" },
                                { key: "US", label: "美股" },
                            ].map((market) => (
                                <button
                                    key={market.key}
                                    onClick={() =>
                                        setActiveMarket(
                                            market.key as "all" | "TW" | "US"
                                        )
                                    }
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${activeMarket === market.key
                                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                        : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                                        }`}
                                >
                                    {market.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 股票卡片網格 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredStocks.map((stock) => (
                            <StockCard
                                key={stock.symbol}
                                symbol={stock.symbol}
                                name={stock.name}
                                price={stock.price}
                                changePercent={stock.changePercent}
                                sparklineData={stock.sparklineData}
                                market={stock.market}
                            />
                        ))}
                    </div>

                    {/* 空狀態 */}
                    {filteredStocks.length === 0 && (
                        <div className="text-center py-16">
                            <Search
                                size={48}
                                className="mx-auto text-gray-600 mb-4"
                            />
                            <p className="text-gray-500">
                                找不到符合條件的股票
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
