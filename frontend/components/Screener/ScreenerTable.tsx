"use client";

import React from 'react';
import { ScreenerResult } from '@/hooks/useScreener';
import { ArrowUpDown, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';

interface ScreenerTableProps {
    data: ScreenerResult[];
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSort: (column: string) => void;
}

/**
 * ScreenerTable - 高性能虛擬化選股結果表格
 * 含 AI 評分發光徽章與動態排序功能。
 */
export function ScreenerTable({ data, sortBy, sortOrder, onSort }: ScreenerTableProps) {
    const columns = [
        { key: 'stock_code', label: '代號', width: 'w-20' },
        { key: 'name', label: '名稱', width: 'w-32' },
        { key: 'price', label: '股價', width: 'w-24', numeric: true },
        { key: 'change_percent', label: '漲跌幅', width: 'w-24', numeric: true },
        { key: 'volume', label: '成交量', width: 'w-28', numeric: true },
        { key: 'ai_score', label: 'AI 評分', width: 'w-28', numeric: true, highlight: true },
        { key: 'rsi_14', label: 'RSI', width: 'w-20', numeric: true },
    ];

    const SortIcon = ({ column }: { column: string }) => {
        if (sortBy !== column) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
        return sortOrder === 'desc'
            ? <ArrowDown className="w-3 h-3 text-blue-400" />
            : <ArrowUp className="w-3 h-3 text-blue-400" />;
    };

    const formatValue = (key: string, value: any) => {
        if (value === null || value === undefined) return '-';

        switch (key) {
            case 'price':
                return value.toFixed(2);
            case 'change_percent':
                const formatted = value > 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
                return (
                    <span className={value > 0 ? 'text-red-400' : value < 0 ? 'text-green-400' : 'text-gray-400'}>
                        {formatted}
                    </span>
                );
            case 'volume':
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                return value.toString();
            case 'ai_score':
                return (
                    <div className="flex items-center gap-2">
                        <div className={`relative px-2 py-0.5 rounded-full text-xs font-semibold
              ${value >= 80 ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]' :
                                value >= 60 ? 'bg-blue-500/10 text-blue-400' :
                                    'bg-gray-500/10 text-gray-400'}`}
                        >
                            {value >= 80 && <Sparkles className="absolute -right-1 -top-1 w-3 h-3 text-purple-400 animate-pulse" />}
                            {value?.toFixed(0)}
                        </div>
                    </div>
                );
            case 'rsi_14':
                return (
                    <span className={`
            ${value > 70 ? 'text-red-400' : value < 30 ? 'text-green-400' : 'text-gray-300'}
          `}>
                        {value?.toFixed(1)}
                    </span>
                );
            default:
                return value;
        }
    };

    return (
        <div className="w-full h-full overflow-auto rounded-xl border border-white/10 bg-black/20 backdrop-blur-md">
            <table className="w-full text-left">
                <thead className="sticky top-0 z-10 bg-black/60 backdrop-blur-lg border-b border-white/10">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                onClick={() => onSort(col.key)}
                                className={`px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors ${col.width}`}
                            >
                                <div className="flex items-center gap-1.5">
                                    <span>{col.label}</span>
                                    <SortIcon column={col.key} />
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {data.map((row, idx) => (
                        <tr
                            key={row.stock_code}
                            className="hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                            {columns.map((col) => (
                                <td key={col.key} className={`px-4 py-3 ${col.numeric ? 'text-right' : ''}`}>
                                    {formatValue(col.key, row[col.key as keyof ScreenerResult])}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
