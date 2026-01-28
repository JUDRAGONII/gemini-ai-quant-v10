'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Plus, Trash2, TrendingUp, TrendingDown, Wallet,
    PieChart, BarChart3, Loader2, Edit2, Save, X, TrendingUpIcon
} from 'lucide-react';
import Link from 'next/link';
import PortfolioPerformanceChart from '@/components/Chart/PortfolioPerformanceChart';

interface Holding {
    id: string;
    stock_code: string;
    stock_name: string | null;
    buy_date: string;
    buy_price: number;
    shares: number;
    commission: number;
    tax: number;
    notes: string | null;
    current_price?: number;
    value?: number;
    return_amount?: number;
    return_rate?: number;
}

interface Portfolio {
    id: string;
    name: string;
    description: string | null;
    currency: string;
    holdings: Holding[];
}

interface PerformanceSummary {
    total_cost: number;
    total_value: number;
    return_amount: number;
    return_rate: number;
    holdings_count: number;
}

interface PerformanceDataPoint {
    date: string;
    total_value: number;
    total_cost: number;
    return_amount: number;
    return_rate: number;
}

interface TopHolding {
    stock_code: string;
    stock_name: string | null;
    value: number;
    return_amount: number;
    return_rate: number;
    weight: number;
}

export default function PortfolioDetailPage() {
    const params = useParams();
    const router = useRouter();
    const portfolioId = params?.id as string;

    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [performanceData, setPerformanceData] = useState<PerformanceDataPoint[]>([]);
    const [summary, setSummary] = useState<PerformanceSummary | null>(null);
    const [topHoldings, setTopHoldings] = useState<TopHolding[]>([]);
    const [period, setPeriod] = useState('1M');
    const [loading, setLoading] = useState(true);
    const [perfLoading, setPerfLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [addingStock, setAddingStock] = useState(false);

    const [newStock, setNewStock] = useState({
        stock_code: '',
        stock_name: '',
        buy_date: new Date().toISOString().split('T')[0],
        buy_price: '',
        shares: '',
        commission: '0',
        tax: '0',
        notes: '',
    });

    const fetchPortfolio = useCallback(async () => {
        if (!portfolioId) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`/api/portfolios/${portfolioId}`);
            if (!response.ok) throw new Error('Failed to fetch portfolio');
            const data = await response.json();
            setPortfolio(data);
        } catch (err: any) {
            console.error('Error fetching portfolio:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [portfolioId]);

    const fetchPerformance = useCallback(async () => {
        if (!portfolioId) return;

        setPerfLoading(true);
        try {
            const response = await fetch(`/api/portfolios/${portfolioId}/performance?period=${period}`);
            if (!response.ok) throw new Error('Failed to fetch performance');
            const data = await response.json();
            setPerformanceData(data.performance_data || []);
            setSummary(data.summary);
            setTopHoldings(data.top_holdings || []);
        } catch (err: any) {
            console.error('Error fetching performance:', err);
        } finally {
            setPerfLoading(false);
        }
    }, [portfolioId, period]);

    useEffect(() => {
        fetchPortfolio();
    }, [fetchPortfolio]);

    useEffect(() => {
        fetchPerformance();
    }, [fetchPerformance]);

    const handlePeriodChange = (newPeriod: string) => {
        setPeriod(newPeriod);
    };

    const handleAddStock = async () => {
        if (!newStock.stock_code || !newStock.buy_price || !newStock.shares) return;

        setAddingStock(true);
        try {
            const response = await fetch('/api/holdings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    portfolio_id: portfolioId,
                    stock_code: newStock.stock_code.toUpperCase(),
                    stock_name: newStock.stock_name || null,
                    buy_date: newStock.buy_date,
                    buy_price: parseFloat(newStock.buy_price),
                    shares: parseFloat(newStock.shares),
                    commission: parseFloat(newStock.commission) || 0,
                    tax: parseFloat(newStock.tax) || 0,
                    notes: newStock.notes || null,
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to add holding');
            }

            setNewStock({
                stock_code: '',
                stock_name: '',
                buy_date: new Date().toISOString().split('T')[0],
                buy_price: '',
                shares: '',
                commission: '0',
                tax: '0',
                notes: '',
            });
            fetchPortfolio();
            fetchPerformance();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setAddingStock(false);
        }
    };

    const handleDeleteHolding = async (id: string) => {
        if (!confirm('確定要移除此持股？')) return;

        try {
            const response = await fetch(`/api/holdings?id=${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete holding');

            fetchPortfolio();
            fetchPerformance();
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

    if (error || !portfolio) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-red-400">無法載入投資組合</h2>
                <p className="text-gray-400 mt-2">{error || 'Portfolio not found'}</p>
            </div>
        );
    }

    const totalCost = portfolio.holdings.reduce(
        (sum, h) => sum + h.buy_price * h.shares + h.commission + h.tax,
        0
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Link href="/portfolios" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">{portfolio.name}</h1>
                    <p className="text-gray-400 text-sm">
                        {portfolio.holdings.length} 檔持股 | 總成本 {totalCost.toLocaleString()} {portfolio.currency}
                    </p>
                </div>
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

            {summary && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4"
                >
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                        <p className="text-sm text-gray-400 mb-1">總價值</p>
                        <p className="text-2xl font-bold text-white font-mono">
                            {summary.total_value.toLocaleString("zh-TW")}
                        </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                        <p className="text-sm text-gray-400 mb-1">總成本</p>
                        <p className="text-2xl font-bold text-gray-300 font-mono">
                            {summary.total_cost.toLocaleString("zh-TW")}
                        </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                        <p className="text-sm text-gray-400 mb-1">報酬金額</p>
                        <p className={`text-2xl font-bold font-mono ${summary.return_amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {summary.return_amount >= 0 ? '+' : ''}{summary.return_amount.toLocaleString("zh-TW")}
                        </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                        <p className="text-sm text-gray-400 mb-1">報酬率</p>
                        <p className={`text-2xl font-bold font-mono ${summary.return_rate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {summary.return_rate >= 0 ? '+' : ''}{summary.return_rate.toFixed(2)}%
                        </p>
                    </div>
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                {perfLoading ? (
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-12 backdrop-blur-sm flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    </div>
                ) : performanceData.length > 0 ? (
                    <PortfolioPerformanceChart
                        data={performanceData}
                        period={period}
                        onPeriodChange={handlePeriodChange}
                    />
                ) : (
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
                        <p className="text-gray-400 text-center">暫無績效數據，請新增持股後再試</p>
                    </div>
                )}
            </motion.div>

            {topHoldings.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm"
                >
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-emerald-400" />
                        持股分布
                    </h2>
                    <div className="space-y-3">
                        {topHoldings.map((holding, index) => (
                            <div key={holding.stock_code} className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-medium">{holding.stock_code}</span>
                                        <span className="text-sm text-gray-400">{holding.weight.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${holding.return_rate >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                                            style={{ width: `${Math.min(holding.weight * 2, 100)}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono text-sm">{holding.value.toLocaleString("zh-TW")}</p>
                                    <p className={`text-xs font-mono ${holding.return_rate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {holding.return_rate >= 0 ? '+' : ''}{holding.return_rate?.toFixed(2)}%
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm"
            >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-400" />
                    新增持股
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input
                        type="text"
                        value={newStock.stock_code}
                        onChange={(e) => setNewStock({ ...newStock, stock_code: e.target.value })}
                        placeholder="股票代碼"
                        className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                    <input
                        type="text"
                        value={newStock.stock_name}
                        onChange={(e) => setNewStock({ ...newStock, stock_name: e.target.value })}
                        placeholder="股票名稱（選填）"
                        className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                    <input
                        type="date"
                        value={newStock.buy_date}
                        onChange={(e) => setNewStock({ ...newStock, buy_date: e.target.value })}
                        className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                    <input
                        type="number"
                        value={newStock.buy_price}
                        onChange={(e) => setNewStock({ ...newStock, buy_price: e.target.value })}
                        placeholder="買入價格"
                        className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                    <input
                        type="number"
                        value={newStock.shares}
                        onChange={(e) => setNewStock({ ...newStock, shares: e.target.value })}
                        placeholder="股數"
                        className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                    <input
                        type="number"
                        value={newStock.commission}
                        onChange={(e) => setNewStock({ ...newStock, commission: e.target.value })}
                        placeholder="手續費"
                        className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                    <input
                        type="number"
                        value={newStock.tax}
                        onChange={(e) => setNewStock({ ...newStock, tax: e.target.value })}
                        placeholder="稅金"
                        className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                        onClick={handleAddStock}
                        disabled={!newStock.stock_code || !newStock.buy_price || !newStock.shares || addingStock}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {addingStock ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        新增
                    </button>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm"
            >
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-amber-400" />
                        持股列表
                    </h2>
                </div>

                {portfolio.holdings.length === 0 ? (
                    <div className="p-12 text-center">
                        <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">尚未加入任何持股</p>
                        <p className="text-sm text-gray-500 mt-1">在上方新增您的持股</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">股票</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">買入日期</th>
                                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">買入價格</th>
                                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">股數</th>
                                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">總成本</th>
                                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">報酬率</th>
                                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">動作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {portfolio.holdings.map((holding) => {
                                    const cost = holding.buy_price * holding.shares + holding.commission + holding.tax;
                                    const value = (holding.current_price || holding.buy_price) * holding.shares;
                                    const returnRate = cost > 0 ? ((value - cost) / cost) * 100 : 0;

                                    return (
                                        <tr key={holding.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold">{holding.stock_code}</span>
                                                    <span className="text-gray-400">{holding.stock_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">
                                                {new Date(holding.buy_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono">
                                                {holding.buy_price.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono">
                                                {holding.shares.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono">
                                                {cost.toLocaleString()}
                                            </td>
                                            <td className={`px-6 py-4 text-right font-mono ${returnRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {returnRate >= 0 ? '+' : ''}{returnRate.toFixed(2)}%
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteHolding(holding.id)}
                                                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
