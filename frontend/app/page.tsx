import React from 'react';
import { supabase } from '@/lib/supabase';
import { Activity, TrendingUp, BarChart3, FileText, Settings, Cpu, Layers } from 'lucide-react';
import MacroChart from '@/components/MacroChart';

// 獲取特定指標的歷史數據
async function getIndicatorHistory(code: string, limit: number = 20) {
    const { data, error } = await supabase
        .from('macro_indicators')
        .select('value, reference_date')
        .eq('indicator_code', code)
        .order('reference_date', { ascending: true }) // Chart 需要時間正序
        .limit(limit);

    if (error) {
        console.error(`Error fetching ${code}:`, error);
        return [];
    }
    return data || [];
}

// 獲取最新 AI 報告
async function getRecentReports() {
    const { data, error } = await supabase
        .from('ai_reports')
        .select('*')
        .order('report_date', { ascending: false })
        .limit(3);

    if (error) {
        console.error('Error fetching reports:', error);
        return [];
    }
    return data || [];
}

// 設定 30 秒重新驗證 (ISR)
export const revalidate = 30;

export default async function Home() {
    // 平行抓取數據
    const [gdpData, cpiData, vixData, reports] = await Promise.all([
        getIndicatorHistory('GDP', 12),     // 季度數據，12點 = 3年
        getIndicatorHistory('CPI', 24),     // 月度數據，24點 = 2年
        getIndicatorHistory('VIX', 30),     // 日度數據，30點 = 1月
        getRecentReports()
    ]);

    return (
        <div className="flex min-h-screen bg-black text-gray-100 font-sans selection:bg-cyan-500/30">
            {/* Sidebar (Desktop) */}
            <aside className="w-64 glass m-4 mr-0 hidden lg:flex flex-col p-6 space-y-8 rounded-2xl border border-white/5">
                <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent flex items-center space-x-2">
                    <Cpu size={28} className="text-cyan-400" />
                    <span>AI QUANT</span>
                </div>
                <nav className="space-y-2">
                    <NavItem icon={<Activity />} label="總覽 (Overview)" active />
                    <NavItem icon={<Layers />} label="籌碼分析 (Chips)" href="/chips" />
                    <NavItem icon={<TrendingUp />} label="市場動態" href="/stocks" />
                    <NavItem icon={<BarChart3 />} label="演化分析" href="/evolution" />
                    <NavItem icon={<FileText />} label="決策報告" href="/ai/ranking" />
                </nav>
                <div className="mt-auto">
                    <NavItem icon={<Settings />} label="系統設定" href="/settings" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white/90">市場導航儀</h1>
                        <p className="text-gray-400 mt-1 font-light">即時監控全局宏觀指標與 AI 戰術報告</p>
                    </div>
                    <div className="flex space-x-4">
                        <StatusBadge label="AI Worker" status="online" />
                        <StatusBadge label="Database" status="online" />
                    </div>
                </header>

                {/* Macro Charts Section */}
                <section className="mb-10">
                    <h2 className="text-xl font-bold flex items-center space-x-2 mb-6 text-white/80">
                        <Activity className="text-cyan-400" />
                        <span>宏觀趨勢監控</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <MacroChart
                            title="GDP Growth"
                            data={gdpData}
                            dataKey="value"
                            color="#06B6D4" // Cyan
                        />
                        <MacroChart
                            title="CPI (Inflation)"
                            data={cpiData}
                            dataKey="value"
                            color="#F59E0B" // Amber
                        />
                        <MacroChart
                            title="VIX Volatility"
                            data={vixData}
                            dataKey="value"
                            color="#EC4899" // Pink
                        />
                    </div>
                </section>

                {/* AI Reports Section */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold flex items-center space-x-2 text-white/80">
                            <FileText className="text-blue-500" />
                            <span>最新多空辯論報告</span>
                        </h2>
                        {reports.length > 0 ? (
                            reports.map((report) => (
                                <ReportCard key={report.id} report={report} />
                            ))
                        ) : (
                            <div className="glass p-10 text-center text-gray-500 italic rounded-xl border border-dashed border-gray-700">
                                暫無 AI 報告生成。請檢查 ETL 排程。
                            </div>
                        )}
                    </div>

                    {/* System Status / Mini Logs */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white/80">系統狀態樞紐</h2>
                        <div className="glass p-6 space-y-6 rounded-xl border border-white/5 bg-white/5">
                            <StatusRow label="Gemini API" value="Connected" color="text-green-400" />
                            <StatusRow label="Fred Data Source" value="Active" color="text-green-400" />
                            <StatusRow label="Last Sync" value="Just now" color="text-gray-400" />

                            <div className="pt-4 border-t border-white/10">
                                <p className="text-xs text-gray-500 leading-relaxed font-mono">
                                    System running in optimized mode.
                                    Version 10.0 (Build 2026.01.22)
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

// --- Helper Components ---
// Dashboard is dynamic
export const dynamic = 'force-dynamic';

import Link from 'next/link';

function NavItem({ icon, label, active = false, href = "#" }: { icon: React.ReactNode, label: string, active?: boolean, href?: string }) {
    return (
        <Link href={href} className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${active
            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}>
            {React.cloneElement(icon as React.ReactElement, { size: 20 })}
            <span className="font-medium">{label}</span>
        </Link>
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

function StatusRow({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">{label}</span>
            <span className={`text-sm font-bold ${color}`}>{value}</span>
        </div>
    );
}

function ReportCard({ report }: { report: any }) {
    return (
        <Link href={`/ai/${report.id}`} className="block">
            <div className="glass p-6 space-y-4 rounded-xl border border-white/5 hover:border-blue-500/50 transition-all duration-300 group relative overflow-hidden cursor-pointer">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-cyan-500 group-hover:w-1.5 transition-all"></div>
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-bold border border-blue-500/30">
                            {report.stock_code}
                        </span>
                        <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition">市場分析報告</h3>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">{report.report_date}</span>
                </div>
                <p className="text-gray-300 leading-relaxed text-sm line-clamp-3">
                    {report.summary}
                </p>
                <div className="text-cyan-400 text-sm font-medium flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                    <span>深入閱讀</span>
                    <span>→</span>
                </div>
            </div>
        </Link>
    );
}
