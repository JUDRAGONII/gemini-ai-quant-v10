'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, TrendingUp, Sparkles, Clock, ChevronDown, ChevronUp, X } from 'lucide-react';

interface SearchResult {
    id: string;
    stock_code: string;
    stock_name: string | null;
    title: string;
    content: string;
    similarity: number;
    report_date: string;
    report_type: string;
}

interface RecentSearch {
    query: string;
    timestamp: number;
}

const MAX_RECENT_SEARCHES = 10;

export default function AISearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
    const [showRecent, setShowRecent] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('rag_recent_searches');
        if (saved) {
            try {
                setRecentSearches(JSON.parse(saved));
            } catch {}
        }
    }, []);

    const saveRecentSearch = useCallback((q: string) => {
        if (!q.trim()) return;
        const newSearch = { query: q.trim(), timestamp: Date.now() };
        const filtered = recentSearches.filter(s => s.query !== q.trim());
        const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);
        setRecentSearches(updated);
        localStorage.setItem('rag_recent_searches', JSON.stringify(updated));
    }, [recentSearches]);

    const handleSearch = useCallback(async () => {
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setSearched(true);
        setResults([]);
        saveRecentSearch(query);

        try {
            const response = await fetch('/api/rag/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query.trim(), limit: 10 }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || '搜尋失敗');
            }

            const data = await response.json();
            setResults(data.results || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [query, saveRecentSearch]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleRecentClick = (q: string) => {
        setQuery(q);
        setShowRecent(false);
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('rag_recent_searches');
        setShowRecent(false);
    };

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const getSimilarityColor = (score: number) => {
        if (score >= 0.8) return 'text-green-400';
        if (score >= 0.6) return 'text-yellow-400';
        return 'text-gray-400';
    };

    const getSimilarityBg = (score: number) => {
        if (score >= 0.8) return 'bg-green-500/20';
        if (score >= 0.6) return 'bg-yellow-500/20';
        return 'bg-gray-500/20';
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-amber-400" />
                    AI 語義搜尋
                </h1>
                <p className="text-gray-400">使用自然語言搜尋 AI 投資報告知識庫</p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm"
            >
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setShowRecent(true);
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setShowRecent(true)}
                        placeholder="輸入問題或關鍵字，例如：半導體產業展望、台積電基本面"
                        className="w-full pl-12 pr-24 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-lg"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={handleSearch}
                            disabled={!query.trim() || loading}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            搜尋
                        </button>
                    </div>
                </div>

                {showRecent && recentSearches.length > 0 && !query && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute z-10 mt-2 w-full bg-gray-900 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm"
                    >
                        <div className="p-3 border-b border-white/10 flex justify-between items-center">
                            <span className="text-sm text-gray-400 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                最近搜尋
                            </span>
                            <button
                                onClick={clearRecentSearches}
                                className="text-xs text-gray-500 hover:text-white transition-colors"
                            >
                                清除
                            </button>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {recentSearches.map((search, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleRecentClick(search.query)}
                                    className="w-full px-4 py-3 text-left text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                                >
                                    <Clock className="w-4 h-4 text-gray-600" />
                                    <span>{search.query}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl"
                >
                    {error}
                </motion.div>
            )}

            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <span className="ml-3 text-gray-400">正在搜尋知識庫...</span>
                </div>
            )}

            {!loading && searched && results.length === 0 && !error && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center backdrop-blur-sm"
                >
                    <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">沒有找到相關結果</p>
                    <p className="text-sm text-gray-500 mt-2">嘗試使用不同的關鍵字或更廣泛的描述</p>
                </motion.div>
            )}

            {!loading && results.length > 0 && (
                <div className="space-y-4">
                    <p className="text-gray-400 text-sm">
                        找到 <span className="text-white font-medium">{results.length}</span> 個相關結果
                    </p>
                    {results.map((result, index) => (
                        <motion.div
                            key={result.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm"
                        >
                            <div className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs rounded-full">
                                                {result.stock_code}
                                            </span>
                                            {result.stock_name && (
                                                <span className="text-gray-400 text-sm">{result.stock_name}</span>
                                            )}
                                            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-xs rounded-full">
                                                {result.report_type}
                                            </span>
                                            <span className="text-gray-500 text-xs">
                                                {new Date(result.report_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-white mb-2">{result.title}</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            {expandedId === result.id
                                                ? result.content
                                                : result.content.slice(0, 200) + '...'}
                                        </p>
                                    </div>
                                    <div className={`flex flex-col items-center px-4 py-2 rounded-xl ${getSimilarityBg(result.similarity)}`}>
                                        <span className={`text-2xl font-bold ${getSimilarityColor(result.similarity)}`}>
                                            {(result.similarity * 100).toFixed(0)}%
                                        </span>
                                        <span className="text-xs text-gray-500">相似度</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleExpand(result.id)}
                                    className="mt-4 flex items-center gap-1 text-sm text-gray-500 hover:text-white transition-colors"
                                >
                                    {expandedId === result.id ? (
                                        <>
                                            <ChevronUp className="w-4 h-4" />
                                            收合
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="w-4 h-4" />
                                            展開全文
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
