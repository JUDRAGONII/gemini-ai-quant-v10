'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import GlassCard from '@/components/ui/GlassCard';
import ProBadge from '@/components/ui/ProBadge';
import { Bilingual } from '@/components/ui/Bilingual';
import {
    Database,
    TrendingUp,
    Globe,
    Globe2,
    Cpu,
    RefreshCcw,
    Search,
    ChevronRight,
    Activity,
    Clock,
    CheckCircle2,
    AlertCircle,
    BarChart2,
    Dna,
    DollarSign,
    Gem,
    Calendar
} from 'lucide-react';
import { useMonitorData } from '@/hooks/useMonitorData';
import { MonitorCardSkeleton, MonitorProgressSkeleton } from '@/components/ui/MonitorSkeleton';

interface MonitorCategory {
    id: string;
    name: string;
    nameEn: string;
    icon: any;
    table: string;
    filter?: Record<string, string>;
    sortColumn: string;
    colorTheme: 'blue' | 'emerald' | 'amber' | 'rose' | 'violet' | 'cyan' | 'slate';
}

const CATEGORIES: MonitorCategory[] = [
    { id: 'tw_equity', name: '台灣行情', nameEn: 'TWSE', icon: TrendingUp, table: 'daily_price', filter: { market_type: 'TWSE' }, sortColumn: 'trade_date', colorTheme: 'blue' },
    { id: 'us_equity', name: '美國行情', nameEn: 'US Equities', icon: BarChart2, table: 'daily_price', filter: { market_type: 'TIINGO' }, sortColumn: 'trade_date', colorTheme: 'violet' },
    { id: 'tw_macro', name: '台灣宏觀', nameEn: 'TW Macro', icon: Globe, table: 'macro_indicators', filter: { country: 'TW' }, sortColumn: 'reference_date', colorTheme: 'emerald' },
    { id: 'us_macro', name: '美國宏觀', nameEn: 'US Macro', icon: Globe2, table: 'macro_indicators', filter: { country: 'US' }, sortColumn: 'reference_date', colorTheme: 'amber' },
    { id: 'realtime', name: '即時報價', nameEn: 'Real-time', icon: Activity, table: 'market_quotes', sortColumn: 'updated_at', colorTheme: 'rose' },
    { id: 'fx', name: '匯率行情', nameEn: 'Forex', icon: DollarSign, table: 'exchange_rates', sortColumn: 'trade_date', colorTheme: 'blue' },
    { id: 'economic_calendar', name: '經濟日曆', nameEn: 'Calendar', icon: Calendar, table: 'economic_calendar', sortColumn: 'scheduled_at', colorTheme: 'emerald' },
    { id: 'factors', name: '多因子評分', nameEn: 'Factors', icon: Cpu, table: 'stock_factors', sortColumn: 'trade_date', colorTheme: 'cyan' },
    { id: 'genes', name: '演化基因', nameEn: 'Genes', icon: Dna, table: 'evolution_genes', sortColumn: 'created_at', colorTheme: 'violet' }
];

const COLOR_THEMES: Record<string, { border: string; bg: string; text: string; icon: string; shadow: string; glow: string }> = {
    blue: {
        border: 'border-blue-500/30',
        bg: 'bg-blue-500/10',
        text: 'text-blue-300',
        icon: 'text-blue-400',
        shadow: 'shadow-blue-500/10',
        glow: 'group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]'
    },
    emerald: {
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-300',
        icon: 'text-emerald-400',
        shadow: 'shadow-emerald-500/10',
        glow: 'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]'
    },
    amber: {
        border: 'border-amber-500/30',
        bg: 'bg-amber-500/10',
        text: 'text-amber-300',
        icon: 'text-amber-400',
        shadow: 'shadow-amber-500/10',
        glow: 'group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]'
    },
    rose: {
        border: 'border-rose-500/30',
        bg: 'bg-rose-500/10',
        text: 'text-rose-300',
        icon: 'text-rose-400',
        shadow: 'shadow-rose-500/10',
        glow: 'group-hover:shadow-[0_0_20px_rgba(244,63,94,0.15)]'
    },
    violet: {
        border: 'border-violet-500/30',
        bg: 'bg-violet-500/10',
        text: 'text-violet-300',
        icon: 'text-violet-400',
        shadow: 'shadow-violet-500/10',
        glow: 'group-hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]'
    },
    cyan: {
        border: 'border-cyan-500/30',
        bg: 'bg-cyan-500/10',
        text: 'text-cyan-300',
        icon: 'text-cyan-400',
        shadow: 'shadow-cyan-500/10',
        glow: 'group-hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]'
    },
    slate: {
        border: 'border-slate-500/30',
        bg: 'bg-slate-500/10',
        text: 'text-slate-300',
        icon: 'text-slate-400',
        shadow: 'shadow-slate-500/10',
        glow: 'group-hover:shadow-[0_0_20px_rgba(148,163,184,0.15)]'
    },
};

