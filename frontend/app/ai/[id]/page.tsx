import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Calendar, FileText, Tag, Share2, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import ScoreRadarChart from '@/components/ScoreRadarChart';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: {
        id: string;
    }
}

async function getReport(id: string) {
    const { data, error } = await supabase
        .from('ai_reports')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error("Fetch report error:", error);
        return null;
    }
    return data;
}

function getScoreGrade(score: number) {
    if (score >= 80) return { label: 'S', color: '#10B981', text: '極佳' };
    if (score >= 70) return { label: 'A', color: '#22C55E', text: '優秀' };
    if (score >= 60) return { label: 'B', color: '#F59E0B', text: '良好' };
    if (score >= 50) return { label: 'C', color: '#EAB308', text: '一般' };
    return { label: 'D', color: '#EF4444', text: '弱勢' };
}

function StatCard({ label, value, subValue, trend, icon: Icon, color }: {
    label: string;
    value: string;
    subValue?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon: any;
    color: string;
}) {
    return (
        <div className="glass p-4 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">{label}</span>
                <Icon size={16} className={color} />
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-white">{value}</span>
                {trend && (
                    trend === 'up' ? <TrendingUp size={14} className="text-green-400" />
                    : trend === 'down' ? <TrendingDown size={14} className="text-red-400" />
                    : null
                )}
            </div>
            {subValue && <span className="text-xs text-gray-500">{subValue}</span>}
        </div>
    );
}

function ScoreCard({ label, score, maxScore = 100 }: { label: string; score: number; maxScore?: number }) {
    const percentage = (score / maxScore) * 100;
    const grade = getScoreGrade(score);
    
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">{label}</span>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: grade.color }}>{score}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-gray-400">{grade.label}</span>
                </div>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
                <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                        width: `${percentage}%`,
                        backgroundColor: grade.color,
                    }}
                />
            </div>
        </div>
    );
}

