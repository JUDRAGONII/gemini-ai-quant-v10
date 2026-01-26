"use client";

// Force dynamic rendering to avoid build-time data fetching errors in CI
export const dynamic = 'force-dynamic';

import React, { useState } from "react";
import {
    TrendingUp,
    Search,
    Activity
} from "lucide-react";
import StockCard from "@/components/StockCard";
import { mockTWStocks, mockUSStocks } from "@/data/mockStocks";
import Sidebar from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout";

/**
 * 股票查詢清單頁面
 * 展示台股與美股的股票卡片網格
 */

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
                const query = searchQuery.trim().toLowerCase();
                return (
                    stock.symbol.toLowerCase().includes(query) ||
                    stock.name.toLowerCase().includes(query)
                );
            }
            return true;
        }
    );

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
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent flex items-center gap-3">
                                <TrendingUp size={32} className="text-amber-400" />
                                市場行情總覽
                            </h1>
                            <p className="text-gray-400 mt-2">
                                即時監控台股與美股關鍵標的
                            </p>
                        </div>
                        <div className="flex space-x-4">
                            <StatusBadge label="AI Worker" status="online" />
                            <StatusBadge label="Database" status="online" />
                        </div>
                    </header>

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
                                    data-testid={`market-btn-${market.key}`}
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

// --- Helper Components ---
function StatusBadge({ label, status }: { label: string, status: 'online' | 'offline' }) {
    return (
        <div className="glass px-3 py-1.5 rounded-full flex items-center space-x-2 border border-white/10">
            <span className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="text-xs font-medium text-gray-300">{label}</span>
        </div>
    );
}
