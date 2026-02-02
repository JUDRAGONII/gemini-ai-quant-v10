"use client";

import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout";

export default function PortfoliosLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-cyan-500/30">
            {/* Mobile Navigation */}
            <MobileNav />

            {/* Sidebar (Desktop) */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            <div className="flex">
                {/* Main Content Area */}
                <main className="flex-1 ml-0 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 transition-all duration-300">
                    {children}
                </main>
            </div>
        </div>
    );
}
