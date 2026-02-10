import React from 'react';
import GlassCard from './GlassCard';

export const MonitorCardSkeleton = () => (
    <GlassCard className="p-4 border-white/5 h-full animate-pulse bg-white/[0.02]">
        <div className="flex items-start justify-between mb-4">
            <div className="p-2 rounded-xl bg-slate-800/50 w-9 h-9 border border-white/5"></div>
        </div>
        <div className="h-7 bg-slate-800/40 rounded-lg w-20 mb-3 ml-0.5"></div>
        <div className="space-y-2">
            <div className="h-3.5 bg-slate-800/30 rounded w-14"></div>
            <div className="h-2.5 bg-slate-900/40 rounded w-10 opacity-50"></div>
        </div>
    </GlassCard>
);

export const MonitorProgressSkeleton = () => (
    <GlassCard className="p-6 border-white/5 bg-white/5 h-32 animate-pulse">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 space-y-3">
                <div className="h-4 bg-slate-800 rounded w-32"></div>
                <div className="h-8 bg-slate-800 rounded w-64"></div>
            </div>
            <div className="w-full md:w-64 h-16 bg-slate-900 rounded-xl"></div>
        </div>
    </GlassCard>
);
