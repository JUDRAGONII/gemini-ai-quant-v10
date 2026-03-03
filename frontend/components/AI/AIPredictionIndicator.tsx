'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, TrendingUp, AlertCircle } from 'lucide-react';
import { Bilingual } from '../ui/Bilingual';

interface AIPredictionIndicatorProps {
    alpha: number;
    winRate: number;
    loading?: boolean;
}

export const AIPredictionIndicator: React.FC<AIPredictionIndicatorProps> = ({
    alpha,
    winRate,
    loading = false
}) => {
    const isPositive = alpha >= 0;
    const colorClass = isPositive ? 'text-emerald-400' : 'text-rose-400';
    const glowClass = isPositive ? 'shadow-emerald-500/20' : 'shadow-rose-500/20';

    if (loading) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md animate-pulse h-48 flex items-center justify-center">
                <BrainCircuit className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
        );
    }

    // Calculate Gauge Degree (-90 to 90)
    // Assume alpha range -0.1 to 0.1 (10%)
    const degree = Math.min(Math.max(alpha * 10 * 90, -90), 90);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative bg-gradient-to-br from-white/10 to-transparent border border-white/20 rounded-3xl p-6 backdrop-blur-xl shadow-2xl ${glowClass}`}
        >
            <div className="flex justify-between items-center mb-6">
                <div className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center">
                    <BrainCircuit className="w-4 h-4 mr-2 text-indigo-400" />
                    <Bilingual zh="AI 預測核心 (5D Alpha)" en="AI Prediction Core (5D Alpha)" mode="inline" />
                </div>
                {isPositive ? (
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                ) : (
                    <AlertCircle className="w-5 h-5 text-rose-400" />
                )}
            </div>

            <div className="flex flex-col items-center">
                {/* Gauge Placeholder / Visual */}
                <div className="relative w-48 h-24 mb-4 overflow-hidden">
                    {/* Half Circle Background */}
                    <div className="absolute bottom-0 w-48 h-48 border-8 border-white/5 rounded-full" />
                    {/* Needle */}
                    <motion.div
                        initial={{ rotate: -90 }}
                        animate={{ rotate: degree }}
                        transition={{ type: 'spring', stiffness: 60 }}
                        className="absolute bottom-0 left-1/2 w-1 h-20 -ml-0.5 bg-indigo-500 origin-bottom rounded-full"
                    />
                    <div className="absolute bottom-0 left-1/2 w-4 h-4 -mb-2 -ml-2 bg-indigo-500 rounded-full border-4 border-gray-900" />
                </div>

                <div className="text-center">
                    <span className={`text-5xl font-mono font-black ${colorClass}`}>
                        {alpha > 0 ? '+' : ''}{(alpha * 100).toFixed(2)}%
                    </span>
                    <div className="mt-2 text-xs text-gray-400 flex items-center justify-center gap-4">
                        <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-indigo-400 mr-2" />
                            <Bilingual
                                zh={`標的前景: ${isPositive ? '看多 (Bullish)' : '偏弱 (Bearish)'}`}
                                en={`Outlook: ${isPositive ? 'Bullish' : 'Bearish'}`}
                                mode="inline"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative Glow */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${isPositive ? 'from-emerald-500/10 to-indigo-500/10' : 'from-rose-500/10 to-indigo-500/10'} rounded-3xl -z-10 blur-xl opacity-50`} />
        </motion.div>
    );
};
