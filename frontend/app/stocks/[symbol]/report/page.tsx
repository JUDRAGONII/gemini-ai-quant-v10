'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    Calendar, FileText, TrendingUp, TrendingDown,
    AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';
import ScoreRadarChart from '@/components/ScoreRadarChart';
import { motion } from 'framer-motion';

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) throw new Error('Failed to fetch report');
    return res.json();
});

function getScoreGrade(score: number) {
    if (score >= 80) return { label: 'S', color: '#10B981', text: '極佳', bg: 'bg-green-500/10' };
    if (score >= 70) return { label: 'A', color: '#22C55E', text: '優秀', bg: 'bg-emerald-500/10' };
    if (score >= 60) return { label: 'B', color: '#F59E0B', text: '良好', bg: 'bg-amber-500/10' };
    if (score >= 50) return { label: 'C', color: '#EAB308', text: '一般', bg: 'bg-yellow-500/10' };
    return { label: 'D', color: '#EF4444', text: '弱勢', bg: 'bg-red-500/10' };
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
        <div className="glass p-4 rounded-xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
                <Icon size={14} className={color} />
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-white">{value}</span>
                {trend && (
                    trend === 'up' ? <TrendingUp size={14} className="text-green-400" />
                        : trend === 'down' ? <TrendingDown size={14} className="text-red-400" />
                            : null
                )}
            </div>
            {subValue && <span className="text-[10px] text-gray-500">{subValue}</span>}
        </div>
    );
}

export default function StockReportPage() {
    const params = useParams();
    const symbol = params?.symbol as string;

    // 我們需要建立一個新的 API endpoint 來獲取「最新」報告，或者直接在 API 路徑中過濾
    // 這裡我們暫時假設 /api/ai/reports/latest?symbol=XXX 存在，或者我們修改 /api/ai/reports
    const { data: report, error, isLoading } = useSWR(
        symbol ? `/api/ai/reports?symbol=${symbol}&latest=true` : null,
        fetcher
    );

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500" />
                <p className="text-gray-500 text-sm animate-pulse">Gemini 正在調取深度分析資料...</p>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="p-12 text-center bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-sm">
                <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="text-amber-500" size={32} />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">暫無 AI 決策報告</h1>
                <p className="text-gray-400 max-w-md mx-auto">
                    目前尚未針對 {symbol} 生成最新的 AI 量化決策報告。
                    請嘗試其他標的，或至「智慧策略看板」啟動新的分析流程。
                </p>
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
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* 1. Header Summary */}
            <header className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className={`px-4 py-2 rounded-2xl ${grade.bg} border border-${grade.color === '#10B981' ? 'green' : 'amber'}-500/20 flex flex-col items-center`}>
                            <span className="text-3xl font-black" style={{ color: grade.color }}>{grade.label}</span>
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">AI Grade</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{report.title}</h2>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-amber-400 font-mono">Quant V2.1 • Gemini Pro</span>
                                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                    <Calendar size={10} />
                                    {new Date(report.report_date).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                    {report.summary && (
                        <p className="text-gray-400 leading-relaxed text-sm bg-white/5 p-4 rounded-2xl border border-white/10">
                            {report.summary}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3 w-full lg:w-96">
                    <StatCard
                        label="AI 評級"
                        value={report.ai_rating || '買進'}
                        icon={CheckCircle}
                        color="text-emerald-400"
                    />
                    <StatCard
                        label="綜合得分"
                        value={`${report.composite_score || 75}`}
                        subValue="加權總和"
                        icon={FileText}
                        color="text-amber-400"
                    />
                    <StatCard
                        label="推薦理由"
                        value={grade.text}
                        subValue="模型判讀"
                        icon={Activity === undefined ? FileText : Activity}
                        color="text-indigo-400"
                    />
                    <StatCard
                        label="信賴度"
                        value={report.confidence || '高'}
                        icon={AlertTriangle}
                        color="text-purple-400"
                    />
                </div>
            </header>

            {/* 2. Main Analysis Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-8">
                    {/* 詳細內容 */}
                    <article className="glass p-8 rounded-[2.5rem] border border-white/10 bg-white/[0.01] backdrop-blur-md prose prose-invert prose-amber max-w-none 
                        prose-headings:text-white prose-headings:font-black
                        prose-p:text-gray-300 prose-p:leading-relaxed prose-p:text-sm
                        prose-strong:text-amber-400
                        prose-li:text-gray-300 prose-li:text-sm
                        prose-blockquote:border-l-amber-500 prose-blockquote:bg-white/5
                    ">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {report.full_content || "_分析內容正由 AI 生成中，請稍候..._"}
                        </ReactMarkdown>
                    </article>
                </div>

                <div className="space-y-6">
                    {/* 雷達圖 */}
                    <ScoreRadarChart
                        symbol={symbol}
                        data={radarData}
                        customScore={report.composite_score}
                        size={240}
                    />

                    {/* 關鍵價位卡片 */}
                    <div className="glass p-6 rounded-3xl border border-white/10 space-y-4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp size={14} className="text-amber-500" />
                            關鍵價位參考
                        </h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-xs text-gray-400">目標價</span>
                                <span className="text-emerald-400 font-mono font-bold">$ {report.target_price || '--'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-xs text-gray-400">獲利點 (TP)</span>
                                <span className="text-amber-400 font-mono font-bold">$ {report.stop_profit || '--'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-xs text-gray-400">停損點 (SL)</span>
                                <span className="text-red-400 font-mono font-bold">$ {report.stop_loss || '--'}</span>
                            </div>
                        </div>
                    </div>

                    {/* 風險提示 */}
                    <div className="p-5 rounded-3xl bg-red-500/5 border border-red-500/10">
                        <div className="flex items-center gap-2 text-red-400 mb-2">
                            <AlertTriangle size={16} />
                            <span className="text-xs font-bold uppercase">Risk Disclaimer</span>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                            AI 生成報告僅供參考，不代表本平台之正式投資建議。投資人應獨立判斷並承擔市場風險。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Activity(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
