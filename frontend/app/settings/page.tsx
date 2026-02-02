"use client";

/**
 * 系統設定中心頁面
 * @description 控制中心風格的設定管理介面
 * @version 1.0.0 (Phase 4.4 Pro Max)
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    Settings,
    Key,
    Palette,
    Database,
    ChevronLeft,
    Save,
    RotateCcw,
    CheckCircle2,
    AlertCircle,
    Activity
} from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import { ProButton } from "@/components/ui/ProButton";
import { ProInput } from "@/components/ui/ProInput";
import { ProToggle } from "@/components/ui/ProToggle";
import { ProBadge } from "@/components/ui/ProBadge";
import { useSettings } from "@/context/SettingsContext";
import Sidebar from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout";

// API 健康狀態模擬
const apiStatus = [
    { name: "Supabase", status: "online" as const, endpoint: "localhost:54321" },
    { name: "AI Worker", status: "online" as const, endpoint: "localhost:8787" },
    { name: "FRED API", status: "online" as const, endpoint: "api.stlouisfed.org" },
    { name: "Finnhub", status: "offline" as const, endpoint: "finnhub.io" },
];

export default function SettingsPage() {
    const { settings, updateUISettings, updateSettings, resetSettings, isLoaded } = useSettings();
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isDev, setIsDev] = useState(false);
    const [geminiKey, setGeminiKey] = useState("AIza****************");

    // 檢查開發者模式
    useEffect(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('dev_mode') === 'true') {
            setIsDev(true);
        }
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        // 模擬儲存延遲
        await new Promise((resolve) => setTimeout(resolve, 800));
        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-gray-100 font-sans selection:bg-cyan-500/30">
            {/* Mobile Navigation (Sticky Top + Drawer) */}
            <MobileNav />

            {/* Sidebar (Unified) */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64">
                {/* 背景裝飾 */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
                    {/* 頂部導航 */}
                    <header className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <Settings className="w-8 h-8 text-cyan-400" />
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">系統設定</h1>
                        </div>
                        <div className="flex space-x-4">
                            <StatusBadge label="AI Worker" status="online" />
                            <StatusBadge label="Database" status="online" />
                        </div>
                    </header>

                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* API 管理區塊 */}
                        <GlassCard glow className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-lg bg-cyan-500/20">
                                    <Key className="w-5 h-5 text-cyan-400" />
                                </div>
                                <h2 className="text-lg font-semibold">API 金鑰管理</h2>
                            </div>

                            <div className="space-y-4">
                                <ProInput
                                    label="Google Gemini API Key"
                                    value={geminiKey}
                                    onChange={(e) => setGeminiKey(e.target.value)}
                                    isPassword
                                    placeholder="輸入您的 API Key"
                                />
                                <p className="text-xs text-gray-500">
                                    * API Key 僅用於本機測試，不會上傳至伺服器
                                </p>
                            </div>
                        </GlassCard>

                        {/* UI 偏好區塊 */}
                        <GlassCard glow className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-lg bg-blue-500/20">
                                    <Palette className="w-5 h-5 text-blue-400" />
                                </div>
                                <h2 className="text-lg font-semibold">介面偏好</h2>
                            </div>

                            <div className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-300">顯示圖表數值標籤</span>
                                    <ProToggle
                                        checked={settings.ui.showChartLabels}
                                        onChange={(checked) =>
                                            updateUISettings({ showChartLabels: checked })
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-300">啟用過渡動畫</span>
                                    <ProToggle
                                        checked={settings.ui.enableAnimations}
                                        onChange={(checked) =>
                                            updateUISettings({ enableAnimations: checked })
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-300">緊湊模式</span>
                                    <ProToggle
                                        checked={settings.ui.compactMode}
                                        onChange={(checked) =>
                                            updateUISettings({ compactMode: checked })
                                        }
                                    />
                                </div>
                            </div>
                        </GlassCard>

                        {/* 數據源狀態區塊 */}
                        <GlassCard glow className="p-6 lg:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-lg bg-emerald-500/20">
                                    <Database className="w-5 h-5 text-emerald-400" />
                                </div>
                                <h2 className="text-lg font-semibold">數據源狀態</h2>
                            </div>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {apiStatus.map((api) => (
                                    <div
                                        key={api.name}
                                        className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-white/5"
                                    >
                                        <div>
                                            <p className="font-medium text-white">{api.name}</p>
                                            <p className="text-xs text-gray-500">{api.endpoint}</p>
                                        </div>
                                        <ProBadge
                                            status={api.status === "online" ? "success" : "error"}
                                            size="sm"
                                            pulse={api.status === "online"}
                                        >
                                            {api.status === "online" ? "連線中" : "離線"}
                                        </ProBadge>
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </div>

                    {/* 操作按鈕區 */}
                    <div className="flex items-center justify-end gap-4 mt-8">
                        {saveSuccess && (
                            <div className="flex items-center gap-2 text-emerald-400 animate-in fade-in">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-sm">設定已儲存</span>
                            </div>
                        )}
                        <ProButton
                            variant="ghost"
                            leftIcon={<RotateCcw className="w-4 h-4" />}
                            onClick={resetSettings}
                        >
                            重置為預設
                        </ProButton>
                        <ProButton
                            variant="primary"
                            leftIcon={<Save className="w-4 h-4" />}
                            isLoading={isSaving}
                            onClick={handleSave}
                        >
                            儲存設定
                        </ProButton>
                    </div>

                    {/* 版本資訊 */}
                    <div className="mt-12 text-center text-gray-500 text-sm">
                        <p
                            className="cursor-default select-none active:opacity-50 transition-opacity"
                            onClick={() => {
                                const newCount = (window as any)._devClickCount || 0;
                                (window as any)._devClickCount = newCount + 1;
                                if ((window as any)._devClickCount >= 5) {
                                    localStorage.setItem('dev_mode', 'true');
                                    window.location.reload();
                                }
                            }}
                        >
                            AI 投資分析儀 V10.0
                        </p>
                        <p className="text-xs mt-1">
                            最後更新: {new Date(settings.lastUpdated).toLocaleString("zh-TW")}
                        </p>

                        {/* 隱藏跳轉：僅在 dev_mode 下顯示 */}
                        {isDev && (
                            <Link
                                href="/admin/monitor"
                                className="inline-block mt-4 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/20 transition-all font-mono"
                            >
                                [進入開發者數據監控中心]
                            </Link>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

// --- Helper Components ---
function StatusBadge({ label, status }: { label: string, status: 'online' | 'offline' }) {
    return (
        <div className="glass px-3 py-1.5 rounded-full flex items-center space-x-2 border border-white/10">
            <span className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="text-xs font-medium text-gray-300">{label}</span>
        </div>
    );
}
