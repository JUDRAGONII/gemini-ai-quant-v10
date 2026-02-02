'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStockDetail } from '@/hooks/useStockDetail';
import { ArrowLeft, TrendingUp, BarChart3, PieChart, Layers, Activity, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StockDetailLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: { symbol: string };
}) {
    const { data } = useStockDetail(params.symbol); // SWR handles deduplication
    const pathname = usePathname();

    // Tabs Configuration
    const tabs = [
        { name: '總覽', path: `/stocks/${params.symbol}`, icon: <Activity className="w-4 h-4" /> },
        { name: 'AI 決策報告', path: `/stocks/${params.symbol}/report`, icon: <FileText className="w-4 h-4" /> },
        { name: '籌碼分析', path: `/stocks/${params.symbol}/chips`, icon: <Layers className="w-4 h-4" /> },
        { name: '財務報表', path: `/stocks/${params.symbol}/financials`, icon: <PieChart className="w-4 h-4" /> },
        { name: '技術分析', path: `/stocks/${params.symbol}/technical`, icon: <BarChart3 className="w-4 h-4" /> },
    ];

    const isActive = (path: string) => pathname === path;

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-gray-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* 1. Shared Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-2">
                        <Link
                            href="/stocks"
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all group"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            返回行情中心
                        </Link>
                        <div className="flex items-baseline gap-3">
                            {data ? (
                                <>
                                    <h1 className="text-4xl font-bold tracking-tight text-white">{data.metadata.name}</h1>
                                    <span className="text-xl font-mono text-gray-500">{data.metadata.symbol}</span>
                                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                        {data.metadata.market}
                                    </span>
                                </>
                            ) : (
                                // Skeleton for Header
                                <div className="h-10 w-48 bg-white/10 rounded animate-pulse"></div>
                            )}
                        </div>
                    </div>

                    <div className="text-right">
                        {data ? (
                            <>
                                <div className="text-3xl font-mono font-bold text-white">
                                    ${data.summary_stats.last_price?.toLocaleString() || '--'}
                                </div>
                                <div className="text-sm font-medium text-emerald-400 flex items-center justify-end">
                                    <TrendingUp className="w-4 h-4 mr-1" /> 即時行情 (模擬)
                                </div>
                            </>
                        ) : (
                            <div className="h-8 w-32 bg-white/10 rounded animate-pulse ml-auto"></div>
                        )}
                    </div>
                </div>

                {/* 2. Tab Navigation */}
                <div className="flex items-center space-x-1 border-b border-white/10 pb-1 overflow-x-auto">
                    {tabs.map((tab) => {
                        const active = isActive(tab.path);
                        return (
                            <Link key={tab.path} href={tab.path}>
                                <div className={`
                                    relative px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2
                                    ${active ? 'text-white bg-white/5 border-t border-x border-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}
                                `}>
                                    {tab.icon}
                                    {tab.name}
                                    {active && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-[#0a0a0b]" // Covers the border-b
                                        />
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* 3. Page Content */}
                <div className="min-h-[500px]">
                    {children}
                </div>
            </div>
        </div>
    );
}
