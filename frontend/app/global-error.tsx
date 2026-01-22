'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="zh-TW">
            <body className="bg-slate-950 text-white min-h-screen flex items-center justify-center p-4">
                <div className="glass p-8 rounded-2xl border border-red-500/20 text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="text-red-500" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">系統核心發生錯誤</h2>
                    <p className="text-gray-400 mb-8">
                        根佈區 (Root Layout) 載入失敗。這通常發生在快取衝突或全域組件崩潰時。
                    </p>
                    <button
                        onClick={() => reset()}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-medium"
                    >
                        <RefreshCw size={18} />
                        強制重置並重試
                    </button>
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-6 text-xs text-gray-600 text-left bg-black/20 p-4 rounded-lg overflow-auto">
                            <p className="font-mono">{error.message}</p>
                            <p className="mt-2 text-[10px] opacity-50">{error.stack}</p>
                        </div>
                    )}
                </div>
            </body>
        </html>
    );
}
