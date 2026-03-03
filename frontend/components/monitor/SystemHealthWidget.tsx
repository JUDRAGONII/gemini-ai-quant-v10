import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Progress } from '@/components/ui';
import { Bilingual } from '@/components/ui/Bilingual';
import { Activity, Server, Database, Cpu } from 'lucide-react';
import { SystemHealth, QuotaStatus } from '@/types/api';

interface SystemHealthWidgetProps {
    system: SystemHealth;
    quota: QuotaStatus;
}

export const SystemHealthWidget: React.FC<SystemHealthWidgetProps> = ({ system, quota }) => {
    // Helper to calculate quota color
    const getQuotaColor = (remaining: number, total: number) => {
        const percentage = (remaining / total) * 100;
        if (percentage < 20) return 'bg-red-500';
        if (percentage < 50) return 'bg-yellow-500';
        return 'bg-emerald-500';
    };

    return (
        <Card className="h-full bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                    <Bilingual zh="系統健康度" en="SYSTEM HEALTH" mode="inline">
                        <Activity className="w-4 h-4 text-emerald-400" />
                    </Bilingual>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* CPU & RAM */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                                <Cpu className="w-3 h-3" />
                                <Bilingual zh="CPU 負載" en="CPU Load" mode="suffix" />
                            </span>
                            <span className={system.cpu_usage > 80 ? 'text-red-400' : 'text-emerald-400'}>
                                {system.cpu_usage}%
                            </span>
                        </div>
                        <Progress value={system.cpu_usage} className="h-1.5" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                                <Server className="w-3 h-3" />
                                <Bilingual zh="RAM 佔用" en="RAM Usage" mode="suffix" />
                            </span>
                            <span className={system.ram_usage > 80 ? 'text-red-400' : 'text-emerald-400'}>
                                {system.ram_usage}%
                            </span>
                        </div>
                        <Progress value={system.ram_usage} className="h-1.5" />
                        <div className="text-[10px] text-right text-slate-500">
                            <Bilingual zh="總計" en="Total" mode="inline" />: {system.ram_total_gb} GB
                        </div>
                    </div>
                </div>

                {/* API Quota */}
                <div className="space-y-4 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                        <div className="text-xs font-medium text-slate-300">
                            <Bilingual zh="API 配額" en="API QUOTA" mode="inline">
                                <Database className="w-3 h-3 text-blue-400" />
                            </Bilingual>
                        </div>
                        <div className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${quota.status === 'Healthy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                            }`}>
                            {quota.status === 'Healthy' ? <Bilingual zh="正常" en="Healthy" mode="inline" /> : <Bilingual zh="異常" en="Warning" mode="inline" />}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Fugle API</span>
                                <span className="text-slate-300">{quota.fugle} reqs</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${getQuotaColor(quota.fugle, 1000)}`}
                                    style={{ width: `${Math.min((quota.fugle / 1000) * 100, 100)}%` }} // Assuming 1000 is failing limit, wait, usually quota is remaining.
                                // Let's assume input is remaining. So width should be remaining %? Or consumed?
                                // Usually "Progress" implies 'filled' is good or bad?
                                // Let's assume bar shows REMAINING capacity.
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Tiingo API</span>
                                <span className="text-slate-300">{quota.tiingo} reqs</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${getQuotaColor(quota.tiingo, 5000)}`}
                                    style={{ width: `${Math.min((quota.tiingo / 5000) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Uptime */}
                <div className="pt-2 border-t border-slate-800 text-center">
                    <span className="text-[10px] text-slate-600 font-mono">
                        <Bilingual zh="運行時間" en="UPTIME" mode="suffix" />: {Math.floor(system.uptime_seconds / 3600)}h {Math.floor((system.uptime_seconds % 3600) / 60)}m
                    </span>
                </div>
            </CardContent>
        </Card>
    );
};
