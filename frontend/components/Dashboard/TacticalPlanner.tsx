'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Sword, Trash2, Plus, Calendar, Save, CheckCircle2 } from 'lucide-react';
import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface TacticalPlan {
    id: string;
    stock_code: string;
    stock_name: string;
    entry_price: number;
    stop_loss: number;
    take_profit: number;
    reason: string;
    status: string;
}

export default function TacticalPlanner() {
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        stock_code: '',
        stock_name: '',
        entry_price: 0,
        stop_loss: 0,
        take_profit: 0,
        reason: ''
    });

    const { data: plans, isLoading } = useSWR<TacticalPlan[]>('/api/v1/tactical/plans', fetcher);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/v1/tactical/plans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (res.ok) {
            mutate('/api/v1/tactical/plans');
            setIsAdding(false);
            setFormData({ stock_code: '', stock_name: '', entry_price: 0, stop_loss: 0, take_profit: 0, reason: '' });
        }
    };

    return (
        <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-red-500 to-rose-700 rounded-xl shadow-lg shadow-rose-900/20">
                        <Sword className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-widest uppercase">戰術作戰中心</h3>
                        <p className="text-[10px] text-slate-500">Tactical Operation Center (TOC)</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-slate-300 transition-all font-bold"
                >
                    {isAdding ? '取消' : <><Plus className="w-4 h-4" /> 啟動新戰術</>}
                </button>
            </div>

            <AnimatePresence mode="wait">
                {isAdding ? (
                    <motion.form
                        key="form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onSubmit={handleSubmit}
                        className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400">代碼</label>
                                <input
                                    type="text"
                                    value={formData.stock_code}
                                    onChange={e => setFormData({ ...formData, stock_code: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500/50"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400">名稱</label>
                                <input
                                    type="text"
                                    value={formData.stock_name}
                                    onChange={e => setFormData({ ...formData, stock_name: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500/50"
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400">預計進場</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.entry_price}
                                    onChange={e => setFormData({ ...formData, entry_price: Number(e.target.value) })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500/50"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-red-400">停損價</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.stop_loss}
                                    onChange={e => setFormData({ ...formData, stop_loss: Number(e.target.value) })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500/50"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-green-400">停利價</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.take_profit}
                                    onChange={e => setFormData({ ...formData, take_profit: Number(e.target.value) })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500/50"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400">戰術理由</label>
                            <textarea
                                value={formData.reason}
                                onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                className="w-full h-20 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500/50 resize-none"
                            />
                        </div>
                        <button type="submit" className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-lg text-white font-black transition-all flex items-center justify-center gap-2">
                            <Save className="w-4 h-4" /> 寫入戰術指令庫
                        </button>
                    </motion.form>
                ) : (
                    <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        {isLoading ? <div className="animate-pulse py-8 text-center text-slate-500 font-mono">LOADING TACTICAL DATABASE...</div> :
                            plans && plans.length > 0 ? plans.map(plan => (
                                <div key={plan.id} className="group p-4 bg-white/5 border border-white/5 rounded-xl hover:border-red-500/30 hover:bg-white/10 transition-all">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-black text-white">{plan.stock_code}</span>
                                            <span className="text-sm font-bold text-slate-400">{plan.stock_name}</span>
                                        </div>
                                        <div className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-black rounded uppercase">Active Plan</div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        <div className="p-2 bg-black/30 rounded border border-white/5 text-center">
                                            <span className="block text-[10px] text-slate-500 font-bold">進場</span>
                                            <span className="text-sm font-mono text-slate-200">{plan.entry_price}</span>
                                        </div>
                                        <div className="p-2 bg-black/30 rounded border border-rose-500/10 text-center">
                                            <span className="block text-[10px] text-rose-500/60 font-bold">停損</span>
                                            <span className="text-sm font-mono text-rose-400">{plan.stop_loss}</span>
                                        </div>
                                        <div className="p-2 bg-black/30 rounded border border-green-500/10 text-center">
                                            <span className="block text-[10px] text-green-500/60 font-bold">停利</span>
                                            <span className="text-sm font-mono text-green-400">{plan.take_profit}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 italic line-clamp-2">" {plan.reason} "</p>
                                </div>
                            )) : <div className="py-12 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center grayscale opacity-50">
                                <Target className="w-10 h-10 mb-2 text-slate-600" />
                                <span className="text-xs font-bold text-slate-600">無運行中戰術計畫</span>
                            </div>}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
