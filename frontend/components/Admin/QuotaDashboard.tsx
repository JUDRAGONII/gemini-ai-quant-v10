"use client";

import React from 'react';
import { ApiKeyStatus, QuotaSummary } from '@/hooks/useQuotaStatus';
import { Activity, ShieldAlert, CheckCircle2, AlertCircle, RefreshCw, Zap } from 'lucide-react';

interface QuotaDashboardProps {
    keys: ApiKeyStatus[];
    summary: QuotaSummary;
    onReset: (keyId: string) => Promise<boolean>;
    isValidating: boolean;
}

/**
 * QuotaDashboard - API 配額監控儀表板
 */
export function QuotaDashboard({ keys, summary, onReset, isValidating }: QuotaDashboardProps) {

    const getHealthColor = (health: string) => {
        switch (health) {
            case 'healthy': return 'text-green-400';
            case 'warning': return 'text-yellow-400';
            case 'critical': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold border border-green-500/20">ACTIVE</span>;
            case 'cooling':
                return <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold border border-red-500/20 animate-pulse">COOLING</span>;
            case 'disabled':
                return <span className="px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-500 text-[10px] font-bold border border-gray-500/20">DISABLED</span>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* 1. Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <SummaryCard
                    title="總金鑰數"
                    value={summary.total}
                    icon={<Activity className="w-5 h-5 text-blue-400" />}
                    gradient="from-blue-500/10 to-transparent"
                />
                <SummaryCard
                    title="健康"
                    value={summary.healthy}
                    icon={<CheckCircle2 className="w-5 h-5 text-green-400" />}
                    gradient="from-green-500/10 to-transparent"
                />
                <SummaryCard
                    title="警告"
                    value={summary.warning}
                    icon={<AlertCircle className="w-5 h-5 text-yellow-400" />}
                    gradient="from-yellow-500/10 to-transparent"
                />
                <SummaryCard
                    title="危險/冷卻"
                    value={summary.critical}
                    icon={<ShieldAlert className="w-5 h-5 text-red-400" />}
                    gradient="from-red-500/10 to-transparent"
                />
            </div>

            {/* 2. Key Detail Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {keys.map((key) => (
                    <div
                        key={key.id}
                        className="relative group p-5 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl hover:border-white/20 transition-all duration-300 overflow-hidden"
                    >
                        {/* Background Glow */}
                        <div className={`absolute -right-8 -top-8 w-32 h-32 blur-3xl rounded-full opacity-10 transition-opacity group-hover:opacity-20 ${key.health === 'healthy' ? 'bg-green-500' :
                                key.health === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />

                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-white tracking-wide">{key.key_name}</h3>
                                    {getStatusBadge(key.status)}
                                </div>
                                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-tighter">{key.provider} • ID: {key.id.slice(0, 8)}</p>
                            </div>

                            {key.status === 'cooling' && (
                                <button
                                    onClick={() => onReset(key.id)}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 flex items-center gap-1.5 transition-colors"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    手動重置
                                </button>
                            )}
                        </div>

                        {/* Usage Progress */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-400">今日配額使用量</span>
                                <span className={`font-mono font-bold ${getHealthColor(key.health)}`}>
                                    {key.requests_today} / {key.daily_limit} ({key.remaining_percent}%)
                                </span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <div
                                    className={`h-full transition-all duration-1000 ease-out rounded-full ${key.health === 'healthy' ? 'bg-gradient-to-r from-green-500/50 to-green-400' :
                                            key.health === 'warning' ? 'bg-gradient-to-r from-yellow-500/50 to-yellow-400' :
                                                'bg-gradient-to-r from-red-600 to-red-400'
                                        }`}
                                    style={{ width: `${Math.min(100, (key.requests_today / key.daily_limit) * 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Footer Metadata */}
                        <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-x-6 gap-y-2 text-[10px] text-gray-500">
                            <div className="flex items-center gap-1">
                                <Activity className="w-3 h-3" />
                                <span>更新於: {new Date(key.updated_at).toLocaleTimeString()}</span>
                            </div>
                            {key.error_count > 0 && (
                                <div className="flex items-center gap-1 text-red-400/80">
                                    <ShieldAlert className="w-3 h-3" />
                                    <span>錯誤次數: {key.error_count}</span>
                                </div>
                            )}
                            {key.cooldown_until && (
                                <div className="flex items-center gap-1 text-yellow-400/80">
                                    <Zap className="w-3 h-3" />
                                    <span>預計恢復: {new Date(key.cooldown_until).toLocaleTimeString()}</span>
                                </div>
                            )}
                        </div>

                        {/* Error Message Tooltip-like area */}
                        {key.last_error_message && (
                            <div className="mt-3 p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                                <p className="text-[10px] text-red-400/70 truncate">
                                    Latest: {key.last_error_message}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function SummaryCard({ title, value, icon, gradient }: { title: string; value: number | string; icon: React.ReactNode; gradient: string }) {
    return (
        <div className={`p-4 rounded-xl border border-white/10 bg-black/20 backdrop-blur-md bg-gradient-to-br ${gradient}`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 font-medium">{title}</span>
                {icon}
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        </div>
    );
}
