import { supabase } from '@/lib/supabase';
import { Activity, TrendingUp, BarChart3, FileText, Settings } from 'lucide-react';

// 獲取最新宏觀數據
async function getMacroData() {
    const { data, error } = await supabase
        .table('macro_indicators')
        .select('*')
        .order('reference_date', { ascending: false })
        .limit(6);

    if (error) {
        console.error('Error fetching macro data:', error);
        return [];
    }
    return data;
}

// 獲取最新 AI 報告
async function getRecentReports() {
    const { data, error } = await supabase
        .table('ai_reports')
        .select('*')
        .order('report_date', { ascending: false })
        .limit(3);

    if (error) {
        console.error('Error fetching reports:', error);
        return [];
    }
    return data;
}

export default async function Home() {
    const macroData = await getMacroData();
    const reports = await getRecentReports();

    return (
        <div className="flex min-h-screen">
            {/* Sidebar Placeholder */}
            <aside className="w-64 glass m-4 mr-0 hidden lg:flex flex-col p-6 space-y-8">
                <div className="text-2xl font-bold gradient-text">AI QUANT V10</div>
                <nav className="space-y-4">
                    <a href="#" className="flex items-center space-x-3 text-blue-400 font-medium">
                        <Activity size={20} />
                        <span>概覽 (Overview)</span>
                    </a>
                    <a href="#" className="flex items-center space-x-3 text-gray-400 hover:text-white transition">
                        <TrendingUp size={20} />
                        <span>市場動態</span>
                    </a>
                    <a href="#" className="flex items-center space-x-3 text-gray-400 hover:text-white transition">
                        <BarChart3 size={20} />
                        <span>演化分析</span>
                    </a>
                    <a href="#" className="flex items-center space-x-3 text-gray-400 hover:text-white transition">
                        <FileText size={20} />
                        <span>決策報告</span>
                    </a>
                </nav>
                <div className="mt-auto">
                    <a href="#" className="flex items-center space-x-3 text-gray-400 hover:text-white transition">
                        <Settings size={20} />
                        <span>系統設定</span>
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold">市場導航儀</h1>
                        <p className="text-gray-400 mt-1">即時監控全局宏觀指標與 AI 戰術報告</p>
                    </div>
                    <div className="flex space-x-4">
                        <div className="glass px-4 py-2 flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-sm font-medium">AI Worker Online</span>
                        </div>
                    </div>
                </header>

                {/* Macro Statistics */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {macroData.length > 0 ? (
                        macroData.map((item) => (
                            <div key={item.indicator_code} className="glass p-6 hover:border-blue-500/50 transition cursor-pointer group">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-gray-400 text-sm font-mono">{item.indicator_code}</span>
                                    <BarChart3 size={16} className="text-blue-500 opacity-0 group-hover:opacity-100 transition" />
                                </div>
                                <div className="text-2xl font-bold mb-1">{item.value.toLocaleString()}</div>
                                <div className="text-xs text-gray-500">更新日期: {item.reference_date}</div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-20 text-gray-500 italic">
                            尚未有宏觀數據。請確保 AI Worker 已正確運行 ETL 任務。
                        </div>
                    )}
                </section>

                {/* AI Reports & Details */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold flex items-center space-x-2">
                            <FileText size={22} className="text-blue-500" />
                            <span>最新多空辯論報告</span>
                        </h2>
                        {reports.length > 0 ? (
                            reports.map((report) => (
                                <div key={report.id} className="glass p-6 space-y-4 border-l-4 border-l-blue-500">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-lg">{report.stock_code} 分析報告</h3>
                                        <span className="text-sm text-gray-500">{report.report_date}</span>
                                    </div>
                                    <p className="text-gray-300 leading-relaxed text-sm">
                                        {report.summary}
                                    </p>
                                    <button className="text-blue-400 text-sm font-medium hover:underline">
                                        讀取詳細辯論過程 →
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="glass p-10 text-center text-gray-500 italic">
                                暫無 AI 報告生成。
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-xl font-bold">系統狀態樞紐</h2>
                        <div className="glass p-6 space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Database Connection</span>
                                <span className="text-green-500 text-sm font-bold">HEALTHY</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Prefect Scheduler</span>
                                <span className="text-green-500 text-sm font-bold">ACTIVE</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Gemini API Quota</span>
                                <span className="text-yellow-500 text-sm font-bold">LIMIT REACHED</span>
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    系統當前正處於「無縫接軌」開發模式。所有核心任務日誌已同步至 0-0 目錄。
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
