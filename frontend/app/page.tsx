import React from 'react';
import { supabase } from '@/lib/supabase';
import { Activity, TrendingUp, BarChart3, FileText, Settings, Cpu, Layers, Zap, Clock } from 'lucide-react';
import MacroChart from '@/components/MacroChart';
import { MobileNav } from '@/components/layout';
import Sidebar from '@/components/layout/Sidebar';
import HomeSystemHealth from '@/components/home/HomeSystemHealth';
import Link from 'next/link';
import { Bilingual } from '@/components/ui/Bilingual';

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
                                <Bilingual
                                    zh="市場導航儀"
                                    en="Market Navigator"
                                    mode="stacked"
                                    zhClassName="text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-2 gradient-text"
                                    enClassName="text-[11px] text-cyan-500/50 font-mono uppercase tracking-[0.3em] mb-2"
                                />
                                <div className="text-gray-400 text-lg font-light tracking-wide max-w-md mt-2">
                                    <Bilingual zh="即時監控全局宏觀指標，驅動精準 AI 決策路徑" en="Real-time global macro monitoring driving precise AI decisions" mode="stacked" />
                                </div>
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
                                <Bilingual
                                    zh="宏觀趨勢動態"
                                    en="Macro Trends"
                                    mode="stacked"
                                    zhClassName="text-2xl font-bold text-white/90"
                                    enClassName="text-[10px] uppercase tracking-widest font-mono text-cyan-500/50"
                                />
                            </h2>
                            <Link href="/macro" className="text-cyan-400 text-sm hover:underline">
                                <Bilingual zh="查看全部數據 →" en="View All Data →" mode="inline" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ChartWrapper titleZh="經濟成長" titleEn="GDP Growth QoQ" data={gdpData} color="#06B6D4" lucide={Activity} />
                            <ChartWrapper titleZh="消費者物價指數" titleEn="CPI Inflation YoY" data={cpiData} color="#3B82F6" lucide={Zap} />
                            <ChartWrapper titleZh="恐慌指數" titleEn="VIX Volatility" data={vixData} color="#EC4899" lucide={BarChart3} />
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
                                <Bilingual
                                    zh="智庫辯論報告"
                                    en="AI Reports"
                                    mode="stacked"
                                    zhClassName="text-2xl font-bold text-white/90"
                                    enClassName="text-[10px] uppercase tracking-widest font-mono text-blue-500/50"
                                />
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
                        <HomeSystemHealth />
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

function ChartWrapper({ titleZh, titleEn, data, color, lucide: Icon }: { titleZh: string, titleEn: string, data: any[], color: string, lucide: any }) {
    return (
        <div className="glass p-6 rounded-2xl glass-hover overflow-hidden h-64 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <Bilingual
                    zh={titleZh}
                    en={titleEn}
                    mode="suffix"
                    zhClassName="text-gray-300 text-sm font-bold tracking-wide"
                    enClassName="text-gray-500 text-[10px] font-mono uppercase tracking-tighter ml-2"
                />
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
                        <Bilingual zh="AI 分析報告" en="AI Analysis Report" mode="inline" zhClassName="text-cyan-400/80" enClassName="text-cyan-500/40 text-[10px] ml-1" />
                    </div>
                    <Bilingual
                        zh={report.report_type === 'dialectic' ? "市場趨勢深度辯論" : "AI 智能籌碼解析"}
                        en={report.report_type === 'dialectic' ? "Dialectic Analysis" : "Smart Money Insights"}
                        mode="stacked"
                        zhClassName="text-xl font-bold text-white/90 group-hover:text-cyan-400 transition-colors"
                        enClassName="text-[10px] text-gray-500 font-mono uppercase tracking-widest"
                    />
                    <p className="text-gray-400 text-sm line-clamp-1 font-light leading-relaxed mt-2">{report.summary}</p>
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
