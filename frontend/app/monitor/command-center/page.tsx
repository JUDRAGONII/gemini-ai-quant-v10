"use client";

import React, { useEffect, useState } from 'react';
import { MonitorRepository } from '@/lib/monitorRepository';
import { MonitorDashboardResponse } from '@/types/api';
import { SystemHealthWidget } from '@/components/monitor/SystemHealthWidget';
import { LiveAlertFeed } from '@/components/monitor/LiveAlertFeed';
import { RiskAlertWidget } from '@/components/monitor/RiskAlertWidget';
import { EvolutionTrendWidget } from '@/components/monitor/EvolutionTrendWidget';
import { Bilingual } from '@/components/ui/Bilingual';
import { Activity, RefreshCw } from 'lucide-react';

export default function CommandCenterPage() {
    const [data, setData] = useState<MonitorDashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const fetchData = async () => {
        try {
            const result = await MonitorRepository.getDashboardSummary();
            setData(result);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Dashboard fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchData();
    }, []);

    // Auto-refresh interval (5 seconds)
    useEffect(() => {
        const interval = setInterval(() => {
            setRefreshTrigger(prev => prev + 1);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!loading) { // Don't trigger if initial loading
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshTrigger]);

    if (loading && !data) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-400">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="text-sm font-mono tracking-widest">
                        <Bilingual zh="正在初始化 AI 監控中心..." en="INITIALIZING AI COMMAND CENTER..." mode="stacked" />
                    </div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-4 font-sans selection:bg-blue-500/30">
            {/* Header */}
            <header className="flex justify-between items-center mb-6 pl-2 border-l-4 border-blue-500">
                <div>
                    <Bilingual
                        zh="AI 監控中心"
                        en="AI Command Center"
                        mode="inline"
                        zhClassName="text-2xl font-bold tracking-tight text-white"
                        enClassName="text-xs font-mono text-slate-500 ml-2"
                    >
                        <span className="text-xs font-normal text-slate-500 font-mono px-2 py-0.5 border border-slate-800 rounded bg-slate-900">
                            v10.3.14
                        </span>
                    </Bilingual>
                    <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <Bilingual
                            zh="系統運行中"
                            en="SYSTEM OPERATIONAL"
                            mode="inline"
                            enClassName="text-[9px] opacity-60"
                        />
                        <span className="text-slate-600">|</span>
                        <Bilingual
                            zh="最後更新"
                            en="LAST UPDATE"
                            mode="inline"
                            enClassName="text-[9px] opacity-60"
                        />: {lastUpdated.toLocaleTimeString()}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => fetchData()}
                        className="p-2 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white"
                        title="Force Refresh"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <div className="text-right">
                        <div className="text-xs font-bold text-blue-400">AI-WORKER-01</div>
                        <div className="text-[10px] text-slate-500">us-east-1a</div>
                    </div>
                </div>
            </header>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-4 h-[calc(100vh-120px)]">

                {/* Column 1: System & Risk (3/12) */}
                <div className="col-span-1 md:col-span-4 lg:col-span-3 flex flex-col gap-4 h-full">
                    <div className="h-1/2">
                        <SystemHealthWidget system={data.system} quota={data.quota} />
                    </div>
                    <div className="h-1/2">
                        <RiskAlertWidget risk={data.risk} />
                    </div>
                </div>

                {/* Column 2: Main Visuals (Evolution & maybe Market) (6/12) */}
                <div className="col-span-1 md:col-span-4 lg:col-span-6 flex flex-col gap-4 h-full">
                    <div className="h-full">
                        <EvolutionTrendWidget data={data.evolution} />
                    </div>
                    {/* Placeholder for future Market Heatmap or other central widget */}
                </div>

                {/* Column 3: Live Alerts (3/12) */}
                <div className="col-span-1 md:col-span-4 lg:col-span-3 h-full">
                    <LiveAlertFeed initialAlerts={data.alerts} />
                </div>

            </div>
        </div>
    );
}
