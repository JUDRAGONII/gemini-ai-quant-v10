'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ShieldAlert, Zap, Target, BarChart, Percent } from 'lucide-react';

interface MetricProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    delay?: number;
}

const MetricCard: React.FC<MetricProps> = ({ label, value, icon, color, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors shadow-lg overflow-hidden relative group"
    >
        <div className={`p-3 rounded-xl mb-3 w-fit bg-${color}-500/10 text-${color}-400 border border-${color}-500/20 group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</p>
            <p className="text-xl font-mono font-black text-white">{value}</p>
        </div>

        {/* Background Glow */}
        <div className={`absolute -right-4 -bottom-4 w-12 h-12 bg-${color}-500/5 blur-2xl rounded-full group-hover:scale-150 transition-transform`} />
    </motion.div>
);

interface StrategyMetricsGridProps {
    metrics: {
        total_return: number;
        cagr: number;
        max_drawdown: number;
        sharpe: number;
        sortino: number;
        win_rate: number;
    };
}

export const StrategyMetricsGrid: React.FC<StrategyMetricsGridProps> = ({ metrics }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <MetricCard
                label="總報酬率"
                value={`${(metrics.total_return * 100).toFixed(2)}%`}
                icon={<TrendingUp className="w-5 h-5" />}
                color="emerald"
                delay={0.1}
            />
            <MetricCard
                label="年化回報 (CAGR)"
                value={`${(metrics.cagr * 100).toFixed(2)}%`}
                icon={<Zap className="w-5 h-5" />}
                color="amber"
                delay={0.2}
            />
            <MetricCard
                label="最大回撤 (MDD)"
                value={`${(metrics.max_drawdown * 100).toFixed(2)}%`}
                icon={<ShieldAlert className="w-5 h-5" />}
                color="rose"
                delay={0.3}
            />
            <MetricCard
                label="夏普比率 (Sharpe)"
                value={metrics.sharpe.toFixed(2)}
                icon={<Target className="w-5 h-5" />}
                color="indigo"
                delay={0.4}
            />
            <MetricCard
                label="索提諾比率"
                value={metrics.sortino.toFixed(2)}
                icon={<BarChart className="w-5 h-5" />}
                color="blue"
                delay={0.5}
            />
            <MetricCard
                label="策略勝率"
                value={`${(metrics.win_rate * 100).toFixed(2)}%`}
                icon={<Percent className="w-5 h-5" />}
                color="teal"
                delay={0.6}
            />
        </div>
    );
};
