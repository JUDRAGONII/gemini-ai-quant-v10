"use client";

import React, { useCallback } from 'react';
import { ScreenerFilters } from '@/hooks/useScreener';
import { Sparkles, TrendingUp, Activity, DollarSign } from 'lucide-react';

interface FilterPanelProps {
    filters: ScreenerFilters;
    onFilterChange: (newFilters: Partial<ScreenerFilters>) => void;
}

/**
 * FilterPanel - Glassmorphism 風格選股控制面板
 * 提供多維度過濾器（價格、漲跌幅、AI 分數、RSI）。
 */
export function FilterPanel({ filters, onFilterChange }: FilterPanelProps) {
    // 通用 Range 更新 handler
    const handleRangeChange = useCallback((key: keyof ScreenerFilters, index: 0 | 1, value: number) => {
        const current = filters[key] || [0, 100];
        const newRange: [number, number] = [...current] as [number, number];
        newRange[index] = value;
        onFilterChange({ [key]: newRange });
    }, [filters, onFilterChange]);

    // 預設策略快捷鍵
    const presets = [
        { label: '🚀 飆股啟動', filters: { change_range: [3, 10] as [number, number], ai_score_range: [70, 100] as [number, number] } },
        { label: '🏦 籌碼集中', filters: { ai_score_range: [60, 100] as [number, number] } },
        { label: '🤖 AI 看多', filters: { ai_score_range: [85, 100] as [number, number] } },
    ];

    return (
        <div className="h-full flex flex-col p-5 space-y-6 overflow-y-auto text-sm">
            {/* Panel Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                    <h2 className="font-semibold text-white">智能篩選器</h2>
                    <p className="text-xs text-gray-500">AI 多維度交叉核驗</p>
                </div>
            </div>

            {/* Presets */}
            <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase tracking-wider">快速策略</label>
                <div className="flex flex-wrap gap-2">
                    {presets.map((preset) => (
                        <button
                            key={preset.label}
                            onClick={() => onFilterChange(preset.filters)}
                            className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/30 transition-all text-xs"
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
            </div>

            <hr className="border-white/10" />

            {/* Price Range */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span>股價範圍</span>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="number"
                        value={filters.price_range?.[0] ?? ''}
                        placeholder="最低"
                        onChange={(e) => handleRangeChange('price_range', 0, parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                    />
                    <span className="text-gray-500">→</span>
                    <input
                        type="number"
                        value={filters.price_range?.[1] ?? ''}
                        placeholder="最高"
                        onChange={(e) => handleRangeChange('price_range', 1, parseFloat(e.target.value) || 9999)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                    />
                </div>
            </div>

            {/* Change Percent Range */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                    <TrendingUp className="w-4 h-4 text-red-400" />
                    <span>漲跌幅 (%)</span>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="number"
                        step="0.1"
                        value={filters.change_range?.[0] ?? ''}
                        placeholder="-10"
                        onChange={(e) => handleRangeChange('change_range', 0, parseFloat(e.target.value) || -10)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                    />
                    <span className="text-gray-500">→</span>
                    <input
                        type="number"
                        step="0.1"
                        value={filters.change_range?.[1] ?? ''}
                        placeholder="10"
                        onChange={(e) => handleRangeChange('change_range', 1, parseFloat(e.target.value) || 10)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                    />
                </div>
            </div>

            {/* AI Score Range */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>AI 評分</span>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={filters.ai_score_range?.[0] ?? ''}
                        placeholder="0"
                        onChange={(e) => handleRangeChange('ai_score_range', 0, parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                    />
                    <span className="text-gray-500">→</span>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={filters.ai_score_range?.[1] ?? ''}
                        placeholder="100"
                        onChange={(e) => handleRangeChange('ai_score_range', 1, parseFloat(e.target.value) || 100)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                    />
                </div>
            </div>

            {/* RSI Range */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                    <Activity className="w-4 h-4 text-yellow-400" />
                    <span>RSI (14)</span>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={filters.rsi_14_range?.[0] ?? ''}
                        placeholder="30"
                        onChange={(e) => handleRangeChange('rsi_14_range', 0, parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-500/50"
                    />
                    <span className="text-gray-500">→</span>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={filters.rsi_14_range?.[1] ?? ''}
                        placeholder="70"
                        onChange={(e) => handleRangeChange('rsi_14_range', 1, parseFloat(e.target.value) || 100)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-500/50"
                    />
                </div>
            </div>

            {/* Clear Button */}
            <button
                onClick={() => onFilterChange({ price_range: undefined, change_range: undefined, ai_score_range: undefined, rsi_14_range: undefined })}
                className="w-full mt-auto py-2.5 border border-white/10 rounded-lg bg-white/5 hover:bg-red-500/10 hover:border-red-500/30 transition-all text-gray-400 hover:text-red-400"
            >
                清除全部條件
            </button>
        </div>
    );
}
