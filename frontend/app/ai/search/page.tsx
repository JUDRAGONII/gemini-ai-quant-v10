'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, Sparkles, Clock, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
    const router = useRouter(); // Though not explicitly used for navigation here yet
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
            } catch { }
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
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <section className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 tracking-tighter uppercase">
                            AI 語義搜尋中心 <span className="text-sm font-medium text-amber-500/60 uppercase tracking-widest ml-2">Semantic Knowledge Hub</span>
                        </h1>
                        <p className="text-gray-400 mt-2 flex items-center text-sm font-medium">
                            <Sparkles className="w-4 h-4 mr-2 text-amber-400" />
                            使用自然語言搜尋 AI 投資報告與市場大數據知識庫
                            <span className="text-[10px] opacity-30 ml-2 uppercase font-mono italic">Knowledge RAG Pro v2.1</span>
                        </p>
                    </div>
                </div>
            </section>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md relative overflow-hidden group shadow-2xl shadow-indigo-500/5"
            >
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[120px] -mr-48 -mt-48 transition-all duration-1000 group-focus-within:bg-indigo-500/10" />

                <div className="relative z-10 space-y-4">
                    <label className="text-[10px] font-bold uppercase text-gray-400 ml-1 tracking-widest">
                        全域檢索 <span className="text-[8px] opacity-40 ml-1">Universal Search</span>
                    </label>
                    <div className="relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400/50" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setShowRecent(true);
                            }}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setShowRecent(true)}
                            placeholder="請輸入問題，例如：半導體產業未來的成長動能為何？"
                            className="w-full pl-14 pr-32 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-lg font-medium"
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
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 active:scale-95 shadow-lg shadow-indigo-600/20"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                    <>
                                        <Search className="w-4 h-4" />
                                        搜尋 <span className="text-[10px] font-normal opacity-70">SEARCH</span>
                                    </>
                                )}
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
                </div>
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
