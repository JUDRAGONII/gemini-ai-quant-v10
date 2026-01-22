import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Calendar, FileText, Tag, Share2 } from 'lucide-react';

// 設定 60 秒 Revalidate，讓報告內容保持相對新鮮
export const revalidate = 60;

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

export default async function ReportPage({ params }: PageProps) {
    const report = await getReport(params.id);

    if (!report) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-gray-400">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Report Not Found</h1>
                    <p className="mb-4">Or connection error.</p>
                    <Link href="/" className="text-cyan-400 hover:underline">Return Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-gray-100 selection:bg-cyan-500/30 pb-20">
            {/* Header / Nav */}
            <nav className="glass sticky top-0 z-50 border-b border-white/10 backdrop-blur-md">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2 text-gray-400 hover:text-white transition">
                        <ArrowLeft size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <div className="flex items-center space-x-4">
                        <button className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-cyan-400 transition">
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content Article */}
            <main className="max-w-4xl mx-auto px-4 mt-10">
                {/* Meta Header */}
                <header className="mb-10 text-center">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
                        <Tag size={14} />
                        <span className="text-sm font-bold tracking-wider">{report.stock_code}</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-6 leading-tight">
                        多空辯論分析報告
                    </h1>

                    <div className="flex items-center justify-center space-x-6 text-gray-500 text-sm">
                        <div className="flex items-center space-x-2">
                            <Calendar size={16} />
                            <span>{report.report_date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <FileText size={16} />
                            <span>AI Quant Engine</span>
                        </div>
                    </div>
                </header>

                {/* Summary Card */}
                {report.summary && (
                    <div className="glass p-6 md:p-8 rounded-2xl border-l-4 border-l-cyan-500 mb-12 bg-gradient-to-br from-cyan-900/10 to-transparent">
                        <h3 className="text-cyan-400 font-bold mb-3 flex items-center space-x-2">
                            <FileText size={18} />
                            <span>Executive Summary</span>
                        </h3>
                        <p className="text-gray-300 leading-relaxed text-lg italic">
                            {report.summary}
                        </p>
                    </div>
                )}

                {/* Markdown Content */}
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
                        {report.full_content || "_No content available._"}
                    </ReactMarkdown>
                </article>

                {/* Footer */}
                <div className="mt-20 pt-10 border-t border-white/10 text-center text-gray-500 text-sm">
                    Generated by AI Quant V10.0 • {new Date(report.created_at).toLocaleString()}
                </div>
            </main>
        </div>
    );
}
