import React from 'react';
import { supabase } from '@/lib/supabase';
import { Activity, TrendingUp, BarChart3, FileText, Settings, Cpu, Layers, Zap, Clock } from 'lucide-react';
import MacroChart from '@/components/MacroChart';
import { MobileNav } from '@/components/layout';
import Sidebar from '@/components/layout/Sidebar';
import Link from 'next/link';

// 獲取數據的伺服器端邏輯 (與原版一致)
async function getIndicatorHistory(code: string, limit: number = 20) {
    const { data, error } = await supabase
        .from('macro_indicators')
        .select('value, reference_date')
        .eq('indicator_code', code)
        .order('reference_date', { ascending: true })
        .limit(limit);
    if (error) return [];
    return data || [];
}

async function getRecentReports() {
    const { data, error } = await supabase
        .from('ai_reports')
        .select('*')
        .order('report_date', { ascending: false })
        .limit(3);
    if (error) return [];
    return data || [];
}

export const dynamic = 'force-dynamic';
export const revalidate = 30;

export default async function Home() {
    const [gdpData, cpiData, vixData, reports] = await Promise.all([
        getIndicatorHistory('GDP', 12),
        getIndicatorHistory('CPI', 24),
        getIndicatorHistory('VIX', 30),
        getRecentReports()
    ]);

    return (
        <div className="flex h-screen bg-[#08080c]">
            {/* Sidebar Container */}
            <div className="hidden lg:block w-64 border-r border-white/5">
                <Sidebar />
            </div>

            {/* Main Scrollable Area */}
            <div className="flex-1 overflow-y-auto">
                <MobileNav />

                <main className="max-w-7xl mx-auto p-6 lg:p-10 space-y-10">
                    {/* Header Section */}
                    <header className="relative py-12 px-8 rounded-3xl overflow-hidden glass neo-shadow group">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 pointer-events-none"></div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                            <div>
                                <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-2">
                                    <span className="gradient-text">市場導航儀</span>
                                </h1>
                                <p className="text-gray-400 text-lg font-light tracking-wide max-w-md">
                                    即時監控全局宏觀指標，驅動精準 AI 決策路徑
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <StatusBadge label="AI Core" status="online" />
                                <StatusBadge label="Engine" status="online" />
                            </div>
                        </div>
                    </header>

                    {/* Macro Trends Section */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold flex items-center space-x-3 text-white/90">
                                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                                    <TrendingUp size={24} />
                                </div>
                                <span>宏觀趨勢動態</span>
                            </h2>
                            <Link href="/macro" className="text-cyan-400 text-sm hover:underline">查看全部數據 →</Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ChartWrapper title="GDP Growth (QoQ)" data={gdpData} color="#06B6D4" lucide={Activity} />
                            <ChartWrapper title="CPI Inflation (YoY)" data={cpiData} color="#3B82F6" lucide={Zap} />
                            <ChartWrapper title="VIX Volatility" data={vixData} color="#EC4899" lucide={BarChart3} />
                        </div>
                    </section>

                    {/* Reports & Status Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* AI Reports */}
                        <div className="lg:col-span-2 space-y-6">
                            <h2 className="text-2xl font-bold flex items-center space-x-3 text-white/90">
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                    <FileText size={24} />
                                </div>
                                <span>智庫辯論報告</span>
                            </h2>
                            <div className="space-y-6">
                                {reports.length > 0 ? (
                                    reports.map((report) => (
                                        <EnhancedReportCard key={report.id} report={report} />
                                    ))
                                ) : (
                                    <div className="glass p-12 text-center rounded-2xl border-dashed border-white/5">
                                        <p className="text-gray-500 italic">正在生成今日戰術分析，請稍候...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* System Health */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white/90">系統效能中心</h2>
                            <div className="glass p-8 rounded-2xl space-y-6 border-white/10 bg-white/[0.02]">
                                <HealthRow label="Gemini 2.0" value="Active" icon={<Cpu size={16} />} />
                                <HealthRow label="Sync Hub" value="Stable" icon={<Layers size={16} />} />
                                <HealthRow label="Latency" value="120ms" icon={<Clock size={16} />} />

                                <div className="pt-6 border-t border-white/5 space-y-4">
                                    <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Version Alpha V10.2.5</p>
                                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full w-[85%] rounded-full shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-light">
                                        系統運作良好。目前追蹤 538 萬筆數據節點。
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

// --- Internal UI Components ---

function StatusBadge({ label, status }: { label: string, status: 'online' | 'offline' }) {
    return (
        <div className="bg-white/5 px-4 py-2 rounded-xl flex items-center space-x-3 border border-white/10 backdrop-blur-sm shadow-xl">
            <div className={`w-2.5 h-2.5 rounded-full ${status === 'online' ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]' : 'bg-red-500 animate-pulse'}`}></div>
            <span className="text-xs font-bold tracking-widest text-gray-200 uppercase">{label}</span>
        </div>
    );
}

function ChartWrapper({ title, data, color, lucide: Icon }: { title: string, data: any[], color: string, lucide: any }) {
    return (
        <div className="glass p-6 rounded-2xl glass-hover overflow-hidden h-64 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-tighter">{title}</span>
                <Icon size={16} style={{ color }} />
            </div>
            <div className="flex-1 -mx-4 -mb-4">
                <MacroChart data={data} dataKey="value" color={color} hideGrid />
            </div>
        </div>
    );
}

function EnhancedReportCard({ report }: { report: any }) {
    return (
        <Link href={`/ai/${report.id}`} className="block group">
            <div className="glass px-8 py-7 rounded-2xl glass-hover border-white/5 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600/20 to-cyan-500/20 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                    <span className="text-cyan-400 font-black text-xs font-mono">{report.stock_code}</span>
                </div>
                <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
                        <Clock size={12} />
                        <span>{report.report_date}</span>
                        <span className="mx-2 text-white/10">|</span>
                        <span className="text-cyan-400/80">AI Analysis Report</span>
                    </div>
                    <h3 className="text-xl font-bold text-white/90 group-hover:text-cyan-400 transition-colors">市場趨勢深度辯論</h3>
                    <p className="text-gray-400 text-sm line-clamp-1 font-light leading-relaxed">{report.summary}</p>
                </div>
                <div className="md:border-l md:border-white/5 md:pl-8 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-cyan-500/10 group-hover:text-cyan-400 transition-all">
                        <TrendingUp size={20} className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                    </div>
                </div>
            </div>
        </Link>
    );
}

function HealthRow({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="flex justify-between items-center group">
            <div className="flex items-center space-x-3 text-gray-400 group-hover:text-gray-200 transition-colors">
                {icon}
                <span className="text-sm font-medium">{label}</span>
            </div>
            <span className="text-sm font-bold text-emerald-400 font-mono tracking-tighter">{value}</span>
        </div>
    );
}
