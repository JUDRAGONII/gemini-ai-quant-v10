"use client";

import React, { useState } from 'react';
import { useHeatmap } from '@/hooks/useHeatmap';
import { MarketHeatmap } from '@/components/Market';
import { RefreshCw, Grid3X3, Layers } from 'lucide-react';

export default function MarketPage() {
    const [marketType, setMarketType] = useState('ALL');
    const [groupBy, setGroupBy] = useState('sector');

    const { data, isLoading, isValidating, isError } = useHeatmap(marketType, groupBy);

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white p-6">
            {/* Header */}
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10">
                            <Grid3X3 className="w-6 h-6 text-blue-400" />
                        </div>
                        市場熱力圖
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        視覺化全市場漲跌強弱分佈
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Market Type Selector */}
                    <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 border border-white/10">
                        {['ALL', 'TWSE', 'TIINGO'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setMarketType(type)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${marketType === type
                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {type === 'ALL' ? '全部' : type}
                            </button>
                        ))}
                    </div>

                    {/* Group By Selector */}
                    <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 border border-white/10">
                        <Layers className="w-4 h-4 text-gray-500 ml-2" />
                        {[{ key: 'sector', label: '產業' }, { key: 'industry', label: '細分' }].map((opt) => (
                            <button
                                key={opt.key}
                                onClick={() => setGroupBy(opt.key)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${groupBy === opt.key
                                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {/* Refresh Indicator */}
                    <div className="flex items-center gap-2 text-gray-400">
                        <RefreshCw className={`w-4 h-4 ${isValidating ? 'animate-spin text-blue-400' : ''}`} />
                        <span className="text-xs">
                            {data?.total_stocks || 0} 檔
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main>
                {isLoading ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                            <p className="text-gray-400 animate-pulse">載入市場數據中...</p>
                        </div>
                    </div>
                ) : isError ? (
                    <div className="flex items-center justify-center h-96 text-red-400">
                        <p>無法載入熱力圖，請稍後再試</p>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md p-4">
                        <MarketHeatmap data={data} height={600} />
                    </div>
                )}
            </main>

            {/* Color Legend */}
            <footer className="mt-6 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#dc2626]"></div>
                    <span className="text-gray-400">跌幅 &gt;5%</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#ef4444]"></div>
                    <span className="text-gray-400">跌幅 2-5%</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#fef08a]"></div>
                    <span className="text-gray-400">平盤</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#22c55e]"></div>
                    <span className="text-gray-400">漲幅 2-5%</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#16a34a]"></div>
                    <span className="text-gray-400">漲幅 &gt;5%</span>
                </div>
            </footer>
        </div>
    );
}
