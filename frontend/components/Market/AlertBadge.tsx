import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useAlerts } from '@/hooks/useAlerts';
import { AlertPanel } from './AlertPanel';
import { motion, AnimatePresence } from 'framer-motion';

export const AlertBadge: React.FC = () => {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const { unreadCount } = useAlerts();

    return (
        <>
            <div className="relative">
                <button
                    onClick={() => setIsPanelOpen(true)}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group active:scale-95"
                    title="市場警示"
                >
                    <Bell
                        size={20}
                        className={`text-gray-400 group-hover:text-white transition-colors ${unreadCount > 0 ? 'animate-pulse' : ''}`}
                    />

                    <AnimatePresence>
                        {unreadCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-[#0c1425] shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                            >
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>

            <AlertPanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />
        </>
    );
};
