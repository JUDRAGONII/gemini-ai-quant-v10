"use client";

import React from 'react';
import { useQuotaStatus } from '@/hooks/useQuotaStatus';
import { QuotaDashboard } from '@/components/Admin/QuotaDashboard';
import { ShieldCheck, RefreshCw, Server, Search } from 'lucide-react';

export default function AdminQuotaPage() {
    const { data, isLoading, isError, isValidating, resetCooldown, refresh } = useQuotaStatus();

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white p-6 pb-20">
            {/* Header Area */}
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/30">
                            <ShieldCheck className="w-6 h-6 text-blue-400" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                            API 配額監控中心
                        </h1>
                    </div>
                    <p className="text-gray-400 text-sm max-w-2xl font-medium">
                        監控多提供者 (Fugle, Tiingo, Gemini) 的金鑰健康狀況、即時請求量與自動冷卻機制，確保資料核心穩定性。
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Server className="w-4 h-4 text-blue-400" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase">System Status</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                            <span className="text-green-400 font-bold">READY</span>
                        </div>
                    </div>

                    <button
                        onClick={() => refresh()}
                        disabled={isValidating}
                        className={`p-2.5 rounded-xl border border-white/10 transition-all ${isValidating ? 'bg-white/5 cursor-wait opacity-50' : 'bg-white/10 hover:bg-white/20 active:scale-95'
                            }`}
                    >
                        <RefreshCw className={`w-5 h-5 text-blue-400 ${isValidating ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Search className="w-6 h-6 text-blue-400/50" />
                            </div>
                        </div>
                        <p className="text-gray-500 text-sm animate-pulse font-medium">正在載入配額狀態數據...</p>
                    </div>
                ) : isError ? (
                    <div className="max-w-md mx-auto p-8 rounded-2xl border border-red-500/20 bg-red-500/5 text-center space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
                            <ShieldCheck className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white">連線失敗</h2>
                        <p className="text-gray-400 text-sm">無法從後端獲取 API 配額資訊。請檢查後端服務是否運行正常或網路連線。</p>
                        <button
                            onClick={() => refresh()}
                            className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors"
                        >
                            重新嘗試
                        </button>
                    </div>
                ) : (
                    <QuotaDashboard
                        keys={data?.keys || []}
                        summary={data?.summary || { total: 0, healthy: 0, warning: 0, critical: 0, overall_health: 'healthy' }}
                        onReset={resetCooldown}
                        isValidating={isValidating}
                    />
                )}
            </main>

            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-600/5 rounded-full blur-[100px]" />
            </div>
        </div>
    );
}
