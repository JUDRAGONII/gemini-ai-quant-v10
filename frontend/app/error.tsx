'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Next.js Global Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="glass max-w-md w-full p-8 rounded-2xl border border-red-500/20 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="text-red-500" size={32} />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">發生了些問題</h2>
                <p className="text-gray-400 mb-8">
                    抱歉，系統運作時出現預期外的錯誤。這可能是由於資料載入失敗或建置快取衝突所致。
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => reset()}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all font-medium border border-red-500/20"
                    >
                        <RefreshCcw size={18} />
                        嘗試重新整理
                    </button>

                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-all font-medium border border-white/10"
                    >
                        <Home size={18} />
                        返回首頁
                    </Link>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 pt-6 border-t border-white/5 text-left text-xs">
                        <p className="text-gray-500 font-mono break-all">
                            Digest: {error.digest || 'no-digest'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
