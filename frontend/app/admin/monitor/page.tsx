'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import GlassCard from '@/components/ui/GlassCard';
import ProBadge from '@/components/ui/ProBadge';
import {
    Database,
    TrendingUp,
    Globe,
    Cpu,
    RefreshCcw,
    Search,
    ChevronRight,
    Activity
} from 'lucide-react';

// 定義監控表選項
const TABLES = [
    { id: 'daily_price', name: '行情數據', icon: TrendingUp },
    { id: 'macro_indicators', name: '宏觀指標', icon: Globe },
    { id: 'stock_factors', name: '多因子評分', icon: Activity },
    { id: 'evolution_genes', name: '演化基因', icon: Cpu },
];

export default function MonitorPage() {
    const [activeTab, setActiveTab] = useState(TABLES[0].id);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>({});
    const router = useRouter();

    // Security Check: Developer Mode Only
    useEffect(() => {
        const isDev = localStorage.getItem('dev_mode') === 'true';
        if (!isDev) {
            router.push('/');
        }
    }, [router]);

    // 獲取統計資訊
    useEffect(() => {
        async function fetchStats() {
            const results: any = {};
            for (const table of TABLES) {
                const { count } = await supabase
                    .from(table.id)
                    .select('*', { count: 'exact', head: true });
                results[table.id] = count || 0;
            }
            setStats(results);
        }
        fetchStats();
    }, []);

    // 獲取具體表數據
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const { data: result, error } = await supabase
                .from(activeTab)
                .select('*')
            const { data: result, error } = await supabase
                .from(activeTab)
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (!error) {
                setData(result || []);
            }
            setLoading(false);
        }
        fetchData();
    }, [activeTab]);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-8 font-sans selection:bg-blue-500/30">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <Database className="w-5 h-5 text-blue-400" />
                        </div>
                        <ProBadge status="info">Developer Only</ProBadge>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        數據監控中心
                    </h1>
                    <p className="text-slate-500 mt-2 font-mono text-sm">
                        Monitor real-time database state and ETL integrity.
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-900/50 p-1 rounded-xl border border-white/5">
                    <button className="px-4 py-2 hover:bg-white/5 rounded-lg transition-colors text-sm flex items-center gap-2">
                        <RefreshCcw className="w-4 h-4" />
                        手動重新整理
                    </button>
                </div>
            </div>

            {/* Tabs / Stats Cards */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {TABLES.map((table) => {
                    const Icon = table.icon;
                    const isActive = activeTab === table.id;
                    return (
                        <button
                            key={table.id}
                            onClick={() => setActiveTab(table.id)}
                            className={`text-left transition-all duration-300 transform group ${isActive ? 'scale-[1.02]' : 'hover:translate-y-[-2px]'
                                }`}
                        >
                            <GlassCard className={`p-4 border-2 transition-all ${isActive ? 'border-blue-500/50 shadow-lg shadow-blue-500/10' : 'border-white/5 hover:border-white/10'
                                }`}>
                                <div className="flex items-start justify-between">
                                    <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500 group-hover:text-slate-300'
                                        }`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="text-3xl font-bold font-mono tracking-tight">
                                        {stats[table.id]?.toLocaleString() || '---'}
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-500'}`}>
                                        {table.name}
                                    </span>
                                    <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'text-blue-400 translate-x-1' : 'text-slate-600'
                                        }`} />
                                </div>
                            </GlassCard>
                        </button>
                    );
                })}
            </div>

            {/* Data Table Area */}
            <div className="max-w-7xl mx-auto">
                <GlassCard className="overflow-hidden border-white/5">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-2">
                            <Search className="w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="快速過濾..."
                                className="bg-transparent border-none focus:ring-0 text-sm w-64 placeholder:text-slate-600"
                            />
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                            Showing last 50 entries
                        </div>
                    </div>

                    <div className="overflow-x-auto min-h-[400px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center p-20 gap-4">
                                <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                                <span className="text-sm font-mono text-slate-500 animate-pulse">Loading Database Stream...</span>
                            </div>
                        ) : data.length > 0 ? (
                            <table className="w-full text-left text-sm font-mono">
                                <thead>
                                    <tr className="bg-white/[0.03] text-slate-500 border-b border-white/5">
                                        {Object.keys(data[0]).map(key => (
                                            <th key={key} className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">
                                                {key}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.02]">
                                    {data.map((row, i) => (
                                        <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                                            {Object.values(row).map((val: any, j) => (
                                                <td key={j} className="px-6 py-4 text-slate-400 group-hover:text-slate-200">
                                                    {typeof val === 'object' ? JSON.stringify(val).slice(0, 50) + '...' : String(val)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-20 gap-2 opacity-50">
                                <Database className="w-12 h-12 text-slate-700" />
                                <span className="text-slate-500">此資料表目前尚無數據</span>
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>

            <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
        </div>
    );
}
