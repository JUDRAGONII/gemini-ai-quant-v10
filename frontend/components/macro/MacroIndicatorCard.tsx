'use client';

import React from 'react';
import Link from 'next/link';
import GlassCard from '@/components/ui/GlassCard';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Bilingual } from '@/components/ui/Bilingual';

interface MacroIndicatorProps {
    name: React.ReactNode;
    code: string;
    value: number;
    unit: string;
    change?: number;
    icon: any;
    color: string;
}

export const MacroIndicatorCard = ({ name, code, value, unit, change, icon: Icon, color }: MacroIndicatorProps) => {
    const isUp = change && change > 0;
    const isDown = change && change < 0;

    return (
        <Link href={`/macro/${code.toLowerCase()}`} className="block h-full cursor-pointer" data-testid="macro-card-link">
            <GlassCard className="p-4 border-white/5 h-full group hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{code}</div>
                </div>

                <div className="space-y-1">
                    <div className="text-slate-400 text-xs font-medium">{name}</div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white tracking-tight">
                            {value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono uppercase">{unit}</span>
                    </div>
                </div>

                {change !== undefined && (
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className={`flex items-center gap-1 text-[10px] font-bold ${isUp ? 'text-emerald-400' : isDown ? 'text-rose-400' : 'text-slate-500'
                            }`}>
                            {isUp && <TrendingUp className="w-3 h-3" />}
                            {isDown && <TrendingDown className="w-3 h-3" />}
                            {!isUp && !isDown && <Minus className="w-3 h-3" />}
                            {Math.abs(change).toFixed(2)}%
                        </div>
                        <div className="text-[9px] text-slate-600 font-mono uppercase tracking-tighter">
                            <Bilingual zh="近 24 小時" en="Last 24H" />
                        </div>
                    </div>
                )}
            </GlassCard>
        </Link>
    );
};
