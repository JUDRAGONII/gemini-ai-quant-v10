"use client";

import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout";
import { Dna, FlaskConical, Play } from "lucide-react";

export default function EvolutionPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-gray-100 font-sans selection:bg-cyan-500/30">
            {/* Mobile Navigation (Sticky Top + Drawer) */}
            <MobileNav />

            {/* Sidebar (Unified) */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            <div className="flex">
                {/* Main Content */}
                <main className="flex-1 ml-0 lg:ml-64 p-4 lg:p-8 text-white">
                    {/* 頁面標題與狀態欄 (In-page Header) */}
                    <header className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
                                <Dna size={32} className="text-violet-400" />
                                演化運算分析 (Evolution)
                            </h1>
                            <p className="text-gray-400 mt-2">
                                基於 DEAP 框架的遺傳演算法策略優化引擎
                            </p>
                        </div>
                        <div className="flex space-x-4">
                            <StatusBadge label="AI Worker" status="online" />
                            <StatusBadge label="Database" status="online" />
                        </div>
                    </header>

                    {/* Placeholder Content */}
                    <div className="glass p-12 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 relative">
                            <FlaskConical size={48} className="text-fuchsia-400" />
                            <div className="absolute inset-0 rounded-full border border-fuchsia-500/30 animate-ping"></div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">策略演化中...</h2>
                            <p className="text-gray-400 max-w-md mx-auto">
                                演化引擎正在後台運行基因演算法，尋找最佳交易策略參數組合。前台介面即將開放。
                            </p>
                        </div>
                        <button className="px-6 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-fuchsia-600/20 flex items-center gap-2 cursor-pointer">
                            <Play size={18} fill="currentColor" />
                            啟動模擬演化
                        </button>
                    </div>
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
