"use client";

import React, { useState } from 'react';
import { useScreener } from '@/hooks/useScreener';
import { FilterPanel } from './FilterPanel';
import { ScreenerTable } from './ScreenerTable';
import { Search, Filter, RefreshCw } from 'lucide-react';

/**
 * ScreenerView - AI 多維度選股主視圖
 * 整合 Glassmorphism 控制面板與動態數據表格。
 */
export function ScreenerView() {
    const {
        results,
        count,
        filters,
        updateFilters,
        sortBy,
        sortOrder,
        handleSort,
        isLoading,
        isValidating
    } = useScreener();

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex h-full w-full bg-[#0a0a0c] text-white overflow-hidden relative">
            {/* 1. Glassmorphism Side Panel */}
            <aside
                className={`transition-all duration-300 ease-in-out border-r border-white/10 bg-black/40 backdrop-blur-xl 
          ${isSidebarOpen ? 'w-80' : 'w-0 opacity-0 overflow-hidden'}`}
            >
                <FilterPanel filters={filters} onFilterChange={updateFilters} />
            </aside>

            {/* 2. Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Header Toolbar */}
                <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-black/20 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <Filter className={`w-5 h-5 ${isSidebarOpen ? 'text-blue-400' : 'text-gray-400'}`} />
                        </button>
                        <h1 className="text-xl font-semibold tracking-tight">AI 智能選股引擎</h1>
                        <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-medium">
                            共計 {count} 檔標的
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="搜尋代號或名稱..."
                                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-64 transition-all"
                            />
                        </div>
                        <button
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors group"
                            onClick={() => window.location.reload()}
                        >
                            <RefreshCw className={`w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-all ${isValidating ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </header>

                {/* Dynamic Table Section */}
                <section className="flex-1 overflow-auto p-6 relative">
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                                <p className="text-gray-400 animate-pulse">大數據分析中...</p>
                            </div>
                        </div>
                    ) : (
                        <ScreenerTable
                            data={results}
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onSort={handleSort}
                        />
                    )}

                    {!isLoading && results.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                            <div className="p-4 rounded-full bg-white/5 border border-white/10">
                                <Search className="w-8 h-8 opacity-20" />
                            </div>
                            <p>查無符合條件的標的，請調整篩選器</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
