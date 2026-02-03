import React from 'react';
import { X, BellOff, Trash2, CheckCircle2 } from 'lucide-react';
import { useAlerts } from '@/hooks/useAlerts';
import { AlertItem } from './AlertItem';
import { motion, AnimatePresence } from 'framer-motion';

interface AlertPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({ isOpen, onClose }) => {
    const { alerts, unreadCount, markAsRead, markAllAsRead, isLoading } = useAlerts();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-screen w-full max-w-sm bg-[#0c1425]/90 border-l border-white/10 backdrop-blur-2xl z-50 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-white">市場監控中心</h2>
                                {unreadCount > 0 && (
                                    <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="px-6 py-3 flex justify-between items-center bg-white/5 border-b border-white/5">
                            <button
                                onClick={markAllAsRead}
                                disabled={unreadCount === 0}
                                className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50 flex items-center gap-1 transition-colors"
                                title="全部標記已讀"
                            >
                                <CheckCircle2 size={14} />
                                <span>全部已讀</span>
                            </button>
                            <span className="text-[10px] text-gray-500">
                                僅顯示最近 50 筆異動
                            </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-40 gap-3">
                                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-sm text-gray-400">正在同步行情...</span>
                                </div>
                            ) : alerts && alerts.length > 0 ? (
                                alerts.map((alert) => (
                                    <AlertItem key={alert.id} alert={alert} onRead={markAsRead} />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 opacity-30">
                                    <BellOff size={48} className="text-gray-500 mb-4" />
                                    <p className="text-sm text-gray-500">目前尚無市場異動</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/10 text-center">
                            <button className="text-xs text-gray-500 hover:text-white transition-colors">
                                設定警示規則
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
