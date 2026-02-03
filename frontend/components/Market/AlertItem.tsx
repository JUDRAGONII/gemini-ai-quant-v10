import React from 'react';
import { Bell, AlertCircle, AlertTriangle, Info, Check } from 'lucide-react';
import { MarketAlert, AlertLevel } from '@/types/alert';
import { motion } from 'framer-motion';

interface AlertItemProps {
    alert: MarketAlert;
    onRead: (id: string) => void;
}

const levelConfig: Record<AlertLevel, { icon: any; color: string; bg: string; border: string }> = {
    critical: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
    info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
};

export const AlertItem: React.FC<AlertItemProps> = ({ alert, onRead }) => {
    const config = levelConfig[alert.alert_level] || levelConfig.info;
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-4 rounded-xl border ${config.border} ${config.bg} backdrop-blur-md mb-3 transition-all hover:scale-[1.02] active:scale-95 group relative`}
        >
            <div className="flex items-start gap-3">
                <div className={`mt-1 ${config.color}`}>
                    <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <h4 className="text-sm font-bold text-white truncate pr-6">{alert.alert_title}</h4>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                            {new Date(alert.triggered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <p className="text-xs text-gray-300 mt-1 line-clamp-2">{alert.alert_description}</p>

                    <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400">
                            {alert.stock_code}
                        </span>
                        {alert.change_percent !== undefined && (
                            <span className={`text-[10px] font-medium ${alert.change_percent >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                                {alert.change_percent > 0 ? '+' : ''}{alert.change_percent}%
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {!alert.is_read && (
                <button
                    onClick={() => onRead(alert.id)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                    title="標記已讀"
                >
                    <Check size={16} />
                </button>
            )}

            {!alert.is_read && (
                <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            )}
        </motion.div>
    );
};
