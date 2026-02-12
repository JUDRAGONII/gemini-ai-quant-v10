import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, ScrollArea } from '@/components/ui';
import { Bell, CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react';
import { MarketAlert } from '@/types/api';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'; // Or use your supabase client

interface LiveAlertFeedProps {
    initialAlerts: MarketAlert[];
}

export const LiveAlertFeed: React.FC<LiveAlertFeedProps> = ({ initialAlerts }) => {
    const [alerts, setAlerts] = useState<MarketAlert[]>(initialAlerts);
    const supabase = createClientComponentClient();

    useEffect(() => {
        setAlerts(initialAlerts);
    }, [initialAlerts]);

    useEffect(() => {
        const channel = supabase
            .channel('market_alerts')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'market_alerts',
                },
                (payload) => {
                    const newAlert = payload.new as MarketAlert;
                    setAlerts((prev) => [newAlert, ...prev].slice(0, 50));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    const getIcon = (severity: string) => {
        switch (severity) {
            case 'HIGH': return <AlertOctagon className="w-4 h-4 text-red-500" />;
            case 'MEDIUM': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            default: return <Bell className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <Card className="h-full flex flex-col bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-blue-400" />
                        LIVE ALERTS
                    </span>
                    <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-mono animate-pulse">
                        REALTIME
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-[400px] px-4">
                    <div className="space-y-4 py-4">
                        {alerts.length === 0 ? (
                            <div className="text-center text-slate-600 text-xs py-10">
                                No active alerts
                            </div>
                        ) : (
                            alerts.map((alert) => (
                                <div key={alert.id} className="flex gap-3 items-start group">
                                    <div className="mt-0.5 shrink-0">
                                        {getIcon(alert.severity)}
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm font-medium text-slate-200">
                                                {alert.stock_code}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-mono">
                                                {new Date(alert.created_at).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 leading-relaxed">
                                            {alert.message}
                                        </p>
                                    </div>
                                    <button
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-emerald-400"
                                        title="Acknowledge"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};
