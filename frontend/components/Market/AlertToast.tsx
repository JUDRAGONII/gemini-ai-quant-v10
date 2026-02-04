import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { MarketAlert, AlertLevel } from '@/types/alert';

interface AlertToastProps {
    alert: MarketAlert;
    onClose: (id: string) => void;
}

const levelStyles: Record<AlertLevel, { icon: any; glow: string; text: string }> = {
    critical: { icon: AlertCircle, glow: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]', text: 'text-red-400' },
    warning: { icon: AlertTriangle, glow: 'shadow-[0_0_20px_rgba(245,158,11,0.5)]', text: 'text-yellow-400' },
    info: { icon: Info, glow: 'shadow-[0_0_20px_rgba(59,130,246,0.5)]', text: 'text-blue-400' },
};

export const AlertToast: React.FC<AlertToastProps> = ({ alert, onClose }) => {
    const style = levelStyles[alert.alert_level] || levelStyles.info;
    const Icon = style.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={`relative w-80 glass-card p-4 flex items-start gap-4 ${style.glow} border border-white/20 overflow-hidden group`}
        >
            {/* ProgressBar Animation (Auto-close hint) */}
            <motion.div
                initial={{ width: '100%' }}
                animate={{ width: 0 }}
                transition={{ duration: 8, ease: 'linear' }}
                className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${alert.alert_level === 'critical' ? 'from-red-500' : 'from-blue-500'} to-transparent`}
            />

            <div className={`mt-1 ${style.text}`}>
                <Icon size={24} className={alert.alert_level === 'critical' ? 'animate-pulse' : ''} />
            </div>

            <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white truncate">{alert.alert_title}</h3>
                <p className="text-xs text-gray-300 mt-1 line-clamp-2">{alert.alert_description}</p>
            </div>

            <button
                onClick={() => onClose(alert.id)}
                className="text-gray-500 hover:text-white transition-colors"
            >
                <X size={16} />
            </button>
        </motion.div>
    );
};