export default function MonitorPage() {
    const { stats, isLoading: isStatsLoading, refresh } = useMonitorData();
    const [activeCategory, setActiveCategory] = useState<MonitorCategory>(CATEGORIES[0]);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const [filterText, setFilterText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const ITEMS_PER_PAGE = 50;
    const router = useRouter();

    useEffect(() => {
        const isDev = localStorage.getItem('dev_mode') === 'true';
        if (!isDev) router.push('/');
    }, [router]);

    // Reset page when category changes
    useEffect(() => {
        setCurrentPage(1);
        setData([]); // 即時清理舊數據，防止切換類別時顯示陳舊內容
    }, [activeCategory]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            let query = supabase
                .from(activeCategory.table)
                .select('*', { count: 'exact' });

            if (activeCategory.filter) {
                Object.entries(activeCategory.filter).forEach(([key, value]) => {
                    query = query.eq(key, value);
                });
            }

            // Apply text filter if specific columns match (Basic implementation for common fields)
            if (filterText) {
                // Note: This is a simple OR search on common text columns. 
                // For comprehensive search on all columns, backend support or RPC is better.
                // Here we keep it simple as per KISS Plan A (Front-end heavy or simple backend params)
                // However, Supabase OR syntax is tricky. 
                // Let's implement Server-side pagination but Client-side filtering for the CURRENT PAGE?
                // No, the user complained about filtering. 
                // Plan A said: "前端分頁 + 前端增強過濾".
                // "快速實作... 搜尋僅限已載入資料". 
                // Wait, if I use .range(), I only load 50 items. Filtering only 50 items is what caused the complaint ("快速過濾功能缺失").
                // If I want to filter properly with pagination, I need to apply filter to the Supabase query via .or().
                // But `activeCategory` tables are different, columns are different.
                // Let's stick to the Plan A description strictly: 
                // "方案 A ... 缺點: 搜尋僅限已載入資料".
                // WAIT. If the drawback is "Search only loaded data", and I switch to pagination (loading 50 at a time), then search becomes even worse (only searching 50 items).
                // The user complained "快速過濾功能缺失" implies they WANT it to work better.
                // Maybe I should fetch slightly more data or enable a simple Symbol search if possible.
                // But adhereing to the plan: "Modify query to support pagination".
                // Let's implement .range() for pagination.
                // For filtering, if I strictly follow "Client side filtering", I can only filter what I fetch.
                // But I can try to add a basic symbol/name filter to the Supabase query if those columns exist.
                // Most tables have 'symbol' or 'code'.
                if (filterText.length >= 2) {
                    // Try to filter by symbol or name if applicable, otherwise client side filter on result
                    // For generic implementation without crashing, we might skip complex OR queries here
                    // unless we know the schema.
                    // The user's complaint 1 was "function exists but weak".
                    // Plan A says "Frontend enhanced filtering".
                    // Let's stick to doing pagination first, and keep client filtering on the fetched page (or simple server filter).
                    // Actually, if I fetch 50 items, client filtering is useless for finding item #1000.
                    // The Plan A drawback "Search only loaded data" explicitly acknowledges this limitation.
                    // The user approved Plan A. So I will implement Pagination + Client Filter.
                }
            }

            // Pagination
            const from = (currentPage - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            const { data: result, error, count } = await query
                .order(activeCategory.sortColumn, { ascending: false })
                .range(from, to);

            if (!error) {
                setData(result || []);
                if (count !== null) setTotalItems(count);
            }
        } catch (err) {
            console.error('Fetch table data exception:', err);
        } finally {
            setLoading(false);
        }
    }, [activeCategory, currentPage]);

    useEffect(() => {
        fetchData();
    }, [activeCategory, refreshKey, currentPage, fetchData]); // Remove filterText from dependency if strictly client side or keep if we want to reset

    // Helper to format market type
    function formatMarketType(val: any, key: string): React.ReactNode {
        if (key === 'market_type') {
            const MAP: Record<string, string> = {
                'TWSE': 'TW 🇹🇼',
                'TIINGO': 'US 🇺🇸',
                'TAIFEX': 'Taifex 📊',
            };
            return MAP[val] || val;
        }
        if (val === null || val === undefined) return <span className="opacity-20">-</span>;
        if (typeof val === 'object') return <span className="text-[10px] opacity-60">{JSON.stringify(val).slice(0, 30)}...</span>;
        return val;
    }

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-8 font-sans selection:bg-blue-500/30">
            <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <Database className="w-5 h-5 text-blue-400" />
                        </div>
                        <Bilingual
                            zh="開發者中心"
                            en="Developer Center"
                            mode="inline"
                            zhClassName="text-[10px] font-bold"
                            enClassName="text-[8px] opacity-50 uppercase tracking-widest"
                            className="bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-blue-400"
                        />
                    </div>
                    <Bilingual
                        zh="數據監控中心"
                        en="Data Monitor Center"
                        mode="stacked"
                        zhClassName="text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent"
                        enClassName="text-xs font-medium text-slate-500 uppercase tracking-[0.3em] font-mono mt-1"
                    />
                </div>
                <button
                    onClick={() => setRefreshKey(k => k + 1)}
                    aria-label="Refresh Data"
                    className="p-2 bg-slate-900 border border-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                    <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-4 mb-8">
                {isStatsLoading
                    ? Array(9).fill(0).map((_, i) => <MonitorCardSkeleton key={i} />)
                    : CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = activeCategory.id === cat.id;
                        const theme = COLOR_THEMES[cat.colorTheme];
                        const count = (stats as any)[cat.id];

                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat)}
                                className={`text-left transition-all duration-300 group ${isActive ? 'scale-[1.02] z-10' : 'scale-100 hover:scale-[1.01]'}`}
                            >
                                <GlassCard className={`p-4 border shadow-2xl transition-all duration-500 flex flex-col justify-between h-full ${theme.glow} ${isActive ? `${theme.border} bg-white/[0.08] ${theme.shadow}` : 'border-white/5 opacity-60 hover:opacity-100 bg-[#0f172a]/40'}`}>
                                    <div>
                                        <div className={`p-2 w-fit rounded-xl mb-3 transition-colors duration-300 ${isActive ? theme.bg + ' ' + theme.icon : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700'}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className={`text-2xl font-bold font-mono tracking-tight mb-1 transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`}>
                                            {count !== undefined ? count.toLocaleString() : '...'}
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <Bilingual
                                            zh={cat.name}
                                            en={cat.nameEn}
                                            mode="stacked"
                                            zhClassName={`text-xs font-semibold tracking-wide truncate ${isActive ? 'text-white' : 'text-slate-500'}`}
                                            enClassName={`text-[9px] font-bold tracking-widest opacity-40 uppercase ${isActive ? 'text-white' : 'text-slate-400'}`}
                                        />
                                    </div>
                                </GlassCard>
                            </button>
                        );
                    })
                }
            </div>

            <div className="max-w-7xl mx-auto">
                <GlassCard className="overflow-hidden border-white/5 bg-slate-900/30 backdrop-blur-xl shadow-inner-white">
                    <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.01]">
                        <div className="flex items-center gap-3">
                            <Bilingual
                                zh="數據檢索"
                                en="Data Query"
                                mode="stacked"
                                zhClassName="text-sm font-bold text-white/80"
                                enClassName="text-[8px] uppercase tracking-wider opacity-40 font-mono"
                            />
                            <div className="flex items-center gap-3 w-full sm:w-auto bg-slate-950/50 px-4 py-2 rounded-xl border border-white/5 focus-within:border-blue-500/50 transition-all ml-2">
                                <Search className="w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="快速篩選 (當前頁 / Quick Filter)..."
                                    data-testid="filter-input"
                                    value={filterText}
                                    onChange={e => setFilterText(e.target.value)}
                                    className="bg-transparent border-none focus:ring-0 text-sm w-full sm:w-64 text-slate-300 placeholder:text-slate-600"
                                />
                            </div>
                        </div>
                        <Bilingual
                            zh={`第 ${currentPage} / ${totalPages || 1} 頁`}
                            en={`PAGE ${currentPage} / ${totalPages || 1}`}
                            mode="stacked"
                            zhClassName="text-[10px] font-bold text-slate-400"
                            enClassName="text-[8px] font-mono tracking-widest text-slate-500"
                            className="items-end"
                        />
                        <div className="h-4 w-px bg-white/5 mx-1" />
                        <Bilingual
                            zh={`總計 ${totalItems.toLocaleString()} 筆數據`}
                            en={`TOTAL: ${totalItems.toLocaleString()} ROWS`}
                            mode="stacked"
                            zhClassName="text-[10px] font-bold text-slate-400"
                            enClassName="text-[8px] font-mono tracking-widest text-slate-500"
                            className="items-end"
                        />
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        {!loading && data.length > 0 ? (
                            <>
                                <table className="w-full text-left text-[11px] font-mono border-collapse">
                                    <thead>
                                        <tr className="bg-white/[0.03] text-slate-500">
                                            {Object.keys(data[0]).map(k => (
                                                <th key={k} className="px-6 py-4 uppercase tracking-widest font-bold opacity-60 border-b border-white/5 whitespace-nowrap">{k}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.03]">
                                        {data.filter(r => JSON.stringify(r).toLowerCase().includes(filterText.toLowerCase())).map((row, i) => (
                                            <tr key={i} className="hover:bg-blue-500/[0.03] transition-colors group">
                                                {Object.entries(row).map(([k, v], j) => (
                                                    <td key={j} className="px-6 py-3.5 text-slate-400 group-hover:text-blue-200 transition-colors border-r border-white/[0.01] last:border-r-0">
                                                        {formatMarketType(v, k)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Pagination Controls - Premium Glass Style */}
                                <div className="p-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.02]">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        className="w-full sm:w-auto px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all text-[10px] font-bold tracking-widest group"
                                    >
                                        <ChevronRight className="w-3.5 h-3.5 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
                                        <Bilingual
                                            zh="上一頁"
                                            en="PREVIOUS"
                                            mode="stacked"
                                            zhClassName="text-[10px] font-bold"
                                            enClassName="text-[7px] tracking-widest"
                                            className="items-start"
                                        />
                                    </button>

                                    <div className="flex gap-1.5 overflow-x-auto pb-2 sm:pb-0">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let p = i + 1;
                                            if (currentPage > 3 && totalPages > 5) p = currentPage - 2 + i;
                                            if (p < 1) p = i + 1;
                                            if (p > totalPages) return null;
                                            return (
                                                <button
                                                    key={p}
                                                    onClick={() => setCurrentPage(p)}
                                                    className={`min-w-[32px] h-8 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all ${currentPage === p ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'hover:bg-white/10 text-slate-500 hover:text-slate-300'}`}
                                                >
                                                    {p}
                                                </button>
                                            )
                                        })}
                                    </div>

                                    <button
                                        disabled={currentPage >= totalPages}
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        className="w-full sm:w-auto px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all text-[10px] font-bold tracking-widest group"
                                    >
                                        <Bilingual
                                            zh="下一頁"
                                            en="NEXT"
                                            mode="stacked"
                                            zhClassName="text-[10px] font-bold"
                                            enClassName="text-[7px] tracking-widest"
                                            className="items-end"
                                        />
                                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                            </>
                        ) : loading ? (
                            <div className="p-24 flex flex-col items-center gap-5">
                                <div className="relative">
                                    <RefreshCcw className="w-10 h-10 text-blue-500 animate-spin opacity-40" />
                                    <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-10 animate-pulse"></div>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-[10px] text-blue-400 font-bold animate-pulse tracking-[0.3em] uppercase">Syncing Database</span>
                                    <span className="text-[9px] text-slate-600 font-mono italic">Fetching latest financial records...</span>
                                </div>
                            </div>
                        ) : (
                            <div className="p-24 text-center">
                                <AlertCircle className="w-10 h-10 text-slate-700 mx-auto mb-4 opacity-20" />
                                <div className="text-sm font-medium text-slate-500 tracking-tight">此資料表目前尚無數據</div>
                                <div className="text-[10px] text-slate-700 mt-1 font-mono uppercase tracking-widest">Verify database tables or check connectivity.</div>
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}

function StatusBadge({ label, status }: { label: string, status: 'online' | 'offline' }) {
    return (
        <div className="glass px-3 py-1.5 rounded-full flex items-center space-x-2 border border-white/10">
            <span className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="text-xs font-medium text-gray-300">{label}</span>
        </div>
    );
}