export default async function ReportPage({ params }: PageProps) {
    const report = await getReport(params.id);

    if (!report) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-gray-400">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">找不到報告</h1>
                    <p className="mb-4">報告可能已被刪除或發生錯誤</p>
                    <Link href="/ai/ranking" className="text-cyan-400 hover:underline">返回列表</Link>
                </div>
            </div>
        );
    }

    const grade = getScoreGrade(report.composite_score || 75);

    const radarData = [
        { dimension: '價值', fullMark: 100, score: report.value_score || 70 },
        { dimension: '成長', fullMark: 100, score: report.growth_score || 70 },
        { dimension: '動能', fullMark: 100, score: report.momentum_score || 70 },
        { dimension: '品質', fullMark: 100, score: report.quality_score || 70 },
        { dimension: '籌碼', fullMark: 100, score: report.chip_score || 70 },
    ];

    return (
        <div className="min-h-screen bg-black text-gray-100 selection:bg-cyan-500/30 pb-20">
            <nav className="glass sticky top-0 z-50 border-b border-white/10 backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/ai/ranking" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
                        <ArrowLeft size={20} />
                        <span>返回列表</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-xs px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            {report.stock_code}
                        </span>
                        <button className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-cyan-400 transition">
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-4 mt-8">
                <header className="mb-8">
                    <div className="flex items-start justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <h1 className="text-3xl font-bold text-white">{report.stock_name || report.stock_code}</h1>
                                <span className="text-lg text-gray-500">({report.stock_code})</span>
                            </div>
                            <p className="text-gray-400 mb-4">AI 量化投資分析報告</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    <span>{report.report_date || new Date(report.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <FileText size={14} />
                                    <span>AI Quant Engine V10.0</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold" style={{ color: grade.color }}>{grade.label}</span>
                                <span className="text-xs text-gray-400">{report.composite_score || 75}分</span>
                            </div>
                            <span className="text-xs text-gray-500 mt-1 block">{grade.text}</span>
                        </div>
                    </div>
                </header>

                {report.summary && (
                    <div className="glass p-6 rounded-2xl border-l-4 border-l-cyan-500 mb-8 bg-gradient-to-r from-cyan-900/10 to-transparent">
                        <h3 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">
                            <FileText size={18} />
                            <span>執行摘要</span>
                        </h3>
                        <p className="text-gray-200 leading-relaxed text-lg">
                            {report.summary}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass p-6 rounded-2xl border border-white/10">
                            <h3 className="text-lg font-semibold text-white mb-4">績效儀表板</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <StatCard
                                    label="當前價格"
                                    value={report.current_price || '--'}
                                    subValue={report.price_change ? `${report.price_change > 0 ? '+' : ''}${report.price_change}%` : undefined}
                                    trend={report.price_change && report.price_change > 0 ? 'up' : report.price_change && report.price_change < 0 ? 'down' : undefined}
                                    icon={TrendingUp}
                                    color="text-cyan-400"
                                />
                                <StatCard
                                    label="綜合評分"
                                    value={`${report.composite_score || 75}`}
                                    subValue="究極版評分"
                                    icon={FileText}
                                    color="text-amber-400"
                                />
                                <StatCard
                                    label="AI 評級"
                                    value={report.ai_rating || '買進'}
                                    subValue="操作建議"
                                    icon={CheckCircle}
                                    color="text-green-400"
                                />
                                <StatCard
                                    label="信賴度"
                                    value={report.confidence || '高'}
                                    subValue="模型信心"
                                    icon={AlertTriangle}
                                    color="text-purple-400"
                                />
                            </div>
                        </div>

                        <div className="glass p-6 rounded-2xl border border-white/10">
                            <h3 className="text-lg font-semibold text-white mb-4">多維度評分</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <ScoreCard label="價值維度" score={report.value_score || 70} />
                                    <ScoreCard label="成長維度" score={report.growth_score || 70} />
                                    <ScoreCard label="動能維度" score={report.momentum_score || 70} />
                                </div>
                                <div className="space-y-4">
                                    <ScoreCard label="品質維度" score={report.quality_score || 70} />
                                    <ScoreCard label="籌碼維度" score={report.chip_score || 70} />
                                </div>
                            </div>
                        </div>

                        <div className="glass p-6 rounded-2xl border border-white/10">
                            <h3 className="text-lg font-semibold text-white mb-4">風險評估</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                    <span className="text-gray-400">波動風險</span>
                                    <span className={`px-2 py-1 rounded text-xs ${report.volatility_risk === '低' ? 'bg-green-500/20 text-green-400' : report.volatility_risk === '中' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {report.volatility_risk || '中'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                    <span className="text-gray-400">流動性風險</span>
                                    <span className={`px-2 py-1 rounded text-xs ${report.liquidity_risk === '低' ? 'bg-green-500/20 text-green-400' : report.liquidity_risk === '中' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {report.liquidity_risk || '低'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                    <span className="text-gray-400">基本面風險</span>
                                    <span className={`px-2 py-1 rounded text-xs ${report.fundamental_risk === '低' ? 'bg-green-500/20 text-green-400' : report.fundamental_risk === '中' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {report.fundamental_risk || '低'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <ScoreRadarChart
                            symbol={report.stock_code}
                            data={radarData}
                            size={260}
                            color="#F59E0B"
                            showLegend={true}
                        />

                        <div className="glass p-5 rounded-xl border border-white/10">
                            <h4 className="text-sm font-semibold text-gray-400 mb-3">關鍵價位</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-sm">目標價</span>
                                    <span className="text-green-400 font-mono">{report.target_price || '--'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-sm">停利點</span>
                                    <span className="text-amber-400 font-mono">{report.stop_profit || '--'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-sm">停損點</span>
                                    <span className="text-red-400 font-mono">{report.stop_loss || '--'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="glass p-5 rounded-xl border border-white/10">
                            <h4 className="text-sm font-semibold text-gray-400 mb-3">投資建議</h4>
                            <div className={`p-4 rounded-lg ${report.ai_rating === '買進' || report.ai_rating === '強力買進' ? 'bg-green-500/10 border border-green-500/20' : report.ai_rating === '中性持有' ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    {report.ai_rating === '買進' || report.ai_rating === '強力買進' ? <CheckCircle size={18} className="text-green-400" /> : report.ai_rating === '減碼' || report.ai_rating === '賣出' ? <XCircle size={18} className="text-red-400" /> : <AlertTriangle size={18} className="text-yellow-400" />}
                                    <span className="font-semibold">{report.ai_rating || '中性持有'}</span>
                                </div>
                                <p className="text-xs text-gray-400">{report.recommendation_reason || '基於多維度評估，建議適當持有'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass p-6 rounded-2xl border border-white/10 mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4">詳細分析</h3>
                    <article className="prose prose-invert prose-lg max-w-none 
                        prose-headings:text-gray-100 prose-headings:font-bold 
                        prose-p:text-gray-300 prose-p:leading-relaxed
                        prose-strong:text-cyan-400
                        prose-ul:text-gray-300
                        prose-li:marker:text-cyan-500
                        prose-blockquote:border-l-cyan-500 prose-blockquote:bg-white/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic prose-blockquote:rounded-r-lg
                        prose-table:border-collapse prose-table:border prose-table:border-gray-700
                        prose-th:bg-white/5 prose-th:p-4 prose-th:text-white
                        prose-td:p-4 prose-td:border-t prose-td:border-gray-800
                        prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
                    ">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {report.full_content || "_暫無詳細內容_"}
                        </ReactMarkdown>
                    </article>
                </div>

                <div className="mt-20 pt-10 border-t border-white/10 text-center text-gray-500 text-sm">
                    <p>Generated by AI Quant V10.0 • {new Date(report.created_at).toLocaleString()}</p>
                    <p className="mt-1">數據僅供參考，不構成投資建議</p>
                </div>
            </main>
        </div>
    );
}
