"use client";

import React from 'react';
import Link from 'next/link';
import { Search, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="glass max-w-md w-full p-10 rounded-3xl border border-white/10 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-8 animate-pulse">
                    <Search className="text-gray-400" size={40} />
                </div>

                <h2 className="text-3xl font-bold text-white mb-4">404 - 找不到頁面</h2>
                <p className="text-gray-400 mb-10 leading-relaxed">
                    抱歉，您所尋找的頁面不存在。這可能是網址輸入錯誤，或是該分析報告已被移除。
                </p>

                <div className="flex flex-col gap-4">
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl transition-all font-bold shadow-lg shadow-emerald-500/20"
                    >
                        <Home size={20} />
                        返回首頁
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center justify-center gap-2 w-full py-4 bg-white/5 hover:bg-white/10 text-gray-300 rounded-2xl transition-all font-medium border border-white/10"
                    >
                        <ArrowLeft size={20} />
                        返回上一頁
                    </button>
                </div>
            </div>
        </div>
    );
}
