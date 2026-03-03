import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { ShieldAlert, AlertOctagon } from 'lucide-react';
import { Bilingual } from '@/components/ui/Bilingual';
import { RiskSummary } from '@/types/api';

interface RiskAlertWidgetProps {
    risk: RiskSummary;
}

export const RiskAlertWidget: React.FC<RiskAlertWidgetProps> = ({ risk }) => {
    return (
        <Card className="h-full bg-slate-900/50 border-slate-800 backdrop-blur-sm relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center justify-between">
                    <Bilingual zh="風險雷達" en="RISK RADAR" mode="inline">
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                    </Bilingual>
                    {risk.high_risk_count > 0 && (
                        <span className="text-[10px] bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded font-mono animate-pulse">
                            <Bilingual zh="嚴重" en="CRITICAL" mode="inline" enClassName="ml-1" />
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-white font-mono">
                        {risk.high_risk_count}
                    </span>
                    <span className="text-xs text-slate-500 mb-1.5 ml-1">
                        <Bilingual zh="高風險標的" en="High Risk Tickers" mode="stacked" />
                    </span>
                </div>

                <div className="space-y-2">
                    {risk.tickers.length === 0 ? (
                        <div className="text-emerald-400 text-xs flex items-center gap-1.5 p-2 bg-emerald-500/5 rounded border border-emerald-500/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <Bilingual zh="系統運作正常" en="All Systems Normal" mode="inline" />
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {risk.tickers.map((ticker) => (
                                <div
                                    key={ticker}
                                    className="flex items-center gap-1.5 px-2 py-1 bg-rose-500/10 border border-rose-500/20 rounded text-xs text-rose-300 font-mono"
                                >
                                    <AlertOctagon className="w-3 h-3" />
                                    {ticker}
                                </div>
                            ))}
                            {risk.high_risk_count > risk.tickers.length && (
                                <div className="text-xs text-slate-500 py-1">
                                    <Bilingual zh={`其他 +${risk.high_risk_count - risk.tickers.length}`} en={`+${risk.high_risk_count - risk.tickers.length} more`} mode="inline" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
