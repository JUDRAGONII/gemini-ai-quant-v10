"use client";

import React from "react";

export function Skeleton({ className = "", variant = "rect", style, "data-testid": testId }: { className?: string; variant?: "rect" | "circle" | "text"; style?: React.CSSProperties; "data-testid"?: string }) {
    const baseClass = "animate-pulse bg-white/10";
    const variantClass = {
        rect: "rounded-lg",
        circle: "rounded-full",
        text: "rounded",
    }[variant];

    return <div className={`${baseClass} ${variantClass} ${className}`} style={style} data-testid={testId || "skeleton"} />;
}

export function SkeletonCard({ className = "", "data-testid": testId }: { className?: string; "data-testid"?: string }) {
    return (
        <div className={`glass p-5 rounded-xl border border-white/10 ${className}`} data-testid={testId || "skeleton-card"}>
            <div className="flex items-center justify-between mb-4">
                <Skeleton variant="rect" className="h-4 w-24" />
                <Skeleton variant="circle" className="h-8 w-8" />
            </div>
            <Skeleton variant="rect" className="h-8 w-16 mb-2" />
            <Skeleton variant="rect" className="h-4 w-32" />
        </div>
    );
}

export function SkeletonTable({ rows = 5, cols = 4, "data-testid": testId }: { rows?: number; cols?: number; "data-testid"?: string }) {
    return (
        <div className="space-y-3" data-testid={testId || "skeleton-table"}>
            <div className="flex gap-4">
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={i} variant="rect" className="h-4 flex-1" />
                ))}
            </div>
            {Array.from({ length: rows }).map((_, row) => (
                <div key={row} className="flex gap-4" data-testid="skeleton-table-row">
                    {Array.from({ length: cols }).map((_, col) => (
                        <Skeleton key={col} variant="rect" className="h-10 flex-1" />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function SkeletonChart({ height = 300, "data-testid": testId }: { height?: number; "data-testid"?: string }) {
    return (
        <div className="glass p-5 rounded-xl border border-white/10" data-testid={testId || "skeleton-chart"}>
            <div className="flex justify-between items-center mb-4">
                <Skeleton variant="rect" className="h-5 w-32" />
                <div className="flex gap-2">
                    <Skeleton variant="rect" className="h-8 w-12" />
                    <Skeleton variant="rect" className="h-8 w-12" />
                    <Skeleton variant="rect" className="h-8 w-12" />
                </div>
            </div>
            <Skeleton variant="rect" className="w-full" style={{ height }} />
        </div>
    );
}

export function SkeletonReport({ "data-testid": testId }: { "data-testid"?: string }) {
    return (
        <div className="space-y-6" data-testid={testId || "skeleton-report"}>
            <div className="glass p-6 rounded-2xl border border-white/10">
                <div className="flex items-start justify-between">
                    <div className="space-y-3">
                        <Skeleton variant="rect" className="h-8 w-48" />
                        <Skeleton variant="rect" className="h-4 w-32" />
                    </div>
                    <Skeleton variant="rect" className="h-20 w-20 rounded-2xl" />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>

            <SkeletonChart height={280} />

            <div className="glass p-6 rounded-2xl border border-white/10">
                <Skeleton variant="rect" className="h-6 w-40 mb-4" />
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <Skeleton variant="rect" className="h-4 w-24" />
                            <Skeleton variant="rect" className="h-4 w-32" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function SkeletonSearch({ "data-testid": testId }: { "data-testid"?: string }) {
    return (
        <div className="space-y-6" data-testid={testId || "skeleton-search"}>
            <div className="glass p-6 rounded-3xl border border-white/10">
                <Skeleton variant="rect" className="h-12 w-full" />
            </div>
            <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="glass p-5 rounded-2xl border border-white/10">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <Skeleton variant="rect" className="h-5 w-32" />
                                <Skeleton variant="rect" className="h-4 w-48" />
                            </div>
                            <Skeleton variant="rect" className="h-12 w-16 rounded-xl" />
                        </div>
                        <Skeleton variant="rect" className="h-4 w-full mt-4" />
                        <Skeleton variant="rect" className="h-4 w-3/4 mt-2" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function SkeletonPortfolio({ "data-testid": testId }: { "data-testid"?: string }) {
    return (
        <div className="space-y-6" data-testid={testId || "skeleton-portfolio"}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
            <SkeletonChart height={250} />
            <SkeletonTable rows={5} cols={6} />
        </div>
    );
}
