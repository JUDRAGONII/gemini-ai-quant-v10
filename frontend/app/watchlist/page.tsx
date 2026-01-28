'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trash2, Plus, TrendingUp, TrendingDown, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface WatchlistItem {
    id: string;
    stock_code: string;
    stock_name: string;
    market: string;
    notes: string | null;
    created_at: string;
}

interface StockQuote {
    code: string;
    name: string;
    price: number;
    change: number;
    change_percent: number;
    volume: number;
}

export default function WatchlistPage() {
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [quotes, setQuotes] = useState<{ [key: string]: StockQuote }>({});
    const [loading, setLoading] = useState(true);
    const [addingStock, setAddingStock] = useState(false);
    const [newStockCode, setNewStockCode] = useState('');
    const [searchResult, setSearchResult] = useState<StockQuote | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchWatchlist = useCallback(async () => {
        try {
            const response = await fetch('/api/watchlist');
            if (!response.ok) throw new Error('Failed to fetch watchlist');
            const data = await response.json();
            setWatchlist(data);
        } catch (err: any) {
            console.error('Error fetching watchlist:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchQuotes = useCallback(async () => {
        if (watchlist.length === 0) return;

        const codes = watchlist.map(item => item.stock_code);
        try {
            const response = await fetch(`/api/stocks/quotes?codes=${codes.join(',')}`);
            if (!response.ok) throw new Error('Failed to fetch quotes');
            const data = await response.json();
            setQuotes(data);
        } catch (err: any) {
            console.error('Error fetching quotes:', err);
        }
    }, [watchlist]);

    useEffect(() => {
        fetchWatchlist();
    }, [fetchWatchlist]);

    useEffect(() => {
        if (watchlist.length > 0) {
            fetchQuotes();
            const interval = setInterval(fetchQuotes, 60000);
            return () => clearInterval(interval);
        }
    }, [watchlist, fetchQuotes]);

    const handleAddStock = async () => {
        if (!newStockCode.trim()) return;

        setAddingStock(true);
        try {
            const response = await fetch('/api/watchlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stock_code: newStockCode.toUpperCase() }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to add stock');
            }

            setNewStockCode('');
            setSearchResult(null);
            fetchWatchlist();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setAddingStock(false);
        }
    };

    const handleRemoveStock = async (id: string) => {
        if (!confirm('確定要移除此股票？')) return;

        try {
            const response = await fetch(`/api/watchlist?id=${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to remove stock');

            fetchWatchlist();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleSearchStock = async () => {
        if (!newStockCode.trim()) return;

        try {
            const response = await fetch(`/api/stocks/${newStockCode}/quote`);
            if (!response.ok) throw new Error('Stock not found');

            const data = await response.json();
            setSearchResult({
                code: data.stock_code,
                name: data.stock_name,
                price: data.quote.price,
                change: data.quote.change,
                change_percent: data.quote.change_percent,
                volume: data.quote.volume,
            });
        } catch (err: any) {
            setError('股票代碼不存在');
            setSearchResult(null);
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
                <h1 className="text-2xl font-bold mb-2">我的自選股</h1>
                <p className="text-gray-400">追蹤您關注的股票，即時掌握行情變化</p>
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
                    新增股票
                </h2>

                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={newStockCode}
                            onChange={(e) => setNewStockCode(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchStock()}
                            placeholder="輸入股票代碼 (如 2330, AAPL)"
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                    <button
                        onClick={handleSearchStock}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors"
                    >
                        查詢
                    </button>
                    <button
                        onClick={handleAddStock}
                        disabled={!searchResult || addingStock}
                        className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {addingStock ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        新增
                    </button>
                </div>

                <AnimatePresence>
                    {searchResult && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-bold">{searchResult.code}</span>
                                        <span className="text-gray-400">{searchResult.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-2xl font-mono font-bold">
                                            {searchResult.price.toFixed(2)}
                                        </span>
                                        <span className={`flex items-center gap-1 ${searchResult.change >= 0 ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                            {searchResult.change >= 0 ? (
                                                <TrendingUp className="w-4 h-4" />
                                            ) : (
                                                <TrendingDown className="w-4 h-4" />
                                            )}
                                            {searchResult.change >= 0 ? '+' : ''}
                                            {searchResult.change.toFixed(2)} ({searchResult.change_percent.toFixed(2)}%)
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleAddStock}
                                    disabled={addingStock}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    加入自選
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm"
            >
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-400" />
                        自選股清單 ({watchlist.length})
                    </h2>
                </div>

                {watchlist.length === 0 ? (
                    <div className="p-12 text-center">
                        <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">尚未加入任何股票</p>
                        <p className="text-sm text-gray-500 mt-1">在上方搜尋並加入您關注的股票</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {watchlist.map((item) => {
                            const quote = quotes[item.stock_code];
                            return (
                                <div
                                    key={item.id}
                                    className="p-4 hover:bg-white/5 transition-colors group"
                                >
                                    <div className="flex items-center justify-between">
                                        <Link
                                            href={`/stocks/${item.stock_code}`}
                                            className="flex items-center gap-3 flex-1"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                                <Star className="w-6 h-6 text-amber-400" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold">{item.stock_code}</span>
                                                    <span className="text-gray-400">{item.stock_name}</span>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    加入時間：{new Date(item.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </Link>

                                        {quote && (
                                            <div className="text-right">
                                                <div className="text-xl font-mono font-bold">
                                                    {quote.price.toFixed(2)}
                                                </div>
                                                <div className={`flex items-center justify-end gap-1 ${quote.change >= 0 ? 'text-green-400' : 'text-red-400'
                                                    }`}>
                                                    {quote.change >= 0 ? (
                                                        <TrendingUp className="w-4 h-4" />
                                                    ) : (
                                                        <TrendingDown className="w-4 h-4" />
                                                    )}
                                                    <span className="text-sm font-medium">
                                                        {quote.change >= 0 ? '+' : ''}{quote.change_percent.toFixed(2)}%
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => handleRemoveStock(item.id)}
                                            className="ml-4 p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
