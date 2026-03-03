'use client';

import React from 'react';
import useSWR from 'swr';
import GlassCard from '@/components/ui/GlassCard';
import { Calendar, AlertTriangle, Info, Clock } from 'lucide-react';

import { Bilingual } from '@/components/ui/Bilingual';

interface EconomicEvent {
    id: string;
    event_name: string;
    country: string;
    scheduled_at: string;
    importance: number;
    actual_value?: string;
    forecast_value?: string;
    previous_value?: string;
}

const fetcher = async (url: string) => {
    const res = await fetch(url);
    const json = await res.json();
    // 防禦性解析：若後端回傳 {data: [...]} 嵌套結構，自動解包
    return Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : json);
};

export const EconomicCalendar = () => {
    const { data, error, isLoading } = useSWR<EconomicEvent[]>(
        '/api/v1/macro/calendar',
        fetcher
    );

    if (isLoading) {
        return (
            <div className="grid gap-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-slate-900/50 rounded-xl animate-pulse"></div>
                ))}
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-10 text-center text-slate-500 border border-dashed border-white/10 rounded-xl">
                <Bilingual zh="暫時無法獲取日曆數據" en="Temporarily unable to fetch calendar data" />
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {data.length === 0 ? (
                <div className="p-10 text-center text-slate-500 italic">
                    <Bilingual zh="未來一週無重大經濟事件" en="No major economic events in the coming week" />
                </div>
            ) : (
                data.map((event) => (
                    <GlassCard key={event.id} className="p-4 border-white/5 hover:border-white/10 transition-all">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${event.country === 'US' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'
                                        }`}>
                                        {event.country}
                                    </span>
                                    <span className="text-slate-400 text-xs font-mono">
                                        {new Date(event.scheduled_at).toLocaleString('zh-TW', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                                    {event.event_name}
                                </h4>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-1 h-3 rounded-full ${i < event.importance ? 'bg-amber-500' : 'bg-slate-800'
                                                }`}
                                        />
                                    ))}
                                </div>
                                {event.actual_value && (
                                    <div className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                        <Bilingual zh="實際:" en="Act:" /> {event.actual_value}
                                    </div>
                                )}
                            </div>
                        </div>
                    </GlassCard>
                ))
            )}
        </div>
    );
};

export default EconomicCalendar;
