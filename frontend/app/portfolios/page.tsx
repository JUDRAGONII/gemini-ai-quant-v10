'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trash2, PieChart, Loader2, Wallet, Briefcase, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatErrorMessage } from '@/lib/errorUtils';

interface Portfolio {
    id: string;
    name: string;
    description: string | null;
    currency: string;
    is_default?: boolean;
    created_at: string;
}

export default function PortfoliosPage() {
    const router = useRouter(); // Though not explicitly used for push here yet
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [error, setError] = useState<string | null>(null);

    const fetchPortfolios = useCallback(async () => {
        try {
            const response = await fetch('/api/portfolios');
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to fetch portfolios');
            }
            const data = await response.json();
            setPortfolios(data);
        } catch (err: any) {
            console.error('Error fetching portfolios:', err);
            setError(formatErrorMessage(err.message));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPortfolios();
    }, [fetchPortfolios]);

    const handleCreate = async () => {
        if (!newName.trim()) return;

        setCreating(true);
        try {
            const response = await fetch('/api/portfolios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName, description: newDesc }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to create portfolio');
            }

            setNewName('');
            setNewDesc('');
            fetchPortfolios();
        } catch (err: any) {
            setError(formatErrorMessage(err.message));
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('確定要刪除此投資組合？此操作將同時刪除所有持股部位。')) return;

        try {
            const response = await fetch(`/api/portfolios?id=${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to delete portfolio');
            }

            fetchPortfolios();
        } catch (err: any) {
            setError(formatErrorMessage(err.message));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <section className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 tracking-tighter">
                            我的投資組合 <span className="text-sm font-medium text-emerald-500/60 uppercase tracking-widest ml-2">My Portfolios</span>
                        </h1>
                        <p className="text-gray-400 mt-2 flex items-center text-sm font-medium">
                            <Briefcase className="w-4 h-4 mr-2 text-emerald-400" />
                            管理您的多維度投資組合，實時追蹤資產績效表現
                        </p>
                    </div>
                </div>
            </section>

            {error && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm flex items-center"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    錯誤: {error}
                </motion.div>
            )}

            {/* Create Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -mr-32 -mt-32 transition-colors duration-700 group-hover:bg-emerald-500/10" />

                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                    <div className="flex-1 w-full space-y-2">
                        <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">
                            名稱 <span className="text-[8px] opacity-40">Portfolio Name</span>
                        </label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="輸入組合名稱 (如: 高股息成長)"
                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-white font-medium"
                        />
                    </div>

                    <div className="flex-1 w-full space-y-2">
                        <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">
                            描述 <span className="text-[8px] opacity-40">Description</span>
                        </label>
                        <input
                            type="text"
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                            placeholder="選填描述"
                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-white font-medium"
                        />
                    </div>

                    <button
                        onClick={handleCreate}
                        disabled={!newName.trim() || creating}
                        className="w-full md:w-auto mt-6 md:mt-0 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center justify-center disabled:opacity-50"
                    >
                        {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                <PlusCircle className="w-4 h-4 mr-2" />
                                建立 <span className="text-[10px] font-normal ml-1 opacity-70">CREATE</span>
                            </>
                        )}
                    </button>
                </div>
            </motion.div>

            {/* List Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-md relative"
            >
                <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <PieChart className="w-5 h-5 text-amber-400" />
                        </div>
                        持有列表 <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">Active Portfolios ({portfolios.length})</span>
                    </h2>
                </div>

                {portfolios.length === 0 ? (
                    <div className="p-20 text-center bg-white/[0.01]">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                            <Wallet className="w-10 h-10 text-gray-600" />
                        </div>
                        <p className="text-gray-400 text-xl font-bold">尚未建立任何投資組合</p>
                        <p className="text-gray-600 mt-2">建立一個投資組合來開始您的 AI 自動化監控旅程</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {portfolios.map((portfolio, index) => (
                            <motion.div
                                key={portfolio.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                                className="p-6 hover:bg-white/10 transition-all group relative overflow-hidden"
                            >
                                <div className="flex items-center justify-between relative z-10">
                                    <Link
                                        href={`/portfolios/${portfolio.id}`}
                                        className="flex items-center gap-6 flex-1"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                                            <PieChart className="w-7 h-7 text-indigo-400" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-xl font-black text-white group-hover:text-indigo-300 transition-colors">{portfolio.name}</span>
                                                {portfolio.is_default && (
                                                    <span className="text-[10px] font-bold px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30 uppercase tracking-tighter">
                                                        DEFAULT
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-xs font-medium">
                                                <span className="text-gray-500">
                                                    建立於 <span className="text-gray-400 font-mono">{new Date(portfolio.created_at).toLocaleDateString()}</span>
                                                </span>
                                                {portfolio.description && (
                                                    <span className="text-gray-600 italic">
                                                        — {portfolio.description}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>

                                    <button
                                        onClick={() => handleDelete(portfolio.id)}
                                        aria-label={`刪除 ${portfolio.name}`}
                                        className="ml-4 p-3 text-gray-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                                {/* Subtle Hover Background */}
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
