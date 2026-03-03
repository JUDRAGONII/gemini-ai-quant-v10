"use client";

import React from 'react';
import useSWR from 'swr';
import { Cpu, Layers, Zap, Activity, CheckCircle2, XCircle } from 'lucide-react';
import { Bilingual } from '@/components/ui/Bilingual';
import { MonitorRepository } from '@/lib/monitorRepository';
import { MonitorDashboardResponse } from '@/types/api';

export default function HomeSystemHealth() {
    // 透過 SWR 掛接 Phase 13 開發的聚合 Dashboard 數據
    const { data: dashboard, error, isLoading } = useSWR<MonitorDashboardResponse>(
        'monitor-home-dashboard',
        () => MonitorRepository.getDashboardSummary(),
        { refreshInterval: 5000, dedupingInterval: 2000 }
    );

    if (error) {
        return (
            <div className="space-y-6">
                <Bilingual zh="系統效能中心" en="System Health" mode="stacked"
                    zhClassName="text-2xl font-bold text-white/90"
                    enClassName="text-[10px] uppercase tracking-widest font-mono text-emerald-500/50" />
                <div className="glass p-8 rounded-2xl space-y-6 border-red-500/20 bg-red-500/5">
                    <div className="flex items-center space-x-3 text-red-400">
                        <XCircle size={20} />
                        <Bilingual zh="系統離線" en="SYSTEM OFFLINE" mode="inline"
                            zhClassName="text-sm font-bold tracking-widest text-red-400"
                            enClassName="text-[10px] text-red-500/60 ml-1" />
                    </div>
                    <p className="text-xs text-red-400/70 font-mono">無法取得監控遙測數據。</p>
                </div>
            </div>
        );
    }

    if (isLoading || !dashboard) {
        return (
            <div className="space-y-6">
                <Bilingual zh="系統效能中心" en="System Health" mode="stacked"
                    zhClassName="text-2xl font-bold text-white/90"
                    enClassName="text-[10px] uppercase tracking-widest font-mono text-emerald-500/50" />
                <div className="glass p-8 rounded-2xl space-y-6 border-white/5 animate-pulse bg-white/5">
                    <div className="h-4 w-full bg-white/10 rounded"></div>
                    <div className="h-4 w-5/6 bg-white/10 rounded"></div>
                    <div className="h-4 w-4/6 bg-white/10 rounded"></div>
                </div>
            </div>
        );
    }

    const currentVersion = "Alpha V10.5.4";
    const { system, quota, alerts } = dashboard;

    return (
        <div className="space-y-6">
            <Bilingual zh="系統效能中心" en="System Health" mode="stacked"
                zhClassName="text-2xl font-bold text-white/90"
                enClassName="text-[10px] uppercase tracking-widest font-mono text-emerald-500/50" />
            <div className="glass p-8 rounded-2xl space-y-6 border-white/10 bg-white/[0.02] relative overflow-hidden group">

                {/* 霓虹裝飾背板 */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-emerald-400/20"></div>

                <div className="relative z-10 space-y-5">
                    <HealthRow
                        labelZh="運算節點 CPU" labelEn="Compute Node"
                        value={`${system?.cpu_usage || 0}%`}
                        icon={<Cpu size={16} />}
                        status={system?.cpu_usage > 80 ? 'warning' : 'good'}
                    />
                    <HealthRow
                        labelZh="記憶體壓力" labelEn="Memory Pressure"
                        value={`${system?.ram_usage || 0}%`}
                        icon={<Layers size={16} />}
                        status={system?.ram_usage > 75 ? 'warning' : 'good'}
                    />
                    <HealthRow
                        labelZh="Gemini 配額" labelEn="API Token"
                        value={quota?.gemini ? `${quota.gemini.toLocaleString()} 次` : '運作中'}
                        icon={<Zap size={16} />}
                        status={quota?.status === 'Healthy' ? 'good' : 'warning'}
                    />
                    <HealthRow
                        labelZh="即時警示" labelEn="Active Alerts"
                        value={alerts ? alerts.length.toString() : '0'}
                        icon={<Activity size={16} />}
                        status={(alerts?.length || 0) > 0 ? 'attention' : 'good'}
                    />
                </div>

                <div className="pt-6 border-t border-white/5 space-y-4 relative z-10">
                    <div className="flex justify-between items-center">
                        <Bilingual zh="版本" en="Version" mode="suffix"
                            zhClassName="text-xs text-gray-500 font-mono uppercase tracking-widest"
                            enClassName="text-cyan-400 text-xs font-mono ml-1" />
                        <span className="text-xs text-cyan-400 font-mono">{currentVersion}</span>
                    </div>

                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden relative">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${system?.ram_usage > 80 ? 'bg-gradient-to-r from-red-500 to-orange-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                                'bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                                }`}
                            style={{ width: `${Math.min(system?.ram_usage || 0, 100)}%` }}
                        ></div>
                    </div>

                    <div className="text-[10px] text-gray-400 font-light flex justify-between">
                        <span>系統運轉良好，神經網路同步中。</span>
                        <span>Load: {(system?.cpu_usage || 0).toFixed(1)} / {(system?.ram_usage || 0).toFixed(1)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- 內部 UI 元件 ---
function HealthRow({ labelZh, labelEn, value, icon, status = 'good' }: {
    labelZh: string, labelEn: string, value: string, icon: React.ReactNode, status?: 'good' | 'warning' | 'attention'
}) {
    let colorClass = "text-emerald-400";
    if (status === 'warning') colorClass = "text-orange-400";
    if (status === 'attention') colorClass = "text-cyan-400";

    return (
        <div className="flex justify-between items-center group/row">
            <div className="flex items-center space-x-3 text-gray-400 group-hover/row:text-gray-200 transition-colors">
                {icon}
                <Bilingual zh={labelZh} en={labelEn} mode="suffix"
                    zhClassName="text-sm font-medium text-gray-300"
                    enClassName="text-gray-500 text-[10px] font-mono" />
            </div>
            <span className={`text-sm font-bold font-mono tracking-tighter transition-colors ${colorClass}`}>
                {value}
            </span>
        </div>
    );
}
