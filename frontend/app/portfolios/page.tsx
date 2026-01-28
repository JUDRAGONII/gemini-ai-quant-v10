'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, TrendingUp, TrendingDown, PieChart, Loader2, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Portfolio {
    id: string;
    name: string;
    description: string | null;
    currency: string;
    is_default?: boolean;
    created_at: string;
}

export default function PortfoliosPage() {
    const router = useRouter();
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [error, setError] = useState<string | null>(null);

    const fetchPortfolios = useCallback(async () => {
        try {
            const response = await fetch('/api/portfolios');
            if (!response.ok) throw new Error('Failed to fetch portfolios');
            const data = await response.json();
            setPortfolios(data);
        } catch (err: any) {
            console.error('Error fetching portfolios:', err);
            setError(err.message);
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
            setError(err.message);
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

            if (!response.ok) throw new Error('Failed to delete portfolio');

            fetchPortfolios();
        } catch (err: any) {
            setError(err.message);
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
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold mb-2">我的投資組合</h1>
                <p className="text-gray-400">管理您的投資組合，追蹤績效表現</p>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl"
                >
                    {error}
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm"
            >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-400" />
                    新增投資組合
                </h2>

                <div className="flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="投資組合名稱"
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                    <input
                        type="text"
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        placeholder="描述（選填）"
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                        onClick={handleCreate}
                        disabled={!newName.trim() || creating}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                    >
                        {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : '建立'}
                    </button>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm"
            >
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-amber-400" />
                        投資組合列表 ({portfolios.length})
                    </h2>
                </div>

                {portfolios.length === 0 ? (
                    <div className="p-12 text-center">
                        <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">尚未建立任何投資組合</p>
                        <p className="text-sm text-gray-500 mt-1">建立投資組合開始追蹤您的投資</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {portfolios.map((portfolio) => (
                            <div
                                key={portfolio.id}
                                className="p-4 hover:bg-white/5 transition-colors group"
                            >
                                <div className="flex items-center justify-between">
                                    <Link
                                        href={`/portfolios/${portfolio.id}`}
                                        className="flex items-center gap-3 flex-1"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                            <PieChart className="w-6 h-6 text-indigo-400" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold">{portfolio.name}</span>
                                                {portfolio.is_default && (
                                                    <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full">
                                                        預設
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                建立時間：{new Date(portfolio.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </Link>

                                    <button
                                        onClick={() => handleDelete(portfolio.id)}
                                        aria-label={`刪除 ${portfolio.name}`}
                                        className="ml-4 p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
