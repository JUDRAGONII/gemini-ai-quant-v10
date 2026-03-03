"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown, TrendingUp, TrendingDown } from "lucide-react";
import { Bilingual } from "@/components/ui/Bilingual";

/**
 * 排行表格組件
 * 可排序的股票排行榜，支援多欄位排序
 */

interface StockRankingItem {
    /** 排名 */
    rank: number;
    /** 股票代碼 */
    symbol: string;
    /** 股票名稱 */
    name: string;
    /** 綜合評分 (0-100) */
    compositeScore: number;
    /** 價值分數 */
    valueScore: number;
    /** 成長分數 */
    growthScore: number;
    /** 動能分數 */
    momentumScore: number;
    /** 品質分數 */
    qualityScore: number;
    /** 籌碼分數 */
    chipScore: number;
    /** 今日漲跌幅 */
    changePercent: number;
}

interface RankingTableProps {
    /** 排行數據陣列 */
    data: StockRankingItem[];
    /** 每頁顯示筆數 (預設 10) */
    pageSize?: number;
    /** 點擊行時的回調 */
    onRowClick?: (item: StockRankingItem) => void;
}

type SortField = keyof StockRankingItem;
type SortDirection = "asc" | "desc";

export default function RankingTable({
    data,
    pageSize = 10,
    onRowClick,
}: RankingTableProps) {
    const [sortField, setSortField] = useState<SortField>("rank");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
    const [currentPage, setCurrentPage] = useState(1);

    // 排序後的數據
    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (typeof aValue === "number" && typeof bValue === "number") {
                return sortDirection === "asc"
                    ? aValue - bValue
                    : bValue - aValue;
            }
            if (typeof aValue === "string" && typeof bValue === "string") {
                return sortDirection === "asc"
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
            return 0;
        });
    }, [data, sortField, sortDirection]);

    // 分頁數據
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, currentPage, pageSize]);

    // 總頁數
    const totalPages = Math.ceil(data.length / pageSize);

    // 處理排序點擊
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDirection("desc"); // 新欄位預設降序 (高分在前)
        }
    };

    // 排序指示器
    const SortIndicator = ({ field }: { field: SortField }) => {
        if (sortField !== field) return null;
        return sortDirection === "asc" ? (
            <ChevronUp size={14} className="inline ml-1" />
        ) : (
            <ChevronDown size={14} className="inline ml-1" />
        );
    };

    // 分數顏色
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-400";
        if (score >= 60) return "text-amber-400";
        if (score >= 40) return "text-orange-400";
        return "text-red-400";
    };

    // 表頭定義
    const columns = [
        { key: "rank", label: <Bilingual zh="排名" en="Rank" />, width: "w-16", sortable: true },
        { key: "symbol", label: <Bilingual zh="代碼" en="Code" />, width: "w-24", sortable: true },
        { key: "name", label: <Bilingual zh="名稱" en="Name" />, width: "w-32", sortable: false },
        {
            key: "compositeScore",
            label: <Bilingual zh="綜合" en="Score" />,
            width: "w-20",
            sortable: true,
        },
        { key: "valueScore", label: <Bilingual zh="價值" en="Value" />, width: "w-16", sortable: true },
        { key: "growthScore", label: <Bilingual zh="成長" en="Growth" />, width: "w-16", sortable: true },
        { key: "momentumScore", label: <Bilingual zh="動能" en="Mom." />, width: "w-16", sortable: true },
        { key: "qualityScore", label: <Bilingual zh="品質" en="Quality" />, width: "w-16", sortable: true },
        { key: "chipScore", label: <Bilingual zh="籌碼" en="Chip" />, width: "w-16", sortable: true },
        { key: "changePercent", label: <Bilingual zh="漲跌" en="Chg%" />, width: "w-20", sortable: true },
    ];

    return (
        <div className="glass rounded-xl border border-white/10 overflow-hidden">
            {/* 表格 */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    {/* 表頭 */}
                    <thead className="bg-white/5">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={`${col.width} px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider ${col.sortable
                                        ? "cursor-pointer hover:text-white transition-colors"
                                        : ""
                                        }`}
                                    onClick={() =>
                                        col.sortable &&
                                        handleSort(col.key as SortField)
                                    }
                                >
                                    {col.label}
                                    {col.sortable && (
                                        <SortIndicator
                                            field={col.key as SortField}
                                        />
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* 表身 */}
                    <tbody className="divide-y divide-white/5">
                        {paginatedData.map((item, index) => (
                            <tr
                                key={item.symbol}
                                className="hover:bg-white/5 transition-colors cursor-pointer"
                                onClick={() => onRowClick?.(item)}
                            >
                                {/* 排名 */}
                                <td className="px-4 py-3">
                                    <span
                                        className={`text-sm font-bold ${item.rank <= 3
                                            ? "text-amber-400"
                                            : "text-gray-400"
                                            }`}
                                    >
                                        #{item.rank}
                                    </span>
                                </td>

                                {/* 代碼 */}
                                <td className="px-4 py-3">
                                    <Link
                                        href={`/stocks/${item.symbol}`}
                                        className="text-sm font-semibold text-white hover:text-amber-400 transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {item.symbol}
                                    </Link>
                                </td>

                                {/* 名稱 */}
                                <td className="px-4 py-3">
                                    <span className="text-sm text-gray-400 truncate block max-w-[120px]">
                                        {item.name}
                                    </span>
                                </td>

                                {/* 綜合評分 */}
                                <td className="px-4 py-3">
                                    <span
                                        className={`text-sm font-bold ${getScoreColor(
                                            item.compositeScore
                                        )}`}
                                    >
                                        {item.compositeScore}
                                    </span>
                                </td>

                                {/* 各維度分數 */}
                                <td className="px-4 py-3 text-sm text-gray-300">
                                    {item.valueScore}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-300">
                                    {item.growthScore}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-300">
                                    {item.momentumScore}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-300">
                                    {item.qualityScore}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-300">
                                    {item.chipScore}
                                </td>

                                {/* 漲跌幅 */}
                                <td className="px-4 py-3">
                                    {item.changePercent !== undefined && (
                                        <div
                                            className={`flex items-center gap-1 text-sm font-semibold ${item.changePercent >= 0
                                                ? "text-emerald-400"
                                                : "text-red-400"
                                                }`}
                                        >
                                            {item.changePercent >= 0 ? (
                                                <TrendingUp size={14} />
                                            ) : (
                                                <TrendingDown size={14} />
                                            )}
                                            {item.changePercent >= 0 ? "+" : ""}
                                            {item.changePercent.toFixed(2)}%
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 分頁控制 */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center px-4 py-3 border-t border-white/10">
                    <span className="text-sm text-gray-500">
                        <Bilingual zh="顯示" en="Showing" /> {(currentPage - 1) * pageSize + 1} -{" "}
                        {Math.min(currentPage * pageSize, data.length)} <Bilingual zh="筆，共" en="of" />{" "}
                        {data.length} <Bilingual zh="筆" en="items" />
                    </span>
                    <div className="flex gap-2">
                        <button
                            className="px-3 py-1 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            onClick={() =>
                                setCurrentPage((p) => Math.max(1, p - 1))
                            }
                            disabled={currentPage === 1}
                        >
                            <Bilingual zh="上一頁" en="Prev" />
                        </button>
                        <span className="px-3 py-1 text-sm text-gray-400">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            className="px-3 py-1 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            onClick={() =>
                                setCurrentPage((p) =>
                                    Math.min(totalPages, p + 1)
                                )
                            }
                            disabled={currentPage === totalPages}
                        >
                            <Bilingual zh="下一頁" en="Next" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
